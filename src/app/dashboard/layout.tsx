import LoginButton from "@/components/LoginButton";
import { Leaf } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDF9F1] font-sans flex flex-col">
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#0B4D26]/10 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <div className="bg-[#0B4D26] text-[#FDF9F1] p-1.5 rounded-xl shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-[#0B4D26]">
            Plantry
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <LoginButton />
        </div>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 md:px-6 md:py-12">
        {children}
      </main>
    </div>
  );
}
