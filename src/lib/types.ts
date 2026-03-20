export interface Ingredient {
  id: string;
  name: string;
  category: string;
  default_shelf_life: number;
}

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  amount?: string;
  opened: boolean;
  expiration_date: string; // ISO date string
  location: "fridge" | "pantry" | "freezer";
}

export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  bought: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  generated_by_ai: boolean;
  match_percentage?: number;
}

export interface SavedRecipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  match_percentage?: number;
  created_at: string;
}
