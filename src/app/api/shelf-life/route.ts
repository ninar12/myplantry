import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FALLBACK = {
  fridge_days: 7,
  pantry_days: null,
  freezer_days: null,
  opened_fridge_days: null,
  category: "Other",
  tips: null,
}

// Tier 1: fuzzy DB lookup using pg_trgm similarity
async function lookupDB(name: string) {
  const { data, error } = await supabase
    .rpc("fuzzy_shelf_life", { query: name.toLowerCase().trim() })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data
}

// Tier 2: Gemini AI fallback
async function lookupGemini(name: string) {
  const prompt = `You are a food safety expert. Base all estimates on USDA and FDA guidelines. When uncertain, err on the shorter side.

Given the food item "${name}", return ONLY a raw JSON object. No markdown, no fences, no explanation:
{
  "category": "<Produce | Dairy | Meat & Seafood | Grains & Bread | Canned & Jarred | Condiments | Beverages | Pantry Staples | Other>",
  "pantry_days": <integer, or null if unsafe at room temp>,
  "fridge_days": <integer, or null if not applicable>,
  "freezer_days": <integer, or null if freezing not recommended>,
  "opened_fridge_days": <integer — days after opening when refrigerated, or null>,
  "tips": "<one short storage tip, or null>"
}
All values assume: fresh from purchase, properly stored, unopened unless noted.`

  const responsePromise = ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
  })

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Gemini timeout")), 10000),
  )

  const response = await Promise.race([responsePromise, timeoutPromise])
  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
  return JSON.parse(cleaned)
}

// Tier 3: Write Gemini result back to DB so next lookup is instant
async function cacheResult(name: string, data: Record<string, unknown>) {
  await supabase.from("shelf_life").upsert(
    {
      name: name.toLowerCase().trim(),
      category: data.category ?? "Other",
      pantry_days: data.pantry_days ?? null,
      fridge_days: data.fridge_days ?? null,
      freezer_days: data.freezer_days ?? null,
      opened_fridge_days: data.opened_fridge_days ?? null,
      tips: data.tips ?? null,
      source: "gemini",
    },
    { onConflict: "name" }
  )
}

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json(FALLBACK)

  // --- Tier 1: DB lookup (instant after seeding) ---
  try {
    const dbResult = await lookupDB(name)
    if (dbResult) {
      return NextResponse.json(dbResult)
    }
  } catch (e) {
    console.error("shelf-life DB lookup error:", e)
  }

  // --- Tier 2: Gemini fallback ---
  try {
    const geminiResult = await lookupGemini(name)

    // --- Tier 3: Cache back (fire and forget) ---
    cacheResult(name, geminiResult).catch((e) =>
      console.error("shelf-life cache error:", e)
    )

    return NextResponse.json(geminiResult)
  } catch (e) {
    console.error("shelf-life Gemini error:", e)
    return NextResponse.json(FALLBACK)
  }
}
