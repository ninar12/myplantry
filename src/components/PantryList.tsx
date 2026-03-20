"use client";

import { usePantry } from "@/context/PantryContext";
import { Clock, Trash2, PackageOpen, Package } from "lucide-react";

type UrgencyLevel = "critical" | "warning" | "fresh" | "expired";

function getUrgency(dateString: string): { level: UrgencyLevel; days: number; label: string } {
  const days = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0)  return { level: "expired",  days, label: "Expired" };
  if (days <= 2) return { level: "critical", days, label: days === 0 ? "Expires today" : `${days}d left` };
  if (days <= 7) return { level: "warning",  days, label: `${days}d left` };
  return         { level: "fresh",    days, label: `${days} days` };
}

const URGENCY_ORDER: Record<UrgencyLevel, number> = { critical: 0, warning: 1, fresh: 2, expired: 3 };

const CARD: Record<UrgencyLevel, string> = {
  critical: "bg-red-50/60 border-red-200 shadow-sm",
  warning:  "bg-amber-50/40 border-amber-200/80",
  fresh:    "bg-white border-[#0B4D26]/10",
  expired:  "bg-gray-50 border-gray-200 opacity-55",
};

const BADGE: Record<UrgencyLevel, string> = {
  critical: "text-red-700 bg-red-100 border-red-200 font-semibold",
  warning:  "text-amber-700 bg-amber-100 border-amber-200",
  fresh:    "text-[#207245]/70 bg-[#207245]/8 border-transparent",
  expired:  "text-gray-400 bg-gray-100 border-gray-200",
};

export default function PantryList() {
  const { items, removeItem, toggleOpened } = usePantry();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-14 h-14 bg-[#207245]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">🥬</span>
        </div>
        <h3 className="text-[#0B4D26] font-bold text-base mb-1">Your pantry is empty</h3>
        <p className="text-[#0B4D26]/50 text-sm">Add some ingredients to get recipe suggestions.</p>
      </div>
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    const ua = getUrgency(a.expiration_date);
    const ub = getUrgency(b.expiration_date);
    if (URGENCY_ORDER[ua.level] !== URGENCY_ORDER[ub.level]) {
      return URGENCY_ORDER[ua.level] - URGENCY_ORDER[ub.level];
    }
    return ua.days - ub.days;
  });

  return (
    <div className="flex flex-col gap-2">
      {sortedItems.map((item) => {
        const { level, label } = getUrgency(item.expiration_date);
        const isCritical = level === "critical";

        return (
          <div
            key={item.id}
            className={`group flex items-center justify-between border rounded-xl transition-all hover:shadow-sm ${CARD[level]} ${isCritical ? "px-4 py-3.5" : "px-4 py-3"}`}
          >
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-semibold text-[#0B4D26] capitalize ${isCritical ? "text-sm" : "text-sm"} ${level === "expired" ? "line-through text-gray-400" : ""}`}>
                  {item.name}
                </span>
                <span className="text-[10px] font-medium text-[#0B4D26]/40 bg-gray-100 px-2 py-0.5 rounded-full capitalize tracking-wide">
                  {item.category}
                </span>
                {item.amount && (
                  <span className="text-[10px] font-medium text-[#207245]/70 bg-[#207245]/10 px-2 py-0.5 rounded-full">
                    {item.amount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full border flex items-center gap-1 w-fit ${BADGE[level]}`}>
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  {label}
                </span>
                <button
                  onClick={() => toggleOpened(item.id)}
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors ${
                    item.opened
                      ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                      : "bg-gray-50 text-[#0B4D26]/40 border border-transparent hover:bg-gray-100"
                  }`}
                >
                  {item.opened ? <PackageOpen className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                  {item.opened ? "Opened" : "Sealed"}
                </button>
              </div>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              className="ml-3 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
