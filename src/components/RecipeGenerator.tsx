"use client";

import { useState, useEffect, useRef } from "react";
import { usePantry } from "@/context/PantryContext";
import { Sparkles, Loader2, BookmarkPlus, BookmarkCheck, CheckCircle2, Leaf, AlertTriangle } from "lucide-react";

export default function RecipeGenerator() {
  const { generateRecipe, isGenerating, recipes, saveRecipe, savedRecipes, items } = usePantry();
  const [isSaving, setIsSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastFading, setToastFading] = useState(false);
  const [recipePrompt, setRecipePrompt] = useState("");
  const toastTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const latestRecipe = recipes[0];
  const isAlreadySaved = latestRecipe
    ? savedRecipes.some((r) => r.title === latestRecipe.title)
    : false;

  const expiringItems = items.filter((item) => {
    const days = Math.ceil((new Date(item.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 3;
  });

  useEffect(() => {
    return () => toastTimers.current.forEach(clearTimeout);
  }, []);

  const showToast = () => {
    setToastVisible(true);
    setToastFading(false);
    const t1 = setTimeout(() => setToastFading(true), 2700);
    const t2 = setTimeout(() => setToastVisible(false), 3000);
    toastTimers.current = [t1, t2];
  };

  const handleSave = async () => {
    if (!latestRecipe || isAlreadySaved) return;
    setIsSaving(true);
    try {
      await saveRecipe(latestRecipe);
      showToast();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Toast */}
      {toastVisible && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 shadow-lg rounded-xl px-4 py-3 transition-opacity duration-300 ${toastFading ? "opacity-0" : "opacity-100"}`}
          style={{ background: "#ffffff", border: "1px solid #e4e2de" }}
        >
          <BookmarkCheck className="w-4 h-4 flex-shrink-0" style={{ color: "#2b6954" }} />
          <span className="text-sm font-medium" style={{ color: "#1b1c1a" }}>Saved to your collection</span>
        </div>
      )}

      <div className="flex flex-col gap-5">

        {/* ── Hero banner ── */}
        <div
          className="rounded-3xl px-7 py-8 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(149,211,186,0.12) 0%, transparent 60%)" }} />
          <div className="relative flex flex-col gap-5">
            <div>
              <h2
                className="text-2xl font-bold text-white mb-1.5"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: "-0.01em" }}
              >
                Cook with what you have.
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
                {items.length > 0
                  ? `You have ${items.length} ingredient${items.length !== 1 ? "s" : ""} — see what's possible.`
                  : "Add ingredients to your pantry to get started."}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={recipePrompt}
                onChange={(e) => setRecipePrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isGenerating && items.length > 0) {
                    generateRecipe(recipePrompt || undefined).then(() => setRecipePrompt(""));
                  }
                }}
                placeholder="e.g. something cozy, pasta dish, 30-minute meal…"
                className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "#ffffff",
                }}
                onFocus={(e) => (e.target.style.background = "rgba(255,255,255,0.18)")}
                onBlur={(e) => (e.target.style.background = "rgba(255,255,255,0.12)")}
              />
              <button
                onClick={() => generateRecipe(recipePrompt || undefined).then(() => setRecipePrompt(""))}
                disabled={isGenerating || items.length === 0}
                className="flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#ffffff", color: "#003527" }}
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                ) : recipePrompt.trim() ? (
                  <><Sparkles className="w-4 h-4" /> Generate</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Surprise Me</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Zero Waste Hero */}
          <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "#cce6d9" }}>
                <Leaf className="w-3.5 h-3.5" style={{ color: "#003527" }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: "#003527" }}>Zero Waste Hero</span>
            </div>
            {expiringItems.length > 0 ? (
              <>
                <p className="text-xs mb-3" style={{ color: "#707974" }}>Use before they expire:</p>
                <div className="flex flex-wrap gap-2">
                  {expiringItems.slice(0, 4).map((item) => {
                    const days = Math.ceil((new Date(item.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    return (
                      <span
                        key={item.id}
                        className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: "#fff4e6", color: "#b45309", border: "1px solid #fed7aa" }}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {item.name}
                        <span style={{ color: "#d97706" }}>· {days === 0 ? "today" : `${days}d`}</span>
                      </span>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-xs" style={{ color: "#707974" }}>
                {items.length > 0 ? "✓ Everything looks fresh. Nice work." : "Add pantry items to track freshness."}
              </p>
            )}
          </div>

          {/* Pantry Coverage */}
          <div className="rounded-2xl p-5" style={{ background: "#f5f3ef" }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#707974" }}>Pantry Coverage</p>
            <div className="flex items-end gap-2 mb-3">
              <span
                className="text-3xl font-extrabold"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
              >
                {items.length}
              </span>
              <span className="text-sm pb-1" style={{ color: "#707974" }}>ingredients tracked</span>
            </div>
            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "#e4e2de" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, Math.round((items.length / 30) * 100))}%`,
                  background: "linear-gradient(90deg, #003527, #2b6954)",
                }}
              />
            </div>
            <p className="text-xs mt-1.5" style={{ color: "#707974" }}>
              {savedRecipes.length} recipe{savedRecipes.length !== 1 ? "s" : ""} saved
            </p>
          </div>
        </div>

        {/* ── Featured generated recipe ── */}
        {latestRecipe && !isGenerating && !isAlreadySaved && (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#ffffff", border: "1px solid #e4e2de", boxShadow: "0 4px 20px rgba(0,53,39,0.06)" }}
          >
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3" style={{ borderBottom: "1px solid #f5f3ef" }}>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: "#cce6d9", color: "#003527" }}
                  >
                    <Sparkles className="w-2.5 h-2.5" /> Just generated
                  </span>
                  {latestRecipe.match_percentage && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#003527", color: "#ffffff" }}
                    >
                      Top Match · {latestRecipe.match_percentage}%
                    </span>
                  )}
                </div>
                <h3
                  className="font-bold text-lg leading-tight"
                  style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}
                >
                  {latestRecipe.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: "#707974" }}>
                  {latestRecipe.ingredients.length} ingredients
                </p>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#707974" }}>Ingredients</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {latestRecipe.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="rounded-full px-3 py-1.5 text-sm flex items-center gap-1.5"
                    style={{ background: "#f5f3ef", color: "#1b1c1a" }}
                  >
                    <CheckCircle2 className="w-3 h-3 flex-shrink-0" style={{ color: "#2b6954" }} />
                    {ing}
                  </span>
                ))}
              </div>

              <div className="pt-5 mb-5" style={{ borderTop: "1px solid #f5f3ef" }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#707974" }}>Instructions</p>
                <ol className="space-y-3">
                  {latestRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs"
                        style={{ background: "#cce6d9", color: "#003527" }}
                      >
                        {idx + 1}
                      </span>
                      <p className="text-sm leading-relaxed pt-0.5" style={{ color: "#404944" }}>{step}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <button
                onClick={handleSave}
                disabled={isSaving || isAlreadySaved}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                ) : (
                  <><BookmarkPlus className="w-4 h-4" /> Save to collection</>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
