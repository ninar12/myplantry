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

import LoginPage from "@/app/auth/login/page";

beforeEach(() => {
  vi.clearAllMocks();
  mockSignIn.mockResolvedValue({ error: null });
});

describe("Login page", () => {
  it("renders the welcome heading", () => {
    render(<LoginPage />);
    expect(screen.getByText(/welcome back/i)).toBeDefined();
  });

  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("you@example.com")).toBeDefined();
    expect(screen.getByPlaceholderText("••••••••")).toBeDefined();
  });

  it("renders a Log In button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /log in/i })).toBeDefined();
  });

  it("renders a Google sign-in button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeDefined();
  });

  it("renders links to the sign-up page", () => {
    render(<LoginPage />);
    const links = screen.getAllByRole("link", { name: /sign up/i });
    expect(links.length).toBeGreaterThanOrEqual(1);
    links.forEach((link) => expect(link.getAttribute("href")).toBe("/auth/signup"));
  });

  it("shows password in plain text when show/hide is toggled", () => {
    render(<LoginPage />);
    const input = screen.getByPlaceholderText("••••••••") as HTMLInputElement;
    expect(input.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "" })); // eye icon button
    expect(input.type).toBe("text");
  });

  it("calls signIn with credentials on form submit", async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "nina@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("credentials", {
        email: "nina@example.com",
        password: "password123",
        redirect: false,
      });
    });
  });

  it("redirects to /dashboard on successful login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "nina@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error message on failed login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "CredentialsSignin" });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "bad@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByText(/incorrect email or password/i)).toBeDefined());
  });

  it("does not redirect on failed login", async () => {
    mockSignIn.mockResolvedValueOnce({ error: "CredentialsSignin" });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "bad@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), { target: { value: "wrongpass" } });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => expect(screen.getByText(/incorrect email/i)).toBeDefined());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("calls signIn('google') when Google button is clicked", () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    expect(mockSignIn).toHaveBeenCalledWith("google", { callbackUrl: "/dashboard" });
  });
});
