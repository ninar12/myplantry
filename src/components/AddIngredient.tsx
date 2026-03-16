"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import { usePantry } from "@/context/PantryContext";

export default function AddIngredient() {
  const { addItem } = usePantry();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Produce");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Default expiration to 7 days from now for manual entries
    const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    addItem({
      name: name.trim(),
      category,
      quantity: 1,
      expiration_date: expiration,
      location: "fridge",
    });
    
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <div className="relative">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tomato, Milk, Chicken..."
          className="w-full pl-4 pr-12 py-3 rounded-xl border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all placeholder:text-gray-400 text-[#0B4D26] font-medium"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#FFC629] text-[#0B4D26] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fbbb21] transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-2 pl-2">
        <Tag className="w-4 h-4 text-[#0B4D26]/50" />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm bg-transparent outline-none text-[#0B4D26]/70 cursor-pointer hover:text-[#0B4D26] transition-colors"
        >
          <option value="Produce">Produce</option>
          <option value="Dairy">Dairy</option>
          <option value="Meat">Meat</option>
          <option value="Grains">Grains</option>
          <option value="Canned Goods">Canned Goods</option>
          <option value="Pantry">Pantry Items</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </form>
  );
}
