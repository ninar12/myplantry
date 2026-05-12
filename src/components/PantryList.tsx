"use client";

import { useState, useEffect } from "react";
import { usePantry } from "@/context/PantryContext";
import { PantryItem } from "@/lib/types";
import {
  Clock, Trash2, PackageOpen, Package, Pencil, FlaskConical,
  Check, X, AlertTriangle, Sparkles, Search, Flame,
} from "lucide-react";

type UrgencyLevel = "critical" | "warning" | "fresh" | "expired";

function getUrgency(dateString: string): { level: UrgencyLevel; days: number; label: string } {
  const days = Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0)  return { level: "expired",  days, label: "Expired" };
  if (days <= 2) return { level: "critical", days, label: days === 0 ? "Today" : `${days}d left` };
  if (days <= 7) return { level: "warning",  days, label: `${days}d left` };
  return         { level: "fresh",    days, label: `${days} days` };
}

const URGENCY_ORDER: Record<UrgencyLevel, number> = { critical: 0, warning: 1, fresh: 2, expired: 3 };

type EditForm = {
  name: string; category: string; quantity: number; amount: string;
  expiration_date: string; location: "fridge" | "pantry" | "freezer";
};

// Icon circle color per category
function getCategoryColor(category: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    "Meat":          { bg: "#fee2e2", text: "#b91c1c" },
    "Meat & Seafood":{ bg: "#fee2e2", text: "#b91c1c" },
    "Seafood":       { bg: "#dbeafe", text: "#1d4ed8" },
    "Dairy":         { bg: "#ede9fe", text: "#6d28d9" },
    "Produce":       { bg: "#dcfce7", text: "#15803d" },
    "Grains":        { bg: "#fef9c3", text: "#a16207" },
    "Canned Goods":  { bg: "#ffedd5", text: "#c2410c" },
    "Pantry":        { bg: "#cce6d9", text: "#003527" },
    "Freezer":       { bg: "#e0f2fe", text: "#0369a1" },
    "Other":         { bg: "#f5f3ef", text: "#404944" },
  };
  return map[category] || { bg: "#f5f3ef", text: "#404944" };
}

