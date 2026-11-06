"use client";

import {
  Truck,
  Wallet,
  Headset,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PRODUCTS, countByCategory } from "@/lib/products";
import { imgFor } from "@/lib/images";
import { useShop } from "@/lib/store";
import { Reveal, useParallax } from "./Reveal";
import { ProductCard, CategoryCard } from "./ProductCard";
import { SafeImg } from "./SafeImg";

const REASSURANCE = [
  { icon: Truck, title: "Livraison 24–48 h", text: "Cotonou et environs" },
  { icon: Wallet, title: "Paiement flexible", text: "MoMo · Moov · Celtiis · Carte" },
  { icon: Headset, title: "Service local", text: "Téléphone & WhatsApp" },
  { icon: RotateCcw, title: "Retours 5 jours", text: "Échanges simples" },
];

export function HomePage() {
  const openCatalog = useShop((s) => s.openCatalog);
  const openProduct = useShop((s) => s.openProduct);
  const parallaxRef = useParallax(0.12);

  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
  const bestBuys = PRODUCTS.filter((p) => p.price <= 30000).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* ------------------------------ HÉROS ------------------------------ */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden bg-[#faf9f6]"
      >
        {/* halos décoratifs doux */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#d4af37]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-[#d4af37]/15 blur-3xl"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-10 sm:pt-14 lg:grid-cols-2 lg:gap-12 lg:pb-20">
          <div className="flex flex-col items-start gap-5">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#f4eeda] px-4 py-1.5 text-sm font-bold text-[#8a6a14]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Maison · Cuisine · Bureau
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="hero-title"
                className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#0b0b0b] sm:text-5xl lg:text-[3.4rem]"
              >
                Équipez votre maison.{" "}
                <span className="relative inline-block text-[#8a6a14]">
                  Simplement.
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 12"
                    className="absolute -bottom-1 left-0 h-2.5 w-full text-[#d4af37]"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M2 9C60 3 140 3 198 8"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-base text-[#6c6c6c] sm:text-lg">
                Appareils, cuisine, maison & bureau — livrés partout au Bénin.
              </p>
            </Reveal>

            <Reveal delay={240} className="w-full">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-[#d4af37] px-7 text-base font-extrabold shadow-lg shadow-[#d4af37]/25 hover:bg-[#bfa032]"
                  onClick={() => openCatalog("all")}
                >
                  Découvrir
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-[#111111] px-7 text-base font-bold text-[#8a6a14] hover:bg-[#f4eeda]"
                  onClick={() => openCatalog("appareils")}
                >
                  Appareils ménagers
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-[#6c6c6c]">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#8a6a14]" aria-hidden="true" />
                  Prix réels du marché
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 text-[#8a6a14]" aria-hidden="true" />
                  Livraison offerte dès 100 000 F
                </span>
              </div>
            </Reveal>
          </div>

          {/* Image d'accueil avec parallaxe léger */}
          <Reveal direction="right" delay={120}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#d4af37]/25 via-transparent to-[#0b0b0b]/15"
              />
              <div
                ref={parallaxRef}
                className="parallax-layer relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-[#0b0b0b]/25"
              >
                <SafeImg
                  src={imgFor("hero")}
                  alt="Cuisine moderne et lumineuse, chaleureuse et bien équipée"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/3]"
                />
              </div>

              {/* carte flottante rassurante */}
              <div className="absolute -bottom-6 right-4 hidden rounded-2xl border border-[#e6e3db] bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:flex sm:items-center sm:gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4eeda]">
                  <ShieldCheck className="h-5 w-5 text-[#8a6a14]" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-[#111111]">
                    Achat rassuré
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paiement sécurisé · SAV local
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* --------------------------- RÉASSURANCE --------------------------- */}
      <section
        aria-label="Nos garanties"
        className="border-y border-[#e6e3db] bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASSURANCE.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f4eeda]">
                  <item.icon className="h-5.5 w-5.5 text-[#8a6a14]" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-extrabold text-[#111111]">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------- CATÉGORIES ---------------------------- */}
      <section
        aria-labelledby="cat-title"
        className="mx-auto w-full max-w-7xl px-4 py-12 lg:py-16"
      >
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="cat-title"
                className="text-2xl font-extrabold text-[#0b0b0b] sm:text-3xl"
              >
                Catégories
              </h2>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8a6a14] hover:underline"
              onClick={() => openCatalog("all")}
            >
              Tout voir
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.id} delay={i * 100}>
              <CategoryCard
                categoryId={cat.id}
                count={countByCategory(cat.id)}
                onClick={() => openCatalog(cat.id)}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ----------------------- SÉLECTION À DÉCOUVRIR ---------------------- */}
      <section
        aria-labelledby="sel-title"
        className="bg-[#f1efe9]/60 py-12 lg:py-16"
      >
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="sel-title"
                  className="text-2xl font-extrabold text-[#0b0b0b] sm:text-3xl"
                >
                  Notre sélection
                </h2>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#8a6a14] hover:underline"
                onClick={() => openCatalog("all")}
              >
                Voir plus
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------- PETITS PRIX ---------------------------- */}
      <section
        aria-labelledby="petitprix-title"
        className="mx-auto w-full max-w-7xl px-4 py-12 lg:py-16"
      >
        <Reveal>
          <div className="mb-6">
            <h2
              id="petitprix-title"
              className="text-2xl font-extrabold text-[#0b0b0b] sm:text-3xl"
            >
              Petits prix
            </h2>
          </div>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestBuys.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 80}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* --------------------------- BANDEAU CTA ---------------------------- */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-14">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-[#0b0b0b] px-6 py-10 text-center sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#d4af37]/20 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#d4af37]/10 blur-2xl"
            />
            <h2 className="mx-auto max-w-2xl text-2xl font-extrabold text-[#faf9f6] sm:text-3xl">
              Une question ? On vous répond.
            </h2>
            <p className="mt-2 text-[#eeebe4]/85">
              WhatsApp{" "}
              <span className="font-bold text-white">+229 01 97 00 00 00</span>
              {" "}— conseil gratuit.
            </p>
            <Button
              size="lg"
              className="mt-6 h-12 rounded-full bg-[#d4af37] px-8 text-base font-extrabold hover:bg-[#bfa032]"
              onClick={() => openCatalog("all")}
            >
              Voir les produits
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
