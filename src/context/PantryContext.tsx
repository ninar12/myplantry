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
  addItem: (item: Omit<PantryItem, "id">) => Promise<void>
  removeItem: (id: string) => void
  recipes: Recipe[]
  generateRecipe: () => Promise<Recipe>
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

  const addItem = async (item: Omit<PantryItem, "id">) => {
    const res = await fetch("/api/pantry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    })
    const { item: newItem } = await res.json()
    if (newItem) setItems((prev) => [...prev, newItem])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    fetch(`/api/pantry?id=${id}`, { method: "DELETE" })
  }

  const toggleOpened = (id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, opened: !i.opened } : i)),
    )
    const item = items.find((i) => i.id === id)
    if (item) {
      fetch(`/api/pantry?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opened: !item.opened }),
      })
    }
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

  const generateRecipe = async (): Promise<Recipe> => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      })
      const data = await res.json()
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
    const { recipe: saved } = await res.json()
    if (saved) setSavedRecipes((prev) => [saved, ...prev])
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
    try {
      const res = await fetch("/api/shelf-life", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groceryItem.name }),
      })
      const data = await res.json()
      const location = groceryItem.category?.toLowerCase().includes("frozen")
        ? "freezer"
        : groceryItem.category?.toLowerCase().includes("pantry") ||
            groceryItem.category?.toLowerCase().includes("canned")
          ? "pantry"
          : "fridge"
      const days =
        location === "pantry"
          ? (data.pantry_days ?? 7)
          : location === "freezer"
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
        location: "fridge",
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
        recipes,
        generateRecipe,
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
