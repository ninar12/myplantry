"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all text-[#003527] bg-[#2b6954]/10 hover:bg-[#2b6954]/20 focus:ring-2 focus:ring-[#2b6954]"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all shadow-sm hover:shadow-md hover:opacity-90" style={{ background: "linear-gradient(135deg, #003527 0%, #064e3b 100%)", color: "#ffffff" }}
    >
      <LogIn className="w-4 h-4" />
      Get Started
    </button>
  );
}
