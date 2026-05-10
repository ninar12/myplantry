"use client";

import { usePantry } from "@/context/PantryContext";

export default function PantryCount() {
  const { items } = usePantry();
  return (
    <span className="text-sm font-normal bg-[#2b6954]/10 text-[#003527] px-2.5 py-1 rounded-full">
      {items.length} {items.length === 1 ? 'item' : 'items'}
    </span>
  );
}
