"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { LogIn, LogOut } from "lucide-react";

export default function LoginButton() {
  const { data: session } = useSession();

  if (session) {
    return (
      <button
        onClick={() => signOut()}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all text-[#0B4D26] bg-[#207245]/10 hover:bg-[#207245]/20 focus:ring-2 focus:ring-[#207245]"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google")}
      className="flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all bg-[#FFC629] text-[#0B4D26] hover:bg-[#fbbb21] shadow-sm hover:shadow-md focus:ring-2 focus:ring-[#FFC629] focus:ring-offset-2 focus:ring-offset-[#FDF9F1]"
    >
      <LogIn className="w-4 h-4" />
      Get Started
    </button>
  );
}
