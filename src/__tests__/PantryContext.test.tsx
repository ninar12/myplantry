import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { PantryProvider, usePantry } from "@/context/PantryContext";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PantryProvider>{children}</PantryProvider>
);

const testItem = {
  name: "Oat Milk",
  category: "Dairy",
  quantity: 2,
  opened: false,
  expiration_date: "2026-04-01T00:00:00.000Z",
  location: "fridge" as const,
};

const newItemFromApi = { id: "generated-id", ...testItem };

function makeFetch() {
  return vi.fn((url: string, options?: RequestInit) => {
    const method = options?.method ?? "GET";

    if (url === "/api/pantry" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
    if (url === "/api/grocery" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
    if (url === "/api/recipes" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ recipes: [] }) });
    if (url === "/api/pantry" && method === "POST")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ item: newItemFromApi }) });
    if (url.startsWith("/api/pantry?id=") && method === "DELETE")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });

    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", makeFetch());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("usePantry", () => {
  it("throws when used outside of PantryProvider", () => {
    expect(() => renderHook(() => usePantry())).toThrow(
      "usePantry must be used within a PantryProvider"
    );
  });

  it("addItem adds an item returned from the API", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addItem(testItem);
    });

    expect(result.current.items).toHaveLength(1);
    const added = result.current.items.find((i) => i.name === "Oat Milk");
    expect(added).toBeDefined();
    expect(added?.id).toBe("generated-id");
    expect(added?.quantity).toBe(2);
  });

  it("removeItem removes the correct item by id", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.addItem(testItem); });
    const added = result.current.items.find((i) => i.name === "Oat Milk")!;

    act(() => result.current.removeItem(added.id));
    expect(result.current.items.find((i) => i.id === added.id)).toBeUndefined();
  });

  it("removeItem does not remove other items", async () => {
    const { result } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Mock two distinct API responses
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ items: [] }) }) // GET pantry
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ items: [] }) }) // GET grocery
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ recipes: [] }) }) // GET recipes
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ item: { ...newItemFromApi, id: "id-1", name: "Oat Milk" } }) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ item: { ...newItemFromApi, id: "id-2", name: "Almond Milk" } }) })
      .mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) })
    );

    const { result: r2 } = renderHook(() => usePantry(), { wrapper });
    await waitFor(() => expect(r2.current.isLoading).toBe(false));

    await act(async () => { await r2.current.addItem(testItem); });
    await act(async () => { await r2.current.addItem({ ...testItem, name: "Almond Milk" }); });

    act(() => r2.current.removeItem("id-1"));

    expect(r2.current.items.find((i) => i.id === "id-1")).toBeUndefined();
    expect(r2.current.items.find((i) => i.name === "Almond Milk")).toBeDefined();
  });
});
