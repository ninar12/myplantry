"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Sparkles, Trash2, Loader2 } from "lucide-react";
import { SavedRecipe } from "@/lib/types";
import { usePantry } from "@/context/PantryContext";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { removeSavedRecipe } = usePantry();
  const [recipe, setRecipe] = useState<SavedRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/recipes?id=${id}`)
      .then((r) => {
        if (!r.ok) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.recipe) setRecipe(data.recipe);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    removeSavedRecipe(id);
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f3ef" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#2b6954" }} />
      </div>
    );
  }

  if (notFound || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: "#f5f3ef" }}>
        <p className="text-sm font-medium" style={{ color: "#707974" }}>Recipe not found.</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-semibold px-4 py-2 rounded-xl"
          style={{ background: "#003527", color: "#ffffff" }}
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f3ef" }}>
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-semibold mb-6 transition-opacity hover:opacity-70"
          style={{ color: "#003527" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="rounded-3xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e4e2de", boxShadow: "0 4px 24px rgba(0,53,39,0.07)" }}>

          {/* Header */}
          <div
            className="px-7 py-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(149,211,186,0.12) 0%, transparent 60%)" }} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)" }}
                >
                  <Sparkles className="w-2.5 h-2.5" /> Saved recipe
                </span>
                {recipe.match_percentage && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff" }}
                  >
                    {recipe.match_percentage}% match
                  </span>
                )}
              </div>
              <h1
                className="text-2xl font-bold text-white leading-tight mb-1"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", letterSpacing: "-0.01em" }}
              >
                {recipe.title}
              </h1>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {new Date(recipe.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                {" · "}{recipe.ingredients.length} ingredients
              </p>
            </div>
          </div>

          <div className="px-7 py-6 flex flex-col gap-7">

            {/* Ingredients */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "#707974" }}>Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {recipe.ingredients.map((ing, idx) => (
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
            </div>

            {/* Instructions */}
            <div style={{ borderTop: "1px solid #f5f3ef", paddingTop: "1.5rem" }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: "#707974" }}>Instructions</p>
              <ol className="space-y-4">
                {recipe.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ background: "#cce6d9", color: "#003527" }}
                    >
                      {idx + 1}
                    </span>
                    <p className="text-sm leading-relaxed pt-0.5" style={{ color: "#404944" }}>{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Delete */}
            <div style={{ borderTop: "1px solid #f5f3ef", paddingTop: "1.25rem" }}>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                style={{ color: "#ef4444", background: "#fef2f2" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fee2e2")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fef2f2")}
              >
                <Trash2 className="w-4 h-4" />
                Delete recipe
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
