"use client";

import { useState, useMemo } from "react";
import { usePantry } from "@/context/PantryContext";
import Image from "next/image";
import {
  Plus, Tag, Trash2, Loader2, CheckCircle2,
  AlertCircle, Apple, Beef, Milk, Package, Wheat, Archive, Layers,
} from "lucide-react";

const CATEGORIES = ["Produce", "Dairy", "Meat", "Grains", "Canned Goods", "Pantry", "Other"];

const CATEGORY_ICON: Record<string, React.ElementType> = {
  Produce:       Apple,
  Dairy:         Milk,
  Meat:          Beef,
  Grains:        Wheat,
  "Canned Goods":Archive,
  Pantry:        Package,
  Other:         Layers,
};

const CATEGORY_COLOR: Record<string, { bg: string; icon: string }> = {
  Produce:       { bg: "#dcfce7", icon: "#15803d" },
  Dairy:         { bg: "#ede9fe", icon: "#6d28d9" },
  Meat:          { bg: "#fee2e2", icon: "#b91c1c" },
  Grains:        { bg: "#fef9c3", icon: "#a16207" },
  "Canned Goods":{ bg: "#ffedd5", icon: "#c2410c" },
  Pantry:        { bg: "#cce6d9", icon: "#003527" },
  Other:         { bg: "#f5f3ef", icon: "#404944" },
};

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
        (new Date(duplicate.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24) // eslint-disable-line react-hooks/purity
      );
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

  const clearCompleted = () => {
    groceryItems.filter(i => i.bought).forEach(i => removeGroceryItem(i.id));
  };

  const boughtCount = groceryItems.filter(i => i.bought).length;
  const totalCount = groceryItems.length;
  const progress = totalCount > 0 ? Math.round((boughtCount / totalCount) * 100) : 0;

  // Group pending (not bought) items by category
  const byCategory = useMemo(() => {
    return groceryItems
      .filter(i => !i.bought)
      .reduce<Record<string, typeof groceryItems>>((acc, item) => {
        const cat = item.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
      }, {});
  }, [groceryItems]);

  const boughtItems = groceryItems.filter(i => i.bought);
  const categoryEntries = Object.entries(byCategory);

  // Split categories between left (first 2/3) and sidebar (last 1/3) — sidebar shows overflow
  const sidebarCategories = categoryEntries.slice(2);
  const mainCategories = categoryEntries.slice(0, 2);

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">

      {/* ── LEFT MAIN AREA ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Add form */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
          <div className="px-5 py-4" style={{ borderBottom: "1px solid #f5f3ef" }}>
            <h2
              className="font-bold text-base"
              style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.01em" }}
            >
              Grocery List
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#707974" }}>
              Add items you need to pick up, then check them off as you shop.
            </p>
          </div>
          <div className="p-5 flex flex-col gap-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Add a new item to your list..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
                onFocus={e => (e.target.style.borderColor = "#2b6954")}
                onBlur={e => (e.target.style.borderColor = "#bfc9c3")}
              />
              <div
                className="flex items-center gap-1 px-3 rounded-xl"
                style={{ background: "#f5f3ef", border: "1px solid #bfc9c3" }}
              >
                <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#707974" }} />
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="text-sm bg-transparent outline-none cursor-pointer pr-1"
                  style={{ color: "#404944" }}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                type="submit"
                disabled={!name.trim() || isAdding}
                className="p-2.5 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
              >
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </button>
            </form>

            {pendingItem && duplicateInfo && (
              <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af" }}>
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>You already have <strong>{duplicateInfo.name}</strong> in your pantry — expires in {duplicateInfo.daysLeft} days.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => pendingItem && doAdd(pendingItem.name, pendingItem.category)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: "#1d4ed8", color: "#ffffff" }}
                  >Add anyway</button>
                  <button
                    onClick={() => { setPendingItem(null); setDuplicateInfo(null); setName(""); }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold"
                    style={{ border: "1px solid #93c5fd", color: "#1e40af" }}
                  >Skip</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Empty state */}
        {totalCount === 0 && (
          <div
            className="rounded-2xl flex flex-col items-center justify-center py-16 px-6 text-center"
            style={{ background: "#ffffff", border: "1px solid #e4e2de" }}
          >
            <Image src="/myplantry_logo1.png" alt="" width={110} height={110} className="mb-4 drop-shadow-md" aria-hidden="true" />
            <p className="font-semibold text-sm mb-1" style={{ color: "#1b1c1a" }}>Your list is empty</p>
            <p className="text-xs" style={{ color: "#707974" }}>Add items you need to pick up.</p>
          </div>
        )}

        {/* Main categories (first 2) */}
        {mainCategories.map(([cat, catItems]) => {
          const Icon = CATEGORY_ICON[cat] ?? Layers;
          const colors = CATEGORY_COLOR[cat] ?? { bg: "#f5f3ef", icon: "#404944" };
          return (
            <CategorySection
              key={cat}
              cat={cat}
              catItems={catItems}
              Icon={Icon}
              colors={colors}
              movingId={movingId}
              onCheck={handleMarkBought}
              onRemove={removeGroceryItem}
            />
          );
        })}

        {/* Remaining categories (when no sidebar split) */}
        <div className="lg:hidden flex flex-col gap-5">
          {sidebarCategories.map(([cat, catItems]) => {
            const Icon = CATEGORY_ICON[cat] ?? Layers;
            const colors = CATEGORY_COLOR[cat] ?? { bg: "#f5f3ef", icon: "#404944" };
            return (
              <CategorySection
                key={cat}
                cat={cat}
                catItems={catItems}
                Icon={Icon}
                colors={colors}
                movingId={movingId}
                onCheck={handleMarkBought}
                onRemove={removeGroceryItem}
              />
            );
          })}
        </div>

        {/* Bought / completed on mobile */}
        {boughtItems.length > 0 && (
          <div className="lg:hidden">
            <BoughtSection boughtItems={boughtItems} onRemove={removeGroceryItem} />
          </div>
        )}
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">

        {/* Progress card */}
        {totalCount > 0 && (
          <div className="rounded-2xl p-5" style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#707974" }}>
              Shopping Progress
            </p>
            <div className="flex items-end gap-2 mb-3">
              <span
                className="text-4xl font-extrabold leading-none"
                style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.03em" }}
              >
                {boughtCount}
              </span>
              <span className="text-sm pb-1" style={{ color: "#707974" }}>of {totalCount} items</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "#e4e2de" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #003527, #2b6954)" }}
              />
            </div>
            <div className="flex gap-2">
              {boughtCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: "#f5f3ef", color: "#404944", border: "1px solid #e4e2de" }}
                >
                  Clear Completed
                </button>
              )}
              <div
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-center"
                style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
              >
                {progress}% done
              </div>
            </div>
          </div>
        )}

        {/* Sidebar categories (overflow) */}
        <div className="hidden lg:flex flex-col gap-4">
          {sidebarCategories.map(([cat, catItems]) => {
            const Icon = CATEGORY_ICON[cat] ?? Layers;
            const colors = CATEGORY_COLOR[cat] ?? { bg: "#f5f3ef", icon: "#404944" };
            return (
              <CategorySection
                key={cat}
                cat={cat}
                catItems={catItems}
                Icon={Icon}
                colors={colors}
                movingId={movingId}
                onCheck={handleMarkBought}
                onRemove={removeGroceryItem}
              />
            );
          })}
        </div>

        {/* Completed items */}
        {boughtItems.length > 0 && (
          <div className="hidden lg:block">
            <BoughtSection boughtItems={boughtItems} onRemove={removeGroceryItem} />
          </div>
        )}

        {/* Tip card */}
        <div
          className="rounded-2xl px-5 py-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(149,211,186,0.12) 0%, transparent 60%)" }} />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "rgba(149,211,186,0.8)" }}>
              Shopping Tip
            </p>
            <p className="text-sm text-white leading-relaxed">
              Group your items by store section to save time — produce, dairy, then dry goods.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──

