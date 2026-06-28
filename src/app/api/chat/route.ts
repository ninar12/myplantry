import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, getOrCreateUser } from "@/lib/supabase"
import { PantryItem } from "@/lib/types"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

interface Message {
  role: "user" | "assistant"
  content: string
}

async function saveMessages(userId: string, messages: { role: string; content: string }[]) {
  await supabase.from("chat_messages").insert(
    messages.map((m) => ({ user_id: userId, role: m.role, content: m.content }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
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

  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: { systemInstruction },
    history,
  })

  const response = await chat.sendMessage({ message: lastMessage.content })
  const reply =
    response.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Sorry, I couldn't generate a response."

  // Persist both the user message and assistant reply (fire and forget)
  if (session?.user?.email) {
    getOrCreateUser(session.user.email, session.user.name)
      .then((userId) =>
        saveMessages(userId, [
          { role: "user", content: lastMessage.content },
          { role: "assistant", content: reply },
        ])
      )
      .catch((e) => console.error("chat save error:", e))
  }

  return NextResponse.json({ reply })
}
