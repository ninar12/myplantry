"use client";

import { useState } from "react";
import { usePantry } from "@/context/PantryContext";
import { Sparkles, Loader2, BookmarkPlus, BookmarkCheck, CheckCircle2 } from "lucide-react";

export default function RecipeGenerator() {
  const { generateRecipe, isGenerating, recipes, saveRecipe, savedRecipes } = usePantry();
  const [isSaving, setIsSaving] = useState(false);

  const latestRecipe = recipes[0];
  const isAlreadySaved = latestRecipe
    ? savedRecipes.some((r) => r.title === latestRecipe.title)
    : false;

  const handleSave = async () => {
    if (!latestRecipe || isAlreadySaved) return;
    setIsSaving(true);
    try {
      await saveRecipe(latestRecipe);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Slim banner */}
      <div className="bg-[#0B4D26] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white text-sm leading-tight">Cook what you have</h2>
          <p className="text-white/50 text-xs mt-0.5">AI-generated from your pantry ingredients.</p>
        </div>
        <button
          onClick={generateRecipe}
          disabled={isGenerating}
          className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-[#FFC629] text-[#0B4D26] rounded-xl text-sm font-bold hover:bg-[#fbbb21] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Generate Recipe</>
          )}
        </button>
      </div>

      {/* Freshly generated recipe — shown inline until saved */}
      {latestRecipe && !isGenerating && !isAlreadySaved && (
        <div className="bg-white border border-[#207245]/20 rounded-xl overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-[#0B4D26]/6 flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#FFC629] flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Just generated
              </span>
              <h3 className="font-bold text-[#0B4D26] text-base mt-0.5 leading-tight">{latestRecipe.title}</h3>
            </div>
            {latestRecipe.match_percentage && (
              <span className="flex-shrink-0 text-xs font-bold text-[#207245] bg-[#207245]/10 px-2.5 py-1 rounded-full">
                {latestRecipe.match_percentage}% match
              </span>
            )}
          </div>

          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B4D26]/40 mb-2">Ingredients</p>
            <ul className="grid grid-cols-2 gap-1.5 mb-4">
              {latestRecipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-[#0B4D26]/80 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-[#207245] flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B4D26]/40 mb-2">Instructions</p>
            <ol className="space-y-2.5 mb-4">
              {latestRecipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#FFC629]/20 text-[#0B4D26] flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#0B4D26]/70 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>

            <button
              onClick={handleSave}
              disabled={isSaving || isAlreadySaved}
              className="w-full py-2.5 rounded-xl border border-[#0B4D26]/10 text-[#0B4D26] text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Saved confirmation */}
      {latestRecipe && !isGenerating && isAlreadySaved && (
        <div className="flex items-center gap-2 text-xs text-[#207245] bg-[#207245]/8 border border-[#207245]/15 px-4 py-2.5 rounded-xl">
          <BookmarkCheck className="w-4 h-4" />
          <span className="font-medium">&ldquo;{latestRecipe.title}&rdquo; saved to your collection.</span>
        </div>
      )}
    </div>
  );
}