function ItemInitial({ name, category }: { name: string; category: string }) {
  const { bg, text } = getCategoryColor(category);
  return (
    <div
      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
      style={{ background: bg, color: text, fontFamily: "var(--font-plus-jakarta), sans-serif" }}
    >
      {name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

export default function PantryList() {
  const { items, removeItem, toggleOpened, updateItem } = usePantry();
  const [editingId,        setEditingId]        = useState<string | null>(null);
  const [usingId,          setUsingId]          = useState<string | null>(null);
  const [tappedId,         setTappedId]         = useState<string | null>(null);
  const [search,           setSearch]           = useState("");
  const [customPct,        setCustomPct]        = useState("");
  const [expiryWarningDays, setExpiryWarningDays] = useState<number>(3);

  useEffect(() => {
    fetch("/api/profile")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.preferences?.expiry_warning_days) setExpiryWarningDays(data.preferences.expiry_warning_days); })
      .catch(() => {});
  }, []);
  const [editForm,  setEditForm]    = useState<EditForm>({
    name: "", category: "", quantity: 1, amount: "", expiration_date: "", location: "fridge",
  });
  const [isRecalculating, setIsRecalculating] = useState(false);

  const applyUse = (item: PantryItem, percent: number) => {
    setUsingId(null);
    if (percent >= 100) { removeItem(item.id); return; }
    const remaining = parseFloat((item.quantity * (1 - percent / 100)).toFixed(2));
    if (remaining <= 0) removeItem(item.id);
    else updateItem(item.id, { quantity: remaining });
  };

  const recalcExpiry = async (name: string, location: EditForm["location"], opened: boolean) => {
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/shelf-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      const bestFallback = data.fridge_days ?? data.pantry_days ?? data.freezer_days ?? 7;
      const days =
        location === "pantry"  ? (data.pantry_days  ?? data.fridge_days  ?? data.freezer_days ?? 7)
        : location === "freezer" ? (data.freezer_days ?? data.fridge_days  ?? data.pantry_days  ?? 7)
        : (opened && data.opened_fridge_days != null ? data.opened_fridge_days : (data.fridge_days ?? bestFallback));
      const expiration_date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      setEditForm((f) => ({ ...f, expiration_date }));
    } catch { /* leave existing date */ }
    finally { setIsRecalculating(false); }
  };

  const startEdit = (item: PantryItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name, category: item.category, quantity: item.quantity,
      amount: item.amount ?? "", expiration_date: item.expiration_date.split("T")[0],
      location: item.location,
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const original = items.find((i) => i.id === editingId);
    const nameChanged = original && editForm.name.trim().toLowerCase() !== original.name.toLowerCase();
    const locationChanged = original && editForm.location !== original.location;

    let expiration_date = new Date(editForm.expiration_date).toISOString();

    if (nameChanged || locationChanged) {
      try {
        const res = await fetch("/api/shelf-life", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: editForm.name.trim() }),
        });
        const data = await res.json();
        const isOpened = original?.opened ?? false;
        const loc = editForm.location;
        const bestFallback = data.fridge_days ?? data.pantry_days ?? data.freezer_days ?? 7;
        const days =
          loc === "pantry"  ? (data.pantry_days  ?? data.fridge_days  ?? data.freezer_days ?? 7)
          : loc === "freezer" ? (data.freezer_days ?? data.fridge_days  ?? data.pantry_days  ?? 7)
          : (isOpened && data.opened_fridge_days != null ? data.opened_fridge_days : (data.fridge_days ?? bestFallback));
        expiration_date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      } catch { /* keep manual date on error */ }
    }

    updateItem(editingId, {
      name: editForm.name.trim(), category: editForm.category.trim(),
      quantity: editForm.quantity, amount: editForm.amount.trim() || undefined,
      expiration_date,
      location: editForm.location,
    });
    setEditingId(null);
  };

  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl flex flex-col items-center justify-center py-20 px-6 text-center"
        style={{ background: "#ffffff", border: "1px solid #e4e2de" }}
      >
        <div
          className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "linear-gradient(135deg, #f5f3ef 0%, #efeeea 100%)" }}
        >
          <span className="text-3xl">🥬</span>
        </div>
        <h3
          className="font-bold text-base mb-1"
          style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527" }}
        >
          Your larder is empty
        </h3>
        <p className="text-sm" style={{ color: "#707974" }}>Add some ingredients to get started.</p>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filteredItems = q ? items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : items;

  // Partition items
  const alertItems   = filteredItems.filter(i => getUrgency(i.expiration_date).level === "critical");
  const expiredItems = filteredItems.filter(i => getUrgency(i.expiration_date).level === "expired");
  const activeItems  = filteredItems.filter(i => getUrgency(i.expiration_date).level !== "expired");

  // Group active items by category
  const byCategory = activeItems.reduce<Record<string, PantryItem[]>>((acc, item) => {
    const cat = item.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // Sort each category by urgency
  Object.values(byCategory).forEach(list =>
    list.sort((a, b) => {
      const ua = getUrgency(a.expiration_date), ub = getUrgency(b.expiration_date);
      return URGENCY_ORDER[ua.level] !== URGENCY_ORDER[ub.level]
        ? URGENCY_ORDER[ua.level] - URGENCY_ORDER[ub.level]
        : ua.days - ub.days;
    })
  );

  const renderItemCard = (item: PantryItem) => {
    const { level, label } = getUrgency(item.expiration_date);
    const isEditing = editingId === item.id;

    if (isEditing) {
      return (
        <div key={item.id} className="rounded-2xl px-4 py-4 col-span-full" style={{ background: "#ffffff", border: "1px solid #bfc9c3" }}>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {[
              { key: "name",            label: "Name",    type: "text", value: editForm.name,            onChange: (v: string) => { setEditForm(f => ({ ...f, name: v })); recalcExpiry(v, editForm.location, items.find(i => i.id === editingId)?.opened ?? false); } },
              { key: "category",        label: "Category",type: "text", value: editForm.category,        onChange: (v: string) => setEditForm(f => ({ ...f, category: v })) },
              { key: "amount",          label: "Amount",  type: "text", value: editForm.amount,          onChange: (v: string) => setEditForm(f => ({ ...f, amount: v })), placeholder: "e.g. 500g" },
              { key: "expiration_date", label: "Expires", type: "date", value: editForm.expiration_date, onChange: (v: string) => setEditForm(f => ({ ...f, expiration_date: v })) },
            ].map(({ key, label: lbl, type, value, onChange, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#707974" }}>{lbl}</label>
                <input
                  type={type} value={value} placeholder={placeholder}
                  onChange={e => onChange(e.target.value)}
                  className="text-sm rounded-xl px-3 py-2 outline-none transition-all"
                  style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
                />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#707974" }}>Quantity</label>
              <input
                type="number" min={1} value={editForm.quantity}
                onChange={e => setEditForm(f => ({ ...f, quantity: Math.max(1, Number(e.target.value)) }))}
                className="text-sm rounded-xl px-3 py-2 outline-none"
                style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "#707974" }}>Location</label>
              <select
                value={editForm.location}
                onChange={e => {
                  const location = e.target.value as EditForm["location"];
                  setEditForm(f => ({ ...f, location }));
                  recalcExpiry(editForm.name, location, items.find(i => i.id === editingId)?.opened ?? false);
                }}
                className="text-sm rounded-xl px-3 py-2 outline-none"
                style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
              >
                <option value="fridge">Fridge</option>
                <option value="pantry">Pantry</option>
                <option value="freezer">Freezer</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={isRecalculating} className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl text-white transition-all hover:opacity-90 disabled:opacity-60" style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}>
              <Check className="w-3.5 h-3.5" /> {isRecalculating ? "Recalculating…" : "Save"}
            </button>
            <button onClick={() => setEditingId(null)} className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-xl transition-colors" style={{ background: "#f5f3ef", color: "#404944" }}>
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </div>
      );
    }

    const badgeStyle = {
      critical: { background: "#fee2e2", color: "#b91c1c" },
      warning:  { background: "#fef3c7", color: "#b45309" },
      fresh:    { background: "#cce6d9", color: "#003527" },
      expired:  { background: "#f5f3ef", color: "#707974" },
    }[level];

    const isTapped = tappedId === item.id;

    return (
      <div
        key={item.id}
        className="group relative flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all"
        style={{
          background: level === "critical" ? "#fff8f8" : "#ffffff",
          border: `1px solid ${isTapped ? "#bfc9c3" : level === "critical" ? "#fecaca" : "#e4e2de"}`,
          opacity: level === "expired" ? 0.6 : 1,
        }}
        onClick={() => setTappedId(isTapped ? null : item.id)}
      >
        <ItemInitial name={item.name} category={item.category} />

        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold text-sm capitalize leading-tight mb-1 ${level === "expired" ? "line-through" : ""}`}
            style={{ color: level === "expired" ? "#707974" : "#1b1c1a", fontFamily: "var(--font-plus-jakarta), sans-serif" }}
          >
            {item.name}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={badgeStyle}>
              <Clock className="w-3 h-3" /> {label}
            </span>
            {item.amount && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#cce6d9", color: "#003527" }}>
                {item.amount}
              </span>
            )}
            {item.quantity !== 1 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#f5f3ef", color: "#404944" }}>
                ×{item.quantity % 1 === 0 ? item.quantity : item.quantity.toFixed(2).replace(/\.?0+$/, "")}
              </span>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); toggleOpened(item.id); }}
              className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
              style={item.opened
                ? { background: "#fef3c7", color: "#b45309", border: "1px solid #fde68a" }
                : { background: "#f5f3ef", color: "#707974" }}
            >
              {item.opened ? <PackageOpen className="w-3 h-3" /> : <Package className="w-3 h-3" />}
              {item.opened ? "Opened" : "Sealed"}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center gap-1 transition-opacity flex-shrink-0 ${isTapped ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-within:opacity-100"}`}>
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setUsingId(usingId === item.id ? null : item.id); setCustomPct(""); }}
              className="p-1.5 rounded-xl transition-colors"
              style={{ color: "#707974" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f3ef"; (e.currentTarget as HTMLElement).style.color = "#2b6954"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#707974"; }}
              title="Use ingredient"
            >
              <FlaskConical className="w-4 h-4" />
            </button>
            {usingId === item.id && (
              <div className="absolute right-0 top-full mt-1 z-20 rounded-2xl shadow-xl p-3 min-w-[148px]" style={{ background: "#ffffff", border: "1px solid #e4e2de" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: "#707974" }}>Used how much?</p>
                <div className="flex flex-col gap-1">
                  {[25, 50, 75, 100].map(pct => (
                    <button key={pct} onClick={() => applyUse(item, pct)}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg text-left transition-colors"
                      style={pct === 100 ? { color: "#dc2626" } : { color: "#1b1c1a" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = pct === 100 ? "#fef2f2" : "#f5f3ef"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      {pct}%{pct === 100 ? " — all of it" : ""}
                    </button>
                  ))}
                  <div className="flex items-center gap-1 mt-1 pt-1" style={{ borderTop: "1px solid #f5f3ef" }}>
                    <input
                      type="number" min={1} max={100} placeholder="Custom %" value={customPct}
                      onChange={e => setCustomPct(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { const v = Math.min(100, Math.max(1, Number(customPct))); if (v) applyUse(item, v); } }}
                      className="w-full text-xs rounded-lg px-2 py-1.5 outline-none"
                      style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
                    />
                    <button
                      onClick={() => { const v = Math.min(100, Math.max(1, Number(customPct))); if (v) applyUse(item, v); }}
                      disabled={!customPct}
                      className="text-xs font-semibold px-2 py-1.5 rounded-lg disabled:opacity-30 text-white"
                      style={{ background: "#003527" }}
                    >Go</button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <button onClick={(e) => { e.stopPropagation(); startEdit(item); }} className="p-1.5 rounded-xl transition-colors" style={{ color: "#707974" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f5f3ef"; (e.currentTarget as HTMLElement).style.color = "#003527"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#707974"; }}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="p-1.5 rounded-xl transition-colors" style={{ color: "#707974" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#707974"; }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const sidebarItems = items
    .filter(i => {
      const { days } = getUrgency(i.expiration_date);
      return days >= 0 && days <= expiryWarningDays;
    })
    .sort((a, b) => getUrgency(a.expiration_date).days - getUrgency(b.expiration_date).days)
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#9ca39f" }} />
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search ingredients…"
        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{ background: "#ffffff", border: "1px solid #e4e2de", color: "#1b1c1a" }}
        onFocus={e => (e.target.style.borderColor = "#2b6954")}
        onBlur={e => (e.target.style.borderColor = "#e4e2de")}
      />
    </div>
    <div className="flex flex-col lg:flex-row gap-6 items-start">

      {/* ── LEFT SIDEBAR ── */}
      <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 flex flex-col gap-4 lg:sticky lg:top-6">

        {/* Expiring Soon */}
        {sidebarItems.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #fcd9a0" }}>
            {/* Header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%)", borderBottom: "1px solid #fcd9a0" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fed7aa" }}>
                  <Flame className="w-4 h-4" style={{ color: "#ea580c" }} />
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight" style={{ color: "#1b1c1a", fontFamily: "var(--font-plus-jakarta), sans-serif" }}>
                    Use these up
                  </p>
                  <p className="text-[10px]" style={{ color: "#b45309" }}>
                    within {expiryWarningDays} day{expiryWarningDays !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <span
                className="text-lg font-extrabold"
                style={{ color: "#ea580c", fontFamily: "var(--font-plus-jakarta), sans-serif" }}
              >
                {sidebarItems.length}
              </span>
            </div>

            {/* Items */}
            <div className="p-3 flex flex-col gap-1.5" style={{ background: "#fffdf9" }}>
              {sidebarItems.map((item) => {
                const { days } = getUrgency(item.expiration_date);
                const isToday = days === 0;
                const isCritical = days <= 1;
                const accent = isCritical ? "#ef4444" : days <= 3 ? "#f97316" : "#f59e0b";
                const rowBg  = isCritical ? "#fef2f2" : days <= 3 ? "#fff7ed" : "#fffbeb";
                const barPct = Math.max(6, Math.round(((expiryWarningDays - days) / expiryWarningDays) * 100));

                return (
                  <div
                    key={item.id}
                    className="rounded-xl px-3 pt-2.5 pb-2 flex flex-col gap-1.5"
                    style={{ background: rowBg }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="text-sm font-semibold capitalize truncate"
                        style={{ color: "#1b1c1a", fontFamily: "var(--font-plus-jakarta), sans-serif" }}
                      >
                        {item.name}
                      </p>
                      <span
                        className="text-xs font-bold flex-shrink-0 px-2 py-0.5 rounded-full"
                        style={{ background: accent + "22", color: accent }}
                      >
                        {isToday ? "today" : `${days}d`}
                      </span>
                    </div>
                    {/* Countdown bar — fills left-to-right as deadline approaches */}
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.07)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${barPct}%`, background: accent, transition: "width 0.6s ease" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2.5 flex items-center gap-1.5" style={{ background: "#fff7ed", borderTop: "1px solid #fcd9a0" }}>
              <AlertTriangle className="w-3 h-3 flex-shrink-0" style={{ color: "#f59e0b" }} />
              <p className="text-[10px]" style={{ color: "#b45309" }}>
                Threshold set in your profile
              </p>
            </div>
          </div>
        )}

        {/* Larder Insight */}
        <div
          className="rounded-2xl px-5 py-5 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at top right, rgba(149,211,186,0.12) 0%, transparent 60%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(149,211,186,0.8)" }}>Larder Insight</span>
            </div>
            <p className="text-sm text-white leading-relaxed mb-4">
              {alertItems.length > 0
                ? alertItems.length === 1
                  ? `Use your ${alertItems[0].name} before it expires — generate a recipe to make the most of it.`
                  : `You have ${alertItems.length} ingredients expiring within 2 days. Generate a recipe to use them up.`
                : `You have ${items.length} ingredient${items.length !== 1 ? "s" : ""} in your larder. Generate a recipe to see what's possible.`}
            </p>
            <div className="text-xs font-semibold text-white/60">
              {Object.keys(byCategory).length} categories · {items.length} items
            </div>
          </div>
        </div>

      </div>

      {/* ── RIGHT MAIN AREA ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">

        {/* Category sections */}
        {Object.entries(byCategory).map(([category, categoryItems]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-3">
              <h3
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "#707974" }}
              >
                {category}
              </h3>
              <div className="flex-1 h-px" style={{ background: "#e4e2de" }} />
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "#f5f3ef", color: "#707974" }}
              >
                {categoryItems.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {categoryItems.map(item => renderItemCard(item))}
            </div>
          </div>
        ))}

        {/* Expired section */}
        {expiredItems.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#bfc9c3" }}>Expired</h3>
              <div className="flex-1 h-px" style={{ background: "#e4e2de" }} />
              <span className="text-[10px] font-semibold" style={{ color: "#bfc9c3" }}>{expiredItems.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {expiredItems.map(item => renderItemCard(item))}
            </div>
          </div>
        )}

      </div>
    </div>
    </div>
  );
}
