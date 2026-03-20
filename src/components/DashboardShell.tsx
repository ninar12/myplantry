"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import {
  Leaf,
  ShoppingBasket,
  ShoppingCart,
  BookOpen,
  MessageCircle,
  LogOut,
  Plus,
  X,
} from "lucide-react"
import PantryList from "@/components/PantryList"
import GroceryList from "@/components/GroceryList"
import SavedRecipes from "@/components/SavedRecipes"
import RecipeGenerator from "@/components/RecipeGenerator"
import CookingConsultant from "@/components/CookingConsultant"
import AddIngredient from "@/components/AddIngredient"
import BulkAddIngredients from "@/components/BulkAddIngredients"
import { usePantry } from "@/context/PantryContext"

type Section = "pantry" | "grocery" | "recipes" | "chat"

const NAV_ITEMS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "pantry", label: "Pantry", icon: ShoppingBasket },
  { id: "grocery", label: "Grocery", icon: ShoppingCart },
  { id: "recipes", label: "Recipes", icon: BookOpen },
  { id: "chat", label: "Chat", icon: MessageCircle },
]

export default function DashboardShell({
  userName,
}: {
  userName?: string | null
}) {
  const [active, setActive] = useState<Section>("pantry")
  const [showAdd, setShowAdd] = useState(false)
  const [addMode, setAddMode] = useState<"single" | "bulk">("single")
  const { data: session } = useSession()
  const { items, groceryItems, savedRecipes } = usePantry()

  const counts: Partial<Record<Section, number>> = {
    pantry: items.length,
    grocery: groceryItems.length,
    recipes: savedRecipes.length,
  }

  const expiringItems = items.filter((item) => {
    const days = Math.ceil((new Date(item.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return days >= 0 && days <= 3
  })
  const expiredItems = items.filter((item) => new Date(item.expiration_date).getTime() < Date.now())

  const displayName = userName ?? session?.user?.name ?? null
  const displayEmail = session?.user?.email ?? null
  const avatarInitial =
    displayName?.[0]?.toUpperCase() ?? displayEmail?.[0]?.toUpperCase() ?? "?"

  return (
    <div className="flex min-h-screen bg-[#FDF9F1]">
      {/* ── Sidebar (desktop) ─────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-[#0B4D26]/10 z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#0B4D26]/10">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="bg-[#0B4D26] text-[#FDF9F1] p-1.5 rounded-xl shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#0B4D26]">
              MyPlantry
            </span>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            const count = counts[id]
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0B4D26] text-white shadow-sm"
                    : "text-[#0B4D26]/60 hover:bg-[#0B4D26]/5 hover:text-[#0B4D26]"
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {count !== undefined && count > 0 && (
                  <span
                    className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#0B4D26]/10 text-[#0B4D26]/60"
                    }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User + sign out */}
        <div className="px-3 py-4 border-t border-[#0B4D26]/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#207245]/15 flex items-center justify-center text-[#0B4D26] font-bold text-sm flex-shrink-0">
              {avatarInitial}
            </div>
            <div className="flex-1 min-w-0">
              {displayName && (
                <p className="text-sm font-semibold text-[#0B4D26] truncate">
                  {displayName}
                </p>
              )}
              {displayEmail && (
                <p className="text-xs text-[#0B4D26]/40 truncate">
                  {displayEmail}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-[#0B4D26]/50 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-60 min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#0B4D26]/10 px-4 py-3 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-[#0B4D26] text-[#FDF9F1] p-1.5 rounded-xl shadow-sm">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#0B4D26]">
              MyPlantry
            </span>
          </Link>
          <button
            onClick={() => signOut()}
            className="w-8 h-8 rounded-full bg-[#207245]/15 flex items-center justify-center text-[#0B4D26] font-bold text-sm"
            aria-label="Sign out">
            {avatarInitial}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 py-6 pb-28 lg:pb-10 lg:px-8">
          {/* Section header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-[#0B4D26] tracking-tight">
                {active === "pantry" &&
                  `Hey${displayName ? ` ${displayName.split(" ")[0]}` : ""}!`}
                {active === "grocery" && "Grocery List"}
                {active === "recipes" && "Recipes"}
                {active === "chat" && "Cooking Consultant"}
              </h1>
              <p className="text-[#0B4D26]/50 text-sm mt-0.5">
                {active === "pantry" && "Here's what's in your pantry."}
                {active === "grocery" && "Items you need to pick up."}
                {active === "recipes" &&
                  "Generate and save recipes from your pantry."}
                {active === "chat" && "Ask me anything about cooking."}
              </p>
              {active === "pantry" && items.length > 0 && (
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {expiringItems.length > 0 ? (
                    <button
                      onClick={() => setActive("recipes")}
                      className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-2.5 py-1 rounded-full hover:bg-red-100 transition-colors"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      {expiringItems.length} expiring soon — cook something?
                    </button>
                  ) : (
                    <span className="text-xs text-[#207245]/70 bg-[#207245]/8 border border-[#207245]/15 px-2.5 py-1 rounded-full font-medium">
                      ✓ Everything looks fresh
                    </span>
                  )}
                  {expiredItems.length > 0 && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full font-medium">
                      {expiredItems.length} expired
                    </span>
                  )}
                </div>
              )}
            </div>
            {active === "pantry" && (
              <button
                onClick={() => setShowAdd((v) => !v)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm self-start ${
                  showAdd
                    ? "bg-[#0B4D26]/8 text-[#0B4D26] hover:bg-[#0B4D26]/12"
                    : "bg-[#0B4D26] text-white hover:bg-[#207245]"
                }`}
              >
                {showAdd ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showAdd ? "Close" : "Add Item"}
              </button>
            )}
          </div>

          {/* Pantry */}
          {active === "pantry" && (
            <div className="flex flex-col gap-6 max-w-2xl">
              {showAdd && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#0B4D26]/10 overflow-hidden">
                  {/* Mode toggle */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-[#0B4D26]/10">
                    <h2 className="font-semibold text-[#0B4D26]">
                      Add to{" "}
                      {displayName
                        ? `${displayName.split(" ")[0]}'s Kitchen Stash`
                        : "Kitchen Stash"}
                    </h2>
                    <div className="flex gap-1 bg-[#0B4D26]/5 p-1 rounded-lg">
                      <button
                        onClick={() => setAddMode("single")}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                          addMode === "single"
                            ? "bg-[#0B4D26] text-white shadow-sm"
                            : "text-[#0B4D26]/60 hover:text-[#0B4D26]"
                        }`}>
                        Single
                      </button>
                      <button
                        onClick={() => setAddMode("bulk")}
                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                          addMode === "bulk"
                            ? "bg-[#0B4D26] text-white shadow-sm"
                            : "text-[#0B4D26]/60 hover:text-[#0B4D26]"
                        }`}>
                        Bulk
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    {addMode === "single" ? (
                      <AddIngredient />
                    ) : (
                      <BulkAddIngredients />
                    )}
                  </div>
                </div>
              )}
              <PantryList />
            </div>
          )}

          {/* Grocery */}
          {active === "grocery" && (
            <div className="max-w-2xl">
              <GroceryList />
            </div>
          )}

          {/* Recipes */}
          {active === "recipes" && (
            <div className="flex flex-col gap-5 max-w-5xl">
              <RecipeGenerator />
              <SavedRecipes />
            </div>
          )}

          {/* Chat */}
          {active === "chat" && (
            <div
              className="max-w-2xl"
              style={{ height: "calc(100vh - 200px)" }}>
              <CookingConsultant alwaysOpen />
            </div>
          )}
        </main>

        {/* ── Bottom nav (mobile) ─────────────────────────────────────── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#0B4D26]/10 z-30 flex">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            const count = counts[id]
            return (
              <button
                key={id}
                onClick={() => setActive(id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors">
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-[#0B4D26]" : "text-[#0B4D26]/35"
                    }`}
                  />
                  {count !== undefined && count > 0 && (
                    <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#FFC629] rounded-full text-[8px] font-bold text-[#0B4D26] flex items-center justify-center leading-none">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-semibold transition-colors ${
                    isActive ? "text-[#0B4D26]" : "text-[#0B4D26]/35"
                  }`}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
