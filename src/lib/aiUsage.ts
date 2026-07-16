import { NextResponse } from "next/server";
import { supabase } from "./supabase";
import { notifyDiscord } from "./notify";

export async function checkAiUsageLimit(userId: string, endpoint: string, dailyLimit: number) {
  const today = new Date().toISOString().split("T")[0];
  const { count } = await supabase
    .from("ai_usage_log")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("created_at", `${today}T00:00:00.000Z`);
  return (count ?? 0) < dailyLimit;
}

export function aiUsageLimitResponse() {
  return NextResponse.json(
    { error: "Daily AI usage limit reached, try again tomorrow" },
    { status: 429 }
  );
}

export async function logAiUsage(userId: string | null, endpoint: string) {
  if (!userId) return;
  await supabase.from("ai_usage_log").insert({ user_id: userId, endpoint });

  // Cheap anomaly check — a single count query, wrapped so it never blocks the caller.
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("ai_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) > 30) {
      const { data: user } = await supabase
        .from("users")
        .select("email")
        .eq("id", userId)
        .single();
      await notifyDiscord(`⚠️ High AI usage: ${user?.email ?? userId} — ${count} calls in the last hour`);
    }
  } catch (e) {
    console.error("ai usage anomaly check error:", e);
  }
}
