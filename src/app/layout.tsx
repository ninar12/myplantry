import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Plantry",
  description: "A plan for your pantry.",
  icons: {
    icon: "/myplantry_logo1.png",
    apple: "/myplantry_logo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#003527" />
      </head>
      <body
        className={`${outfit.variable} ${plusJakartaSans.variable} ${manrope.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
