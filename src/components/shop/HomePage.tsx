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
  {
    icon: Truck,
    title: "Livraison rapide au Bénin",
    text: "24–48 h à Cotonou et ses environs, 2 à 5 jours pour les autres villes.",
  },
  {
    icon: Wallet,
    title: "Payez comme vous voulez",
    text: "MTN MoMo, Moov Money, Celtiis Cash, carte bancaire ou à la livraison.",
  },
  {
    icon: Headset,
    title: "Un service client local",
    text: "Une équipe joignable par téléphone et WhatsApp pour vous conseiller.",
  },
  {
    icon: RotateCcw,
    title: "Retours sous 5 jours",
    text: "Un produit qui ne convient pas ? Nous trouvons ensemble la solution.",
  },
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
        className="relative overflow-hidden bg-[#faf6ee]"
      >
        {/* halos décoratifs doux */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#e8842c]/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 right-1/3 h-80 w-80 rounded-full bg-[#1b5e3f]/10 blur-3xl"
        />

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-12 pt-10 sm:pt-14 lg:grid-cols-2 lg:gap-12 lg:pb-20">
          <div className="flex flex-col items-start gap-5">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8842c]/40 bg-[#f8e8d4] px-4 py-1.5 text-sm font-bold text-[#b05f14]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                La boutique des maisons béninoises
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                id="hero-title"
                className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#123d29] sm:text-5xl lg:text-[3.4rem]"
              >
                Équipez votre maison,{" "}
                <span className="relative inline-block text-[#1b5e3f]">
                  simplement,
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 200 12"
                    className="absolute -bottom-1 left-0 h-2.5 w-full text-[#e8842c]"
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
                </span>{" "}
                du blender au bureau.
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="max-w-xl text-base leading-relaxed text-[#5f6d5e] sm:text-lg">
                Appareils ménagers, articles de cuisine et équipements pour la
                maison ou le bureau : comparez les caractéristiques en toute
                clarté, payez en Mobile Money et faites-vous livrer partout au
                Bénin.
              </p>
            </Reveal>

            <Reveal delay={240} className="w-full">
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="h-12 rounded-full bg-[#e8842c] px-7 text-base font-extrabold shadow-lg shadow-[#e8842c]/25 hover:bg-[#d9741f]"
                  onClick={() => openCatalog("all")}
                >
                  Découvrir les produits
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-[#1b5e3f] px-7 text-base font-bold text-[#1b5e3f] hover:bg-[#e4efe4]"
                  onClick={() => openCatalog("appareils")}
                >
                  Voir les appareils ménagers
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-[#5f6d5e]">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#1b5e3f]" aria-hidden="true" />
                  Produits réels, prix constatés localement
                </span>
                <span className="inline-flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 text-[#1b5e3f]" aria-hidden="true" />
                  Livraison offerte dès 100 000 FCFA
                </span>
              </div>
            </Reveal>
          </div>

          {/* Image d'accueil avec parallaxe léger */}
          <Reveal direction="right" delay={120}>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#e8842c]/25 via-transparent to-[#1b5e3f]/20"
              />
              <div
                ref={parallaxRef}
                className="parallax-layer relative overflow-hidden rounded-[1.75rem] shadow-2xl shadow-[#123d29]/25"
              >
                <SafeImg
                  src={imgFor("hero")}
                  alt="Cuisine moderne et lumineuse, chaleureuse et bien équipée"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/3]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#123d29]/70 to-transparent p-4 pb-16 sm:pb-14 sm:pr-56">
                  <p className="text-sm font-bold text-white">
                    De vraies cuisines, de vrais produits — pensés pour le
                    quotidien.
                  </p>
                </div>
              </div>

              {/* carte flottante rassurante */}
              <div className="absolute -bottom-6 right-4 hidden rounded-2xl border border-[#e6ddc9] bg-white/95 px-4 py-3 shadow-xl backdrop-blur sm:flex sm:items-center sm:gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4efe4]">
                  <ShieldCheck className="h-5 w-5 text-[#1b5e3f]" aria-hidden="true" />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-extrabold text-[#21301f]">
                    Achat rassuré
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paiement sécurisé · Service après-vente local
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
        className="border-y border-[#e6ddc9] bg-white"
      >
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {REASSURANCE.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <div className="flex items-start gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e4efe4]">
                  <item.icon className="h-5.5 w-5.5 text-[#1b5e3f]" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-extrabold text-[#21301f]">{item.title}</p>
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
                className="text-2xl font-extrabold text-[#123d29] sm:text-3xl"
              >
                Explorez par catégorie
              </h2>
              <p className="mt-1 text-muted-foreground">
                Trois univers, un même objectif : vous simplifier la vie.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#b05f14] hover:underline"
              onClick={() => openCatalog("all")}
            >
              Tout le catalogue
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
        className="bg-[#f2ecdf]/60 py-12 lg:py-16"
      >
        <div className="mx-auto max-w-7xl px-4">
          <Reveal>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id="sel-title"
                  className="text-2xl font-extrabold text-[#123d29] sm:text-3xl"
                >
                  Une sélection à découvrir
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Les coups de cœur de l&apos;équipe, choisis pour leur utilité
                  au quotidien.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#b05f14] hover:underline"
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
              className="text-2xl font-extrabold text-[#123d29] sm:text-3xl"
            >
              Utile et petit budget
            </h2>
            <p className="mt-1 text-muted-foreground">
              Moins de 30 000 FCFA : des produits qui changent la vie sans vider
              le portefeuille.
            </p>
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
          <div className="relative overflow-hidden rounded-3xl bg-[#123d29] px-6 py-10 text-center sm:px-12 sm:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#e8842c]/20 blur-2xl"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[#e8842c]/10 blur-2xl"
            />
            <h2 className="mx-auto max-w-2xl text-2xl font-extrabold text-[#faf6ee] sm:text-3xl">
              Une question sur un produit ? On vous répond avant que vous
              commandiez.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-[#efe7d6]/85">
              Notre équipe connaît chaque article du catalogue. Écrivez-nous sur
              WhatsApp au{" "}
              <span className="font-bold text-white">+229 01 97 00 00 00</span>{" "}
              — conseil gratuit, sans engagement.
            </p>
            <Button
              size="lg"
              className="mt-6 h-12 rounded-full bg-[#e8842c] px-8 text-base font-extrabold hover:bg-[#d9741f]"
              onClick={() => openCatalog("all")}
            >
              Commencer mes achats
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
