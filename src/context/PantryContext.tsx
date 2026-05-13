"use client"

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react"
import { PantryItem, GroceryItem, Recipe, SavedRecipe } from "@/lib/types"

interface PantryContextType {
  items: PantryItem[]
  addItem: (item: Omit<PantryItem, "id">) => Promise<PantryItem | undefined>
  removeItem: (id: string) => void
  updateItem: (id: string, updates: Partial<Omit<PantryItem, "id">>) => Promise<void>
  upgradeResource: string | null
  clearUpgradePrompt: () => void
  recipes: Recipe[]
  generateRecipe: (prompt?: string) => Promise<Recipe>
  addSavedRecipe: (recipe: SavedRecipe) => void
  isGenerating: boolean
  isLoading: boolean
  groceryItems: GroceryItem[]
  addGroceryItem: (item: Omit<GroceryItem, "id">) => Promise<void>
  removeGroceryItem: (id: string) => void
  markGroceryBought: (id: string) => Promise<void>
  checkPantryDuplicate: (name: string) => PantryItem | null
  toggleOpened: (id: string) => void
  savedRecipes: SavedRecipe[]
  saveRecipe: (recipe: Recipe) => Promise<void>
  removeSavedRecipe: (id: string) => void
}

const PantryContext = createContext<PantryContextType | undefined>(undefined)

export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>([])
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [upgradeResource, setUpgradeResource] = useState<string | null>(null)

  const clearUpgradePrompt = () => setUpgradeResource(null)

  useEffect(() => {
    Promise.all([
      fetch("/api/pantry").then((r) => r.json()),
      fetch("/api/grocery").then((r) => r.json()),
      fetch("/api/recipes").then((r) => r.json()),
    ])
      .then(([pantryData, groceryData, recipesData]) => {
        if (pantryData.items) setItems(pantryData.items)
        if (groceryData.items) setGroceryItems(groceryData.items)
        if (recipesData.recipes) setSavedRecipes(recipesData.recipes)
      })
      .finally(() => setIsLoading(false))
  }, [])

  const addItem = async (item: Omit<PantryItem, "id">): Promise<PantryItem | undefined> => {
    const res = await fetch("/api/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    const data = await res.json()
    if (data.error === "limit_reached") { setUpgradeResource(data.resource); return }
    if (data.item) setItems((prev) => [...prev, data.item])
    return data.item
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    fetch(`/api/pantry?id=${id}`, { method: "DELETE" })
  }

  const updateItem = async (id: string, updates: Partial<Omit<PantryItem, "id">>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
    await fetch(`/api/pantry?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
  }

  const toggleOpened = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const nowOpened = !item.opened
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, opened: nowOpened } : i)))

    fetch("/api/shelf-life", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: item.name }),
    })
      .then((r) => r.json())
      .then((data) => {
        let days: number | null = null
        if (nowOpened) {
          days = data.opened_fridge_days ?? null
        } else {
          days =
            item.location === "pantry" ? (data.pantry_days ?? data.fridge_days ?? data.freezer_days ?? null)
            : item.location === "freezer" ? (data.freezer_days ?? data.fridge_days ?? data.pantry_days ?? null)
            : (data.fridge_days ?? data.pantry_days ?? data.freezer_days ?? null)
        }

        const updates: Partial<Omit<PantryItem, "id">> = { opened: nowOpened }
        if (days != null) {
          updates.expiration_date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
          setItems((prev) => prev.map((i) => (i.id === id ? { ...i, expiration_date: updates.expiration_date! } : i)))
        }
        fetch(`/api/pantry?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
      })
      .catch(() => {
        fetch(`/api/pantry?id=${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ opened: nowOpened }),
        })
      })
  }

  const checkPantryDuplicate = (name: string): PantryItem | null => {
    const n = name.trim().toLowerCase()
    return (
      items.find(
        (i) =>
          i.name.toLowerCase().includes(n) || n.includes(i.name.toLowerCase()),
      ) ?? null
    )
  }

  const addSavedRecipe = (recipe: SavedRecipe) => {
    setSavedRecipes((prev) => [recipe, ...prev])
  }

  const generateRecipe = async (prompt?: string): Promise<Recipe> => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, prompt }),
      })
      const data = await res.json()
      if (data.error === "limit_reached") { setUpgradeResource(data.resource); throw new Error("limit_reached") }
      const newRecipe: Recipe = {
        id: crypto.randomUUID(),
        title: data.title,
        ingredients: data.ingredients,
        instructions: data.instructions,
        generated_by_ai: true,
        match_percentage: data.match_percentage,
      }
      setRecipes((prev) => [newRecipe, ...prev])
      return newRecipe
    } finally {
      setIsGenerating(false)
    }
  }

  const addGroceryItem = async (item: Omit<GroceryItem, "id">) => {
    const res = await fetch("/api/grocery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    const { item: newItem } = await res.json()
    if (newItem) setGroceryItems((prev) => [...prev, newItem])
  }

  const removeGroceryItem = (id: string) => {
    setGroceryItems((prev) => prev.filter((i) => i.id !== id))
    fetch(`/api/grocery?id=${id}`, { method: "DELETE" })
  }

  const saveRecipe = async (recipe: Recipe) => {
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        match_percentage: recipe.match_percentage,
      }),
    })
    const data = await res.json()
    if (data.error === "limit_reached") { setUpgradeResource(data.resource); return }
    if (data.recipe) setSavedRecipes((prev) => [data.recipe, ...prev])
  }

  const removeSavedRecipe = (id: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== id))
    fetch(`/api/recipes?id=${id}`, { method: "DELETE" })
  }

  const markGroceryBought = async (id: string) => {
    const groceryItem = groceryItems.find((i) => i.id === id)
    if (!groceryItem) return

    // Get shelf life from AI then add to pantry
    let expiration_date: string
    const cat = groceryItem.category?.toLowerCase() ?? ""
    const storageLocation: "fridge" | "pantry" | "freezer" = cat.includes("frozen")
      ? "freezer"
      : cat.includes("pantry") || cat.includes("canned") ||
        cat.includes("condiment") || cat.includes("jarred") || cat.includes("staple")
        ? "pantry"
        : "fridge"
    try {
      const res = await fetch("/api/shelf-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groceryItem.name }),
      })
      const data = await res.json()
      const days =
        storageLocation === "pantry"
          ? (data.pantry_days ?? 7)
          : storageLocation === "freezer"
            ? (data.freezer_days ?? 7)
            : (data.fridge_days ?? 7)
      expiration_date = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000,
      ).toISOString()
    } catch {
      expiration_date = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      ).toISOString()
    }

    // Add to pantry and remove from grocery list concurrently
    await Promise.all([
      addItem({
        name: groceryItem.name,
        category: groceryItem.category,
        quantity: groceryItem.quantity,
        expiration_date,
        location: storageLocation,
        opened: false,
      }),
      fetch(`/api/grocery?id=${id}`, { method: "DELETE" }),
    ])

    setGroceryItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <PantryContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItem,
        upgradeResource,
        clearUpgradePrompt,
        recipes,
        generateRecipe,
        addSavedRecipe,
        isGenerating,
        isLoading,
        groceryItems,
        addGroceryItem,
        removeGroceryItem,
        markGroceryBought,
        checkPantryDuplicate,
        toggleOpened,
        savedRecipes,
        saveRecipe,
        removeSavedRecipe,
      }}>
      {children}
    </PantryContext.Provider>
  )
}

export function usePantry() {
  const context = useContext(PantryContext)
  if (context === undefined) {
    throw new Error("usePantry must be used within a PantryProvider")
  }
  return context
}
