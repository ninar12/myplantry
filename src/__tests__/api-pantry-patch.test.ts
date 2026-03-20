// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-auth", () => ({ getServerSession: vi.fn() }));
vi.mock("@/app/api/auth/[...nextauth]/route", () => ({ authOptions: {} }));

const { mockFrom, mockUpdate, mockEq, chain } = vi.hoisted(() => {
  const mockEq = vi.fn();
  const mockUpdate = vi.fn();
  const mockFrom = vi.fn();
  const chain: Record<string, unknown> = {};
  chain.update = mockUpdate.mockReturnValue(chain);
  chain.eq = mockEq.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);
  return { mockFrom, mockUpdate, mockEq, chain };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
  getOrCreateUser: vi.fn().mockResolvedValue("user-123"),
}));

import { getServerSession } from "next-auth";
import { PATCH } from "@/app/api/pantry/route";

const authed = { user: { email: "test@example.com", name: "Test" } };

function req(url: string, body: unknown) {
  return new NextRequest(url, { method: "PATCH", body: JSON.stringify(body) });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUpdate.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);
});

describe("PATCH /api/pantry", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);
    expect((await PATCH(req("http://localhost/api/pantry?id=item-1", { opened: true }))).status).toBe(401);
  });

  it("returns 400 when id is missing", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    const res = await PATCH(req("http://localhost/api/pantry", { opened: true }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("Missing id");
  });

  it("updates opened to true and returns success", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    // Route calls .eq("id", ...).eq("user_id", ...) — first returns chain, second resolves
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

    const res = await PATCH(req("http://localhost/api/pantry?id=item-1", { opened: true }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("updates opened to false", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

    await PATCH(req("http://localhost/api/pantry?id=item-1", { opened: false }));
    expect(mockUpdate).toHaveBeenCalledWith({ opened: false });
  });

  it("scopes the update to the authenticated user", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: null });

    await PATCH(req("http://localhost/api/pantry?id=item-1", { opened: true }));
    expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
  });

  it("returns 500 on database error", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(authed);
    mockEq.mockReturnValueOnce(chain).mockResolvedValueOnce({ error: { message: "Update failed" } });

    expect((await PATCH(req("http://localhost/api/pantry?id=item-1", { opened: true }))).status).toBe(500);
  });
});
