"use client";

import {
  Shell,
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  MessageCircle,
  Youtube,
  Truck,
  RotateCcw,
  Wallet,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORIES,
  PRODUCTS,
} from "@/lib/products";
import { useShop } from "@/lib/store";

const HELP_LINKS = [
  "Comment commander ?",
  "Délais et zones de livraison",
  "Modes de paiement acceptés",
  "Suivre ma commande",
  "Garanties et SAV",
];

const LEGAL_LINKS = [
  "Conditions générales de vente",
  "Politique de confidentialité",
  "Mentions légales",
];

export function Footer() {
  const openCatalog = useShop((s) => s.openCatalog);
  const goHome = useShop((s) => s.goHome);

  return (
    <footer
      className="mt-auto border-t-4 border-[#e8842c] bg-[#123d29] text-[#efe7d6]"
      aria-label="Pied de page"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
        {/* Marque + contact */}
        <div>
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8842c]"
            aria-label="Maison Cauris — retour en haut"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b5e3f] text-white ring-1 ring-white/20">
              <Shell className="h-5.5 w-5.5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold text-white">
                Maison Cauris
              </span>
              <span className="text-[11px] font-semibold text-[#f2b56b]">
                Maison · Cuisine · Bénin
              </span>
            </span>
          </button>

          <p className="mt-4 text-sm leading-relaxed text-[#efe7d6]/85">
            La boutique en ligne qui équipe les maisons béninoises : appareils
            ménagers, cuisine, maison et bureau. Des produits réels, des prix
            clairs, un service local.
          </p>

          <ul className="mt-5 grid gap-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#f2b56b]" aria-hidden="true" />
              Point relais : Fidjrossè, Cotonou, Bénin
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#f2b56b]" aria-hidden="true" />
              <span>
                <a
                  href="tel:+2290197000000"
                  className="whitespace-nowrap hover:underline"
                  aria-label="Appeler le service client"
                >
                  +229 01 97 00 00 00
                </a>{" "}
                (appel &amp; WhatsApp)
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#f2b56b]" aria-hidden="true" />
              <a
                href="mailto:bonjour@maisoncauris.bj"
                className="hover:underline"
              >
                bonjour@maisoncauris.bj
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#f2b56b]" aria-hidden="true" />
              Lun – Sam : 8 h – 19 h
            </li>
          </ul>
        </div>

        {/* Catégories */}
        <nav aria-label="Catégories du catalogue">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f2b56b]">
            Notre catalogue
          </h2>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="group inline-flex items-center gap-1.5 text-[#efe7d6]/90 hover:text-white hover:underline"
                  onClick={() => openCatalog(c.id)}
                >
                  <ChevronRight
                    className="h-4 w-4 text-[#e8842c] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                  {c.name}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="group inline-flex items-center gap-1.5 font-bold text-white hover:underline"
                onClick={() => openCatalog("all")}
              >
                <ChevronRight
                  className="h-4 w-4 text-[#e8842c] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                Tout le catalogue ({PRODUCTS.length} produits)
              </button>
            </li>
          </ul>
        </nav>

        {/* Aide + infos pratiques */}
        <nav aria-label="Aide et informations pratiques">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f2b56b]">
            Aide & infos pratiques
          </h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-[#efe7d6]/90">
            {HELP_LINKS.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className="inline-flex items-start gap-2 text-left hover:text-white hover:underline"
                  onClick={() =>
                    toast({
                      title: label,
                      description:
                        "Cette page d'aide sera complétée prochainement. En attendant, écrivez-nous sur WhatsApp : +229 01 97 00 00 00.",
                    })
                  }
                >
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#e8842c]" aria-hidden="true" />
                  {label}
                </button>
              </li>
            ))}
          </ul>

          <ul className="mt-5 grid gap-2 text-xs text-[#efe7d6]/75">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#f2b56b]" aria-hidden="true" />
              Livraison offerte dès 100 000 FCFA d&apos;achat
            </li>
            <li className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-[#f2b56b]" aria-hidden="true" />
              Retours et échanges sous 5 jours
            </li>
            <li className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-[#f2b56b]" aria-hidden="true" />
              MTN MoMo · Moov Money · Celtiis Cash · Visa / Mastercard
            </li>
          </ul>
        </nav>

        {/* Réseaux sociaux + contact rapide */}
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#f2b56b]">
            Suivez-nous
          </h2>
          <p className="mt-4 text-sm text-[#efe7d6]/85">
            Nouveautés, promos et conseils d&apos;utilisation : rejoignez notre
            communauté.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Maison Cauris sur Facebook (lien à personnaliser)"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#e8842c]"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Maison Cauris sur Instagram (lien à personnaliser)"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#e8842c]"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/2290197000000"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacter Maison Cauris sur WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#e8842c]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Maison Cauris sur YouTube (lien à personnaliser)"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-[#e8842c]"
            >
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-6 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="text-sm font-bold text-white">
              Une question avant d&apos;acheter ?
            </p>
            <p className="mt-1 text-xs text-[#efe7d6]/80">
              Nos conseillers répondent en français, sous 1 heure en journée.
            </p>
            <Button
              className="mt-3 h-10 w-full rounded-full bg-[#e8842c] font-extrabold hover:bg-[#d9741f]"
              asChild
            >
              <a
                href="https://wa.me/2290197000000"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="h-4.5 w-4.5" aria-hidden="true" />
                Discuter sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center sm:flex-row sm:text-left">
        <p className="text-xs text-[#efe7d6]/70">
          © {new Date().getFullYear()} Maison Cauris — Cotonou, Bénin. Tous
          droits réservés.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#efe7d6]/70">
          {LEGAL_LINKS.map((label) => (
            <li key={label}>
              <button
                type="button"
                className="hover:text-white hover:underline"
                onClick={() =>
                  toast({
                    title: label,
                    description:
                      "Document juridique à joindre avant la mise en ligne réelle de la boutique.",
                  })
                }
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
