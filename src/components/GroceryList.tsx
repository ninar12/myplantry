"use client";

import { useState } from "react";
import { usePantry } from "@/context/PantryContext";
import { Plus, Tag, Trash2, Loader2, ShoppingCart } from "lucide-react";

const CATEGORIES = ["Produce", "Dairy", "Meat", "Grains", "Canned Goods", "Pantry", "Other"];

export default function GroceryList() {
  const { groceryItems, addGroceryItem, removeGroceryItem, markGroceryBought, checkPantryDuplicate } = usePantry();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Produce");
  const [isAdding, setIsAdding] = useState(false);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [pendingItem, setPendingItem] = useState<{ name: string; category: string } | null>(null);
  const [duplicateInfo, setDuplicateInfo] = useState<{ name: string; daysLeft: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const duplicate = checkPantryDuplicate(name.trim());
    if (duplicate) {
      const daysLeft = Math.ceil(
        (new Date(duplicate.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      // Only warn if item expires in more than 3 days
      if (daysLeft > 3) {
        setPendingItem({ name: name.trim(), category });
        setDuplicateInfo({ name: duplicate.name, daysLeft });
        return;
      }
    }

    await doAdd(name.trim(), category);
  };

  const doAdd = async (itemName: string, itemCategory: string) => {
    setIsAdding(true);
    setPendingItem(null);
    setDuplicateInfo(null);
    await addGroceryItem({ name: itemName, category: itemCategory, quantity: 1, bought: false });
    setName("");
    setIsAdding(false);
  };

  const handleMarkBought = async (id: string) => {
    setMovingId(id);
    await markGroceryBought(id);
    setMovingId(null);
  };

  if (groceryItems.length === 0 && !name) {
    return (
      <div className="flex flex-col gap-4">
        <AddForm
          name={name} setName={setName}
          category={category} setCategory={setCategory}
          isAdding={isAdding} onSubmit={handleSubmit}
          pendingItem={pendingItem} duplicateInfo={duplicateInfo}
          onAddAnyway={() => pendingItem && doAdd(pendingItem.name, pendingItem.category)}
          onCancel={() => { setPendingItem(null); setDuplicateInfo(null); setName(""); }}
        />
        <div className="text-center py-10 px-4">
          <div className="w-16 h-16 bg-[#207245]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-7 h-7 text-[#207245]" />
          </div>
          <h3 className="text-[#0B4D26] font-bold text-lg mb-1">Your grocery list is empty</h3>
          <p className="text-[#0B4D26]/60 text-sm">Add items you need to buy.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <AddForm
        name={name} setName={setName}
        category={category} setCategory={setCategory}
        isAdding={isAdding} onSubmit={handleSubmit}
        pendingItem={pendingItem} duplicateInfo={duplicateInfo}
        onAddAnyway={() => pendingItem && doAdd(pendingItem.name, pendingItem.category)}
        onCancel={() => { setPendingItem(null); setDuplicateInfo(null); setName(""); }}
      />

      <div className="flex flex-col gap-2">
        {groceryItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-3 p-4 bg-white border border-[#0B4D26]/10 rounded-xl hover:border-[#207245]/30 hover:shadow-sm transition-all"
          >
            {movingId === item.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Loader2 className="w-4 h-4 text-[#207245] animate-spin flex-shrink-0" />
                <span className="text-sm text-[#0B4D26]/60 italic">Moving to pantry...</span>
              </div>
            ) : (
              <>
                <input
                  type="checkbox"
                  checked={item.bought}
                  onChange={() => handleMarkBought(item.id)}
                  className="w-4 h-4 rounded accent-[#207245] cursor-pointer flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold text-[#0B4D26] capitalize ${item.bought ? "line-through opacity-50" : ""}`}>
                    {item.name}
                  </span>
                  <span className="ml-2 text-xs font-normal text-[#0B4D26]/50 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                    {item.category}
                  </span>
                </div>
                <button
                  onClick={() => removeGroceryItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AddForm({
  name, setName, category, setCategory, isAdding, onSubmit,
  pendingItem, duplicateInfo, onAddAnyway, onCancel,
}: {
  name: string;
  setName: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  isAdding: boolean;
  onSubmit: (e: React.FormEvent) => void;
  pendingItem: { name: string; category: string } | null;
  duplicateInfo: { name: string; daysLeft: number } | null;
  onAddAnyway: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add item..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all placeholder:text-gray-400 text-[#0B4D26] font-medium text-sm"
        />
        <div className="flex items-center gap-1 px-2 rounded-xl border border-[#0B4D26]/20 bg-gray-50/50">
          <Tag className="w-3.5 h-3.5 text-[#0B4D26]/40 flex-shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="text-sm bg-transparent outline-none text-[#0B4D26]/70 cursor-pointer pr-1"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!name.trim() || isAdding}
          className="p-2.5 bg-[#FFC629] text-[#0B4D26] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fbbb21] transition-colors shadow-sm"
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
        </button>
      </form>

      {pendingItem && duplicateInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-800">
          <p className="mb-2">
            ℹ You already have <strong>{duplicateInfo.name}</strong> in your pantry (expires in {duplicateInfo.daysLeft} days).
          </p>
          <div className="flex gap-2">
            <button
              onClick={onAddAnyway}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              Yes, add it
            </button>
            <button
              onClick={onCancel}
              className="px-3 py-1 border border-blue-300 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
