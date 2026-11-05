"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ShoppingBasket,
  Truck,
  ShieldCheck,
  Wallet,
  Phone,
  Minus,
  Plus,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getProduct,
  getCategory,
  relatedProducts,
} from "@/lib/products";
import { galleryFor, imgFor } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import { useShop } from "@/lib/store";
import { Reveal } from "./Reveal";
import { ProductCard } from "./ProductCard";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { SafeImg } from "./SafeImg";

export function ProductView() {
  const productId = useShop((s) => s.productId);
  const goHome = useShop((s) => s.goHome);
  const openCatalog = useShop((s) => s.openCatalog);
  const addToCart = useShop((s) => s.addToCart);
  const openCart = useShop((s) => s.openCart);

  const product = getProduct(productId ?? "");
  const [qty, setQty] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);

  const gallery = useMemo(
    () => (product ? galleryFor(product.imageKeys[0]) : []),
    [product]
  );

  if (!product) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-24 text-center">
        <p className="text-xl font-extrabold text-[#21301f]">
          Ce produit n&apos;existe pas (ou plus).
        </p>
        <Button
          className="rounded-full bg-[#e8842c] hover:bg-[#d9741f]"
          onClick={() => openCatalog("all")}
        >
          Retour au catalogue
        </Button>
      </div>
    );
  }

  const category = getCategory(product.category);
  const related = relatedProducts(product);
  const mainImage = gallery[imageIndex] ?? imgFor(product.imageKeys[0]);

  const addNow = (goToCart = false) => {
    addToCart(product.id, qty);
    toast({
      title: goToCart ? "Ajouté — direction le panier !" : "Ajouté au panier",
      description: `${qty} × ${product.name}`,
    });
    if (goToCart) openCart();
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-10">
      {/* Fil d'Ariane */}
      <nav aria-label="Fil d'Ariane" className="mb-5">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <button
              type="button"
              className="inline-flex items-center gap-1 font-bold text-[#1b5e3f] hover:underline"
              onClick={goHome}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Accueil
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <button
              type="button"
              className="font-bold text-[#1b5e3f] hover:underline"
              onClick={() => openCatalog(product.category)}
            >
              {category?.name}
            </button>
          </li>
          <li aria-hidden="true">/</li>
          <li className="line-clamp-1 max-w-[16rem] font-semibold" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galerie */}
        <Reveal direction="left">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-[#e6ddc9] bg-white shadow-sm">
              <SafeImg
                src={mainImage}
                alt={product.name}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="absolute left-4 top-4">
                <AvailabilityBadge
                  availability={product.availability}
                  leadTimeDays={product.leadTimeDays}
                />
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 flex gap-3" role="group" aria-label="Galerie du produit">
                {gallery.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    aria-label={`Photo ${i + 1} du produit`}
                    aria-pressed={i === imageIndex}
                    onClick={() => setImageIndex(i)}
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${
                      i === imageIndex
                        ? "border-[#e8842c]"
                        : "border-transparent hover:border-[#d9cfba]"
                    }`}
                  >
                    <SafeImg
                      src={url}
                      alt=""
                      className="h-20 w-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Infos produit */}
        <Reveal direction="right">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-[#7a8a75]">
                {product.brand} · {category?.name}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold leading-snug text-[#123d29] sm:text-3xl">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              {product.oldPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatFCFA(product.oldPrice)}
                </span>
              )}
              <span className="text-3xl font-extrabold text-[#1b5e3f]">
                {formatFCFA(product.price)}
              </span>
              {product.oldPrice && (
                <span className="rounded-full bg-[#e8842c] px-2.5 py-1 text-xs font-extrabold text-white">
                  Économisez {formatFCFA(product.oldPrice - product.price)}
                </span>
              )}
            </div>

            <p className="text-base leading-relaxed text-[#43503f]">
              {product.description}
            </p>

            {/* Caractéristiques */}
            <section aria-labelledby="caract-title" className="rounded-2xl border border-[#e6ddc9] bg-white p-5">
              <h2
                id="caract-title"
                className="flex items-center gap-2 text-base font-extrabold text-[#1b5e3f]"
              >
                <CheckCircle2 className="h-4.5 w-4.5" aria-hidden="true" />
                Caractéristiques principales
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[#43503f]">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#e8842c]"
                    />
                    {f}
                  </li>
                ))}
              </ul>
            </section>

            {/* Quantité + ajout panier */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e6ddc9] bg-white p-4">
              <div className="flex items-center gap-2" role="group" aria-label="Quantité">
                <button
                  type="button"
                  aria-label="Diminuer la quantité"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cfba] bg-white hover:bg-[#efe7d6]"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span
                  className="min-w-10 text-center text-lg font-extrabold"
                  aria-live="polite"
                >
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Augmenter la quantité"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d9cfba] bg-white hover:bg-[#efe7d6]"
                  onClick={() => setQty((q) => Math.min(20, q + 1))}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <Button
                size="lg"
                className="h-12 min-w-40 flex-1 rounded-full bg-[#e8842c] text-base font-extrabold hover:bg-[#d9741f]"
                onClick={() => addNow(false)}
              >
                <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
                Ajouter au panier
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-[#1b5e3f] text-base font-bold text-[#1b5e3f] hover:bg-[#e4efe4]"
                onClick={() => addNow(true)}
              >
                Commander
              </Button>
            </div>

            {/* Informations pratiques */}
            <section aria-labelledby="pratique-title" className="rounded-2xl bg-[#f2ecdf]/70 p-5">
              <h2 id="pratique-title" className="text-base font-extrabold text-[#123d29]">
                Informations pratiques
              </h2>
              <ul className="mt-3 grid gap-2.5 text-sm text-[#43503f]">
                <li className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                  {product.availability === "in_stock"
                    ? "Expédition sous 24–48 h à Cotonou ; 2 à 5 jours pour les autres villes."
                    : `Article préparé à la commande : livraison estimée sous ${product.leadTimeDays ?? 5} jours.`}
                </li>
                <li className="flex items-start gap-2.5">
                  <Wallet className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                  Paiement : MTN MoMo, Moov Money, Celtiis Cash, carte bancaire ou espèces à la livraison.
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                  {product.practical.map((p) => (
                    <span key={p}>{p}</span>
                  ))}
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                  Une question ? WhatsApp +229 01 97 00 00 00 — réponse sous 1 h.
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                  Retrait possible à notre point relais de Cotonou (Fidjrossè).
                </li>
              </ul>
            </section>

            <p className="text-xs italic text-muted-foreground">
              Réf. {product.slug} — {product.source}.
            </p>
          </div>
        </Reveal>
      </div>

      <Separator className="my-10" />

      {/* Produits similaires */}
      <section aria-labelledby="similaires-title">
        <Reveal>
          <h2
            id="similaires-title"
            className="mb-5 text-2xl font-extrabold text-[#123d29]"
          >
            Vous aimerez aussi
          </h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
