import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SavedRecipe } from "@/lib/types";

const { mockRemoveSavedRecipe, mockRecipes, mockPush } = vi.hoisted(() => {
  const mockRemoveSavedRecipe = vi.fn();
  const mockPush = vi.fn();
  const mockRecipes: SavedRecipe[] = [
    {
      id: "r1",
      title: "Garlic Pasta",
      ingredients: ["pasta", "garlic", "olive oil"],
      instructions: ["Boil pasta", "Sauté garlic", "Toss together"],
      match_percentage: 90,
      created_at: "2026-03-01T00:00:00.000Z",
    },
    {
      id: "r2",
      title: "Veggie Stir Fry",
      ingredients: ["broccoli", "soy sauce"],
      instructions: ["Heat pan", "Add veggies", "Add sauce"],
      match_percentage: undefined,
      created_at: "2026-03-10T00:00:00.000Z",
    },
  ];
  return { mockRemoveSavedRecipe, mockRecipes, mockPush };
});

vi.mock("@/context/PantryContext", () => ({
  usePantry: () => ({
    savedRecipes: mockRecipes,
    removeSavedRecipe: mockRemoveSavedRecipe,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}));

import SavedRecipes from "@/components/SavedRecipes";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SavedRecipes", () => {
  it("renders all saved recipe titles", () => {
    render(<SavedRecipes />);
    expect(screen.getByText("Garlic Pasta")).toBeDefined();
    expect(screen.getByText("Veggie Stir Fry")).toBeDefined();
  });

  it("shows match percentage badge when present", () => {
    render(<SavedRecipes />);
    expect(screen.getByText("90% match")).toBeDefined();
  });

  it("shows match badge only for recipes that have one", () => {
    render(<SavedRecipes />);
    expect(screen.queryAllByText(/% match/)).toHaveLength(1);
  });

  it("hides ingredients and instructions by default", () => {
    render(<SavedRecipes />);
    expect(screen.queryByText("Boil pasta")).toBeNull();
    expect(screen.queryByText("Sauté garlic")).toBeNull();
  });

  it("navigates to the recipe detail page on click", () => {
    render(<SavedRecipes />);
    fireEvent.click(screen.getByText("Garlic Pasta"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/recipes/r1");
  });

  it("navigates to the correct recipe when the second card is clicked", () => {
    render(<SavedRecipes />);
    fireEvent.click(screen.getByText("Veggie Stir Fry"));
    expect(mockPush).toHaveBeenCalledWith("/dashboard/recipes/r2");
  });

  it("does not show recipe details inline on the list page", () => {
    render(<SavedRecipes />);
    expect(screen.queryByText("Boil pasta")).toBeNull();
    expect(screen.queryByText("Heat pan")).toBeNull();
  });

  it("calls removeSavedRecipe with the correct id when delete is clicked", () => {
    render(<SavedRecipes />);
    fireEvent.click(screen.getAllByLabelText(/delete recipe/i)[0]);
    expect(mockRemoveSavedRecipe).toHaveBeenCalledWith("r1");
  });

  it("calls removeSavedRecipe only once per click", () => {
    render(<SavedRecipes />);
    fireEvent.click(screen.getAllByLabelText(/delete recipe/i)[1]);
    expect(mockRemoveSavedRecipe).toHaveBeenCalledTimes(1);
    expect(mockRemoveSavedRecipe).toHaveBeenCalledWith("r2");
  });

  it("does not show empty state when recipes exist", () => {
    render(<SavedRecipes />);
    expect(screen.queryByText("No saved recipes yet")).toBeNull();
  });
});
