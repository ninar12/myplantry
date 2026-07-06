"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePantry } from "@/context/PantryContext";
import Image from "next/image";
import { Trash2, Sparkles, X, Search, Link, FileText, Loader2 } from "lucide-react";

type ImportTab = "url" | "text";

// Dish-type emoji, matched against the recipe title
const RECIPE_EMOJI_MAP: [string[], string][] = [
  [["pizza"], "🍕"],
  [["taco"], "🌮"],
  [["burrito"], "🌯"],
  [["pasta", "spaghetti", "penne", "lasagna", "fettuccine", "macaroni"], "🍝"],
  [["ramen", "pho", "noodle"], "🍜"],
  [["sushi", "sashimi"], "🍣"],
  [["curry"], "🍛"],
  [["soup", "stew", "chowder", "chili"], "🍲"],
  [["salad"], "🥗"],
  [["sandwich", "panini", "grilled cheese"], "🥪"],
  [["burger"], "🍔"],
  [["pancake", "waffle", "french toast"], "🥞"],
  [["omelette", "omelet", "frittata", "scrambled egg"], "🍳"],
  [["stir fry", "stir-fry", "fried rice", "rice bowl", "rice"], "🍚"],
  [["bread", "loaf", "bagel", "biscuit"], "🍞"],
  [["cake", "cupcake", "brownie", "muffin"], "🍰"],
  [["cookie"], "🍪"],
  [["smoothie", "shake"], "🥤"],
  [["chicken"], "🍗"],
  [["steak", "beef"], "🥩"],
  [["fish", "salmon", "shrimp", "seafood"], "🐟"],
  [["pie"], "🥧"],
  [["dumpling", "gyoza", "potsticker"], "🥟"],
  [["kebab", "skewer"], "🍢"],
];

// Ingredient-level emoji, matched against each ingredient string — fills out
// the combo when the title alone doesn't yield enough dish-type matches
const INGREDIENT_EMOJI_MAP: [string[], string][] = [
  [["chicken"], "🍗"],
  [["beef", "steak", "ground beef"], "🥩"],
  [["pork", "ham", "bacon"], "🥓"],
  [["shrimp", "prawn"], "🍤"],
  [["salmon", "tuna", "fish", "cod", "tilapia"], "🐟"],
  [["egg"], "🥚"],
  [["tofu"], "🫘"],
  [["tomato"], "🍅"],
  [["onion", "shallot"], "🧅"],
  [["garlic"], "🧄"],
  [["potato"], "🥔"],
  [["carrot"], "🥕"],
  [["broccoli"], "🥦"],
  [["spinach", "kale", "lettuce", "greens"], "🥬"],
  [["mushroom"], "🍄"],
  [["pepper", "bell pepper", "chili", "jalape"], "🌶️"],
  [["corn"], "🌽"],
  [["avocado"], "🥑"],
  [["cucumber"], "🥒"],
  [["cheese"], "🧀"],
  [["butter"], "🧈"],
  [["milk", "cream"], "🥛"],
  [["rice"], "🍚"],
  [["pasta", "noodle", "spaghetti"], "🍝"],
  [["bread", "baguette", "bun"], "🍞"],
  [["lemon", "lime"], "🍋"],
  [["basil", "cilantro", "parsley", "herb"], "🌿"],
  [["bean", "lentil", "chickpea"], "🫘"],
  [["olive oil", "olive"], "🫒"],
];

// Deterministic fallback so a recipe without any keyword match still gets a stable (not generic) icon
const RECIPE_EMOJI_FALLBACKS = ["🍽️", "🥘", "🍴", "🧑‍🍳"];

// Returns up to 3 emojis for a recipe: dish-type matches from the title first,
// topped up with ingredient matches, falling back to one stable icon if nothing matches.
function getRecipeEmojis(title: string, ingredients: string[]): string[] {
  const lower = title.toLowerCase();
  const matches: string[] = [];

  for (const [keywords, emoji] of RECIPE_EMOJI_MAP) {
    if (matches.length >= 3) break;
    if (keywords.some((k) => lower.includes(k)) && !matches.includes(emoji)) {
      matches.push(emoji);
    }
  }

  if (matches.length < 3) {
    for (const ingredient of ingredients) {
      if (matches.length >= 3) break;
      const ingredientLower = ingredient.toLowerCase();
      for (const [keywords, emoji] of INGREDIENT_EMOJI_MAP) {
        if (keywords.some((k) => ingredientLower.includes(k)) && !matches.includes(emoji)) {
          matches.push(emoji);
          break;
        }
      }
    }
  }

  if (matches.length === 0) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
    matches.push(RECIPE_EMOJI_FALLBACKS[Math.abs(hash) % RECIPE_EMOJI_FALLBACKS.length]);
  }

  return matches;
}

