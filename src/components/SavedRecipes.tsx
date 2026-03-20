"use client";

import { useState } from "react";
import { usePantry } from "@/context/PantryContext";
import { ChefHat, Trash2, CheckCircle2, Sparkles, X } from "lucide-react";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-[#0B4D26]/8 bg-white overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-100" />
      <div className="p-4 flex flex-col gap-2">
        <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="flex gap-1.5 mt-1 flex-wrap">
          <div className="h-5 w-16 bg-gray-100 rounded-full" />
          <div className="h-5 w-12 bg-gray-100 rounded-full" />
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function SavedRecipes() {
  const { savedRecipes, removeSavedRecipe } = usePantry();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedRecipe = savedRecipes.find((r) => r.id === selectedId) ?? null;

  if (savedRecipes.length === 0) {
    return (
      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none select-none opacity-50">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur-sm px-6 py-5 rounded-2xl border border-[#0B4D26]/10 shadow-sm">
            <ChefHat className="w-8 h-8 text-[#0B4D26]/25 mx-auto mb-2" />
            <p className="text-[#0B4D26] font-semibold text-sm">Generate your first recipe to see it here.</p>
            <p className="text-[#0B4D26]/40 text-xs mt-1">Your saved recipes will appear as cards below.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedRecipes.map((recipe) => {
          const previewIngredients = recipe.ingredients.slice(0, 4);
          const overflow = recipe.ingredients.length - 4;
          const isSelected = recipe.id === selectedId;

          return (
            <div
              key={recipe.id}
              className={`group relative bg-white rounded-xl border overflow-hidden transition-all cursor-pointer ${
                isSelected
                  ? "border-[#207245]/40 shadow-md shadow-[#207245]/10"
                  : "border-[#0B4D26]/10 hover:border-[#207245]/30 hover:shadow-sm"
              }`}
              onClick={() => setSelectedId(isSelected ? null : recipe.id)}
            >
              {/* Thumbnail placeholder */}
              <div className="aspect-video bg-[#0B4D26]/4 flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-[#0B4D26]/20" />
              </div>

              <div className="p-4">
                {/* Match badge + AI label */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#FFC629]/80 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                  {recipe.match_percentage && (
                    <span className="text-[10px] font-bold text-[#207245] bg-[#207245]/10 px-2 py-0.5 rounded-full">
                      {recipe.match_percentage}% match
                    </span>
                  )}
                </div>

                {/* Title */}
                <p className="font-semibold text-[#0B4D26] text-sm leading-tight line-clamp-2">{recipe.title}</p>

                {/* Ingredient pills */}
                <div className="flex flex-wrap gap-1 mt-2.5">
                  {previewIngredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] text-[#0B4D26]/60 bg-gray-100 px-2 py-0.5 rounded-full capitalize"
                    >
                      {ing.split(" ").slice(-1)[0]}
                    </span>
                  ))}
                  {overflow > 0 && (
                    <span className="text-[10px] text-[#0B4D26]/40 bg-gray-50 px-2 py-0.5 rounded-full">
                      +{overflow} more
                    </span>
                  )}
                </div>
              </div>

              {/* Delete button — on hover */}
              <button
                onClick={(e) => { e.stopPropagation(); removeSavedRecipe(recipe.id); }}
                className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-white/60 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                aria-label="Delete recipe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected recipe detail */}
      {selectedRecipe && (
        <div className="bg-white border border-[#0B4D26]/10 rounded-xl overflow-hidden">
          <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-[#0B4D26]/6">
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#FFC629]/80 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Saved recipe
              </span>
              <h3 className="font-bold text-[#0B4D26] text-base mt-0.5">{selectedRecipe.title}</h3>
              <p className="text-xs text-[#0B4D26]/40 mt-0.5">
                {new Date(selectedRecipe.created_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-[#0B4D26]/40 hover:text-[#0B4D26] transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B4D26]/40 mb-2">Ingredients</p>
            <ul className="grid grid-cols-2 gap-1.5 mb-4">
              {selectedRecipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-1.5 text-xs text-[#0B4D26]/80 bg-gray-50 px-2.5 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-[#207245] flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>

            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#0B4D26]/40 mb-2">Instructions</p>
            <ol className="space-y-2.5">
              {selectedRecipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-md bg-[#FFC629]/20 text-[#0B4D26] flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-[#0B4D26]/70 leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
