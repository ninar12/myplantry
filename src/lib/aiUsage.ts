import { NextResponse } from "next/server";
import { supabase } from "./supabase";
import { notifyDiscord } from "./notify";

// Atomically checks the per-minute burst cap and the per-endpoint daily cap,
// and reserves the slot (inserts the usage row) in the same DB call — a
// Postgres advisory lock serializes concurrent calls per user, so concurrent
// requests can't all read the same count and all pass the cap.
export async function reserveAiUsage(
  userId: string,
  endpoint: string,
  dailyLimit: number,
  maxPerMinute = 100
): Promise<{ allowed: boolean; reason: "rate_limit" | "daily_limit" | null }> {
  const { data, error } = await supabase.rpc("reserve_ai_usage", {
    p_user_id: userId,
    p_endpoint: endpoint,
    p_daily_limit: dailyLimit,
    p_max_per_minute: maxPerMinute,
  });
  if (error) throw error;
  const row = data?.[0];
  return { allowed: row?.allowed ?? false, reason: row?.reason ?? null };
}

export function aiUsageLimitResponse() {
  return NextResponse.json(
    { error: "Daily AI usage limit reached, try again tomorrow" },
    { status: 429 }
  );
}

export function aiRateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests, please slow down and try again in a moment" },
    { status: 429 }
  );
}

export async function checkAiUsageAnomaly(userId: string | null) {
  if (!userId) return;

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
