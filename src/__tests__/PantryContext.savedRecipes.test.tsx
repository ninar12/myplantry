import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { PantryProvider, usePantry } from "@/context/PantryContext";
import { Recipe, SavedRecipe } from "@/lib/types";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PantryProvider>{children}</PantryProvider>
);

const mockSavedRecipe: SavedRecipe = {
  id: "saved-1",
  title: "Pasta Primavera",
  ingredients: ["pasta", "zucchini", "tomato"],
  instructions: ["Boil pasta", "Sauté vegetables", "Combine"],
  match_percentage: 80,
  created_at: new Date().toISOString(),
};

const mockRecipe: Recipe = {
  id: "local-1",
  title: "Pasta Primavera",
  ingredients: ["pasta", "zucchini", "tomato"],
  instructions: ["Boil pasta", "Sauté vegetables", "Combine"],
  generated_by_ai: true,
  match_percentage: 80,
};

const mockPantryItem = {
  id: "item-1",
  name: "Tomato",
  category: "Produce",
  quantity: 3,
  amount: "3 count",
  opened: false,
  expiration_date: "2026-05-01T00:00:00.000Z",
  location: "fridge" as const,
};

function makeFetch(overrides: Record<string, unknown> = {}) {
  return vi.fn((url: string, options?: RequestInit) => {
    const method = options?.method ?? "GET";

    if (url === "/api/pantry" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [mockPantryItem] }) });

    if (url === "/api/grocery" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });

    if (url === "/api/recipes" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ recipes: [mockSavedRecipe] }) });

    if (url === "/api/recipes" && method === "POST")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ recipe: { ...mockSavedRecipe, id: "saved-new" } }) });

    if (url.startsWith("/api/recipes?id=") && method === "DELETE")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });

    if (url.startsWith("/api/pantry?id=") && method === "PATCH")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });

    return Promise.resolve({ ok: true, json: () => Promise.resolve(overrides) });
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", makeFetch());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("savedRecipes", () => {
  it("loads saved recipes from the API on mount", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.savedRecipes).toHaveLength(1);
    expect(result.current.savedRecipes[0].title).toBe("Pasta Primavera");
  });

  it("saveRecipe adds the recipe to savedRecipes", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const before = result.current.savedRecipes.length;
    await act(async () => {
      await result.current.saveRecipe(mockRecipe);
    });

    expect(result.current.savedRecipes).toHaveLength(before + 1);
  });

  it("saveRecipe calls POST /api/recipes with correct payload", async () => {
    const fetchMock = makeFetch();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveRecipe(mockRecipe);
    });

    const postCall = (fetchMock.mock.calls as [string, RequestInit][]).find(
      ([url, opts]) => url === "/api/recipes" && opts?.method === "POST"
    );
    expect(postCall).toBeDefined();
    const body = JSON.parse(postCall![1].body as string);
    expect(body.title).toBe("Pasta Primavera");
    expect(body.ingredients).toEqual(["pasta", "zucchini", "tomato"]);
    expect(body.match_percentage).toBe(80);
  });

  it("removeSavedRecipe removes the recipe from local state", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      result.current.removeSavedRecipe("saved-1");
    });

    expect(result.current.savedRecipes.find((r) => r.id === "saved-1")).toBeUndefined();
  });

  it("removeSavedRecipe calls DELETE /api/recipes?id=", async () => {
    const fetchMock = makeFetch();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.removeSavedRecipe("saved-1"));

    await waitFor(() => {
      const deleteCall = (fetchMock.mock.calls as [string, RequestInit][]).find(
        ([url, opts]) => url === "/api/recipes?id=saved-1" && opts?.method === "DELETE"
      );
      expect(deleteCall).toBeDefined();
    });
  });
});

describe("toggleOpened", () => {
  it("toggles the opened state of an item in local state", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const item = result.current.items.find((i) => i.id === "item-1")!;
    expect(item.opened).toBe(false);

    act(() => result.current.toggleOpened("item-1"));

    expect(result.current.items.find((i) => i.id === "item-1")?.opened).toBe(true);
  });

  it("toggles back to false on second call", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggleOpened("item-1"));
    act(() => result.current.toggleOpened("item-1"));

    expect(result.current.items.find((i) => i.id === "item-1")?.opened).toBe(false);
  });

  it("only affects the targeted item", async () => {
    const fetchMock = makeFetch();
    // Add a second item
    fetchMock.mockImplementation((url: string, options?: RequestInit) => {
      const method = options?.method ?? "GET";
      if (url === "/api/pantry" && method === "GET")
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                mockPantryItem,
                { ...mockPantryItem, id: "item-2", name: "Cheese", opened: false },
              ],
            }),
        });
      if (url === "/api/grocery" && method === "GET")
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
      if (url === "/api/recipes" && method === "GET")
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ recipes: [] }) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggleOpened("item-1"));

    expect(result.current.items.find((i) => i.id === "item-1")?.opened).toBe(true);
    expect(result.current.items.find((i) => i.id === "item-2")?.opened).toBe(false);
  });

  it("calls PATCH /api/pantry?id= with toggled value", async () => {
    const fetchMock = makeFetch();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.toggleOpened("item-1"));

    await waitFor(() => {
      const patchCall = (fetchMock.mock.calls as [string, RequestInit][]).find(
        ([url, opts]) => url === "/api/pantry?id=item-1" && opts?.method === "PATCH"
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse(patchCall![1].body as string);
      expect(body.opened).toBe(true);
    });
  });
});