function ImportModal({ onClose }: { onClose: () => void }) {
  const { addSavedRecipe } = usePantry();
  const [tab, setTab] = useState<ImportTab>("url");
  const [urlInput, setUrlInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const body = tab === "url"
      ? { url: urlInput.trim() }
      : { text: textInput.trim() };

    const value = tab === "url" ? urlInput.trim() : textInput.trim();
    if (!value) {
      setError(tab === "url" ? "Enter a URL." : "Paste recipe text first.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/recipes/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (data.recipe) {
        addSavedRecipe(data.recipe);
        onClose();
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: "#ffffff", border: "1px solid #e4e2de", boxShadow: "0 20px 60px rgba(0,53,39,0.14)" }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #f5f3ef" }}>
          <div>
            <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}>
              Import a recipe
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#707974" }}>From a URL or paste the text directly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ background: "#f5f3ef", color: "#707974" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: "#f5f3ef" }}>
            {([["url", "Paste URL", Link], ["text", "Paste Text", FileText]] as const).map(([id, label, Icon]) => (
              <button
                key={id}
                onClick={() => { setTab(id); setError(null); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all"
                style={tab === id ? { background: "#003527", color: "#ffffff" } : { color: "#404944" }}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {tab === "url" ? (
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="https://example.com/delicious-pasta"
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: "#f5f3ef", border: "1px solid transparent", color: "#1b1c1a" }}
              onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          ) : (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={"Paste the recipe title, ingredients, and instructions here…"}
              rows={7}
              autoFocus
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
              style={{ background: "#f5f3ef", border: "1px solid transparent", color: "#1b1c1a" }}
              onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          )}

          {error && (
            <p className="text-xs mt-2 px-1" style={{ color: "#ef4444" }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
            ) : (
              <><Link className="w-4 h-4" /> Import Recipe</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All Recipes" },
  { id: "high-match", label: "Top Match" },
  { id: "quick", label: "Quick Meals" },
  { id: "recent", label: "Recent" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
      <div className="aspect-[4/3]" style={{ background: "#f5f3ef" }} />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3.5 rounded-full w-3/4" style={{ background: "#e4e2de" }} />
        <div className="h-3 rounded-full w-1/3" style={{ background: "#e4e2de" }} />
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <div className="h-5 w-16 rounded-full" style={{ background: "#e4e2de" }} />
          <div className="h-5 w-12 rounded-full" style={{ background: "#e4e2de" }} />
          <div className="h-5 w-20 rounded-full" style={{ background: "#e4e2de" }} />
        </div>
      </div>
    </div>
  );
}

export default function SavedRecipes() {
  const { savedRecipes, removeSavedRecipe } = usePantry();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("all");
  // const [showImport, setShowImport] = useState(false); // NRH-78: import hidden for now

  const filtered = useMemo(() => {
    let list = [...savedRecipes];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.title.toLowerCase().includes(q));
    }
    if (activeFilter === "high-match") list = list.filter((r) => (r.match_percentage ?? 0) >= 80);
    if (activeFilter === "quick") list = list.filter((r) => r.ingredients.length <= 6);
    if (activeFilter === "recent") list = list.slice(0, 6);
    return list;
  }, [savedRecipes, search, activeFilter]);

  if (savedRecipes.length === 0) {
    return (
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none select-none opacity-40">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="text-center px-8 py-6 rounded-2xl flex flex-col items-center"
            style={{ background: "rgba(251,249,245,0.92)", backdropFilter: "blur(8px)", border: "1px solid #e4e2de" }}
          >
            <Image src="/myplantry_logo1.png" alt="" width={130} height={130} className="mb-4 drop-shadow-md" aria-hidden="true" />
            <p className="font-semibold text-sm" style={{ color: "#1b1c1a" }}>Generate your first recipe to see it here.</p>
            <p className="text-xs mt-1" style={{ color: "#707974" }}>Your saved recipes will appear as cards below.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-col gap-5">

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#707974" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#f5f3ef",
              border: "1px solid #bfc9c3",
              color: "#1b1c1a",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
            onBlur={(e) => (e.target.style.borderColor = "#bfc9c3")}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#f5f3ef" }}>
          {FILTERS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveFilter(id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                activeFilter === id
                  ? { background: "#003527", color: "#ffffff" }
                  : { color: "#404944" }
              }
            >
              {label}
            </button>
          ))}
        </div>

        {/* NRH-78: Import button hidden for now */}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-12" style={{ color: "#707974" }}>
          <p className="text-sm">No recipes match your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe) => {
            const previewIngredients = recipe.ingredients.slice(0, 3);
            const overflow = recipe.ingredients.length - 3;

            return (
              <div
                key={recipe.id}
                className="group relative rounded-2xl overflow-hidden transition-all cursor-pointer hover:shadow-md"
                style={{
                  background: "#ffffff",
                  border: "1px solid #e4e2de",
                }}
                onClick={() => router.push(`/dashboard/recipes/${recipe.id}`)}
              >
                {/* Thumbnail */}
                <div
                  className="aspect-[4/3] flex items-center justify-center"
                  style={{ background: "linear-gradient(145deg, #f5f3ef 0%, #efeeea 100%)" }}
                >
                  <div className="flex -space-x-3">
                    {getRecipeEmojis(recipe.title, recipe.ingredients).map((emoji, idx) => (
                      <div
                        key={idx}
                        className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#003527]/10 text-xl"
                        style={{ zIndex: 10 - idx }}
                      >
                        {emoji}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  {/* Badges */}
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-0.5"
                      style={{ color: "#2b6954" }}
                    >
                      <Sparkles className="w-2.5 h-2.5" /> AI
                    </span>
                    {recipe.match_percentage && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#cce6d9", color: "#003527" }}
                      >
                        {recipe.match_percentage}% match
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-sm leading-tight line-clamp-2 mb-1" style={{ color: "#1b1c1a", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
                    {recipe.title}
                  </p>
                  <p className="text-xs mb-2.5" style={{ color: "#707974" }}>
                    {recipe.ingredients.length} ingredients
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {previewIngredients.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-full capitalize"
                        style={{ background: "#f5f3ef", color: "#404944" }}
                      >
                        {ing.split(" ").slice(-1)[0]}
                      </span>
                    ))}
                    {overflow > 0 && (
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "#f5f3ef", color: "#707974" }}
                      >
                        +{overflow} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeSavedRecipe(recipe.id); }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg border transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", borderColor: "#e4e2de", color: "#707974" }}
                  aria-label="Delete recipe"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#707974"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.85)"; }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
    </>
  );
}
