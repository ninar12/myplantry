"use client";

import { usePantry } from "@/context/PantryContext";
import { X, Sparkles, Lock } from "lucide-react";
import Link from "next/link";

const COPY: Record<string, { title: string; description: string }> = {
  pantry_items: {
    title: "You've filled your pantry.",
    description: "Free accounts can track up to 30 ingredients. Upgrade to Pro for unlimited pantry items.",
  },
  saved_recipes: {
    title: "Recipe collection is full.",
    description: "Free accounts can save up to 5 recipes. Upgrade to Pro to save as many as you want.",
  },
  generate_recipe: {
    title: "Daily limit reached.",
    description: "Free accounts can generate 10 recipes per day. Upgrade to Pro for unlimited AI recipe generation.",
  },
  scan_image: {
    title: "Photo scan is a Pro feature.",
    description: "Scan receipts and fridge photos to add ingredients instantly. Available on Pro and Team plans.",
  },
};

export default function UpgradePrompt() {
  const { upgradeResource, clearUpgradePrompt } = usePantry();
  if (!upgradeResource) return null;

  const copy = COPY[upgradeResource] ?? {
    title: "Upgrade to Pro",
    description: "You've hit the limit for your free plan. Upgrade to unlock everything.",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5 shadow-2xl"
        style={{ background: "#fbf9f5" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
          >
            <Lock className="w-4 h-4 text-white" />
          </div>
          <button
            onClick={clearUpgradePrompt}
            className="p-1 rounded-lg transition-colors hover:opacity-60 flex-shrink-0"
            style={{ color: "#707974" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Copy */}
        <div>
          <h3
            className="font-bold text-lg mb-1.5"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.01em" }}
          >
            {copy.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#404944" }}>
            {copy.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Link
            href="/upgrade"
            onClick={clearUpgradePrompt}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white text-center flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
          >
            <Sparkles className="w-4 h-4" />
            Upgrade to Pro
          </Link>
          <button
            onClick={clearUpgradePrompt}
            className="w-full py-3 rounded-xl font-medium text-sm transition-colors hover:opacity-80"
            style={{ color: "#404944", background: "#f5f3ef", border: "1px solid #bfc9c3" }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