function CategorySection({
  cat, catItems, Icon, colors, movingId, onCheck, onRemove,
}: {
  cat: string;
  catItems: ReturnType<typeof usePantry>["groceryItems"];
  Icon: React.ElementType;
  colors: { bg: string; icon: string };
  movingId: string | null;
  onCheck: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
      {/* Section header */}
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #f5f3ef" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: colors.bg }}>
          <Icon className="w-4 h-4" style={{ color: colors.icon }} />
        </div>
        <span
          className="font-semibold text-sm flex-1"
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}
        >
          {cat}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#bfc9c3" }}>
          {catItems.length} {catItems.length === 1 ? "item" : "items"}
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col">
        {catItems.map((item, idx) => (
          <div
            key={item.id}
            className="group flex items-center gap-3 px-5 py-3.5 transition-colors"
            style={{ borderBottom: idx < catItems.length - 1 ? "1px solid #f5f3ef" : "none" }}
          >
            {movingId === item.id ? (
              <div className="flex items-center gap-2 flex-1">
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#2b6954" }} />
                <span className="text-sm italic" style={{ color: "#707974" }}>Moving to pantry...</span>
              </div>
            ) : (
              <>
                {/* Custom checkbox */}
                <button
                  onClick={() => onCheck(item.id)}
                  className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ borderColor: "#bfc9c3" }}
                  aria-label={`Mark ${item.name} as bought`}
                />
                <span
                  className="flex-1 text-sm font-medium capitalize"
                  style={{ color: "#1b1c1a", fontFamily: "var(--font-plus-jakarta), sans-serif" }}
                >
                  {item.name}
                </span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: "#bfc9c3" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#bfc9c3"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BoughtSection({
  boughtItems, onRemove,
}: {
  boughtItems: ReturnType<typeof usePantry>["groceryItems"];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#f5f3ef", border: "1px solid #e4e2de" }}>
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid #e4e2de" }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#cce6d9" }}>
          <CheckCircle2 className="w-4 h-4" style={{ color: "#003527" }} />
        </div>
        <span className="font-semibold text-sm flex-1" style={{ color: "#707974" }}>In Cart</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#bfc9c3" }}>
          {boughtItems.length}
        </span>
      </div>
      <div className="flex flex-col">
        {boughtItems.map((item, idx) => (
          <div
            key={item.id}
            className="group flex items-center gap-3 px-5 py-3.5"
            style={{ borderBottom: idx < boughtItems.length - 1 ? "1px solid #e4e2de" : "none" }}
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: "#2b6954" }} />
            <span className="flex-1 text-sm capitalize line-through" style={{ color: "#bfc9c3" }}>
              {item.name}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              style={{ color: "#bfc9c3" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "#fef2f2"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#bfc9c3"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
