"use client";

import { usePantry } from "@/context/PantryContext";
import { Sparkles, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

export default function RecipeGenerator() {
  const { generateRecipe, isGenerating, recipes } = usePantry();
  
  const latestRecipe = recipes[0];

  return (
    <div className="flex flex-col gap-6">
      {/* CTA Card */}
      <div className="bg-[#0B4D26] text-white rounded-2xl p-6 shadow-md relative overflow-hidden group transition-all hover:shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#207245] rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
        <h2 className="font-bold mb-2 text-xl relative z-10">Cook what you have</h2>
        <p className="text-white/80 text-sm mb-6 relative z-10 w-[85%]">
          Stop throwing away expired food. Let AI generate a delicious meal with your current ingredients.
        </p>
        
        <button 
          onClick={generateRecipe}
          disabled={isGenerating}
          className="w-full relative z-10 h-12 bg-[#FFC629] text-[#0B4D26] rounded-xl flex items-center justify-center font-bold overflow-hidden group-hover:bg-[#fbbb21] transition-colors disabled:opacity-80 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Crafting recipe...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Recipe
            </span>
          )}
        </button>
      </div>

      {/* Latest Recipe Result */}
      {latestRecipe && !isGenerating && (
        <div className="bg-white border-2 border-[#207245]/20 rounded-2xl p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FFC629] to-[#207245]"></div>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[#FFC629] text-xs font-bold tracking-wider uppercase flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
              <h3 className="text-2xl font-bold text-[#0B4D26] leading-tight">
                {latestRecipe.title}
              </h3>
            </div>
            {latestRecipe.match_percentage && (
              <div className="bg-[#207245]/10 text-[#207245] px-3 py-1 rounded-xl text-sm font-bold flex flex-col items-center">
                <span>{latestRecipe.match_percentage}%</span>
                <span className="text-[10px] uppercase font-semibold">Match</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h4 className="font-semibold text-[#0B4D26] mb-3 text-sm uppercase tracking-wide">Ingredients</h4>
            <ul className="grid grid-cols-2 gap-2">
              {latestRecipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-[#0B4D26]/80 bg-gray-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-[#207245]" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-[#0B4D26] mb-3 text-sm uppercase tracking-wide">Instructions</h4>
            <ol className="space-y-4">
              {latestRecipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-md bg-[#FFC629]/20 text-[#0B4D26] flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </div>
                  <p className="text-[#0B4D26]/80 text-sm leading-relaxed pt-0.5">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          
          <button className="w-full mt-8 py-3 rounded-xl border border-[#0B4D26]/10 text-[#0B4D26] font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
            Save to Plan <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
