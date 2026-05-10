import { supabase } from "./supabase";

export type Plan = "free" | "pro" | "team";

const LIMITS: Record<Plan, { pantry_items: number | null; saved_recipes: number | null; generate_recipe: number | null }> = {
  free:  { pantry_items: 30, saved_recipes: 5,    generate_recipe: 10 },
  pro:   { pantry_items: null, saved_recipes: null, generate_recipe: null },
  team:  { pantry_items: null, saved_recipes: null, generate_recipe: null },
};

export async function getUserPlan(userId: string): Promise<Plan> {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = data?.plan;
  if (plan === "pro" || plan === "team") return plan;
  return "free";
}

export async function checkLimit(
  userId: string,
  resource: "pantry_items" | "saved_recipes" | "generate_recipe",
): Promise<{ allowed: boolean; plan: Plan; limit: number | null; current: number }> {
  const plan = await getUserPlan(userId);
  const limit = LIMITS[plan][resource];

  // Unlimited for this plan
  if (limit === null) return { allowed: true, plan, limit, current: 0 };

  let current = 0;

  if (resource === "pantry_items") {
    const { count } = await supabase
      .from("pantry_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    current = count ?? 0;
  } else if (resource === "saved_recipes") {
    const { count } = await supabase
      .from("saved_recipes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    current = count ?? 0;
  } else if (resource === "generate_recipe") {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
      .from("recipe_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", `${today}T00:00:00.000Z`);
    current = count ?? 0;
  }

  return { allowed: current < limit, plan, limit, current };
}

export function limitReachedResponse(plan: Plan, limit: number | null, resource: string) {
  return Response.json(
    { error: "limit_reached", resource, limit, plan, upgrade_url: "/upgrade" },
    { status: 403 },
  );
}
