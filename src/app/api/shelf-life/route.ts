import { GoogleGenAI } from "@google/genai"
import { NextRequest, NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! })

const FALLBACK = { fridge_days: 7 }

export async function POST(req: NextRequest) {
  const { name } = await req.json()

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

  try {
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
    const parsed = JSON.parse(cleaned)

    return NextResponse.json(parsed)
  } catch (e) {
    console.error("shelf-life error:", e)
    return NextResponse.json(FALLBACK)
  }
}
