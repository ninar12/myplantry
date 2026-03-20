import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { parseAiJsonArray } from "@/lib/parseAiResponse";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

const PROMPTS = {
  receipt: `You are a grocery receipt parser. Extract every food or household item purchased.
- Ignore store name, totals, taxes, loyalty points, cashier info, and non-food items
- Decode abbreviations common on receipts (e.g. "BANA" → "Bananas", "2% MLK" → "2% Milk", "CHKN BRST" → "Chicken Breast")
- Use the quantity/weight shown on the receipt when available; otherwise default to 1
- If a line item is a multipack (e.g. "6PK EGGS"), set quantity to 6 and name to "Eggs"`,

  fridge: `You are a kitchen inventory scanner. Identify every visible food item in this fridge or pantry photo.
- Name each item specifically (e.g. "Greek Yogurt" not just "Yogurt", "Cheddar Cheese" not just "Cheese")
- Estimate visible quantity (number of bottles, bags, containers) — use 1 if unclear
- Include condiments, beverages, produce, and leftovers in containers if identifiable
- Skip non-food items and anything too blurry to identify confidently`,

  handwritten: `You are a handwritten grocery list reader. Transcribe every item the user wrote.
- Correct obvious spelling mistakes (e.g. "mlk" → "Milk", "tmoatos" → "Tomatoes")
- Preserve any quantities written beside items (e.g. "3 apples" → quantity: 3, name: "Apples")
- If a quantity is written as a fraction or weight (e.g. "½ lb butter"), normalize to a whole number (quantity: 1)
- Ignore doodles, checkmarks, crossed-out items, and non-food text`,
};

const SHARED_OUTPUT_INSTRUCTIONS = `
Return ONLY a raw JSON array — no markdown fences, no explanation, no extra text.
Each object must have exactly these fields:
  "name": string            — specific, human-readable item name
  "category": string        — one of: produce, dairy, meat, seafood, grains, condiments, beverages, snacks, frozen, other
  "quantity": number        — whole number, minimum 1
  "shelf_life_days": number — typical days this item stays fresh from today
                              (examples: fresh berries 3, leafy greens 5, milk 10, yogurt 14,
                               raw chicken 2, ground beef 2, eggs 21, hard cheese 30,
                               bread 5, cooked grains 5, canned goods 730, pantry staples 365,
                               frozen items 180, condiments 180, beverages 14)
  "location": string        — where this item is typically stored: "fridge" or "pantry"
                              (examples: produce/dairy/meat/beverages → "fridge",
                               grains/canned goods/condiments/snacks/pantry staples → "pantry",
                               frozen items → "fridge")

If you cannot confidently identify any items, return an empty array: []`;

export async function POST(req: NextRequest) {
  const { image, mimeType, type } = await req.json();
  const imageType = (type as keyof typeof PROMPTS) ?? "receipt";
  const prompt = PROMPTS[imageType] + SHARED_OUTPUT_INSTRUCTIONS;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        parts: [
          { inlineData: { mimeType: mimeType ?? "image/jpeg", data: image } },
          { text: prompt },
        ],
      },
    ],
  });

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const parsed = parseAiJsonArray(raw);
  const now = Date.now();

  const items = parsed.map((item) => {
    const entry = item as Record<string, unknown>;
    const shelfLifeDays = typeof entry.shelf_life_days === "number" ? entry.shelf_life_days : 7;
    return {
      name: entry.name,
      category: entry.category,
      quantity: entry.quantity,
      expiration_date: new Date(now + shelfLifeDays * 24 * 60 * 60 * 1000).toISOString(),
      location: entry.location === "pantry" ? "pantry" : "fridge",
    };
  });

  return NextResponse.json({ items });
}
