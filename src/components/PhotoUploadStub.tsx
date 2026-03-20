"use client";

import { useRef, useState } from "react";
import { Camera, Receipt, Loader2, Sparkles, X } from "lucide-react";
import { usePantry } from "@/context/PantryContext";

type ScanType = "receipt" | "fridge" | "handwritten";

interface ScannedItem {
  name: string;
  category: string;
  quantity: number;
  expiration_date: string;
  location: string;
}

export default function PhotoUploadStub({ scanType = "receipt" }: { scanType?: ScanType }) {
  const { addItem, checkPantryDuplicate } = usePantry();
  const [isScanning, setIsScanning] = useState(false);
  const [skippedItems, setSkippedItems] = useState<ScannedItem[]>([]);
  const [showSkippedBanner, setShowSkippedBanner] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setShowSkippedBanner(false);
    setSkippedItems([]);

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const [meta, base64] = dataUrl.split(",");
      const mimeType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";

      try {
        const res = await fetch("/api/scan-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType, type: scanType }),
        });

        const { items } = await res.json();
        const newItems: ScannedItem[] = [];
        const duplicates: ScannedItem[] = [];

        for (const item of items as ScannedItem[]) {
          if (checkPantryDuplicate(item.name)) {
            duplicates.push(item);
          } else {
            newItems.push(item);
          }
        }

        for (const item of newItems) {
          await addItem({
            name: item.name,
            category: item.category,
            quantity: item.quantity ?? 1,
            expiration_date: item.expiration_date,
            location: item.location === "pantry" ? "pantry" : "fridge",
          });
        }

        if (duplicates.length > 0) {
          setSkippedItems(duplicates);
          setShowSkippedBanner(true);
        }
      } catch (err) {
        console.error("Scan failed:", err);
      } finally {
        setIsScanning(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    };

    reader.readAsDataURL(file);
  };

  const addSkippedItems = async () => {
    for (const item of skippedItems) {
      await addItem({
        name: item.name,
        category: item.category,
        quantity: item.quantity ?? 1,
        expiration_date: item.expiration_date,
        location: item.location === "pantry" ? "pantry" : "fridge",
      });
    }
    setShowSkippedBanner(false);
    setSkippedItems([]);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="w-full relative overflow-hidden group border-2 border-dashed border-[#207245]/30 bg-[#207245]/5 hover:bg-[#207245]/10 hover:border-[#207245]/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileChange}
          disabled={isScanning}
        />
        {isScanning ? (
          <>
            <Loader2 className="w-8 h-8 text-[#207245] animate-spin" />
            <span className="text-[#0B4D26] font-medium text-sm flex items-center gap-2">
              Extracting items with AI <Sparkles className="w-3 h-3 text-[#FFC629]" />
            </span>
          </>
        ) : (
          <>
            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#0B4D26]/10 z-10 group-hover:-translate-y-1 transition-transform">
                <Camera className="w-5 h-5 text-[#207245]" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center border border-[#0B4D26]/10 group-hover:-translate-y-1 transition-transform delay-75">
                <Receipt className="w-5 h-5 text-[#207245]" />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[#0B4D26] font-semibold text-sm mb-0.5">
                Wait, here&apos;s a receipt...
              </span>
              <span className="block text-[#0B4D26]/60 text-xs">
                Scan to log multiple ingredients
              </span>
            </div>
          </>
        )}
      </label>

      {showSkippedBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800 flex items-start gap-2">
          <span className="text-base flex-shrink-0">ⓘ</span>
          <div className="flex-1">
            <p>
              {skippedItems.length} item{skippedItems.length !== 1 ? "s" : ""} already in pantry{" "}
              {skippedItems.length !== 1 ? "were" : "was"} skipped.
            </p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={addSkippedItems}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Add all anyway
              </button>
              <button
                onClick={() => setShowSkippedBanner(false)}
                className="px-3 py-1 border border-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
          <button onClick={() => setShowSkippedBanner(false)} className="flex-shrink-0">
            <X className="w-4 h-4 text-blue-400 hover:text-blue-600" />
          </button>
        </div>
      )}
    </div>
  );
}
