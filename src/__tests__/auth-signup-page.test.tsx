import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

// ── next-auth mock ─────────────────────────────────────────────────────────
const { mockSignIn } = vi.hoisted(() => ({ mockSignIn: vi.fn() }));
vi.mock("next-auth/react", () => ({ signIn: mockSignIn }));

// ── next/navigation mock ───────────────────────────────────────────────────
const { mockPush } = vi.hoisted(() => ({ mockPush: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mockPush }) }));

// ── next/link mock ─────────────────────────────────────────────────────────
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// ── fetch mock ─────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

import SignUpPage from "@/app/auth/signup/page";

beforeEach(() => {
  vi.clearAllMocks();
  mockSignIn.mockResolvedValue({ error: null });
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
});

describe("Sign Up page", () => {
  it("renders the Join MyPlantry heading", () => {
    render(<SignUpPage />);
    expect(screen.getByText(/join myplantry/i)).toBeDefined();
  });

  it("renders name, email, and password inputs", () => {
    render(<SignUpPage />);
    expect(screen.getByPlaceholderText(/nina rhone/i)).toBeDefined();
    expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeDefined();
  });

  it("renders a Create Account button", () => {
    render(<SignUpPage />);
    expect(screen.getByRole("button", { name: /create account/i })).toBeDefined();
  });

  it("renders a Google sign-in button", () => {
    render(<SignUpPage />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeDefined();
  });

  it("renders a link back to login", () => {
    render(<SignUpPage />);
    const link = screen.getByRole("link", { name: /log in/i });
    expect(link.getAttribute("href")).toBe("/auth/login");
  });

  it("calls /api/auth/register with name, email, and password on submit", async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText(/nina rhone/i), { target: { value: "Nina" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "nina@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ name: "Nina", email: "nina@example.com", password: "password123" }),
      }));
    });
  });

  it("signs in with credentials after successful registration", async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText(/nina rhone/i), { target: { value: "Nina" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "nina@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "nina@example.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("redirects to /dashboard after successful registration + sign in", async () => {
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText(/nina rhone/i), { target: { value: "Nina" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "nina@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows a server error message when registration fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "An account with this email already exists." }) });
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText(/nina rhone/i), { target: { value: "Nina" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "taken@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeDefined());
  });

  it("does not call signIn when registration fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({ error: "An account with this email already exists." }) });
    render(<SignUpPage />);
    fireEvent.change(screen.getByPlaceholderText(/nina rhone/i), { target: { value: "Nina" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "taken@example.com" } });
    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/already exists/i)).toBeDefined());
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it("calls signIn('google') when Google button is clicked", () => {
    render(<SignUpPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/dashboard" });
  });
});
