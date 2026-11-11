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
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORIES,
} from "@/lib/products";
import { useShop } from "@/lib/store";

const HELP_LINKS = [
  "Comment commander",
  "Livraison",
  "Paiement",
  "Suivi de commande",
  "Garantie & SAV",
];

const LEGAL_LINKS = [
  "CGV",
  "Confidentialité",
  "Mentions légales",
];

export function Footer() {
  const openCatalog = useShop((s) => s.openCatalog);
  const goHome = useShop((s) => s.goHome);
  const productCount = useShop((s) => s.products.length);

  return (
    <footer
      className="mt-auto border-t-4 border-[#d4af37] bg-[#0b0b0b] text-[#eeebe4]"
      aria-label="Pied de page"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
        {/* Marque + contact */}
        <div>
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
            aria-label="NEWLAND ELECTRO — retour en haut"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#141414] text-white ring-1 ring-white/20">
              <Shell className="h-5.5 w-5.5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-lg font-extrabold text-white">
                NEWLAND ELECTRO
              </span>
              <span className="text-[11px] font-semibold text-[#d4af37]">
                Une marque de NEWLAND GROUP
              </span>
            </span>
          </button>

          <ul className="mt-5 grid gap-2.5 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#d4af37]" aria-hidden="true" />
              Fidjrossè, Cotonou
            </li>
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#d4af37]" aria-hidden="true" />
              <span>
                <a
                  href="tel:+2290197000000"
                  className="whitespace-nowrap hover:underline"
                  aria-label="Appeler le service client"
                >
                  +229 01 97 00 00 00
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#d4af37]" aria-hidden="true" />
              <a
                href="mailto:bonjour@maisoncauris.bj"
                className="hover:underline"
              >
                bonjour@maisoncauris.bj
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#d4af37]" aria-hidden="true" />
              Lun–Sam · 8 h–19 h
            </li>
          </ul>
        </div>

        {/* Catégories */}
        <nav aria-label="Catégories du catalogue">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#d4af37]">
            Notre catalogue
          </h2>
          <ul className="mt-4 grid gap-2.5 text-sm">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="group inline-flex items-center gap-1.5 text-[#eeebe4]/90 hover:text-white hover:underline"
                  onClick={() => openCatalog(c.id)}
                >
                  <ChevronRight
                    className="h-4 w-4 text-[#d4af37] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
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
                  className="h-4 w-4 text-[#d4af37] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
                Tout voir ({productCount})
              </button>
            </li>
          </ul>
        </nav>

        {/* Aide + infos pratiques */}
        <nav aria-label="Aide et informations pratiques">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#d4af37]">
            Aide
          </h2>
          <ul className="mt-4 grid gap-2.5 text-sm text-[#eeebe4]/90">
            {HELP_LINKS.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className="inline-flex items-start gap-2 text-left hover:text-white hover:underline"
                  onClick={() =>
                    toast({
                      title: label,
                      description:
                        "Écrivez-nous sur WhatsApp : +229 01 97 00 00 00.",
                    })
                  }
                >
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#d4af37]" aria-hidden="true" />
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Réseaux sociaux + contact rapide */}
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#d4af37]">
            Suivez-nous
          </h2>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEWLAND ELECTRO sur Facebook (lien à personnaliser)"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 transition-colors hover:bg-[#d4af37]"
            >
              <Facebook className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEWLAND ELECTRO sur Instagram (lien à personnaliser)"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 transition-colors hover:bg-[#d4af37]"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://wa.me/2290197000000"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contacter NEWLAND ELECTRO sur WhatsApp"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 transition-colors hover:bg-[#d4af37]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="NEWLAND ELECTRO sur YouTube (lien à personnaliser)"
              className="flex h-11 w-11 items-center justify-center rounded-md bg-white/10 transition-colors hover:bg-[#d4af37]"
            >
              <Youtube className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>

          <div className="mt-6 rounded-md bg-white/5 p-4 ring-1 ring-white/10">
            <p className="text-sm font-bold text-white">
              Une question ?
            </p>
            <Button
              className="mt-3 h-10 w-full rounded-md bg-[#d4af37] font-extrabold hover:bg-[#bfa032]"
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
        <p className="text-xs text-[#eeebe4]/70">
          © {new Date().getFullYear()} NEWLAND ELECTRO — NEWLAND GROUP. Cotonou, Bénin. Tous
          droits réservés.
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[#eeebe4]/70">
          {LEGAL_LINKS.map((label) => (
            <li key={label}>
              <button
                type="button"
                className="hover:text-white hover:underline"
                onClick={() =>
                  toast({
                    title: label,
                    description:
                      "Document à joindre avant la mise en ligne réelle.",
                  })
                }
              >
                {label}
              </button>
            </li>
          ))}
          <li>
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 font-semibold text-[#d4af37]/80 hover:text-[#d4af37] hover:underline"
            >
              Espace admin
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
