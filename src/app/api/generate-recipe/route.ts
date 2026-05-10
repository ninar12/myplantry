import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { parseAiJsonObject } from "@/lib/parseAiResponse";
import { PantryItem } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { getOrCreateUser, supabase } from "@/lib/supabase";
import { checkLimit, limitReachedResponse } from "@/lib/subscription";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { allowed, plan, limit } = await checkLimit(userId, "generate_recipe");
  if (!allowed) return limitReachedResponse(plan, limit, "generate_recipe");

  const { items, prompt: userPrompt }: { items: PantryItem[]; prompt?: string } = await req.json();

  const pantryContext = items
    .map((i) => `- ${i.name} (${i.category}, expires: ${new Date(i.expiration_date).toLocaleDateString()})`)
    .join("\n");

  const userGuidance = userPrompt?.trim()
    ? `The user wants: "${userPrompt.trim()}" — use this as guidance but still prefer ingredients expiring soonest.\n\n`
    : "";

  const prompt = `You are a professional chef. Create one delicious recipe using ingredients from this pantry:

${pantryContext}

${userGuidance}Prefer ingredients that expire soonest. Return ONLY a raw JSON object — no markdown fences, no extra text:
{
  "title": "Recipe name",
  "ingredients": ["1 cup flour", "2 eggs"],
  "instructions": ["Step 1 description", "Step 2 description"],
  "pantry_matches": ["flour", "eggs"]
}

pantry_matches must list each ingredient name that comes from the user's pantry (normalized, lowercase).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [{ parts: [{ text: prompt }] }],
  });

  const raw = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  const parsed = parseAiJsonObject(raw) as {
    title?: string;
    ingredients?: string[];
    instructions?: string[];
    pantry_matches?: string[];
  };

  const matchesFound = (parsed.pantry_matches ?? []).length;
  const totalIngredients = (parsed.ingredients ?? []).length;
  const match_percentage = totalIngredients > 0
    ? Math.round((matchesFound / totalIngredients) * 100)
    : 0;

  // Log generation for rate limiting
  await supabase.from("recipe_generations").insert({ user_id: userId });

  return NextResponse.json({
    title: parsed.title ?? "Chef's Special",
    ingredients: parsed.ingredients ?? [],
    instructions: parsed.instructions ?? [],
    match_percentage,
  });
}
