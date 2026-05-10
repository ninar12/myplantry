"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Eye, EyeOff, ArrowLeft } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);
    if (result?.error) {
      setError("Account created. Please log in.");
      router.push("/auth/login");
    } else {
      router.push("/dashboard");
    }
  };

  const handleGoogle = () => signIn("google", { callbackUrl: "/dashboard" });

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: "#fbf9f5", fontFamily: "var(--font-manrope), sans-serif" }}
    >
      {/* Header */}
      <header className="flex items-center justify-between px-6 pt-8 pb-4">
        <Link href="/" className="flex items-center gap-2 p-1" style={{ color: "#404944" }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl" style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}>
            <Leaf className="w-4 h-4 text-white" />
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
        <div className="mb-8">
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", color: "#003527", letterSpacing: "-0.02em" }}
          >
            Join MyPlantry.
          </h1>
          <p className="text-sm font-medium mb-0.5" style={{ color: "#2b6954" }}>Create your pantry</p>
          <p className="text-sm leading-relaxed" style={{ color: "#404944" }}>
            Organize your kitchen with intention.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#404944" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nina Rhone"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
              onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
              onBlur={(e) => (e.target.style.borderColor = "#bfc9c3")}
            />
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#404944" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
              style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
              onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
              onBlur={(e) => (e.target.style.borderColor = "#bfc9c3")}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#404944" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 pr-11 rounded-xl text-sm outline-none transition-all"
                style={{ background: "#f5f3ef", border: "1px solid #bfc9c3", color: "#1b1c1a" }}
                onFocus={(e) => (e.target.style.borderColor = "#2b6954")}
                onBlur={(e) => (e.target.style.borderColor = "#bfc9c3")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                style={{ color: "#707974" }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm px-4 py-2.5 rounded-xl" style={{ background: "#ffdad6", color: "#93000a" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
            style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ background: "#bfc9c3" }} />
          <span className="text-xs" style={{ color: "#707974" }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: "#bfc9c3" }} />
        </div>

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="w-full py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all hover:opacity-80 active:scale-[0.98]"
          style={{ background: "#ffffff", border: "1px solid #e4e2de", color: "#1b1c1a" }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm mt-8" style={{ color: "#707974" }}>
          Already part of the kitchen?{" "}
          <Link href="/auth/login" className="font-semibold" style={{ color: "#003527" }}>
            Log In
          </Link>
        </p>
      </main>
    </div>
  );
}
