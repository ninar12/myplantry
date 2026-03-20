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

  if (existing) return existing.id;

  const id = crypto.randomUUID();
  await supabase.from("users").insert({ id, email, name: name ?? null });
  return id;
}
