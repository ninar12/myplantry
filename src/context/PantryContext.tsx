"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { PantryItem, Recipe } from "@/lib/types";
import { initialPantryItems, mockRecipes } from "@/lib/mockData";

interface PantryContextType {
  items: PantryItem[];
  addItem: (item: Omit<PantryItem, "id">) => void;
  removeItem: (id: string) => void;
  recipes: Recipe[];
  generateRecipe: () => Promise<Recipe>;
  isGenerating: boolean;
}

const PantryContext = createContext<PantryContextType | undefined>(undefined);

export function PantryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>(initialPantryItems);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const addItem = (item: Omit<PantryItem, "id">) => {
    const newItem = {
      ...item,
      id: Math.random().toString(36).substring(7),
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const generateRecipe = async () => {
    setIsGenerating(true);
    // Simulate AI loading delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // For now, return a mock recipe
    const newRecipe = mockRecipes[Math.floor(Math.random() * mockRecipes.length)];
    setRecipes((prev) => [newRecipe, ...prev]);
    setIsGenerating(false);
    return newRecipe;
  };

  return (
    <PantryContext.Provider value={{ items, addItem, removeItem, recipes, generateRecipe, isGenerating }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantry() {
  const context = useContext(PantryContext);
  if (context === undefined) {
    throw new Error("usePantry must be used within a PantryProvider");
  }
  return context;
}
