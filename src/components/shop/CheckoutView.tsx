"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Gift,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Wallet,
  UserRound,
  MapPin,
  CreditCard,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { imgFor } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import { pointsForAmount, rewardDiscount } from "@/lib/loyalty";
import {
  useShop,
  cartSubtotal,
  DELIVERY_ZONES,
  PAYMENT_METHODS,
  type PaymentMethod,
} from "@/lib/store";
import { Reveal } from "./Reveal";
import { SafeImg } from "./SafeImg";

/** Villes principales proposées dans le sélecteur (liste non exhaustive). */
const CITIES = [
  "Cotonou",
  "Porto-Novo",
  "Abomey-Calavi",
  "Sèmè-Podji",
  "Akpro-Missérété",
  "Ouidah",
  "Bohicon",
  "Abomey",
  "Parakou",
  "Djougou",
  "Natitingou",
  "Kandi",
  "Autre ville",
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  landmark: string;
  payment: PaymentMethod;
  momoNumber: string;
  notes: string;
}

export function CheckoutView() {
  const cart = useShop((s) => s.cart);
  const customer = useShop((s) => s.customer);
  const activeReward = useShop((s) => s.activeReward);
  const setActiveReward = useShop((s) => s.setActiveReward);
  const placeOrder = useShop((s) => s.placeOrder);
  const openCart = useShop((s) => s.openCart);
  const openCatalog = useShop((s) => s.openCatalog);
  const products = useShop((s) => s.products);

  const [form, setForm] = useState<FormState>({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    city: customer?.city ?? "Cotonou",
    district: customer?.district ?? "",
    address: customer?.address ?? "",
    landmark: "",
    payment: customer?.defaultPayment ?? "mtn_momo",
    momoNumber: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cartSubtotal(cart);

  const zone = useMemo(() => {
    if (form.city === "Cotonou") return DELIVERY_ZONES[0];
    if (["Abomey-Calavi", "Sèmè-Podji", "Akpro-Missérété", "Porto-Novo"].includes(form.city))
      return DELIVERY_ZONES[1];
    return DELIVERY_ZONES[2];
  }, [form.city]);

  const freeShipping = subtotal >= 100000;
  const shipping = freeShipping ? 0 : zone.fee;
  // Récompense fidélité armée dans l'espace client → réduite ici.
  const discount = activeReward ? rewardDiscount(activeReward, subtotal) : 0;
  const total = Math.max(0, subtotal - discount) + shipping;
  const pointsPreview = pointsForAmount(total);

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-[#0b0b0b]">
          Votre panier est vide
        </h1>
        <Button
          className="rounded-md bg-[#d4af37] font-extrabold hover:bg-[#bfa032]"
          onClick={() => openCatalog("all")}
        >
          Voir le catalogue
        </Button>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({
        title: "Informations manquantes",
        description:
          "Nom, téléphone et adresse requis.",
        variant: "destructive",
      });
      return;
    }
    if (
      (form.payment === "mtn_momo" ||
        form.payment === "moov_money" ||
        form.payment === "celtiis_cash") &&
      !form.momoNumber.trim()
    ) {
      toast({
        title: "Numéro de paiement requis",
        description:
          "Indiquez le numéro Mobile Money à débiter.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const paymentLabel =
      PAYMENT_METHODS.find((m) => m.id === form.payment)?.label ?? "Paiement";

    // Simulation de la confirmation : dans une vraie boutique, on appellerait
    // ici l'API de l'agrégateur (ex. CinetPay) ou le marchand Mobile Money.
    // placeOrder crée le compte au premier achat, met à jour les coordonnées,
    // enregistre l'historique et gère les points de fidélité.
    window.setTimeout(() => {
      placeOrder({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        city: form.city,
        district: form.district.trim(),
        address: form.address.trim(),
        paymentId: form.payment,
        paymentLabel,
        zoneLabel: zone.label,
        eta: zone.eta,
        shipping,
      });
      setSubmitting(false);
      window.scrollTo({ top: 0 });
    }, 900);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:py-12">
      <Reveal>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0b0b0b]">
              Finaliser ma commande
            </h1>
          </div>
          <Button
            variant="ghost"
            className="rounded-md font-bold text-[#8a6a14] hover:bg-[#f4eeda]"
            onClick={openCart}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour au panier
          </Button>
        </div>
      </Reveal>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6">
          {/* 1. Coordonnées */}
          <Reveal>
            <section
              aria-labelledby="coord-title"
              className="rounded-md border border-[#e6e3db] bg-white p-6 shadow-sm"
            >
              <h2
                id="coord-title"
                className="flex items-center gap-2.5 text-lg font-extrabold text-[#8a6a14]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f4eeda] text-sm font-extrabold text-[#8a6a14]">
                  1
                </span>
                <UserRound className="h-5 w-5" aria-hidden="true" />
                Vos coordonnées
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="co-name">Nom complet *</Label>
                  <Input
                    id="co-name"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Ex. Hounkpatin Bernard"
                    autoComplete="name"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="co-phone">Téléphone (WhatsApp) *</Label>
                  <Input
                    id="co-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+229 01 97 00 00 00"
                    autoComplete="tel"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-email">
                    E-mail — pour recevoir vos identifiants
                  </Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                </div>
              </div>

              {!customer && (
                <p className="mt-4 flex items-start gap-2 rounded-sm bg-[#f4eeda]/60 p-3 text-xs font-semibold text-[#8a6a14]">
                  <KeyRound
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  Première commande ? Votre compte se crée tout seul :
                  identifiant = votre numéro, code PIN à 4 chiffres à définir
                  après l&apos;achat, copie envoyée par email.
                </p>
              )}
            </section>
          </Reveal>

          {/* 2. Livraison */}
          <Reveal>
            <section
              aria-labelledby="livraison-title"
              className="rounded-md border border-[#e6e3db] bg-white p-6 shadow-sm"
            >
              <h2
                id="livraison-title"
                className="flex items-center gap-2.5 text-lg font-extrabold text-[#8a6a14]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f4eeda] text-sm font-extrabold text-[#8a6a14]">
                  2
                </span>
                <MapPin className="h-5 w-5" aria-hidden="true" />
                Livraison
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="co-city">Ville *</Label>
                  <Select value={form.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger
                      id="co-city"
                      className="h-11 rounded-md border-[#d8d4ca]"
                      aria-label="Choisir la ville de livraison"
                    >
                      <SelectValue placeholder="Choisir une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="co-district">Quartier</Label>
                  <Input
                    id="co-district"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    placeholder="Ex. Cadjèhoun, Fidjrossè, Zogbo…"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-address">Adresse précise *</Label>
                  <Input
                    id="co-address"
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Ex. Rue 12.084, maison bleue après la pharmacie"
                    autoComplete="street-address"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-landmark">Point de repère</Label>
                  <Input
                    id="co-landmark"
                    value={form.landmark}
                    onChange={(e) => set("landmark", e.target.value)}
                    placeholder="Ex. en face du carrefour Sainte Rita"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-notes">Instructions (facultatif)</Label>
                  <Textarea
                    id="co-notes"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Ex. appeler avant d'arriver, livrer après 17 h…"
                    className="min-h-20 rounded-md border-[#d8d4ca]"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-md bg-[#f1efe9]/70 p-4 text-sm text-[#3d3d3d]">
                <p>
                  {zone.label} · {zone.eta} ·{" "}
                  {freeShipping ? (
                    <span className="font-extrabold text-[#8a6a14]">livraison offerte</span>
                  ) : (
                    <span className="font-extrabold">{formatFCFA(zone.fee)}</span>
                  )}
                </p>
              </div>
            </section>
          </Reveal>

          {/* 3. Paiement */}
          <Reveal>
            <section
              aria-labelledby="paiement-title"
              className="rounded-md border border-[#e6e3db] bg-white p-6 shadow-sm"
            >
              <h2
                id="paiement-title"
                className="flex items-center gap-2.5 text-lg font-extrabold text-[#8a6a14]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#f4eeda] text-sm font-extrabold text-[#8a6a14]">
                  3
                </span>
                <Wallet className="h-5 w-5" aria-hidden="true" />
                Paiement
              </h2>
              <RadioGroup
                value={form.payment}
                onValueChange={(v) => set("payment", v as PaymentMethod)}
                className="mt-4 grid gap-3"
                aria-label="Choisir le mode de paiement"
              >
                {PAYMENT_METHODS.map((m) => (
                  <div key={m.id}>
                    <Label
                      htmlFor={`pay-${m.id}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors ${
                        form.payment === m.id
                          ? "border-[#d4af37] bg-[#f4eeda]/60"
                          : "border-[#e6e3db] bg-white hover:bg-[#f1efe9]/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={m.id}
                        id={`pay-${m.id}`}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-bold text-[#111111]">
                          {m.label}
                        </span>
                        <span className="mt-0.5 block text-sm text-muted-foreground">
                          {m.hint}
                        </span>
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {(form.payment === "mtn_momo" ||
                form.payment === "moov_money" ||
                form.payment === "celtiis_cash") && (
                <div className="mt-4 grid gap-2">
                  <Label htmlFor="co-momo">
                    Numéro Mobile Money à débiter *
                  </Label>
                  <Input
                    id="co-momo"
                    type="tel"
                    value={form.momoNumber}
                    onChange={(e) => set("momoNumber", e.target.value)}
                    placeholder="Ex. +229 01 96 00 00 00"
                    className="h-11 rounded-md border-[#d8d4ca]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Vous recevrez une demande de paiement sur ce numéro.
                  </p>
                </div>
              )}

              {form.payment === "card" && (
                <div className="mt-4 flex items-start gap-3 rounded-md bg-[#f1efe9]/70 p-4 text-sm text-[#3d3d3d]">
                  <CreditCard className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#8a6a14]" aria-hidden="true" />
                  <p>
                    Paiement sécurisé via notre partenaire (type CinetPay).
                    Aucune donnée bancaire stockée ici.
                  </p>
                </div>
              )}
            </section>
          </Reveal>
        </div>

        {/* Récapitulatif */}
        <aside aria-label="Récapitulatif de la commande">
          <Reveal direction="right">
            <div className="rounded-md border border-[#e6e3db] bg-white p-6 shadow-sm lg:sticky lg:top-40">
              <h2 className="text-lg font-extrabold text-[#0b0b0b]">
                Votre commande
              </h2>
              <Separator className="my-4" />

              <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto nice-scroll pr-1">
                {cart.map((line) => {
                  const p = products.find((pr) => pr.id === line.productId);
                  if (!p) return null;
                  return (
                    <li key={line.productId} className="flex items-center gap-3">
                      <SafeImg
                        src={imgFor(p.imageKeys[0])}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-snug">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quantité : {line.qty}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-[#8a6a14]">
                        {formatFCFA(p.price * line.qty)}
                      </p>
                    </li>
                  );
                })}
              </ul>

              <Separator className="my-4" />

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-bold">{formatFCFA(subtotal)}</span>
              </div>

              {/* Récompense fidélité appliquée */}
              {activeReward && discount > 0 && (
                <div className="mt-2 flex items-center justify-between gap-2 rounded-sm bg-[#f4eeda] px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5 font-bold text-[#8a6a14]">
                    <Gift className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">{activeReward.label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="font-extrabold text-[#8a6a14]">
                      −{formatFCFA(discount)}
                    </span>
                    <button
                      type="button"
                      className="text-xs font-bold text-[#8f8f8f] underline hover:text-[#111111]"
                      onClick={() => setActiveReward(null)}
                    >
                      Retirer
                    </button>
                  </span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Livraison ({form.city})
                </span>
                <span className="font-bold">
                  {freeShipping ? "Offerte" : formatFCFA(shipping)}
                </span>
              </div>

              <Separator className="my-4" />

              <div className="flex items-baseline justify-between">
                <span className="font-bold text-[#111111]">Total à payer</span>
                <span className="text-2xl font-extrabold text-[#8a6a14]">
                  {formatFCFA(total)}
                </span>
              </div>

              {/* Points fidélité gagnés avec cette commande */}
              <p className="mt-2 flex items-center justify-end gap-1.5 text-xs font-bold text-[#8a6a14]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                +{pointsPreview} pts de fidélité avec cet achat
              </p>
              {!activeReward && (
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  10 000 F = 5 pts · 100 pts = −5 % · 80 pts = −7 000 F
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="mt-5 h-13 w-full rounded-md bg-[#d4af37] text-base font-extrabold hover:bg-[#bfa032] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin rounded-md border-2 border-white/40 border-t-white motion-reduce:animate-none"
                    />
                    Traitement…
                  </>
                ) : (
                  <>
                    Confirmer la commande
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </>
                )}
              </Button>

              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a14]" aria-hidden="true" />
                Retours sous 5 jours · Conditions de vente applicables.
              </p>
            </div>
          </Reveal>
        </aside>
      </form>
    </div>
  );
}
