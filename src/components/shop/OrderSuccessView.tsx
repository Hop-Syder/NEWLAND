"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Gem,
  KeyRound,
  Package,
  Truck,
  Phone,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatFCFA, formatDateLong } from "@/lib/format";
import { isValidEmail, isValidPin, useShop } from "@/lib/store";
import { Reveal } from "./Reveal";

export function OrderSuccessView() {
  const lastOrder = useShop((s) => s.lastOrder);
  const loyaltyPoints = useShop((s) => s.loyaltyPoints);
  const resetToHome = useShop((s) => s.resetToHome);
  const openCatalog = useShop((s) => s.openCatalog);
  const openAccount = useShop((s) => s.openAccount);

  if (!lastOrder) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="text-2xl font-extrabold text-[#0b0b0b]">
          Aucune commande à afficher
        </h1>
        <Button
          className="rounded-md bg-[#d4af37] font-extrabold hover:bg-[#bfa032]"
          onClick={resetToHome}
        >
          Retour à l&apos;accueil
        </Button>
      </div>
    );
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(lastOrder.id);
      toast({ title: "Numéro copié", description: lastOrder.id });
    } catch {
      toast({
        title: "Copie impossible",
        description: `Notez votre numéro : ${lastOrder.id}`,
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 lg:py-16">
      <Reveal>
        <div className="rounded-md border border-[#e6e3db] bg-white p-8 text-center shadow-sm sm:p-10">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-md bg-[#f4eeda]">
            <CheckCircle2 className="h-10 w-10 text-[#8a6a14]" aria-hidden="true" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold text-[#0b0b0b]">
            Merci {lastOrder.name.split(" ")[0]} !
          </h1>
          <p className="mt-2 text-muted-foreground">
            Commande enregistrée. Nous vous appelons pour confirmer la
            livraison.
          </p>

          <div className="mt-6 rounded-md bg-[#f1efe9]/70 p-5 text-left">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Numéro de commande
                </p>
                <p className="text-xl font-extrabold text-[#8a6a14]">
                  {lastOrder.id}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-[#d8d4ca]"
                onClick={copyId}
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                Copier
              </Button>
            </div>

            <Separator className="my-4" />

            <dl className="grid gap-2.5 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-bold">
                  {formatDateLong(new Date(lastOrder.createdAt))}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Montant total</dt>
                <dd className="font-extrabold text-[#8a6a14]">
                  {formatFCFA(lastOrder.total)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Paiement</dt>
                <dd className="font-bold">{lastOrder.paymentLabel}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted-foreground">Livraison</dt>
                <dd className="text-right font-bold">
                  {lastOrder.city} · {lastOrder.eta}
                </dd>
              </div>
            </dl>
          </div>

          {/* Carte fidélité : points gagnés */}
          <button
            type="button"
            onClick={() => openAccount("loyalty")}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-md bg-[#141414] p-5 text-left text-white transition-colors hover:bg-[#1f1f1f]"
          >
            <span className="flex items-center gap-3">
              <Gem className="h-6 w-6 shrink-0 text-[#d4af37]" aria-hidden="true" />
              <span>
                <span className="block text-sm font-bold text-[#d4af37]">
                  +{lastOrder.pointsEarned} points gagnés
                </span>
                <span className="block text-xs text-white/70">
                  Solde : {loyaltyPoints} pts · 100 pts = −5 % · 80 pts = −7 000 F
                </span>
              </span>
            </span>
            <span className="text-sm font-extrabold text-[#d4af37]">Voir ma carte →</span>
          </button>

          {/* Sécurité : code PIN à définir après la première commande */}
          <SecuritySetupCard />

          <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
            <div className="rounded-md border border-[#e6e3db] p-4">
              <Package className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              <p className="mt-2 text-sm font-extrabold">1. Préparation</p>
              <p className="text-xs text-muted-foreground">
                Vos articles sont vérifiés.
              </p>
            </div>
            <div className="rounded-md border border-[#e6e3db] p-4">
              <Phone className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              <p className="mt-2 text-sm font-extrabold">2. Appel de confirmation</p>
              <p className="text-xs text-muted-foreground">
                Appel ou WhatsApp au {lastOrder.phone}.
              </p>
            </div>
            <div className="rounded-md border border-[#e6e3db] p-4">
              <Truck className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              <p className="mt-2 text-sm font-extrabold">3. Livraison</p>
              <p className="text-xs text-muted-foreground">
                Jusqu&apos;à votre porte.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-12 rounded-md bg-[#141414] px-7 font-extrabold hover:bg-[#2e2e2e]"
              onClick={resetToHome}
            >
              Retour à l&apos;accueil
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-md border-[#d4af37] px-7 font-bold text-[#8a6a14] hover:bg-[#f4eeda]"
              onClick={() => openAccount("orders")}
            >
              Suivre ma commande
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="h-12 rounded-md px-5 font-bold text-[#3d3d3d] hover:bg-[#f1efe9]"
              onClick={() => openCatalog("all")}
            >
              Continuer mes achats
            </Button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sécurité — le client définit lui-même son code PIN après l'achat    */
/* ------------------------------------------------------------------ */

function SecuritySetupCard() {
  const customer = useShop((s) => s.customer);
  const pin = useShop((s) => s.pin);
  const credentialsSentTo = useShop((s) => s.credentialsSentTo);
  const setPin = useShop((s) => s.setPin);
  const saveCustomer = useShop((s) => s.saveCustomer);

  const [justSet, setJustSet] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [pinField, setPinField] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [show, setShow] = useState(false);

  if (skipped) return null;
  // Déjà sécurisé avant d'arriver ici (commandes suivantes) : rien à faire.
  if (pin && !justSet) return null;
  if (!customer) return null;

  // Récapitulatif affiché juste après la définition du code PIN.
  if (justSet) {
    return (
      <Reveal>
        <div className="mt-4 rounded-md border border-[#d4af37] bg-[#f4eeda]/60 p-5 text-left">
          <p className="flex items-center gap-2 font-extrabold text-[#8a6a14]">
            <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
            Compte sécurisé — identifiants envoyés
          </p>
          <dl className="mt-3 grid gap-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Identifiant</dt>
              <dd className="font-bold">{customer.phone}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Code PIN</dt>
              <dd className="font-bold tracking-[0.4em]">{pin}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">Copie email</dt>
              <dd className="font-bold">{credentialsSentTo}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">
            Conservez cet email précieusement. Vous pourrez changer votre code
            PIN dans l&apos;espace client → Paramètres → Sécurité.
          </p>
        </div>
      </Reveal>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPin(pinField)) {
      toast({
        title: "Code PIN invalide",
        description: "Choisissez exactement 4 chiffres.",
        variant: "destructive",
      });
      return;
    }
    if (pinField !== confirm) {
      toast({
        title: "Codes différents",
        description: "La confirmation ne correspond pas.",
        variant: "destructive",
      });
      return;
    }
    const mail = email.trim();
    if (!isValidEmail(mail)) {
      toast({
        title: "Email requis",
        description: "La copie de vos identifiants y sera envoyée.",
        variant: "destructive",
      });
      return;
    }
    if (mail !== (customer.email ?? "")) {
      saveCustomer({ ...customer, email: mail });
    }
    setPin(pinField);
    setJustSet(true);
    toast({
      title: "Compte sécurisé",
      description: `Copie des identifiants envoyée à ${mail}.`,
    });
  };

  return (
    <Reveal>
      <div className="mt-4 rounded-md border border-[#e6e3db] bg-white p-5 text-left shadow-sm">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#141414]">
            <KeyRound className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
          </span>
          <div>
            <p className="font-extrabold text-[#111111]">
              Sécurisez votre compte
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Identifiant :{" "}
              <span className="font-bold text-[#111111]">
                {customer.phone}
              </span>
              . Choisissez un code PIN à 4 chiffres : une copie de vos
              identifiants sera envoyée par email.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="sec-pin">Code PIN (4 chiffres) *</Label>
            <div className="relative">
              <Input
                id="sec-pin"
                type={show ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                value={pinField}
                onChange={(e) =>
                  setPinField(e.target.value.replace(/\D/g, ""))
                }
                autoComplete="new-password"
                className="h-11 rounded-md border-[#d8d4ca] pr-11 tracking-[0.5em]"
              />
              <button
                type="button"
                aria-label={show ? "Masquer le code" : "Afficher le code"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f8f8f] hover:text-[#111111]"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sec-confirm">Confirmer *</Label>
            <Input
              id="sec-confirm"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
              autoComplete="new-password"
              className="h-11 rounded-md border-[#d8d4ca] tracking-[0.5em]"
            />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="sec-email">Email de réception *</Label>
            <Input
              id="sec-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              autoComplete="email"
              className="h-11 rounded-md border-[#d8d4ca]"
            />
            <p className="text-xs text-muted-foreground">
              Une copie de vos identifiants (numéro + code PIN) y sera envoyée.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button
              type="submit"
              className="rounded-md bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
            >
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              Sécuriser mon compte
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-md font-bold text-[#3d3d3d] hover:bg-[#f1efe9]"
              onClick={() => setSkipped(true)}
            >
              Plus tard
            </Button>
          </div>
        </form>
      </div>
    </Reveal>
  );
}
