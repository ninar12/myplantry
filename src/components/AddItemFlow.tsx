"use client";

import { useState } from "react";
import { Camera, Receipt, PencilLine, ChevronLeft } from "lucide-react";
import AddIngredient from "@/components/AddIngredient";
import PhotoUploadStub from "@/components/PhotoUploadStub";

type Method = "image" | "receipt" | "manual";

const METHODS = [
  {
    id: "image" as Method,
    icon: Camera,
    label: "Scan Items",
    description: "Photo of your fridge or pantry shelf",
  },
  {
    id: "receipt" as Method,
    icon: Receipt,
    label: "Scan Receipt",
    description: "Grocery receipt — paper or on screen",
  },
  {
    id: "manual" as Method,
    icon: PencilLine,
    label: "Manual Entry",
    description: "Type an ingredient name",
  },
];

export default function AddItemFlow() {
  const [method, setMethod] = useState<Method | null>(null);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#0B4D26]/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#0B4D26]/10">
        {method && (
          <button
            onClick={() => setMethod(null)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-[#0B4D26]/50 hover:text-[#0B4D26]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <h2 className="font-semibold text-[#0B4D26]">
          {method === "image" && "Scan Items"}
          {method === "receipt" && "Scan Receipt"}
          {method === "manual" && "Manual Entry"}
          {!method && "Add to Pantry"}
        </h2>
      </div>

      <div className="p-5">
        {/* Method picker */}
        {!method && (
          <div className="flex flex-col gap-2">
            {METHODS.map(({ id, icon: Icon, label, description }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
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

        {/* Image scan */}
        {method === "image" && <PhotoUploadStub scanType="fridge" />}

        {/* Receipt scan */}
        {method === "receipt" && <PhotoUploadStub scanType="receipt" />}

        {/* Manual entry */}
        {method === "manual" && <AddIngredient />}
      </div>
    </div>
  );
}
