// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// ── Supabase mock ──────────────────────────────────────────────────────────
const { mockFrom, mockSelect, mockEq, mockSingle, mockInsert, chain } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq     = vi.fn();
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockFrom   = vi.fn();

  const chain: Record<string, unknown> = {};
  chain.select = mockSelect.mockReturnValue(chain);
  chain.eq     = mockEq.mockReturnValue(chain);
  chain.single = mockSingle;
  chain.insert = mockInsert.mockReturnValue(chain);
  mockFrom.mockReturnValue(chain);

  return { mockFrom, mockSelect, mockEq, mockSingle, mockInsert, chain };
});

vi.mock("@/lib/supabase", () => ({
  supabase: { from: mockFrom },
}));

// ── bcrypt mock — deterministic in tests ──────────────────────────────────
vi.mock("bcryptjs", () => ({
  default: {
    hash:    vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
}));

import { POST } from "@/app/api/auth/register/route";

function req(body: unknown) {
  return new NextRequest("http://localhost/api/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue(chain);
  mockSelect.mockReturnValue(chain);
  mockEq.mockReturnValue(chain);
  mockInsert.mockReturnValue(chain);
});

describe("POST /api/auth/register", () => {
  it("returns 400 when name is missing", async () => {
    const res = await POST(req({ email: "a@b.com", password: "password123" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/required/i);
  });

  it("returns 400 when email is missing", async () => {
    const res = await POST(req({ name: "Nina", password: "password123" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is missing", async () => {
    const res = await POST(req({ name: "Nina", email: "a@b.com" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when password is too short", async () => {
    const res = await POST(req({ name: "Nina", email: "a@b.com", password: "short" }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/8 characters/i);
  });

  it("returns 409 when email already exists", async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: "existing-id" }, error: null });

    const res = await POST(req({ name: "Nina", email: "taken@b.com", password: "password123" }));
    expect(res.status).toBe(409);
    expect((await res.json()).error).toMatch(/already exists/i);
  });

  it("returns 200 and creates the user on valid input", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { code: "PGRST116" } });
    mockInsert.mockReturnValue({ ...chain, then: (_: unknown, rej: (e: unknown) => unknown) => Promise.resolve({ error: null }).then(() => ({ error: null })) });

    // Override chain so insert resolves with no error
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const res = await POST(req({ name: "Nina", email: "new@b.com", password: "password123" }));
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it("returns 500 when database insert fails", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: { message: "DB error" } }),
    });

    const res = await POST(req({ name: "Nina", email: "new@b.com", password: "password123" }));
    expect(res.status).toBe(500);
  });

  it("hashes the password before storing", async () => {
    const bcrypt = await import("bcryptjs");
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    await POST(req({ name: "Nina", email: "new@b.com", password: "password123" }));
    expect(bcrypt.default.hash).toHaveBeenCalledWith("password123", 12);
  });

  it("never stores the plain-text password", async () => {
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockInsertFn = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: vi.fn().mockResolvedValue({ data: null, error: null }) }) }),
      insert: mockInsertFn,
    });

    await POST(req({ name: "Nina", email: "new@b.com", password: "password123" }));
    const insertedData = mockInsertFn.mock.calls[0][0];
    expect(insertedData).not.toHaveProperty("password");
    expect(insertedData.password_hash).toBe("hashed_password");
  });
});
