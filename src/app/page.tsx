"use client";

import { useEffect } from "react";
import { useShop } from "@/lib/store";
import { Header } from "@/components/shop/Header";
import { Footer } from "@/components/shop/Footer";
import { MobileDock } from "@/components/shop/MobileDock";
import { HomePage } from "@/components/shop/HomePage";
import { CatalogView } from "@/components/shop/CatalogView";
import { ProductView } from "@/components/shop/ProductView";
import { CartView } from "@/components/shop/CartView";
import { CheckoutView } from "@/components/shop/CheckoutView";
import { OrderSuccessView } from "@/components/shop/OrderSuccessView";
import { AccountView } from "@/components/shop/AccountView";

export default function Page() {
  const view = useShop((s) => s.view);

  // Remonter en haut à chaque changement de vue (navigation SPA).
  // « instant » outrepasse le scroll-behavior: smooth du CSS.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6]">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#141414] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="contenu-principal" className="flex-1">
        {view === "home" && <HomePage />}
        {view === "catalog" && <CatalogView />}
        {view === "product" && <ProductView />}
        {view === "cart" && <CartView />}
        {view === "checkout" && <CheckoutView />}
        {view === "success" && <OrderSuccessView />}
        {view === "account" && <AccountView />}
      </main>

      <Footer />

      {/* Réserve la hauteur du dock fixe pour ne pas masquer le pied de page. */}
      <div className="h-24 md:hidden" aria-hidden="true" />

      <MobileDock />
    </div>
  );
}
