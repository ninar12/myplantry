import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PantryList from "@/components/PantryList";
import { PantryProvider } from "@/context/PantryContext";

const ONION_SHELF_LIFE = {
  pantry_days: 30, fridge_days: 7, freezer_days: 330, opened_fridge_days: null, category: "Produce",
};
const MILK_SHELF_LIFE = {
  pantry_days: null, fridge_days: 60, freezer_days: null, opened_fridge_days: 9, category: "Dairy",
};

const onionItem = {
  id: "onion-1", name: "Onion", category: "Produce", quantity: 1, opened: false,
  expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  location: "fridge" as const,
};
const milkItem = {
  id: "milk-1", name: "Milk", category: "Dairy", quantity: 1, opened: false,
  expiration_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  location: "fridge" as const,
};

function makeFetch(shelfLifeMap: Record<string, object> = {}, pantryItems = [onionItem, milkItem]) {
  return vi.fn((url: string, options?: RequestInit) => {
    const method = options?.method ?? "GET";
    if (url === "/api/pantry" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: pantryItems }) });
    if (url === "/api/grocery" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ items: [] }) });
    if (url === "/api/recipes" && method === "GET")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ recipes: [] }) });
    if (url === "/api/shelf-life" && method === "POST") {
      const body = JSON.parse((options?.body as string) ?? "{}");
      const name = body.name?.toLowerCase() ?? "";
      const data = Object.entries(shelfLifeMap).find(([k]) => name.includes(k))?.[1] ?? {};
      return Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
    }
    if (url.startsWith("/api/pantry?id=") && method === "PATCH")
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true }) });
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

function renderPantryList(shelfLifeMap: Record<string, object> = {}, pantryItems = [onionItem, milkItem]) {
  vi.stubGlobal("fetch", makeFetch(shelfLifeMap, pantryItems));
  return render(<PantryProvider><PantryList /></PantryProvider>);
}

function clickEditForItem(name: string) {
  // Find the item card in the main list (not the sidebar) and click its pencil button
  const allNames = screen.getAllByText(name);
  // The main card has a pencil button nearby; find the one in the card grid area
  const mainCard = allNames.find(el => el.closest("[class*='group']"))?.closest("[class*='group']");
  if (!mainCard) throw new Error(`Could not find main card for ${name}`);
  const pencilBtn = mainCard.querySelector(".lucide-pencil")?.closest("button") as HTMLElement;
  if (!pencilBtn) throw new Error(`No pencil button in card for ${name}`);
  fireEvent.click(pencilBtn);
}

afterEach(() => vi.unstubAllGlobals());

describe("PantryList edit — expiry recalculation on location change", () => {
  it("recalculates expiry when location changes from fridge to pantry", async () => {
    renderPantryList({ onion: ONION_SHELF_LIFE });

    await waitFor(() => expect(screen.getAllByText("Onion").length).toBeGreaterThan(0));
    clickEditForItem("Onion");

    const locationSelect = await waitFor(() => screen.getByDisplayValue("Fridge"));
    const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;
    const originalDate = dateInput.value;

    fireEvent.change(locationSelect, { target: { value: "pantry" } });

    await waitFor(() => {
      const newDate = (screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement).value;
      expect(newDate).not.toBe(originalDate);
      const daysFromNow = Math.round((new Date(newDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysFromNow).toBeGreaterThanOrEqual(28);
      expect(daysFromNow).toBeLessThanOrEqual(32);
    });
  });

  it("recalculates expiry when name changes to a different ingredient", async () => {
    renderPantryList({ onion: ONION_SHELF_LIFE, milk: MILK_SHELF_LIFE });

    await waitFor(() => expect(screen.getAllByText("Onion").length).toBeGreaterThan(0));
    clickEditForItem("Onion");

    const nameInput = await waitFor(() => screen.getByDisplayValue("Onion"));

    fireEvent.change(nameInput, { target: { value: "Milk" } });

    await waitFor(() => {
      const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;
      const daysFromNow = Math.round((new Date(dateInput.value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysFromNow).toBeGreaterThanOrEqual(58);
      expect(daysFromNow).toBeLessThanOrEqual(62);
    });
  });
});

describe("PantryContext toggleOpened — expiry recalculation", () => {
  it("switches to opened_fridge_days when toggling milk to opened", async () => {
    renderPantryList({ milk: MILK_SHELF_LIFE });

    await waitFor(() => screen.getAllByText("Milk"));

    const sealedBtns = screen.getAllByRole("button", { name: /sealed/i });
    fireEvent.click(sealedBtns[sealedBtns.length - 1]);

    await waitFor(() => {
      expect(screen.getAllByRole("button", { name: /opened/i }).length).toBeGreaterThan(0);
    });

    const patchCall = (vi.mocked(global.fetch) as ReturnType<typeof vi.fn>).mock.calls.find(
      (call: unknown[]) => String(call[0]).includes("/api/pantry?id=") && (call[1] as RequestInit)?.method === "PATCH"
    );
    expect(patchCall).toBeDefined();
    const body = JSON.parse((patchCall![1] as RequestInit).body as string);
    const daysFromNow = Math.round((new Date(body.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    expect(daysFromNow).toBeGreaterThanOrEqual(8);
    expect(daysFromNow).toBeLessThanOrEqual(10);
  });

  it("restores fridge_days when toggling opened milk back to sealed", async () => {
    const openMilk = { ...milkItem, opened: true, expiration_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString() };
    vi.stubGlobal("fetch", makeFetch({ milk: MILK_SHELF_LIFE }, [openMilk]));
    render(<PantryProvider><PantryList /></PantryProvider>);

    await waitFor(() => screen.getAllByText("Milk"));

    fireEvent.click(screen.getByRole("button", { name: /opened/i }));

    await waitFor(() => {
      const patchCalls = (vi.mocked(global.fetch) as ReturnType<typeof vi.fn>).mock.calls.filter(
        (call: unknown[]) => String(call[0]).includes("/api/pantry?id=") && (call[1] as RequestInit)?.method === "PATCH"
      );
      expect(patchCalls.length).toBeGreaterThan(0);
      const body = JSON.parse((patchCalls[patchCalls.length - 1][1] as RequestInit).body as string);
      const daysFromNow = Math.round((new Date(body.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysFromNow).toBeGreaterThanOrEqual(58);
      expect(daysFromNow).toBeLessThanOrEqual(62);
    });
  });
});
