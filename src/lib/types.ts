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
  expiration_date: string; // ISO date string
  location: "fridge" | "pantry" | "freezer";
}

export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  generated_by_ai: boolean;
  match_percentage?: number;
}
