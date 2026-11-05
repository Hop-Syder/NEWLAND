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
import { getProduct } from "@/lib/products";
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

  const count = cartCount(cart);
  const subtotal = cartSubtotal(cart);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const cheapestZone = Math.min(...DELIVERY_ZONES.map((z) => z.fee));
  const missing = FREE_SHIPPING_THRESHOLD - subtotal;

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#efe7d6]">
          <ShoppingBasket className="h-10 w-10 text-[#8a9a86]" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold text-[#123d29]">
          Votre panier est vide
        </h1>
        <p className="text-muted-foreground">
          Ajoutez des produits utiles à votre maison : appareils, cuisine,
          bureau… le catalogue n&apos;attend que vous.
        </p>
        <Button
          size="lg"
          className="mt-2 h-12 rounded-full bg-[#e8842c] px-8 font-extrabold hover:bg-[#d9741f]"
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
            <h1 className="text-3xl font-extrabold text-[#123d29]">
              Mon panier
            </h1>
            <p className="mt-1 text-muted-foreground">
              {count} article{count > 1 ? "s" : ""} — vérifiez les quantités
              puis passez à la commande.
            </p>
          </div>
          <Button
            variant="ghost"
            className="rounded-full font-bold text-[#1b5e3f] hover:bg-[#e4efe4]"
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
            const p = getProduct(line.productId);
            if (!p) return null;
            return (
              <li key={line.productId}>
                <Reveal delay={i * 50}>
                  <div className="flex gap-4 rounded-2xl border border-[#e6ddc9] bg-white p-4 shadow-sm">
                    <SafeImg
                      src={imgFor(p.imageKeys[0])}
                      alt={p.name}
                      className="h-24 w-24 shrink-0 cursor-pointer rounded-xl object-cover sm:h-28 sm:w-32"
                      sizesHint={p.name}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[#7a8a75]">
                            {p.brand}
                          </p>
                          <h2 className="line-clamp-2 font-bold leading-snug text-[#21301f]">
                            {p.name}
                          </h2>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {p.availability === "in_stock"
                              ? "En stock — expédition rapide"
                              : `Sur commande — livraison sous ${p.leadTimeDays ?? 5} jours`}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Retirer ${p.name} du panier`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#c6482f] hover:bg-[#f8e2dc]"
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
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9cfba] bg-white hover:bg-[#efe7d6]"
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
                            className="h-9 w-16 rounded-full border-[#d9cfba] text-center font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <button
                            type="button"
                            aria-label="Augmenter la quantité"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d9cfba] bg-white hover:bg-[#efe7d6]"
                            onClick={() => setQty(p.id, line.qty + 1)}
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-lg font-extrabold text-[#1b5e3f]">
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
            <div className="rounded-2xl border border-[#e6ddc9] bg-white p-6 shadow-sm lg:sticky lg:top-40">
              <h2 className="text-lg font-extrabold text-[#123d29]">
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
                    <span className="text-[#1b5e3f]">Offerte 🎉</span>
                  ) : (
                    `dès ${formatFCFA(cheapestZone)}`
                  )}
                </span>
              </div>

              {!freeShipping && (
                <div className="mt-4 rounded-xl bg-[#f8e8d4] p-3 text-sm text-[#8a4d10]">
                  <p className="flex items-start gap-2">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    Plus que{" "}
                    <span className="font-extrabold">{formatFCFA(missing)}</span>{" "}
                    pour la livraison offerte partout au Bénin.
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              <div className="flex items-baseline justify-between">
                <span className="font-bold text-[#21301f]">Total estimé</span>
                <span className="text-2xl font-extrabold text-[#1b5e3f]">
                  {formatFCFA(subtotal + (freeShipping ? 0 : cheapestZone))}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Estimation avec livraison vers Cotonou ; le montant exact est
                calculé selon votre adresse à l&apos;étape suivante.
              </p>

              <Button
                size="lg"
                className="mt-5 h-13 w-full rounded-full bg-[#e8842c] text-base font-extrabold hover:bg-[#d9741f]"
                onClick={openCheckout}
              >
                Passer la commande
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Button>

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Paiement MTN MoMo, Moov Money, Celtiis Cash, carte bancaire ou
                à la livraison.
              </p>
            </div>
          </Reveal>
        </aside>
      </div>
    </div>
  );
}
