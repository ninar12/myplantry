"use client";

import { useState } from "react";
import { Camera, Receipt, Loader2, Sparkles } from "lucide-react";
import { usePantry } from "@/context/PantryContext";

export default function PhotoUploadStub() {
  const { addItem } = usePantry();
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = async () => {
    setIsScanning(true);
    // Simulate AI parsing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Add mocked receipt items
    addItem({
      name: "Avocado",
      category: "Produce",
      quantity: 3,
      expiration_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      location: "fridge",
    });
    addItem({
      name: "Eggs",
      category: "Dairy",
      quantity: 1,
      expiration_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: "fridge",
    });
    
    setIsScanning(false);
  };

  return (
    <button
      onClick={handleSimulateScan}
      disabled={isScanning}
      className="w-full relative overflow-hidden group border-2 border-dashed border-[#207245]/30 bg-[#207245]/5 hover:bg-[#207245]/10 hover:border-[#207245]/50 transition-all rounded-xl p-6 flex flex-col items-center justify-center gap-3"
    >
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
              Wait, here's a receipt...
            </span>
            <span className="block text-[#0B4D26]/60 text-xs">
              Scan to log multiple ingredients
            </span>
          </div>
        </>
      )}
    </button>
  );
}
