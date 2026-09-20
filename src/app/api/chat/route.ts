import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, getOrCreateUser } from "@/lib/supabase"
import { PantryItem } from "@/lib/types"
import { reserveAiUsage, checkAiUsageAnomaly, aiUsageLimitResponse, aiRateLimitResponse } from "@/lib/aiUsage"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

interface Message {
  role: "user" | "assistant"
  content: string
}

// Inserts sequentially, not as one batched array insert — Postgres evaluates now()
// once per statement, so a single multi-row insert gives the user message and its
// assistant reply the exact same created_at. /api/chat/history sorts by created_at
// with no secondary tiebreaker, so on a tie the reply can sort before the question
// it's answering, making the conversation look unanswered when reloaded. Two
// statements means two distinct timestamps and a stable chronological order.
async function saveMessages(userId: string, messages: { role: string; content: string }[]) {
  for (const m of messages) {
    await supabase.from("chat_messages").insert({ user_id: userId, role: m.role, content: m.content })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = await getOrCreateUser(session.user.email, session.user.name)

  const reservation = await reserveAiUsage(userId, "chat", 100)
  if (!reservation.allowed) {
    return reservation.reason === "rate_limit" ? aiRateLimitResponse() : aiUsageLimitResponse()
  }

  const { messages, pantryItems }: { messages: Message[]; pantryItems: PantryItem[] } =
    await req.json()

  const now = Date.now()
  const pantryContext =
    pantryItems.length > 0
      ? pantryItems
          .map((i) => {
            const daysLeft = Math.ceil(
              (new Date(i.expiration_date).getTime() - now) / (1000 * 60 * 60 * 24)
            )
            return `- ${i.name} (${i.category}, ${daysLeft > 0 ? `${daysLeft} days left` : "expired"})`
          })
          .join("\n")
      : "No items in pantry."

  const systemInstruction = `You are a friendly and knowledgeable cooking consultant. The user's current pantry:

${pantryContext}

Give practical, specific cooking advice. Reference actual items from their pantry when relevant. Keep responses concise and conversational.`

  const history = messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }))

  const lastMessage = messages[messages.length - 1]

  let reply: string
  try {
    const chat = ai.chats.create({
      model: "gemini-3.8-flash",
      config: { systemInstruction },
      history,
    })

    const response = await chat.sendMessage({ message: lastMessage.content })
    await checkAiUsageAnomaly(userId)
    reply =
      response.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I couldn't generate a response."
  } catch (e) {
    // Gemini is intermittently flaky (timeouts, transient 503s, etc.) — without this,
    // any hiccup here was an uncaught exception that surfaced as a raw 500, which the
    // frontend couldn't parse as JSON and showed as a generic failure. Now it's a clean,
    // expected error response instead.
    console.error("chat Gemini error:", e)
    return NextResponse.json(
      { error: "The AI is temporarily unavailable — please try again in a moment." },
      { status: 503 }
    )
  }

  // Persist both the user message and assistant reply before returning — on Vercel's
  // serverless runtime, unawaited work isn't guaranteed to complete after the response
  // is sent, so this must be awaited even though a save failure shouldn't fail the reply.
  try {
    await saveMessages(userId, [
      { role: "user", content: lastMessage.content },
      { role: "assistant", content: reply },
    ])
  } catch (e) {
    console.error("chat save error:", e)
  }

  return NextResponse.json({ reply })
}
