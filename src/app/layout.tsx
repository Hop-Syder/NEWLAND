import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

// Polices auto-hébergées (woff2 variables, subset latin) — évite le bug
// Turbopack « next/font/google queries have exactly one entry » et fonctionne
// hors ligne. Mêmes variables CSS qu'avant : --font-nunito / --font-geist-mono.
const nunito = localFont({
  variable: "--font-nunito",
  src: [
    {
      path: "./fonts/NunitoSans-Variable.woff2",
      weight: "200 1000",
      style: "normal",
    },
  ],
  display: "swap",
});

const geistMono = localFont({
  variable: "--font-geist-mono",
  src: [
    {
      path: "./fonts/GeistMono-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEWLAND ELECTRO — Électroménager, high-tech et maison au Bénin",
  description:
    "NEWLAND ELECTRO par NEWLAND GROUP : boutique en ligne d'appareils ménagers, équipements high-tech et maison au Bénin. Comparez facilement, payez en Mobile Money, faites-vous livrer à Cotonou et partout au Bénin.",
  keywords: [
    "NEWLAND ELECTRO",
    "NEWLAND GROUP",
    "électroménager Bénin",
    "boutique en ligne Cotonou",
    "cuisine",
    "maison",
    "high-tech",
    "Mobile Money",
  ],
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#141414",
  // Couvre tout l'écran sur iOS (zones sûres) pour le dock mobile.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${nunito.variable} ${geistMono.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
