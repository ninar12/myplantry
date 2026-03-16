"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { PantryProvider } from "@/context/PantryContext";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PantryProvider>
        {children}
      </PantryProvider>
    </SessionProvider>
  );
}
