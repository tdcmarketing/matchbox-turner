import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { DemoBar } from "@/components/DemoBar";
import { asset } from "@/lib/asset";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Matchbox Turner",
  description: "Leasing automation for Matchbox Realty: listings, pre-qualification, tour scheduling, and self-showings.",
  icons: { icon: asset("/brand/favicon.svg") },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${figtree.variable} ${plexMono.variable} h-full`}>
      <body className="min-h-full flex flex-col pt-10">
        <DemoBar />
        {children}
      </body>
    </html>
  );
}
