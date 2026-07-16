import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { parseAiJsonObject } from "@/lib/parseAiResponse"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { supabase, getOrCreateUser } from "@/lib/supabase"
import { checkLimit, limitReachedResponse } from "@/lib/subscription"
import { checkAiUsageLimit, logAiUsage, aiUsageLimitResponse } from "@/lib/aiUsage"

export const maxDuration = 30

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

interface RecipeJsonLd {
  "@type"?: string | string[]
  name?: string
  recipeIngredient?: string[]
  recipeInstructions?: Array<{ text?: string } | string> | string
}

function extractJsonLdRecipe(html: string): { title: string; ingredients: string[]; instructions: string[] } | null {
  const scriptMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  for (const match of scriptMatches) {
    try {
      const json = JSON.parse(match[1])
      const candidates: RecipeJsonLd[] = Array.isArray(json)
        ? json
        : json["@graph"]
          ? json["@graph"]
          : [json]

      for (const item of candidates) {
        const type = item["@type"]
        const isRecipe = type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"))
        if (!isRecipe || !item.name || !item.recipeIngredient?.length) continue

        let instructions: string[] = []
        if (Array.isArray(item.recipeInstructions)) {
          instructions = item.recipeInstructions
            .map((s) => (typeof s === "string" ? s : s.text ?? ""))
            .filter(Boolean)
        } else if (typeof item.recipeInstructions === "string") {
          instructions = item.recipeInstructions.split(/\n+/).filter(Boolean)
        }
        if (!instructions.length) continue

        return { title: item.name, ingredients: item.recipeIngredient, instructions }
      }
    } catch {}
  }
  return null
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 6000)
}

async function saveAndReturn(
  userId: string,
  title: string,
  ingredients: string[],
  instructions: string[],
) {
  const { data, error } = await supabase
    .from("saved_recipes")
    .insert({ user_id: userId, title, ingredients, instructions, match_percentage: null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = await getOrCreateUser(session.user.email, session.user.name)

  const { allowed, plan, limit } = await checkLimit(userId, "saved_recipes")
  if (!allowed) return limitReachedResponse(plan, limit, "saved_recipes")

  const body: { url?: string; text?: string } = await req.json()

  if (body.url?.trim()) {
    let html: string
    try {
      const res = await fetch(body.url.trim(), {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; Plantry/1.0)" },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      html = await res.text()
    } catch (e) {
      return NextResponse.json(
        { error: `Could not fetch URL: ${(e as Error).message}` },
        { status: 422 },
      )
    }

    // Try structured data first — instant, no AI needed
    const jsonLd = extractJsonLdRecipe(html)
    if (jsonLd) return saveAndReturn(userId, jsonLd.title, jsonLd.ingredients, jsonLd.instructions)

    // Fall back to Gemini on stripped text
    const content = stripHtml(html)
    return runGemini(userId, content)
  }

  if (body.text?.trim()) {
    return runGemini(userId, body.text.trim().slice(0, 6000))
  }

  return NextResponse.json({ error: "Provide either a url or text" }, { status: 400 })
}

async function runGemini(userId: string, content: string) {
  const usageOk = await checkAiUsageLimit(userId, "recipe_import", 50)
  if (!usageOk) return aiUsageLimitResponse()

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
    model: "gemini-2.0-flash",
    contents: [{ parts: [{ text: geminiPrompt }] }],
  })
  await logAiUsage(userId, "recipe_import")

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

  return saveAndReturn(userId, parsed.title, parsed.ingredients, parsed.instructions)
}
