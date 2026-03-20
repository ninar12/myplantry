"use client";

import { useState } from "react";
import { Plus, Sparkles, Calendar, AlertTriangle, PackageOpen, Refrigerator, Package, Snowflake } from "lucide-react";
import { usePantry } from "@/context/PantryContext";
import { PantryItem } from "@/lib/types";

type ExpiryMode = "auto" | "manual";
type Location = "fridge" | "pantry" | "freezer";

export default function AddIngredient() {
  const { addItem, checkPantryDuplicate } = usePantry();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [opened, setOpened] = useState(false);
  const [location, setLocation] = useState<Location>("fridge");
  const [expiryMode, setExpiryMode] = useState<ExpiryMode>("auto");
  const [manualDate, setManualDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pendingItem, setPendingItem] = useState<{
    name: string; expiryMode: ExpiryMode; manualDate: string;
    duplicate: PantryItem;
  } | null>(null);

  const resolveShelfLife = async (itemName: string): Promise<{ expiration_date: string; category: string }> => {
    try {
      const res = await fetch("/api/shelf-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: itemName }),
      });
      const data = await res.json();
      const days =
        location === "pantry" ? (data.pantry_days ?? 7)
        : location === "freezer" ? (data.freezer_days ?? 7)
        : (data.fridge_days ?? 7);
      return {
        expiration_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
        category: data.category ?? "Other",
      };
    } catch {
      return {
        expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: "Other",
      };
    }
  };

  const doAdd = async (itemName: string, mode: ExpiryMode, date: string) => {
    setIsLoading(true);
    let expiration_date: string;
    let category: string;

    if (mode === "manual" && date) {
      expiration_date = new Date(date).toISOString();
      const result = await resolveShelfLife(itemName);
      category = result.category;
    } else {
      const result = await resolveShelfLife(itemName);
      expiration_date = result.expiration_date;
      category = result.category;
    }

    await addItem({
      name: itemName,
      category,
      quantity: 1,
      amount: amount.trim() || undefined,
      opened,
      expiration_date,
      location,
    });
    setName("");
    setAmount("");
    setOpened(false);
    setManualDate("");
    setPendingItem(null);
    setIsLoading(false);
    setExpanded(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const duplicate = checkPantryDuplicate(name.trim());
    if (duplicate) {
      setPendingItem({ name: name.trim(), expiryMode, manualDate, duplicate });
      return;
    }

    await doAdd(name.trim(), expiryMode, manualDate);
  };

  const daysUntilDuplicateExpires = pendingItem
    ? Math.ceil((new Date(pendingItem.duplicate.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const pillBase = "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all";
  const pillActive = "bg-[#207245] text-white shadow-sm";
  const pillInactive = "text-[#0B4D26]/60 hover:text-[#0B4D26]";
  const pillGroup = "flex items-center gap-0.5 rounded-full border border-[#0B4D26]/15 p-0.5";

  return (
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        {/* Primary input — always visible */}
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setExpanded(true)}
            placeholder="e.g. Tomato, Milk, Chicken..."
            className="w-full pl-4 pr-12 py-3 rounded-lg border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all placeholder:text-gray-400 text-[#0B4D26] font-medium text-sm"
          />
          <button
            type="submit"
            disabled={!name.trim() || isLoading || (expiryMode === "manual" && !manualDate)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[#FFC629] text-[#0B4D26] rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#fbbb21] transition-colors shadow-sm"
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 animate-pulse" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Secondary controls — revealed on focus */}
        {expanded && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount (e.g. 1 cup, 500g)"
                className="flex-1 px-3 py-2 rounded-lg border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all placeholder:text-gray-400 text-[#0B4D26] text-xs"
              />
              <button
                type="button"
                onClick={() => setOpened((o) => !o)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                  opened
                    ? "bg-[#207245]/10 border-[#207245]/30 text-[#207245]"
                    : "border-[#0B4D26]/20 text-[#0B4D26]/50 hover:text-[#0B4D26]"
                }`}
              >
                <PackageOpen className="w-3.5 h-3.5" />
                {opened ? "Opened" : "Sealed"}
              </button>
            </div>

            {/* Location + expiry toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <div className={pillGroup}>
                <button type="button" onClick={() => setLocation("fridge")} className={`${pillBase} ${location === "fridge" ? pillActive : pillInactive}`}>
                  <Refrigerator className="w-3 h-3" /> Fridge
                </button>
                <button type="button" onClick={() => setLocation("pantry")} className={`${pillBase} ${location === "pantry" ? pillActive : pillInactive}`}>
                  <Package className="w-3 h-3" /> Pantry
                </button>
                <button type="button" onClick={() => setLocation("freezer")} className={`${pillBase} ${location === "freezer" ? pillActive : pillInactive}`}>
                  <Snowflake className="w-3 h-3" /> Freezer
                </button>
              </div>

              <div className={pillGroup}>
                <button type="button" onClick={() => setExpiryMode("auto")} className={`${pillBase} ${expiryMode === "auto" ? pillActive : pillInactive}`}>
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
                <button type="button" onClick={() => setExpiryMode("manual")} className={`${pillBase} ${expiryMode === "manual" ? pillActive : pillInactive}`}>
                  <Calendar className="w-3 h-3" /> Set date
                </button>
              </div>
            </div>

            {expiryMode === "manual" && (
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 rounded-lg border border-[#0B4D26]/20 bg-gray-50/50 outline-none focus:ring-2 focus:ring-[#207245] focus:border-transparent transition-all text-[#0B4D26] text-xs"
              />
            )}
          </>
        )}
      </form>

      {pendingItem && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>&ldquo;{pendingItem.duplicate.name}&rdquo;</strong> is already in your pantry
              {daysUntilDuplicateExpires > 0
                ? ` (expires in ${daysUntilDuplicateExpires} days)`
                : " (expired)"}.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => doAdd(pendingItem.name, pendingItem.expiryMode, pendingItem.manualDate)}
              className="px-3 py-1 bg-amber-600 text-white rounded-full text-xs font-semibold hover:bg-amber-700 transition-colors"
            >
              Add anyway
            </button>
            <button
              onClick={() => { setPendingItem(null); setName(""); }}
              className="px-3 py-1 border border-amber-300 rounded-full text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
