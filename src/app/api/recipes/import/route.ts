import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { parseAiJsonObject } from "@/lib/parseAiResponse"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { supabase, getOrCreateUser } from "@/lib/supabase"
import { checkLimit, limitReachedResponse } from "@/lib/subscription"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12000)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = await getOrCreateUser(session.user.email, session.user.name)

  const { allowed, plan, limit } = await checkLimit(userId, "saved_recipes")
  if (!allowed) return limitReachedResponse(plan, limit, "saved_recipes")

  const body: { url?: string; text?: string } = await req.json()

  let content: string
  if (body.url?.trim()) {
    let html: string
    try {
      const res = await fetch(body.url.trim(), {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Plantry/1.0)" },
        signal: AbortSignal.timeout(8000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      html = await res.text()
    } catch (e) {
      return NextResponse.json(
        { error: `Could not fetch URL: ${(e as Error).message}` },
        { status: 422 },
      )
    }
    content = stripHtml(html)
  } else if (body.text?.trim()) {
    content = body.text.trim().slice(0, 12000)
  } else {
    return NextResponse.json(
      { error: "Provide either a url or text" },
      { status: 400 },
    )
  }

  const geminiPrompt = `Extract the recipe from the following content and return ONLY a raw JSON object — no markdown fences, no extra text:
{
  "title": "Recipe name",
  "ingredients": ["1 cup flour", "2 eggs"],
  "instructions": ["Step 1 description", "Step 2 description"]
}

If no recipe is found, return: {"error": "no recipe found"}

Content:
${content}`

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: geminiPrompt }] }],
  })

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}"
  const parsed = parseAiJsonObject(raw) as {
    title?: string
    ingredients?: string[]
    instructions?: string[]
    error?: string
  }

  if (parsed.error || !parsed.title || !parsed.ingredients || !parsed.instructions) {
    return NextResponse.json(
      { error: "Could not extract a recipe from this content" },
      { status: 422 },
    )
  }

  const { data, error } = await supabase
    .from("saved_recipes")
    .insert({
      user_id: userId,
      title: parsed.title,
      ingredients: parsed.ingredients,
      instructions: parsed.instructions,
      match_percentage: null,
    })
    .select()
    .single()

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    recipe: {
      id: data.id,
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions,
      match_percentage: undefined,
      created_at: data.created_at,
    },
  })
}
