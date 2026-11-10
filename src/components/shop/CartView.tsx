"use client";

import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShoppingBasket,
  Truck,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { imgFor } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import {
  useShop,
  cartSubtotal,
  cartCount,
  DELIVERY_ZONES,
  FREE_SHIPPING_THRESHOLD,
} from "@/lib/store";
import { Reveal } from "./Reveal";
import { SafeImg } from "./SafeImg";

export function CartView() {
  const cart = useShop((s) => s.cart);
  const setQty = useShop((s) => s.setQty);
  const removeFromCart = useShop((s) => s.removeFromCart);
  const openCatalog = useShop((s) => s.openCatalog);
  const openCheckout = useShop((s) => s.openCheckout);
  const goHome = useShop((s) => s.goHome);
  const products = useShop((s) => s.products);

  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const cheapestZone = Math.min(...DELIVERY_ZONES.map((z) => z.fee));
  const missing = FREE_SHIPPING_THRESHOLD - subtotal;

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-md bg-[#eeebe4]">
          <ShoppingBasket className="h-10 w-10 text-[#8f8f8f]" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold text-[#0b0b0b]">
          Votre panier est vide
        </h1>
        <Button
          size="lg"
          className="mt-2 h-12 rounded-md bg-[#d4af37] px-8 font-extrabold hover:bg-[#bfa032]"
          onClick={() => openCatalog("all")}
        >
          Découvrir le catalogue
          <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b0b0b]">
              Mon panier
            </h1>
            <p className="mt-1 text-muted-foreground">
              {count} article{count > 1 ? "s" : ""}
            </p>
          </div>
          <Button
            variant="ghost"
            className="rounded-md font-bold text-[#8a6a14] hover:bg-[#f4eeda]"
            onClick={() => openCatalog("all")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Continuer mes achats
          </Button>
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Lignes du panier */}
        <ul className="flex flex-col gap-4">
          {cart.map((line, i) => {
            const p = products.find((pr) => pr.id === line.productId);
            if (!p) return null;
            return (
              <li key={line.productId}>
                <Reveal delay={i * 50}>
                  <div className="flex gap-4 rounded-md border border-[#e6e3db] bg-white p-4 shadow-sm">
                    <SafeImg
                      src={imgFor(p.imageKeys[0])}
                      alt={p.name}
                      className="h-24 w-24 shrink-0 cursor-pointer rounded-md object-cover sm:h-28 sm:w-32"
                      sizesHint={p.name}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#808080]">
                            {p.brand}
                          </p>
                          <h2 className="line-clamp-2 font-bold leading-snug text-[#111111]">
                            {p.name}
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {p.availability === "in_stock"
                              ? "En stock"
                              : `Sur commande · ${p.leadTimeDays ?? 5} j`}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Retirer ${p.name} du panier`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#c6482f] hover:bg-[#f8e2dc]"
                          onClick={() => {
                            removeFromCart(p.id);
                            toast({ title: "Produit retiré du panier", description: p.name });
                          }}
                        >
                          <Trash2 className="h-4.5 w-4.5" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                        <div className="flex items-center gap-2" role="group" aria-label={`Quantité de ${p.name}`}>
                          <button
                            type="button"
                            aria-label="Diminuer la quantité"
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d8d4ca] bg-white hover:bg-[#eeebe4]"
                            onClick={() => setQty(p.id, line.qty - 1)}
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <Input
                            type="number"
                            min={1}
                            max={20}
                            value={line.qty}
                            onChange={(e) =>
                              setQty(p.id, Math.max(1, Math.min(20, Number(e.target.value) || 1)))
                            }
                            aria-label={`Quantité de ${p.name}`}
                            className="h-9 w-16 rounded-md border-[#d8d4ca] text-center font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            aria-label="Augmenter la quantité"
                            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#d8d4ca] bg-white hover:bg-[#eeebe4]"
                            onClick={() => setQty(p.id, line.qty + 1)}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-lg font-extrabold text-[#8a6a14]">
                          {formatFCFA(p.price * line.qty)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ul>

        {/* Récapitulatif */}
        <aside aria-label="Récapitulatif de la commande">
          <Reveal direction="right">
            <div className="rounded-md border border-[#e6e3db] bg-white p-6 shadow-sm lg:sticky lg:top-40">
              <h2 className="text-lg font-extrabold text-[#0b0b0b]">
                Récapitulatif
              </h2>
              <Separator className="my-4" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-bold">{formatFCFA(subtotal)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-bold">
                  {freeShipping ? (
                    <span className="text-[#8a6a14]">Offerte</span>
                  ) : (
                    `dès ${formatFCFA(cheapestZone)}`
                  )}
                </span>
              </div>

              {!freeShipping && (
                <div className="mt-4 rounded-md bg-[#f4eeda] p-3 text-sm text-[#7a5f10]">
                  <p className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Plus que{" "}
                    <span className="font-extrabold">{formatFCFA(missing)}</span>{" "}
                    pour la livraison offerte.
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-baseline justify-between">
                <span className="font-bold text-[#111111]">Total estimé</span>
                <span className="text-2xl font-extrabold text-[#8a6a14]">
                  {formatFCFA(subtotal + (freeShipping ? 0 : cheapestZone))}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimation — ajustée à l&apos;étape suivante.
              </p>

              <Button
                size="lg"
                className="mt-5 h-13 w-full rounded-md bg-[#d4af37] text-base font-extrabold hover:bg-[#bfa032]"
                onClick={openCheckout}
              >
                Passer la commande
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                MoMo · Moov · Celtiis · Carte · Cash
              </p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
