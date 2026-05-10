"use client";

import { useRouter } from "next/navigation";

export default function LandingSignInButton({ size = "default" }: { size?: "default" | "large" }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/auth/signup")}
      style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)" }}
      className={`inline-flex items-center justify-center font-semibold text-white rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-md hover:shadow-lg ${
        size === "large" ? "px-8 py-3.5 text-base" : "px-6 py-2.5 text-sm"
      }`}
    >
      Get Started Free
    </button>
  );
}
