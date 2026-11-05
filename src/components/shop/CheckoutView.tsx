"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
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
import { getProduct } from "@/lib/products";
import { imgFor } from "@/lib/images";
import { formatFCFA, makeOrderId } from "@/lib/format";
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
  const setCustomer = useShop((s) => s.setCustomer);
  const placeOrder = useShop((s) => s.placeOrder);
  const openCart = useShop((s) => s.openCart);
  const openCatalog = useShop((s) => s.openCatalog);

  const [form, setForm] = useState<FormState>({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    city: "Cotonou",
    district: "",
    address: "",
    landmark: "",
    payment: "mtn_momo",
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
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-[#123d29]">
          Votre panier est vide
        </h1>
        <p className="text-muted-foreground">
          Ajoutez d&apos;abord des produits avant de finaliser une commande.
        </p>
        <Button
          className="rounded-full bg-[#e8842c] font-extrabold hover:bg-[#d9741f]"
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
          "Nom, téléphone et adresse de livraison sont nécessaires pour vous livrer.",
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
          "Indiquez le numéro Mobile Money qui recevra la demande de paiement.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
    });

    const paymentLabel =
      PAYMENT_METHODS.find((m) => m.id === form.payment)?.label ?? "Paiement";

    // Simulation de la confirmation : dans une vraie boutique, on appellerait
    // ici l'API de l'agrégateur (ex. CinetPay) ou le marchand Mobile Money.
    window.setTimeout(() => {
      placeOrder({
        id: makeOrderId(),
        total,
        paymentLabel,
        deliveryZone: `${form.city} — ${zone.eta}`,
        createdAt: new Date().toISOString(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        city: form.city,
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
            <h1 className="text-3xl font-extrabold text-[#123d29]">
              Finaliser ma commande
            </h1>
            <p className="mt-1 text-muted-foreground">
              Trois étapes simples : vos coordonnées, la livraison au Bénin, le
              paiement.
            </p>
          </div>
          <Button
            variant="ghost"
            className="rounded-full font-bold text-[#1b5e3f] hover:bg-[#e4efe4]"
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
              className="rounded-2xl border border-[#e6ddc9] bg-white p-6 shadow-sm"
            >
              <h2
                id="coord-title"
                className="flex items-center gap-2.5 text-lg font-extrabold text-[#1b5e3f]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4efe4] text-sm font-extrabold text-[#1b5e3f]">
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
                    className="h-11 rounded-xl border-[#d9cfba]"
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
                    className="h-11 rounded-xl border-[#d9cfba]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-email">E-mail (facultatif)</Label>
                  <Input
                    id="co-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    className="h-11 rounded-xl border-[#d9cfba]"
                  />
                </div>
              </div>
            </section>
          </Reveal>

          {/* 2. Livraison */}
          <Reveal>
            <section
              aria-labelledby="livraison-title"
              className="rounded-2xl border border-[#e6ddc9] bg-white p-6 shadow-sm"
            >
              <h2
                id="livraison-title"
                className="flex items-center gap-2.5 text-lg font-extrabold text-[#1b5e3f]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4efe4] text-sm font-extrabold text-[#1b5e3f]">
                  2
                </span>
                <MapPin className="h-5 w-5" aria-hidden="true" />
                Adresse de livraison au Bénin
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="co-city">Ville *</Label>
                  <Select value={form.city} onValueChange={(v) => set("city", v)}>
                    <SelectTrigger
                      id="co-city"
                      className="h-11 rounded-xl border-[#d9cfba]"
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
                    className="h-11 rounded-xl border-[#d9cfba]"
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
                    className="h-11 rounded-xl border-[#d9cfba]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-landmark">Point de repère</Label>
                  <Input
                    id="co-landmark"
                    value={form.landmark}
                    onChange={(e) => set("landmark", e.target.value)}
                    placeholder="Ex. en face du carrefour Sainte Rita"
                    className="h-11 rounded-xl border-[#d9cfba]"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="co-notes">Instructions au livreur (facultatif)</Label>
                  <Textarea
                    id="co-notes"
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Ex. appeler avant d'arriver, livrer après 17 h…"
                    className="min-h-20 rounded-xl border-[#d9cfba]"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-[#f2ecdf]/70 p-4 text-sm text-[#43503f]">
                <p className="font-bold text-[#123d29]">
                  Zone estimée : {zone.label}
                </p>
                <p>
                  Délai indicatif : {zone.eta} · Frais :{" "}
                  {freeShipping ? (
                    <span className="font-extrabold text-[#1b5e3f]">
                      offerts (commande ≥ 100 000 FCFA)
                    </span>
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
              className="rounded-2xl border border-[#e6ddc9] bg-white p-6 shadow-sm"
            >
              <h2
                id="paiement-title"
                className="flex items-center gap-2.5 text-lg font-extrabold text-[#1b5e3f]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e4efe4] text-sm font-extrabold text-[#1b5e3f]">
                  3
                </span>
                <Wallet className="h-5 w-5" aria-hidden="true" />
                Mode de paiement
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
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
                        form.payment === m.id
                          ? "border-[#e8842c] bg-[#f8e8d4]/60"
                          : "border-[#e6ddc9] bg-white hover:bg-[#f2ecdf]/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={m.id}
                        id={`pay-${m.id}`}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-bold text-[#21301f]">
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
                    className="h-11 rounded-xl border-[#d9cfba]"
                  />
                  <p className="text-xs text-muted-foreground">
                    À la confirmation, une demande de paiement sera envoyée sur
                    ce numéro. Validez avec votre code secret.
                  </p>
                </div>
              )}

              {form.payment === "card" && (
                <div className="mt-4 flex items-start gap-3 rounded-xl bg-[#f2ecdf]/70 p-4 text-sm text-[#43503f]">
                  <CreditCard className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                  <p>
                    Après validation, vous serez dirigé vers la page de paiement
                    sécurisée de notre partenaire (agrégateur type CinetPay)
                    pour saisir vos données de carte. Aucune donnée bancaire
                    n&apos;est stockée sur ce site.
                  </p>
                </div>
              )}
            </section>
          </Reveal>
        </div>

        {/* Récapitulatif */}
        <aside aria-label="Récapitulatif de la commande">
          <Reveal direction="right">
            <div className="rounded-2xl border border-[#e6ddc9] bg-white p-6 shadow-sm lg:sticky lg:top-40">
              <h2 className="text-lg font-extrabold text-[#123d29]">
                Votre commande
              </h2>
              <Separator className="my-4" />

              <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto nice-scroll pr-1">
                {cart.map((line) => {
                  const p = getProduct(line.productId);
                  if (!p) return null;
                  return (
                    <li key={line.productId} className="flex items-center gap-3">
                      <SafeImg
                        src={imgFor(p.imageKeys[0])}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-bold leading-snug">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Quantité : {line.qty}
                        </p>
                      </div>
                      <p className="text-sm font-extrabold text-[#1b5e3f]">
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
                <span className="font-bold text-[#21301f]">Total à payer</span>
                <span className="text-2xl font-extrabold text-[#1b5e3f]">
                  {formatFCFA(total)}
                </span>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="mt-5 h-13 w-full rounded-full bg-[#e8842c] text-base font-extrabold hover:bg-[#d9741f] disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none"
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
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#1b5e3f]" aria-hidden="true" />
                En confirmant, vous acceptez nos conditions de vente. Retours
                sous 5 jours, service client joignable par téléphone et
                WhatsApp.
              </p>
            </div>
          </Reveal>
        </aside>
      </form>
    </div>
  );
}
