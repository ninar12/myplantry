"use client";

import { usePantry } from "@/context/PantryContext";

export default function PantryCount() {
  const { items } = usePantry();
  return (
    <span className="text-sm font-normal bg-[#207245]/10 text-[#0B4D26] px-2.5 py-1 rounded-full">
      {items.length} {items.length === 1 ? 'item' : 'items'}
    </span>
  );
}
