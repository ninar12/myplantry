import { PantryItem, Recipe } from "./types";

export const initialPantryItems: PantryItem[] = [
  {
    id: "1",
    name: "Milk",
    category: "Dairy",
    quantity: 1,
    expiration_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    location: "fridge",
  },
  {
    id: "2",
    name: "Spinach",
    category: "Produce",
    quantity: 1,
    expiration_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    location: "fridge",
  },
  {
    id: "3",
    name: "Chicken Breast",
    category: "Meat",
    quantity: 2,
    expiration_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
    location: "fridge",
  },
  {
    id: "4",
    name: "Rice",
    category: "Grains",
    quantity: 1,
    expiration_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 6 months
    location: "pantry",
  },
  {
    id: "5",
    name: "Canned Beans",
    category: "Canned Goods",
    quantity: 3,
    expiration_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    location: "pantry",
  },
  {
    id: "6",
    name: "Tomatoes",
    category: "Produce",
    quantity: 4,
    expiration_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    location: "fridge",
  }
];

export const mockRecipes: Recipe[] = [
  {
    id: "r1",
    title: "Spinach Tomato Chicken Bowl",
    ingredients: [
      "Chicken Breast",
      "Spinach",
      "Tomatoes",
      "Rice"
    ],
    instructions: [
      "Cook rice according to package instructions.",
      "Season and sauté chicken in a pan until cooked through.",
      "Add tomatoes and spinach, cooking until spinach is wilted.",
      "Serve over rice."
    ],
    generated_by_ai: true,
    match_percentage: 100,
  },
  {
    id: "r2",
    title: "Simple Veggie Scramble",
    ingredients: [
      "Eggs",
      "Spinach",
      "Milk"
    ],
    instructions: [
      "Whisk eggs with a splash of milk and seasoning.",
      "Sauté spinach until wilted.",
      "Add eggs to the pan and scramble until cooked.",
    ],
    generated_by_ai: true,
    match_percentage: 66,
  }
];
