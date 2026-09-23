import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";

export const metadata: Metadata = { title: "ReCircuit | Second-hand electronics", description: "Demo marketplace for pre-owned, repairable, and parts-only electronics." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Header /><main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6">{children}</main></body></html>;
}
