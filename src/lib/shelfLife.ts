export type ShelfLifeLookup = {
  pantry_days?: number | null;
  fridge_days?: number | null;
  freezer_days?: number | null;
  opened_fridge_days?: number | null;
};

export type ShelfLifeResponse = ShelfLifeLookup & {
  category?: string;
  tips?: string | null;
};

export type StorageLocation = "fridge" | "pantry" | "freezer";

/**
 * Calls /api/shelf-life and returns the parsed result, or null if the lookup
 * failed for any reason: network error, non-2xx status, or an `{ error }`
 * body (e.g. aiRateLimitResponse/aiUsageLimitResponse, which have no
 * fridge_days/category fields at all). Callers must treat null as "unknown"
 * and leave whatever data they already had alone — NOT plug the response's
 * (all-undefined) fields into the usual `?? 7` fallback chains, which
 * silently produces a fake-looking "7 day, Other category" answer
 * indistinguishable from a real one.
 */
export async function fetchShelfLife(name: string): Promise<ShelfLifeResponse | null> {
  try {
    const res = await fetch("/api/shelf-life", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok || data?.error) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Picks the number of days until expiry for a pantry item, given a /api/shelf-life
 * lookup result, its storage location, and whether it's opened.
 *
 * Some rows in the shelf_life table (mostly USDA-sourced canned/jarred/pantry-staple
 * items — tomato paste, coconut milk, anchovies, coffee, nuts, ...) carry a
 * freezer_days figure that reflects "quality after opening and freezing" rather than
 * a like-for-like comparison to the unopened pantry_days figure — e.g. tomato paste:
 * pantry_days 810, freezer_days 90. Left as-is, moving an unopened item to the
 * freezer would show it expiring *sooner* than just leaving it in the pantry, which
 * never makes sense: freezing an already shelf-stable item should never look worse
 * than not freezing it. So the freezer figure is floored at the pantry/fridge figures.
 */
export function pickShelfLifeDays(
  data: ShelfLifeLookup,
  location: StorageLocation,
  opened: boolean,
  fallbackDays = 7
): number {
  if (location === "pantry") {
    return data.pantry_days ?? data.fridge_days ?? data.freezer_days ?? fallbackDays;
  }

  if (location === "freezer") {
    const freezer = data.freezer_days ?? data.fridge_days ?? data.pantry_days ?? fallbackDays;
    return Math.max(freezer, data.pantry_days ?? 0, data.fridge_days ?? 0);
  }

  // fridge (default)
  if (opened && data.opened_fridge_days != null) return data.opened_fridge_days;
  return data.fridge_days ?? data.pantry_days ?? data.freezer_days ?? fallbackDays;
}
