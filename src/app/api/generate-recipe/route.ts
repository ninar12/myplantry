import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { parseAiJsonObject } from "@/lib/parseAiResponse";
import { PantryItem } from "@/lib/types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateUser, supabase } from "@/lib/supabase";
import { checkLimit, limitReachedResponse } from "@/lib/subscription";
import { checkAiUsageLimit, logAiUsage, aiUsageLimitResponse } from "@/lib/aiUsage";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = await getOrCreateUser(session.user.email, session.user.name);

  const { allowed, plan, limit } = await checkLimit(userId, "generate_recipe");
  if (!allowed) return limitReachedResponse(plan, limit, "generate_recipe");

  const usageOk = await checkAiUsageLimit(userId, "generate_recipe", 100);
  if (!usageOk) return aiUsageLimitResponse();

  const { items, prompt: userPrompt }: { items: PantryItem[]; prompt?: string } = await req.json();

  const [prefsResult, savedResult] = await Promise.all([
    supabase.from("user_preferences").select("dietary_prefs, cuisine_prefs").eq("user_id", userId).maybeSingle(),
    supabase.from("saved_recipes").select("title").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
  ]);
  const prefs = prefsResult.data;
  const savedRecipes = savedResult.data ?? [];

  const dietaryContext = prefs?.dietary_prefs?.length
    ? `Dietary restrictions — strictly follow these, no exceptions: ${prefs.dietary_prefs.join(", ")}.`
    : "";
  const cuisineContext = prefs?.cuisine_prefs?.length
    ? `Preferred cuisines: ${prefs.cuisine_prefs.join(", ")}.`
    : "";
  const tasteContext = savedRecipes.length
    ? `The user has previously saved these recipes: ${savedRecipes.map((r) => r.title).join(", ")}. Suggest something different but complementary.`
    : "";
  const personalization = [dietaryContext, cuisineContext, tasteContext].filter(Boolean).join("\n");

  const pantryContext = items
    .map((i) => `- ${i.name} (${i.category}, expires: ${new Date(i.expiration_date).toLocaleDateString()})`)
    .join("\n");

  const userGuidance = userPrompt?.trim()
    ? `The user wants: "${userPrompt.trim()}" — use this as guidance but still prefer ingredients expiring soonest.\n\n`
    : "";

  const prompt = `You are a practical home cooking assistant. Your job is to suggest ONE real, well-known recipe that can be made using the user's pantry ingredients.

STRICT RULES:
- Only suggest recipes that actually exist and that a real home cook would recognize
- Never invent unusual or unappetizing flavor combinations (e.g. vinegar pasta, sweet meat stews with random acids)
- If the pantry ingredients don't naturally combine into a real dish, suggest the closest sensible recipe and note what common ingredient is missing
- Prefer simple, classic dishes over creative experiments
- Prioritize ingredients expiring soonest
${personalization ? `\n${personalization}` : ""}
User's pantry:
${pantryContext}

${userGuidance}Return ONLY a raw JSON object — no markdown fences, no extra text:
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
  await logAiUsage(userId, "generate_recipe");

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
