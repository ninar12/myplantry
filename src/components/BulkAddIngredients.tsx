"use client";

import { useState } from "react";
import { Camera, Receipt, PencilLine, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import { usePantry } from "@/context/PantryContext";
import PhotoUploadStub from "@/components/PhotoUploadStub";

type BulkMode = "image" | "receipt" | "manual";

const OPTIONS = [
  {
    id: "image" as BulkMode,
    icon: Camera,
    label: "Scan Items",
    description: "Photo of your fridge or pantry shelf",
  },
  {
    id: "receipt" as BulkMode,
    icon: Receipt,
    label: "Scan Receipt",
    description: "Grocery receipt — paper or on screen",
  },
  {
    id: "manual" as BulkMode,
    icon: PencilLine,
    label: "Manual List",
    description: "Type multiple ingredients at once",
  },
];

export default function BulkAddIngredients() {
  const { addItem } = usePantry();
  const [mode, setMode] = useState<BulkMode | null>(null);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const names = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!names.length) return;

    setIsLoading(true);
    setDone([]);
    setFailed([]);

    const added: string[] = [];
    const errored: string[] = [];

    for (const name of names) {
      try {
        const res = await fetch("/api/shelf-life", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        const data = await res.json();
        const days = data.fridge_days ?? data.pantry_days ?? 7;
        await addItem({
          name,
          category: data.category ?? "Other",
          quantity: 1,
          opened: false,
          expiration_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
          location: "fridge",
        });
        added.push(name);
      } catch {
        errored.push(name);
      }
    }

    setDone(added);
    setFailed(errored);
    setText("");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Back button when a mode is selected */}
      {mode && (
        <button
          onClick={() => { setMode(null); setDone([]); setFailed([]); }}
          className="flex items-center gap-1 text-sm text-[#0B4D26]/50 hover:text-[#0B4D26] transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>
      )}

      {/* Option picker */}
      {!mode && (
        <div className="flex flex-col gap-2">
          {OPTIONS.map(({ id, icon: Icon, label, description }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#0B4D26]/10 hover:border-[#207245]/40 hover:bg-[#207245]/5 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#207245]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#207245]/20 transition-colors">
                <Icon className="w-5 h-5 text-[#207245]" />
              </div>
              <div>
                <p className="font-semibold text-[#0B4D26] text-sm">{label}</p>
                <p className="text-[#0B4D26]/50 text-xs mt-0.5">{description}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Scan modes */}
      {mode === "image" && <PhotoUploadStub scanType="fridge" />}
      {mode === "receipt" && <PhotoUploadStub scanType="receipt" />}

      {/* Manual list */}
      {mode === "manual" && (
        <form onSubmit={handleManualSubmit} className="flex flex-col gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"One ingredient per line:\nMilk\nEggs\nCheddar cheese\nSpinach"}
            rows={6}
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all placeholder:text-gray-400 text-[#0B4D26] text-sm resize-none disabled:opacity-60"
          />
          <p className="text-xs text-[#0B4D26]/40 -mt-1">
            AI will auto-detect category and expiry for each item.
          </p>
          <button
            type="submit"
            disabled={!text.trim() || isLoading}
            className="w-full h-11 bg-[#0B4D26] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#207245] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Adding items...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Add All</>
            )}
          </button>

          {done.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800">
              ✓ Added {done.length} item{done.length !== 1 ? "s" : ""}: {done.join(", ")}
            </div>
          )}
          {failed.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              Failed to add: {failed.join(", ")}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
