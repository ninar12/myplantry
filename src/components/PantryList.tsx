"use client";

import { usePantry } from "@/context/PantryContext";
import { Clock, Trash2 } from "lucide-react";

export default function PantryList() {
  const { items, removeItem } = usePantry();

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-16 h-16 bg-[#207245]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🥬</span>
        </div>
        <h3 className="text-[#0B4D26] font-bold text-lg mb-1">Your pantry is empty</h3>
        <p className="text-[#0B4D26]/60 text-sm">Add some ingredients to get recipe suggestions.</p>
      </div>
    );
  }

  // Sort items by expiration date
  const sortedItems = [...items].sort(
    (a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime()
  );

  const getExpirationStatus = (dateString: string) => {
    const daysUntil = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return { label: "Expired", color: "text-red-600 bg-red-50 border-red-200" };
    if (daysUntil === 0) return { label: "Expires today", color: "text-[#d97706] bg-[#fef3c7] border-[#fde68a]" };
    if (daysUntil <= 3) return { label: `Expires in ${daysUntil} days`, color: "text-[#d97706] bg-[#fef3c7] border-[#fde68a]" };
    return { label: `Expires in ${daysUntil} days`, color: "text-[#207245] bg-[#207245]/10 border-transparent" };
  };

  return (
    <div className="flex flex-col gap-3">
      {sortedItems.map((item) => {
        const status = getExpirationStatus(item.expiration_date);
        return (
          <div 
            key={item.id} 
            className="group flex items-center justify-between p-4 bg-white border border-[#0B4D26]/10 rounded-xl hover:border-[#207245]/30 hover:shadow-sm transition-all"
          >
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-[#0B4D26] capitalize flex items-center gap-2">
                {item.name}
                <span className="text-xs font-normal text-[#0B4D26]/50 bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                  {item.category}
                </span>
              </span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-md w-fit border flex items-center gap-1 ${status.color}`}>
                <Clock className="w-3 h-3" />
                {status.label}
              </span>
            </div>
            
            <button 
              onClick={() => removeItem(item.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
