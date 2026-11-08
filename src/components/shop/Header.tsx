"use client";

import { useState } from "react";
import {
  Search,
  ShoppingBasket,
  UserRound,
  Shell,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CATEGORIES, PRODUCTS, getProduct } from "@/lib/products";
import { imgFor } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import {
  useShop,
  cartCount,
  cartSubtotal,
} from "@/lib/store";
import { SafeImg } from "./SafeImg";

function Logo({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
      aria-label="Maison Cauris — retour à l'accueil"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#141414] text-white shadow-sm">
        <Shell className="h-5.5 w-5.5" aria-hidden="true" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-lg font-extrabold tracking-tight text-[#111111]">
          Maison Cauris
        </span>
      </span>
    </button>
  );
}

export function Header() {
  const view = useShop((s) => s.view);
  const goHome = useShop((s) => s.goHome);
  const openCatalog = useShop((s) => s.openCatalog);
  const openProduct = useShop((s) => s.openProduct);
  const openAccount = useShop((s) => s.openAccount);
  const searchQuery = useShop((s) => s.searchQuery);
  const setSearch = useShop((s) => s.setSearch);
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const removeFromCart = useShop((s) => s.removeFromCart);
  const customer = useShop((s) => s.customer);
  const catalogCategory = useShop((s) => s.catalogCategory);
  const openCart = useShop((s) => s.openCart);

  const [cartOpen, setCartOpen] = useState(false);
  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    openCatalog("all");
    // On garde la requête telle quelle ; le catalogue filtre dessus.
  };

  const navItems = [
    { label: "Accueil", active: view === "home", action: () => goHome() },
    ...CATEGORIES.map((c) => ({
      label: c.name,
      active: view === "catalog" && catalogCategory === c.id,
      action: () => openCatalog(c.id),
    })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e3db] bg-[#faf9f6]/95 backdrop-blur supports-[backdrop-filter]:bg-[#faf9f6]/85">
      {/* Bandeau réassurance */}
      <div className="hidden bg-[#0b0b0b] px-4 py-1.5 text-center text-xs font-semibold text-[#eeebe4] sm:block">
        Livraison 24–48 h · Mobile Money · Retours 5 jours
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-5">
        <Logo onClick={goHome} />

        {/* Recherche (desktop) */}
        <form
          onSubmit={submitSearch}
          role="search"
          className="relative ml-auto hidden flex-1 max-w-xl md:block"
        >
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#8f8f8f]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            className="h-11 rounded-md border-[#d8d4ca] bg-white pl-10 pr-4 text-sm shadow-sm focus-visible:ring-[#d4af37]"
          />
        </form>

        {/* Compte client — ouvre l'espace client complet */}
        <Button
          variant="ghost"
          className="hidden h-11 items-center gap-2 rounded-md px-4 text-sm font-bold text-[#111111] hover:bg-[#eeebe4] sm:inline-flex"
          aria-label={customer ? "Mon espace client" : "Mon espace client (créé à la première commande)"}
          onClick={() => openAccount()}
        >
          {customer ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#141414] text-xs font-extrabold text-white">
              {customer.name.trim().charAt(0).toUpperCase()}
            </span>
          ) : (
            <UserRound className="h-5 w-5" aria-hidden="true" />
          )}
          <span className="hidden lg:inline">
            {customer ? customer.name.split(" ")[0] : "Mon compte"}
          </span>
        </Button>

        {/* Panier (aperçu latéral) */}
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="relative hidden h-11 items-center gap-2 rounded-md bg-[#141414] px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2e2e2e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] sm:inline-flex"
              aria-label={`Ouvrir le panier (${count} article${count > 1 ? "s" : ""})`}
              onClick={() => setCartOpen(true)}
              data-testid="header-cart"
            >
              <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
              <span className="hidden sm:inline">Panier</span>
              {count > 0 && (
                <span
                  className="absolute -right-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-md bg-[#d4af37] px-1 text-xs font-extrabold text-[#0b0b0b] shadow"
                  aria-hidden="true"
                >
                  {count}
                </span>
              )}
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="flex w-full flex-col gap-0 border-[#e6e3db] bg-[#faf9f6] p-0 sm:max-w-md"
          >
            <SheetHeader className="border-b border-[#e6e3db] bg-[#faf9f6] p-5">
              <SheetTitle className="flex items-center gap-2 text-[#8a6a14]">
                <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
                Mon panier ({count})
              </SheetTitle>
              <SheetDescription className="sr-only">
                Aperçu des articles de votre panier, quantités et sous-total.
              </SheetDescription>
            </SheetHeader>

            {cart.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-md bg-[#eeebe4]">
                  <ShoppingBasket className="h-8 w-8 text-[#8f8f8f]" aria-hidden="true" />
                </span>
                <p className="font-bold text-[#111111]">Votre panier est vide</p>
                <Button
                  className="mt-2 rounded-md bg-[#d4af37] hover:bg-[#bfa032]"
                  onClick={() => {
                    setCartOpen(false);
                    openCatalog("all");
                  }}
                >
                  Découvrir le catalogue
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <ul className="flex flex-col gap-3 p-4">
                    {cart.map((line) => {
                      const p = getProduct(line.productId);
                      if (!p) return null;
                      return (
                        <li
                          key={line.productId}
                          className="flex gap-3 rounded-md border border-[#e6e3db] bg-white p-3"
                        >
                          <SafeImg
                            src={imgFor(p.imageKeys[0])}
                            alt={p.name}
                            className="h-16 w-16 shrink-0 rounded-md object-cover"
                          />
                          <div className="flex min-w-0 flex-1 flex-col">
                            <button
                              type="button"
                              className="line-clamp-2 text-left text-sm font-bold leading-snug text-[#111111] hover:underline"
                              onClick={() => {
                                setCartOpen(false);
                                openProduct(p.id);
                              }}
                            >
                              {p.name}
                            </button>
                            <p className="mt-0.5 text-sm font-extrabold text-[#8a6a14]">
                              {formatFCFA(p.price)}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-1">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  aria-label={`Retirer un exemplaire de ${p.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d8d4ca] bg-white hover:bg-[#eeebe4]"
                                  onClick={() => setQty(p.id, line.qty - 1)}
                                >
                                  <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                                <span
                                  className="min-w-6 text-center text-sm font-bold"
                                  aria-label={`Quantité : ${line.qty}`}
                                >
                                  {line.qty}
                                </span>
                                <button
                                  type="button"
                                  aria-label={`Ajouter un exemplaire de ${p.name}`}
                                  className="flex h-7 w-7 items-center justify-center rounded-md border border-[#d8d4ca] bg-white hover:bg-[#eeebe4]"
                                  onClick={() => setQty(p.id, line.qty + 1)}
                                >
                                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </div>
                              <button
                                type="button"
                                aria-label={`Retirer ${p.name} du panier`}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#c6482f] hover:bg-[#f8e2dc]"
                                onClick={() => {
                                  removeFromCart(p.id);
                                  toast({
                                    title: "Produit retiré",
                                    description: p.name,
                                  });
                                }}
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>

                <div className="border-t border-[#e6e3db] bg-white p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Sous-total</span>
                    <span className="text-lg font-extrabold text-[#8a6a14]">
                      {formatFCFA(subtotal)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Livraison offerte dès 100 000 F.
                  </p>
                  <Button
                    className="mt-3 h-12 w-full rounded-md bg-[#d4af37] text-base font-extrabold hover:bg-[#bfa032]"
                    onClick={() => {
                      setCartOpen(false);
                      openCart();
                    }}
                  >
                    Commander
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Sur mobile, navigation déportée dans le dock bas fixe. */}
      </div>

      {/* Navigation catégories (desktop) */}
      <nav
        aria-label="Catégories"
        className="hidden border-t border-[#eeebe4] md:block"
      >
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-4 py-1.5">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              aria-current={item.active ? "page" : undefined}
              className={`rounded-md px-4 py-1.5 text-sm font-bold transition-colors ${
                item.active
                  ? "bg-[#141414] text-white"
                  : "text-[#111111] hover:bg-[#eeebe4]"
              }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto hidden items-center gap-2 text-xs font-semibold text-[#808080] lg:flex">
            <Separator orientation="vertical" className="h-4" />
            {PRODUCTS.length} produits
          </span>
        </div>
      </nav>

    </header>
  );
}
