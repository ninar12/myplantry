// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));

const {
  mockFrom, mockSelect, mockInsert, mockDelete,
  mockEq, mockOrder, mockSingle, chain,
} = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockOrder = vi.fn();
  const mockEq = vi.fn();
  const mockInsert = vi.fn();
  const mockDelete = vi.fn();
  const mockSelect = vi.fn();
  const mockFrom = vi.fn();

  const chain: Record<string, unknown> = {};
  chain.select = mockSelect.mockReturnValue(chain);
  chain.insert = mockInsert.mockReturnValue(chain);
  chain.delete = mockDelete.mockReturnValue(chain);
  chain.eq = mockEq.mockReturnValue(chain);
  chain.order = mockOrder.mockReturnValue(chain);
  chain.single = mockSingle.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);

  return { mockFrom, mockSelect, mockInsert, mockDelete, mockEq, mockOrder, mockSingle, chain };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
  getOrCreateUser: vi.fn().mockResolvedValue("user-123"),
}));

import { getServerSession } from "next-auth";
import { GET, POST, DELETE } from "@/app/api/recipes/route";

const authed = { user: { email: "test@example.com", name: "Test" } };
const mockRow = {
  id: "recipe-1",
  title: "Garlic Pasta",
  ingredients: ["pasta", "garlic"],
  instructions: ["Boil", "Sauté"],
  match_percentage: 85,
  created_at: "2026-03-01T00:00:00.000Z",
};

function req(url: string, options: RequestInit = {}) {
  return new NextRequest(url, options);
}

function resetChain() {
  mockSelect.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
  mockDelete.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockOrder.mockReturnValue(chain);
  mockSingle.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetChain();
});

// ─── GET ────────────────────────────────────────────────────────────────────

describe("GET /api/recipes", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
  });

  it("returns the user's saved recipes", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockOrder.mockResolvedValueOnce({ data: [mockRow], error: null });

    const body = await (await GET()).json();
    expect(body.recipes).toHaveLength(1);
    expect(body.recipes[0].title).toBe("Garlic Pasta");
    expect(body.recipes[0].match_percentage).toBe(85);
  });

  it("returns an empty array when user has no saved recipes", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    expect((await (await GET()).json()).recipes).toHaveLength(0);
  });

  it("returns 500 on a database error", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockOrder.mockResolvedValueOnce({ data: null, error: { message: "DB error" } });
    expect((await GET()).status).toBe(500);
  });

  it("queries saved_recipes ordered by created_at desc", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    await GET();
    expect(mockFrom).toHaveBeenCalledWith("saved_recipes");
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("scopes query to authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    await GET();
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
  });
});

// ─── POST ───────────────────────────────────────────────────────────────────

describe("POST /api/recipes", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    const r = req("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify({ title: "X", ingredients: [], instructions: [] }),
    });
    expect((await POST(r)).status).toBe(401);
  });

  it("creates and returns a new saved recipe", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockSingle.mockResolvedValueOnce({ data: mockRow, error: null });

    const r = req("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify({
        title: "Garlic Pasta",
        ingredients: ["pasta", "garlic"],
        instructions: ["Boil", "Sauté"],
        match_percentage: 85,
      }),
    });
    const body = await (await POST(r)).json();
    expect(body.recipe.title).toBe("Garlic Pasta");
    expect(body.recipe.id).toBe("recipe-1");
  });

  it("returns undefined match_percentage when db returns null", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockSingle.mockResolvedValueOnce({ data: { ...mockRow, match_percentage: null }, error: null });

    const r = req("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify({ title: "Simple", ingredients: [], instructions: [] }),
    });
    const body = await (await POST(r)).json();
    expect(body.recipe.match_percentage).toBeUndefined();
  });

  it("returns 500 on database error", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Insert failed" } });

    const r = req("http://localhost/api/recipes", {
      method: "POST",
      body: JSON.stringify({ title: "X", ingredients: [], instructions: [] }),
    });
    expect((await POST(r)).status).toBe(500);
  });
});

// ─── DELETE ─────────────────────────────────────────────────────────────────

describe("DELETE /api/recipes", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    expect((await DELETE(req("http://localhost/api/recipes?id=r1", { method: "DELETE" }))).status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    const res = await DELETE(req("http://localhost/api/recipes", { method: "DELETE" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Missing id");
  });

  it("deletes the recipe and returns success", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    // Route calls .eq("id", ...).eq("user_id", ...) — first returns chain, second resolves
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

    const res = await DELETE(req("http://localhost/api/recipes?id=recipe-1", { method: "DELETE" }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("scopes the delete to the authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

    await DELETE(req("http://localhost/api/recipes?id=recipe-1", { method: "DELETE" }));
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
  });

  it("returns 500 on database error", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: { message: "Delete failed" } });

    expect((await DELETE(req("http://localhost/api/recipes?id=r1", { method: "DELETE" }))).status).toBe(500);
  });
});
