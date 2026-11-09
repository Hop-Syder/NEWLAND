"use client";

/**
 * Espace client Maison Cauris.
 * Onglets : Aperçu · Commandes (suivi + garantie) · Fidélité · Paramètres.
 * Le compte est créé automatiquement lors de la première commande ;
 * sans compte, on affiche les avantages et un formulaire de création.
 */

import { useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  CalendarClock,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Gem,
  Gift,
  Headset,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MailCheck,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  RefreshCcw,
  Settings,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { imgFor } from "@/lib/images";
import { formatFCFA, formatDateLong } from "@/lib/format";
import {
  cheapestReward,
  nextTier,
  rewardLabel,
  REWARDS,
  tierFor,
  pointsForAmount,
  type Reward,
} from "@/lib/loyalty";
import {
  isValidEmail,
  isValidPin,
  orderStage,
  phoneMatches,
  useShop,
  warrantyActive,
  warrantyEnd,
  type AccountTab,
  type Customer,
  type Order,
} from "@/lib/store";
import { SafeImg } from "./SafeImg";
import { Reveal } from "./Reveal";
import { getProduct } from "@/lib/products";

const GOLD = "#d4af37";
const GOLD_DARK = "#8a6a14";
const GOLD_BG = "#f4eeda";
const WHATSAPP = "https://wa.me/2290197000000";

const TABS: { id: AccountTab; label: string; icon: typeof Package }[] = [
  { id: "overview", label: "Aperçu", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: Package },
  { id: "loyalty", label: "Fidélité", icon: Gem },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function AccountView() {
  const customer = useShop((s) => s.customer);
  const sessionActive = useShop((s) => s.sessionActive);
  const accountTab = useShop((s) => s.accountTab);
  const setAccountTab = useShop((s) => s.setAccountTab);

  if (!customer) return <GuestAccount />;

  // Sécurité : espace verrouillé tant que numéro + code PIN ne sont pas validés.
  if (!sessionActive) return <LoginGate />;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 lg:py-12">
      {/* En-tête compte */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[#141414] text-xl font-extrabold text-white">
            {customer.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-extrabold text-[#0b0b0b]">
              {customer.name}
            </h1>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {customer.phone}
            </p>
          </div>
          <TierBadge className="sm:ml-auto" />
        </div>
      </Reveal>

      {/* Onglets */}
      <nav
        aria-label="Sections de l'espace client"
        className="mt-6 flex gap-1.5 overflow-x-auto nice-scroll rounded-md border border-[#e6e3db] bg-white p-1.5"
      >
        {TABS.map((t) => {
          const active = accountTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setAccountTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-sm px-4 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-[#141414] text-white"
                  : "text-[#3d3d3d] hover:bg-[#f1efe9]"
              }`}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-6">
        {accountTab === "overview" && <OverviewTab />}
        {accountTab === "orders" && <OrdersTab />}
        {accountTab === "loyalty" && <LoyaltyTab />}
        {accountTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Visiteur (pas encore de compte)                                     */
/* ------------------------------------------------------------------ */

function GuestAccount() {
  const openCatalog = useShop((s) => s.openCatalog);
  const [showForm, setShowForm] = useState(false);
  const perks = [
    {
      icon: Package,
      title: "Suivi de commandes",
      text: "Historique, statut en direct, recommander en 1 tap.",
    },
    {
      icon: Gem,
      title: "Carte de fidélité",
      text: "10 000 F payés = 5 pts. Échangez contre −5 % ou −7 000 F.",
    },
    {
      icon: ShieldCheck,
      title: "Garantie 90 jours",
      text: "Chaque commande est garantie boutique, suivie ici.",
    },
    {
      icon: BadgeCheck,
      title: "Commander plus vite",
      text: "Coordonnées et adresses préremplies au checkout.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 lg:py-16">
      <Reveal>
        <div className="text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-[#141414]">
            <UserRound className="h-8 w-8 text-[#d4af37]" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-[#0b0b0b]">
            Votre espace client
          </h1>
          <p className="mt-2 text-muted-foreground">
            Aucune inscription à faire :{" "}
            <span className="font-bold text-[#8a6a14]">
              il se crée automatiquement à votre première commande.
            </span>{" "}
            Sécurisez-le ensuite avec un code PIN à 4 chiffres.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="h-12 rounded-md bg-[#d4af37] px-7 font-extrabold hover:bg-[#bfa032]"
              onClick={openCatalog.bind(null, "all")}
            >
              Découvrir le catalogue
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-md border-[#d4af37] px-7 font-bold text-[#8a6a14] hover:bg-[#f4eeda]"
              onClick={() => setShowForm(true)}
            >
              Créer mon compte maintenant
            </Button>
          </div>
        </div>
      </Reveal>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {perks.map((p, i) => (
          <Reveal key={p.title} delay={i * 0.06}>
            <div className="h-full rounded-md border border-[#e6e3db] bg-white p-5">
              <p.icon className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              <p className="mt-2 font-extrabold text-[#111111]">{p.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {showForm && (
        <div className="mt-8">
          <SettingsTab />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Porte sécurisée — compte existant mais session verrouillée          */
/* ------------------------------------------------------------------ */

function LoginGate() {
  const customer = useShop((s) => s.customer);
  const pinStored = useShop((s) => s.pin);
  const setPin = useShop((s) => s.setPin);
  const unlock = useShop((s) => s.unlock);
  const saveCustomer = useShop((s) => s.saveCustomer);
  const resendCredentials = useShop((s) => s.resendCredentials);

  const [phone, setPhone] = useState("");
  const [pin, setPinField] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [show, setShow] = useState(false);
  const [wipeArmed, setWipeArmed] = useState(false);

  const hasPin = typeof pinStored === "string";
  const lastDigits = customer
    ? customer.phone.replace(/\D/g, "").slice(-4)
    : "";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    if (!phoneMatches(phone, customer.phone)) {
      toast({
        title: "Numéro inconnu",
        description: "Aucun compte lié à ce numéro sur cet appareil.",
        variant: "destructive",
      });
      return;
    }

    if (!hasPin) {
      // Première sécurisation : le client choisit lui-même son code PIN.
      if (!isValidPin(pin)) {
        toast({
          title: "Code PIN invalide",
          description: "Choisissez exactement 4 chiffres.",
          variant: "destructive",
        });
        return;
      }
      if (pin !== confirm) {
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
      setPin(pin);
      toast({
        title: "Compte sécurisé",
        description: `Copie des identifiants envoyée à ${mail}.`,
      });
      return;
    }

    if (pin !== pinStored) {
      toast({
        title: "Code PIN incorrect",
        description: "Réessayez ou demandez une copie par email.",
        variant: "destructive",
      });
      return;
    }

    unlock();
    toast({
      title: `Bienvenue ${customer.name.split(" ")[0]} !`,
      description: "Votre espace client est déverrouillé.",
    });
  };

  const forgot = () => {
    const mail = resendCredentials();
    if (mail) {
      toast({
        title: "Copie envoyée",
        description: `Vos identifiants ont été renvoyés à ${mail}.`,
      });
    } else {
      toast({
        title: "Aucun email enregistré",
        description: "Effacez ce compte de cet appareil, puis recommandez.",
      });
    }
  };

  const wipe = () => {
    try {
      useShop.persist.clearStorage();
    } catch {
      /* stockage indisponible : on recharge quand même */
    }
    window.location.reload();
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 lg:py-16">
      <Reveal>
        <div className="rounded-md border border-[#e6e3db] bg-white p-6 shadow-sm sm:p-8">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-[#141414]">
              <LockKeyhole className="h-7 w-7 text-[#d4af37]" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-[#0b0b0b]">
              Espace client sécurisé
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {hasPin
                ? "Identifiez-vous avec votre numéro et votre code PIN à 4 chiffres."
                : "Confirmez votre numéro, puis choisissez votre code PIN à 4 chiffres."}
            </p>
            {lastDigits && (
              <p className="mt-1 text-xs text-muted-foreground">
                Compte enregistré se terminant par {lastDigits}
              </p>
            )}
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="lg-phone">Téléphone (identifiant) *</Label>
              <Input
                id="lg-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+229 01 97 00 00 00"
                autoComplete="username"
                className="h-11 rounded-sm border-[#d8d4ca]"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lg-pin">
                {hasPin ? "Code PIN *" : "Nouveau code PIN (4 chiffres) *"}
              </Label>
              <div className="relative">
                <Input
                  id="lg-pin"
                  type={show ? "text" : "password"}
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPinField(e.target.value.replace(/\D/g, ""))}
                  autoComplete={hasPin ? "current-password" : "new-password"}
                  className="h-11 rounded-sm border-[#d8d4ca] pr-11 tracking-[0.5em]"
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

            {!hasPin && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="lg-confirm">Confirmer le code PIN *</Label>
                  <Input
                    id="lg-confirm"
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={confirm}
                    onChange={(e) =>
                      setConfirm(e.target.value.replace(/\D/g, ""))
                    }
                    autoComplete="new-password"
                    className="h-11 rounded-sm border-[#d8d4ca] tracking-[0.5em]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lg-email">Email de réception *</Label>
                  <Input
                    id="lg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    className="h-11 rounded-sm border-[#d8d4ca]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Une copie de vos identifiants (numéro + code PIN) y sera
                    envoyée.
                  </p>
                </div>
              </>
            )}

            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-sm bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
            >
              {hasPin ? "Déverrouiller mon espace" : "Sécuriser mon compte"}
            </Button>
          </form>

          {hasPin && (
            <button
              type="button"
              onClick={forgot}
              className="mt-3 w-full text-center text-sm font-bold text-[#8a6a14] underline-offset-2 hover:underline"
            >
              Identifiants oubliés ? Renvoyer une copie par email
            </button>
          )}

          <Separator className="my-5" />

          <p className="text-center text-xs text-muted-foreground">
            Ce n&apos;est pas votre compte ?{" "}
            {wipeArmed ? (
              <button
                type="button"
                onClick={wipe}
                className="font-bold text-[#c6482f] underline"
              >
                Confirmer l&apos;effacement
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setWipeArmed(true)}
                className="font-bold underline underline-offset-2 hover:text-[#111111]"
              >
                Effacer les données de cet appareil
              </button>
            )}
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Aperçu                                                              */
/* ------------------------------------------------------------------ */

function TierBadge({ className }: { className?: string }) {
  const lifetimePoints = useShop((s) => s.lifetimePoints);
  const tier = tierFor(lifetimePoints);
  const Icon = tier.name === "Or" ? Crown : tier.name === "Argent" ? Award : ShieldCheck;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-[#d4af37]/40 bg-[#f4eeda] px-3 py-1.5 text-sm font-extrabold text-[#8a6a14] ${className ?? ""}`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      Membre {tier.name}
    </span>
  );
}

function Crown({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return <Gem className={className} {...props} />;
}

function OverviewTab() {
  const customer = useShop((s) => s.customer);
  const orders = useShop((s) => s.orders);
  const points = useShop((s) => s.loyaltyPoints);
  const openAccount = useShop((s) => s.openAccount);
  const openCatalog = useShop((s) => s.openCatalog);

  const spent = useMemo(
    () => orders.reduce((sum, o) => sum + o.subtotal, 0),
    [orders]
  );
  const activeWarranties = orders.filter((o) => warrantyActive(o)).length;
  const goal = cheapestReward();
  const pct = Math.min(100, Math.round((points / goal.cost) * 100));

  return (
    <div className="flex flex-col gap-6">
      {/* Cartes statistiques */}
      <div className="grid gap-4 sm:grid-cols-3">
        <PointsCard compact />
        <Reveal delay={0.05}>
          <div className="h-full rounded-md border border-[#e6e3db] bg-white p-5">
            <Package className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
            <p className="mt-2 text-2xl font-extrabold text-[#0b0b0b]">
              {orders.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {orders.length > 1 ? "commandes passées" : "commande passée"}
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="h-full rounded-md border border-[#e6e3db] bg-white p-5">
            <ShieldCheck className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
            <p className="mt-2 text-2xl font-extrabold text-[#0b0b0b]">
              {activeWarranties}
            </p>
            <p className="text-sm text-muted-foreground">
              garantie{activeWarranties > 1 ? "s" : ""} active
              {activeWarranties > 1 ? "s" : ""}
            </p>
          </div>
        </Reveal>
      </div>

      {/* Prochaine récompense */}
      <Reveal>
        <div className="rounded-md bg-[#141414] p-6 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="flex items-center gap-2 font-extrabold">
              <Gift className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              Prochaine récompense
            </p>
            <p className="text-sm font-bold text-[#d4af37]">
              {goal.short} à {goal.cost} pts
            </p>
          </div>
          <Progress
            value={pct}
            className="mt-4 h-2.5 bg-white/15 [&_[data-slot=progress-indicator]]:bg-[#d4af37]"
          />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-white/80">
              {points >= goal.cost
                ? "Récompense disponible — échangez-la !"
                : `Encore ${goal.cost - points} pts (≈ ${formatFCFA(
                    Math.ceil(((goal.cost - points) / 5) * 10000)
                  )} d'achats)`}
            </p>
            <Button
              size="sm"
              className="rounded-sm bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
              onClick={() => openAccount("loyalty")}
            >
              Ma carte fidélité
            </Button>
          </div>
        </div>
      </Reveal>

      {/* Dernières commandes */}
      <section aria-labelledby="ov-orders">
        <div className="flex items-center justify-between">
          <h2 id="ov-orders" className="text-lg font-extrabold text-[#0b0b0b]">
            Dernières commandes
          </h2>
          {orders.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="font-bold text-[#8a6a14] hover:bg-[#f4eeda]"
              onClick={() => openAccount("orders")}
            >
              Tout voir
            </Button>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-[#d8d4ca] bg-white p-8 text-center">
            <ShoppingBasket className="mx-auto h-8 w-8 text-[#8f8f8f]" aria-hidden="true" />
            <p className="mt-2 font-bold">Aucune commande pour le moment</p>
            <Button
              className="mt-4 rounded-sm bg-[#d4af37] font-extrabold hover:bg-[#bfa032]"
              onClick={() => openCatalog("all")}
            >
              Commencer mes achats
            </Button>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {orders.slice(0, 3).map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>

      {/* Rappel profil */}
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e6e3db] bg-white p-5">
          <p className="text-sm">
            <span className="font-extrabold">Bonjour {customer?.name.split(" ")[0]} !</span>{" "}
            <span className="text-muted-foreground">
              Vos coordonnées servent à vos livraisons.
            </span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="rounded-sm border-[#d8d4ca] font-bold"
            onClick={() => openAccount("settings")}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Modifier mes données
          </Button>
        </div>
      </Reveal>
    </div>
  );
}

/** Carte points — utilisée en compact (aperçu) et pleine (fidélité). */
function PointsCard({ compact = false }: { compact?: boolean }) {
  const points = useShop((s) => s.loyaltyPoints);
  return (
    <Reveal>
      <div
        className={`flex h-full flex-col justify-between rounded-md bg-gradient-to-br from-[#141414] to-[#2b2415] p-5 text-white ${
          compact ? "" : "sm:p-7"
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-bold text-white/70">
            <Gem className={`text-[#d4af37] ${compact ? "h-4 w-4" : "h-5 w-5"}`} aria-hidden="true" />
            Carte fidélité
          </p>
          <span className="rounded-sm border border-[#d4af37]/50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-[#d4af37]">
            Maison Cauris
          </span>
        </div>
        <div className="mt-4">
          <p className={`font-extrabold text-[#d4af37] ${compact ? "text-2xl" : "text-4xl"}`}>
            {points} pts
          </p>
          {!compact && (
            <p className="mt-1 text-sm text-white/70">
              10 000 F payés = 5 pts · utilisables en récompenses
            </p>
          )}
        </div>
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/* Commandes                                                           */
/* ------------------------------------------------------------------ */

const STAGE_STEPS = [
  { label: "Confirmée", icon: BadgeCheck },
  { label: "Livraison", icon: Truck },
  { label: "Livrée", icon: PackageCheck },
];

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const stage = orderStage(order);
  const hasWarranty = warrantyActive(order);
  const end = warrantyEnd(order);

  return (
    <Reveal>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="overflow-hidden rounded-md border border-[#e6e3db] bg-white">
          <CollapsibleTrigger className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-[#f1efe9]/50">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda]">
              <Package className="h-5 w-5 text-[#8a6a14]" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-[#111111]">{order.id}</span>
                <Badge
                  className={`rounded-sm border-0 px-2 py-0.5 text-[11px] font-bold ${
                    stage.stage === 3
                      ? "bg-[#eef3ea] text-[#3e6b47]"
                      : stage.stage === 2
                        ? "bg-[#f4eeda] text-[#8a6a14]"
                        : "bg-[#141414] text-white"
                  }`}
                >
                  {stage.label}
                </Badge>
                {hasWarranty && (
                  <Badge className="rounded-sm border border-[#d4af37]/40 bg-white px-2 py-0.5 text-[11px] font-bold text-[#8a6a14]">
                    <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                    Garantie
                  </Badge>
                )}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {formatDateLong(new Date(order.createdAt))} · {order.lines.length}{" "}
                article{order.lines.length > 1 ? "s" : ""}
              </span>
            </span>
            <span className="text-right">
              <span className="block font-extrabold text-[#8a6a14]">
                {formatFCFA(order.total)}
              </span>
              <span className="text-xs text-muted-foreground">
                +{order.pointsEarned} pts
              </span>
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-[#8f8f8f] transition-transform ${open ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-[#e6e3db] px-4 pb-4 pt-4">
              {/* Suivi */}
              <ol className="flex items-center gap-1" aria-label="Suivi de commande">
                {STAGE_STEPS.map((s, i) => {
                  const done = stage.stage >= i + 1;
                  const Icon = s.icon;
                  return (
                    <li key={s.label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="flex w-full items-center">
                        <span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done ? "bg-[#d4af37]" : "bg-[#e6e3db]"}`} />
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                            done ? "bg-[#d4af37] text-[#0b0b0b]" : "bg-[#f1efe9] text-[#8f8f8f]"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span
                          className={`h-0.5 flex-1 ${i === STAGE_STEPS.length - 1 ? "opacity-0" : stage.stage > i + 1 ? "bg-[#d4af37]" : "bg-[#e6e3db]"}`}
                        />
                      </span>
                      <span
                        className={`text-center text-[11px] font-bold ${done ? "text-[#111111]" : "text-[#8f8f8f]"}`}
                      >
                        {s.label}
                      </span>
                    </li>
                  );
                })}
              </ol>
              <p className="mt-2 text-center text-xs text-muted-foreground">{stage.hint}</p>

              <Separator className="my-4" />

              {/* Articles */}
              <ul className="flex flex-col gap-2.5">
                {order.lines.map((l) => {
                  const p = getProduct(l.productId);
                  return (
                    <li key={l.productId} className="flex items-center gap-3">
                      {p && (
                        <SafeImg
                          src={imgFor(p.imageKeys[0])}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-sm object-cover"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{l.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.qty} × {formatFCFA(l.price)}
                        </p>
                      </div>
                      <p className="text-sm font-bold">{formatFCFA(l.price * l.qty)}</p>
                    </li>
                  );
                })}
              </ul>

              {/* Détails */}
              <div className="mt-4 grid gap-3 rounded-sm bg-[#f1efe9]/60 p-4 text-sm sm:grid-cols-2">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a14]" aria-hidden="true" />
                  <span>
                    {order.address}
                    {order.district ? `, ${order.district}` : ""} — {order.city}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a14]" aria-hidden="true" />
                  <span>{order.paymentLabel}</span>
                </p>
                <p className="flex items-start gap-2">
                  <Gem className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a14]" aria-hidden="true" />
                  <span>
                    +{order.pointsEarned} pts
                    {order.rewardUsed ? ` · ${order.rewardUsed.label} (−${order.rewardUsed.cost} pts)` : ""}
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-[#8a6a14]" aria-hidden="true" />
                  <span>
                    Garantie :{" "}
                    {hasWarranty ? (
                      <span className="font-bold text-[#3e6b47]">
                        active jusqu&apos;au {formatDateLong(end)}
                      </span>
                    ) : (
                      "expirée"
                    )}
                  </span>
                </p>
              </div>

              {order.discount > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Sous-total {formatFCFA(order.subtotal)} · Réduction{" "}
                  <span className="font-bold text-[#8a6a14]">−{formatFCFA(order.discount)}</span>{" "}
                  · Livraison {order.shipping === 0 ? "offerte" : formatFCFA(order.shipping)}
                </p>
              )}

              {/* Actions */}
              <div className="mt-4 flex flex-wrap gap-2">
                <ReorderButton order={order} />
                <Button variant="outline" size="sm" className="rounded-sm border-[#d8d4ca] font-bold" asChild>
                  <a href={WHATSAPP} target="_blank" rel="noreferrer">
                    <Headset className="h-4 w-4" aria-hidden="true" />
                    SAV / garantie
                  </a>
                </Button>
                <CopyIdButton orderId={order.id} />
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Reveal>
  );
}

function ReorderButton({ order }: { order: Order }) {
  const addToCart = useShop((s) => s.addToCart);
  const available = order.lines.filter((l) => getProduct(l.productId));

  const reorder = () => {
    available.forEach((l) => addToCart(l.productId, l.qty));
    toast({
      title: "Ajouté au panier",
      description: `${available.reduce((n, l) => n + l.qty, 0)} article(s) de ${order.id}.`,
    });
  };

  return (
    <Button
      size="sm"
      className="rounded-sm bg-[#141414] font-extrabold hover:bg-[#2e2e2e]"
      onClick={reorder}
      disabled={available.length === 0}
    >
      <RefreshCcw className="h-4 w-4" aria-hidden="true" />
      Recommander
    </Button>
  );
}

function CopyIdButton({ orderId }: { orderId: string }) {
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      toast({ title: "Numéro copié", description: orderId });
    } catch {
      toast({ title: "Copie impossible", description: orderId });
    }
  };
  return (
    <Button variant="ghost" size="sm" className="font-bold text-[#3d3d3d] hover:bg-[#f1efe9]" onClick={copy}>
      <Copy className="h-4 w-4" aria-hidden="true" />
      Copier le nº
    </Button>
  );
}

function OrdersTab() {
  const orders = useShop((s) => s.orders);
  const openCatalog = useShop((s) => s.openCatalog);

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[#d8d4ca] bg-white p-10 text-center">
        <Package className="mx-auto h-10 w-10 text-[#8f8f8f]" aria-hidden="true" />
        <p className="mt-3 text-lg font-extrabold">Aucune commande</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Vos commandes apparaîtront ici avec leur suivi et leur garantie.
        </p>
        <Button
          className="mt-5 rounded-sm bg-[#d4af37] font-extrabold hover:bg-[#bfa032]"
          onClick={() => openCatalog("all")}
        >
          Découvrir le catalogue
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-foreground">
        {orders.length} commande{orders.length > 1 ? "s" : ""} · garantie 90 jours sur chaque achat
      </p>
      {orders.map((o) => (
        <OrderRow key={o.id} order={o} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Fidélité                                                            */
/* ------------------------------------------------------------------ */

function LoyaltyTab() {
  const points = useShop((s) => s.loyaltyPoints);
  const lifetimePoints = useShop((s) => s.lifetimePoints);
  const orders = useShop((s) => s.orders);
  const activeReward = useShop((s) => s.activeReward);
  const setActiveReward = useShop((s) => s.setActiveReward);
  const openCatalog = useShop((s) => s.openCatalog);

  const tier = tierFor(lifetimePoints);
  const next = nextTier(lifetimePoints);
  const tierPct = next
    ? Math.min(100, Math.round(((lifetimePoints - tier.min) / (next.min - tier.min)) * 100))
    : 100;

  const exchange = (r: Reward) => {
    if (activeReward?.id === r.id) {
      setActiveReward(null);
      toast({ title: "Récompense retirée", description: "Vos points restent intacts." });
      return;
    }
    if (points < r.cost) return;
    setActiveReward(r);
    toast({
      title: `${r.label} activée`,
      description: "Appliquée automatiquement à votre prochaine commande.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <PointsCard />

        {/* Règles du programme */}
        <Reveal direction="right">
          <div className="h-full rounded-md border border-[#e6e3db] bg-white p-5 sm:p-7">
            <h2 className="flex items-center gap-2 font-extrabold text-[#0b0b0b]">
              <Sparkles className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              Comment ça marche
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm">
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda] font-extrabold text-[#8a6a14]">
                  10k
                </span>
                Chaque tranche de 10 000 F payés rapporte <b>5 pts</b>
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda] font-extrabold text-[#8a6a14]">
                  100
                </span>
                100 pts = <b>−5 %</b> sur une commande
              </li>
              <li className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda] font-extrabold text-[#8a6a14]">
                  80
                </span>
                80 pts = <b>−7 000 FCFA</b> sur une commande
              </li>
            </ul>
          </div>
        </Reveal>
      </div>

      {/* Récompenses */}
      <section aria-labelledby="rewards-title">
        <h2 id="rewards-title" className="text-lg font-extrabold text-[#0b0b0b]">
          Mes récompenses
        </h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {REWARDS.map((r) => {
            const armed = activeReward?.id === r.id;
            const affordable = points >= r.cost;
            return (
              <div
                key={r.id}
                className={`rounded-md border p-5 transition-colors ${
                  armed
                    ? "border-[#d4af37] bg-[#f4eeda]/60"
                    : "border-[#e6e3db] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-[#141414]">
                    <Gift className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
                  </span>
                  <Badge
                    className={`rounded-sm border-0 font-extrabold ${
                      affordable ? "bg-[#f4eeda] text-[#8a6a14]" : "bg-[#f1efe9] text-[#8f8f8f]"
                    }`}
                  >
                    {r.cost} pts
                  </Badge>
                </div>
                <p className="mt-3 text-lg font-extrabold text-[#111111]">{rewardLabel(r)}</p>
                <p className="text-sm text-muted-foreground">{r.label}</p>
                <Button
                  className={`mt-4 w-full rounded-sm font-extrabold ${
                    armed
                      ? "bg-white text-[#8a6a14] border border-[#d4af37] hover:bg-[#f4eeda]"
                      : affordable
                        ? "bg-[#d4af37] text-[#0b0b0b] hover:bg-[#bfa032]"
                        : "bg-[#f1efe9] text-[#8f8f8f]"
                  }`}
                  disabled={!armed && !affordable}
                  onClick={() => exchange(r)}
                >
                  {!armed && !affordable
                    ? `Encore ${r.cost - points} pts`
                    : armed
                      ? "Retirer de ma commande"
                      : "Échanger mes points"}
                </Button>
                {armed && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#8a6a14]">
                    <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Appliquée au checkout
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Palier membre */}
      <Reveal>
        <div className="rounded-md border border-[#e6e3db] bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 font-extrabold">
              <Award className="h-5 w-5 text-[#d4af37]" aria-hidden="true" />
              Statut {tier.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {next
                ? `${next.min - lifetimePoints} pts pour devenir ${next.name}`
                : "Rang maximum atteint !"}
            </p>
          </div>
          <Progress
            value={tierPct}
            className="mt-3 h-2 bg-[#f1efe9] [&_[data-slot=progress-indicator]]:bg-[#d4af37]"
          />
        </div>
      </Reveal>

      {/* Historique des points */}
      <section aria-labelledby="pts-history">
        <h2 id="pts-history" className="text-lg font-extrabold text-[#0b0b0b]">
          Historique des points
        </h2>
        {orders.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-[#d8d4ca] bg-white p-8 text-center">
            <p className="font-bold">Vos points apparaîtront après votre première commande.</p>
            <Button
              className="mt-4 rounded-sm bg-[#d4af37] font-extrabold hover:bg-[#bfa032]"
              onClick={() => openCatalog("all")}
            >
              Faire mes premiers points
            </Button>
          </div>
        ) : (
          <ul className="mt-3 overflow-hidden rounded-md border border-[#e6e3db] bg-white">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e6e3db] px-4 py-3 last:border-b-0"
              >
                <div>
                  <p className="text-sm font-bold">{o.id}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateLong(new Date(o.createdAt))}
                    {o.rewardUsed ? ` · ${o.rewardUsed.label}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-extrabold">
                  {o.rewardUsed && (
                    <span className="text-[#c6482f]">−{o.rewardUsed.cost} pts</span>
                  )}
                  <span className="text-[#3e6b47]">+{o.pointsEarned} pts</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Paramètres                                                          */
/* ------------------------------------------------------------------ */

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

function SettingsTab() {
  const customer = useShop((s) => s.customer);
  const saveCustomer = useShop((s) => s.saveCustomer);
  const isCreating = !customer;

  const [form, setForm] = useState<Customer>({
    name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    email: customer?.email ?? "",
    city: customer?.city ?? "Cotonou",
    district: customer?.district ?? "",
    address: customer?.address ?? "",
    defaultPayment: customer?.defaultPayment ?? "mtn_momo",
    notifyWhatsApp: customer?.notifyWhatsApp ?? true,
  });

  const set = <K extends keyof Customer>(key: K, value: Customer[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast({
        title: "Informations incomplètes",
        description: "Le nom et le téléphone sont requis.",
        variant: "destructive",
      });
      return;
    }
    saveCustomer({ ...form, name: form.name.trim(), phone: form.phone.trim() });
    toast({
      title: isCreating ? "Compte créé !" : "Profil mis à jour",
      description: isCreating
        ? "Vos prochaines commandes seront préremplies."
        : "Vos préférences sont enregistrées.",
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={save} className="flex flex-col gap-6" noValidate={false}>
      {/* Profil */}
      <section aria-labelledby="st-profile" className="rounded-md border border-[#e6e3db] bg-white p-5 sm:p-6">
        <h2 id="st-profile" className="flex items-center gap-2 text-lg font-extrabold text-[#8a6a14]">
          <UserRound className="h-5 w-5" aria-hidden="true" />
          Mes coordonnées
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="st-name">Nom complet *</Label>
            <Input id="st-name" value={form.name} onChange={(e) => set("name", e.target.value)} className="h-11 rounded-sm border-[#d8d4ca]" autoComplete="name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="st-phone">Téléphone (WhatsApp) *</Label>
            <Input id="st-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="h-11 rounded-sm border-[#d8d4ca]" autoComplete="tel" placeholder="+229 01 97 00 00 00" />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="st-email">E-mail</Label>
            <Input id="st-email" type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} className="h-11 rounded-sm border-[#d8d4ca]" autoComplete="email" placeholder="vous@exemple.com" />
          </div>
        </div>
      </section>

      {/* Adresse par défaut */}
      <section aria-labelledby="st-address" className="rounded-md border border-[#e6e3db] bg-white p-5 sm:p-6">
        <h2 id="st-address" className="flex items-center gap-2 text-lg font-extrabold text-[#8a6a14]">
          <MapPin className="h-5 w-5" aria-hidden="true" />
          Adresse de livraison par défaut
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="st-city">Ville</Label>
            <Select value={form.city} onValueChange={(v) => set("city", v)}>
              <SelectTrigger id="st-city" className="h-11 rounded-sm border-[#d8d4ca]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="st-district">Quartier</Label>
            <Input id="st-district" value={form.district ?? ""} onChange={(e) => set("district", e.target.value)} className="h-11 rounded-sm border-[#d8d4ca]" placeholder="Ex. Cadjèhoun" />
          </div>
          <div className="grid gap-2 sm:col-span-2">
            <Label htmlFor="st-address-input">Adresse</Label>
            <Input id="st-address-input" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} className="h-11 rounded-sm border-[#d8d4ca]" placeholder="Ex. Rue 12.084, maison bleue" autoComplete="street-address" />
          </div>
        </div>
      </section>

      {/* Préférences */}
      <section aria-labelledby="st-prefs" className="rounded-md border border-[#e6e3db] bg-white p-5 sm:p-6">
        <h2 id="st-prefs" className="flex items-center gap-2 text-lg font-extrabold text-[#8a6a14]">
          <Settings className="h-5 w-5" aria-hidden="true" />
          Préférences
        </h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="st-payment">Paiement par défaut</Label>
            <Select value={form.defaultPayment} onValueChange={(v) => set("defaultPayment", v as Customer["defaultPayment"])}>
              <SelectTrigger id="st-payment" className="h-11 rounded-sm border-[#d8d4ca]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  { id: "mtn_momo", label: "MTN MoMo" },
                  { id: "moov_money", label: "Moov Money" },
                  { id: "celtiis_cash", label: "Celtiis Cash" },
                  { id: "card", label: "Carte bancaire" },
                  { id: "cash_on_delivery", label: "Espèces à la livraison" },
                ].map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-sm bg-[#f1efe9]/60 p-4 sm:max-w-md">
            <div>
              <p className="text-sm font-bold">Suivi par WhatsApp</p>
              <p className="text-xs text-muted-foreground">
                Confirmation et livraison via WhatsApp.
              </p>
            </div>
            <Switch
              checked={form.notifyWhatsApp ?? true}
              onCheckedChange={(v) => set("notifyWhatsApp", v)}
              aria-label="Recevoir le suivi de commande par WhatsApp"
            />
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" className="h-12 rounded-sm bg-[#d4af37] px-8 font-extrabold hover:bg-[#bfa032]">
          <BadgeCheck className="h-5 w-5" aria-hidden="true" />
          {isCreating ? "Créer mon compte" : "Enregistrer"}
        </Button>
        {isCreating && (
          <p className="text-sm text-muted-foreground">
            Ou commandez directement : le compte se crée tout seul.
          </p>
        )}
      </div>

      </form>

      {/* Sécurité — identifiant, code PIN, copie email, session */}
      {!isCreating && <SecuritySection />}

      {/* Danger — uniquement si un compte existe */}
      {!isCreating && <DangerZone />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sécurité — identifiants de connexion, code PIN, session             */
/* ------------------------------------------------------------------ */

function SecuritySection() {
  const customer = useShop((s) => s.customer);
  const pin = useShop((s) => s.pin);
  const pinSetAt = useShop((s) => s.pinSetAt);
  const credentialsSentTo = useShop((s) => s.credentialsSentTo);
  const sessionActive = useShop((s) => s.sessionActive);
  const setPin = useShop((s) => s.setPin);
  const saveCustomer = useShop((s) => s.saveCustomer);
  const resendCredentials = useShop((s) => s.resendCredentials);
  const logout = useShop((s) => s.logout);

  const [mode, setMode] = useState<"closed" | "setup" | "change">("closed");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [email, setEmail] = useState(customer?.email ?? "");
  const [show, setShow] = useState(false);

  if (!customer) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "change" && current !== pin) {
      toast({
        title: "Code actuel incorrect",
        description: "Vérifiez votre code PIN actuel.",
        variant: "destructive",
      });
      return;
    }
    if (!isValidPin(next)) {
      toast({
        title: "Code PIN invalide",
        description: "Choisissez exactement 4 chiffres.",
        variant: "destructive",
      });
      return;
    }
    if (next !== confirm) {
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
    setPin(next);
    setMode("closed");
    setCurrent("");
    setNext("");
    setConfirm("");
    toast({
      title: mode === "change" ? "Code PIN modifié" : "Code PIN défini",
      description: `Copie des identifiants envoyée à ${mail}.`,
    });
  };

  const resend = () => {
    const mail = resendCredentials();
    if (mail) {
      toast({
        title: "Copie renvoyée",
        description: `Identifiants renvoyés à ${mail}.`,
      });
    } else {
      toast({
        title: "Aucun email enregistré",
        description: "Ajoutez un email dans « Mes coordonnées ».",
        variant: "destructive",
      });
    }
  };

  return (
    <section
      aria-labelledby="st-security"
      className="rounded-md border border-[#e6e3db] bg-white p-5 sm:p-6"
    >
      <h2
        id="st-security"
        className="flex items-center gap-2 text-lg font-extrabold text-[#8a6a14]"
      >
        <KeyRound className="h-5 w-5" aria-hidden="true" />
        Sécurité
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Identifiant : votre numéro de téléphone · code PIN à 4 chiffres choisi
        par vous · copie des identifiants envoyée par email.
      </p>

      <div className="mt-4">
        {/* Identifiant de connexion */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda]">
              <Phone className="h-4 w-4 text-[#8a6a14]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#111111]">
                Identifiant de connexion
              </p>
              <p className="text-xs text-muted-foreground">
                Votre numéro de téléphone
              </p>
            </div>
          </div>
          <p className="font-bold text-[#111111]">{customer.phone}</p>
        </div>

        {/* Code PIN */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e3db] py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda]">
              <KeyRound className="h-4 w-4 text-[#8a6a14]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#111111]">
                Code PIN à 4 chiffres
              </p>
              <p className="text-xs text-muted-foreground">
                {pin
                  ? `Défini le ${pinSetAt ? formatDateLong(new Date(pinSetAt)) : "—"}`
                  : "Pas encore défini — sécurisez votre compte"}
              </p>
            </div>
          </div>
          {pin ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm border-[#d8d4ca] font-bold"
              onClick={() => setMode(mode === "change" ? "closed" : "change")}
            >
              Changer
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-sm bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
              onClick={() => setMode("setup")}
            >
              Définir mon code PIN
            </Button>
          )}
        </div>

        {/* Copie des identifiants par email */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e3db] py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda]">
              <MailCheck className="h-4 w-4 text-[#8a6a14]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#111111]">
                Copie des identifiants par email
              </p>
              <p className="text-xs text-muted-foreground">
                {credentialsSentTo
                  ? `Envoyée à ${credentialsSentTo}`
                  : customer.email
                    ? `Sera envoyée à ${customer.email}`
                    : "Aucun email enregistré"}
              </p>
            </div>
          </div>
          {pin && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm border-[#d8d4ca] font-bold"
              onClick={resend}
            >
              Renvoyer
            </Button>
          )}
        </div>

        {/* Session */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e6e3db] py-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#f4eeda]">
              <LockKeyhole
                className="h-4 w-4 text-[#8a6a14]"
                aria-hidden="true"
              />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#111111]">Session</p>
              <p className="text-xs text-muted-foreground">
                {sessionActive
                  ? "Déverrouillée sur cet appareil"
                  : "Verrouillée"}
              </p>
            </div>
          </div>
          {sessionActive && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm border-[#c6482f]/40 font-bold text-[#c6482f] hover:bg-[#f8e2dc]"
              onClick={() => {
                logout();
                toast({
                  title: "Déconnecté",
                  description: "Votre espace client est verrouillé.",
                });
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Se déconnecter
            </Button>
          )}
        </div>
      </div>

      {mode !== "closed" && (
        <form
          onSubmit={submit}
          className="mt-2 grid gap-3 rounded-sm bg-[#f1efe9]/60 p-4 sm:max-w-md"
        >
          <p className="text-sm font-extrabold text-[#111111]">
            {mode === "change"
              ? "Changer mon code PIN"
              : "Définir mon code PIN"}
          </p>
          {mode === "change" && (
            <div className="grid gap-2">
              <Label htmlFor="sec-current">Code PIN actuel *</Label>
              <Input
                id="sec-current"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={current}
                onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ""))}
                autoComplete="current-password"
                className="h-11 rounded-sm border-[#d8d4ca] tracking-[0.5em]"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="sec-next">
              {mode === "change"
                ? "Nouveau code PIN *"
                : "Code PIN (4 chiffres) *"}
            </Label>
            <div className="relative">
              <Input
                id="sec-next"
                type={show ? "text" : "password"}
                inputMode="numeric"
                maxLength={4}
                value={next}
                onChange={(e) => setNext(e.target.value.replace(/\D/g, ""))}
                autoComplete="new-password"
                className="h-11 rounded-sm border-[#d8d4ca] pr-11 tracking-[0.5em]"
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
              className="h-11 rounded-sm border-[#d8d4ca] tracking-[0.5em]"
            />
          </div>
          {!customer.email && (
            <div className="grid gap-2">
              <Label htmlFor="sec-email">Email de réception *</Label>
              <Input
                id="sec-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                autoComplete="email"
                className="h-11 rounded-sm border-[#d8d4ca]"
              />
              <p className="text-xs text-muted-foreground">
                Une copie de vos identifiants (numéro + code PIN) y sera
                envoyée.
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="rounded-sm bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
            >
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="rounded-sm font-bold text-[#3d3d3d] hover:bg-[#f1efe9]"
              onClick={() => setMode("closed")}
            >
              Annuler
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

function DangerZone() {
  const [confirmed, setConfirmed] = useState(false);

  const wipe = () => {
    try {
      useShop.persist.clearStorage();
    } catch {
      /* stockage indisponible : on recharge quand même */
    }
    window.location.reload();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#f0d9d3] bg-[#fdf5f2] p-5">
      <div>
        <p className="flex items-center gap-2 font-extrabold text-[#c6482f]">
          <Trash2 className="h-4.5 w-4.5" aria-hidden="true" />
          Effacer mon compte
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Commandes, points et préférences supprimés de cet appareil.
        </p>
      </div>
      <AlertDialog open={confirmed} onOpenChange={setConfirmed}>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="rounded-sm border-[#c6482f]/40 font-bold text-[#c6482f] hover:bg-[#f8e2dc]">
            Effacer
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Effacer toutes mes données ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action supprime votre compte, vos {useShop.getState().orders.length} commande(s),
              vos points fidélité et vos préférences, sur cet appareil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-sm bg-[#c6482f] hover:bg-[#a83c26]"
              onClick={wipe}
            >
              Tout effacer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
