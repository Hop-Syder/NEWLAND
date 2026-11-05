import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maison Cauris — Électroménager, cuisine et maison au Bénin",
  description:
    "Boutique en ligne béninoise : appareils ménagers, articles de cuisine et équipements pour la maison ou le bureau. Comparez facilement, payez en Mobile Money, faites-vous livrer à Cotonou et partout au Bénin.",
  keywords: [
    "électroménager Bénin",
    "boutique en ligne Cotonou",
    "cuisine",
    "maison",
    "bureau",
    "Mobile Money",
  ],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#1b5e3f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${nunito.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
