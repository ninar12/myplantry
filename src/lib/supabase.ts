import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getOrCreateUser(email: string, name?: string | null): Promise<string> {
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    await touchLastSeen(existing.id);
    return existing.id;
  }

  const id = crypto.randomUUID();
  await supabase.from("users").insert({ id, email, name: name ?? null });
  return id;
}

// Update last_seen_at at most once per 15 minutes — single conditional UPDATE,
// no read-then-write race. Never throws: visibility tracking must not break requests.
export async function touchLastSeen(userId: string): Promise<void> {
  try {
    await supabase.rpc("touch_last_seen", { p_user_id: userId });
  } catch (e) {
    console.error("touchLastSeen error:", e);
  }
}
