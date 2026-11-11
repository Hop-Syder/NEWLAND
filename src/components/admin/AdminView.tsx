"use client";

/**
 * Espace administrateur NEWLAND ELECTRO (/admin).
 * NEWLAND GROUP
 *
 * Tableau de bord pour piloter tout le site : chiffre d'affaires, commandes
 * (statuts modifiables), comptes clients (points fidélité, PIN, suivi des
 * achats, suppression de comptes), catalogue (ajout / édition / suppression,
 * promotions, tags, stocks), réglages du site (bandeau d'annonce, export CSV,
 * réinitialisation des données de démo).
 *
 * Démo sans backend : la session admin et les données vivent dans le store
 * persisté ; le mot de passe est fixé côté client (ADMIN_PASSWORD).
 */

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  Banknote,
  Boxes,
  ChevronDown,
  Download,
  Gem,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings,
  Shell,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CATEGORIES, type CategoryId, type Product } from "@/lib/products";
import { IMG, imgFor } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import { tierFor } from "@/lib/loyalty";
import {
  ADMIN_PASSWORD,
  ORDER_STATUS_LABELS,
  phoneMatches,
  useShop,
  type ClientAccount,
  type Order,
  type OrderStatus,
} from "@/lib/store";
import { SafeImg } from "@/components/shop/SafeImg";

/* ————— Types & helpers locaux ————— */

type AdminTab = "dashboard" | "orders" | "clients" | "products" | "settings";

const TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "orders", label: "Commandes", icon: ShoppingBag },
  { id: "clients", label: "Comptes clients", icon: UsersRound },
  { id: "products", label: "Produits", icon: Boxes },
  { id: "settings", label: "Réglages", icon: Settings },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  en_attente: "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/40",
  confirmee: "bg-[#60a5fa]/15 text-[#93c5fd] border-[#60a5fa]/40",
  livree: "bg-[#4ade80]/15 text-[#86efac] border-[#4ade80]/40",
  annulee: "bg-[#f87171]/15 text-[#fca5a5] border-[#f87171]/40",
};

const SHORT_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

function fmtDateTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function relDate(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} j`;
  return SHORT_DATE.format(new Date(iso));
}

function statusOf(o: Order): OrderStatus {
  return o.status ?? "en_attente";
}

/** Pourcentage de réduction en cours, ou null si le produit n'est pas en promo. */
function promoPct(p: Product): number | null {
  if (p.oldPrice && p.oldPrice > p.price) {
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  }
  return null;
}

/** Suggestions de tags proposées dans le formulaire produit. */
const TAG_SUGGESTIONS = [
  "Nouveau",
  "Best-seller",
  "Promo",
  "Essentiel",
  "Famille",
  "Fait main",
  "Livraison rapide",
  "Petit prix",
];

/** CA des 7 derniers jours, jour par jour (pour le graphique en barres). */
function computeLast7Days(orders: Order[]): {
  label: string;
  total: number;
  key: string;
}[] {
  const out: { label: string; total: number; key: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toDateString();
    const total = orders
      .filter(
        (o) =>
          statusOf(o) !== "annulee" &&
          new Date(o.createdAt).toDateString() === key
      )
      .reduce((sum, o) => sum + o.total, 0);
    out.push({
      key,
      total,
      label: new Intl.DateTimeFormat("fr-FR", { weekday: "short" })
        .format(d)
        .replace(".", ""),
    });
  }
  return out;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge
      variant="outline"
      className={`rounded-md border text-xs font-bold ${STATUS_BADGE[status]}`}
    >
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}

/* ————— Vue racine ————— */

export function AdminView() {
  const adminLoggedIn = useShop((s) => s.adminLoggedIn);

  // Thème sombre le temps de la visite admin (retiré à la sortie).
  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  if (!adminLoggedIn) return <AdminLogin />;
  return <AdminDashboard />;
}

/* ————— Connexion administrateur ————— */

function AdminLogin() {
  const adminLogin = useShop((s) => s.adminLogin);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(password)) {
      toast({
        title: "Bienvenue",
        description: "Session administrateur ouverte.",
      });
    } else {
      toast({
        title: "Mot de passe incorrect",
        description: "Réessayez — démo : cauris2026",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="dark flex min-h-screen items-center justify-center bg-[#0b0b0b] px-4">
      <div className="w-full max-w-sm rounded-md border border-[#2a2a2a] bg-[#161616] p-7 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-md bg-[#d4af37]">
            <Shell className="h-7 w-7 text-[#0b0b0b]" aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-[#f5f2e9]">
            Espace administrateur
          </h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            NEWLAND ELECTRO — suivi du site
          </p>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="admin-pass" className="text-[#f5f2e9]">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="admin-pass"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                autoFocus
                className="h-11 rounded-md border-[#2a2a2a] bg-[#0b0b0b] pr-11 text-[#f5f2e9]"
              />
              <button
                type="button"
                aria-label={show ? "Masquer" : "Afficher"}
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a3a3a3] hover:text-white"
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          <Button
            type="submit"
            className="h-11 rounded-md bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
          >
            Ouvrir la session
          </Button>
        </form>

        <p className="mt-4 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] p-3 text-center text-xs text-[#a3a3a3]">
          Démo — mot de passe :{" "}
          <span className="font-bold text-[#d4af37]">{ADMIN_PASSWORD}</span>
        </p>

        <a
          href="/"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-[#a3a3a3] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Retour au site
        </a>
      </div>
    </div>
  );
}

/* ————— Tableau de bord (layout + navigation) ————— */

function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const adminLogout = useShop((s) => s.adminLogout);

  return (
    <div className="dark min-h-screen bg-[#0b0b0b] text-[#f5f2e9]">
      {/* Barre supérieure */}
      <header className="sticky top-0 z-30 border-b border-[#2a2a2a] bg-[#111111]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#d4af37]">
            <Shell className="h-5 w-5 text-[#0b0b0b]" aria-hidden="true" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-extrabold">NEWLAND ELECTRO</p>
            <p className="text-xs font-semibold text-[#d4af37]">
              Administration (NEWLAND GROUP)
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-md border-[#2a2a2a] bg-transparent font-bold text-[#f5f2e9] hover:bg-[#1e1e1e] hover:text-white"
            >
              <a href="/">
                <Store className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Voir le site</span>
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-md font-bold text-[#a3a3a3] hover:bg-[#1e1e1e] hover:text-white"
              onClick={() => {
                adminLogout();
                toast({ title: "Session fermée" });
              }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        {/* Navigation latérale (desktop) */}
        <aside className="hidden w-56 shrink-0 md:block">
          <nav aria-label="Sections admin" className="sticky top-20 grid gap-1">
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#d4af37] text-[#0b0b0b]"
                      : "text-[#c9c9c9] hover:bg-[#161616] hover:text-white"
                  }`}
                >
                  <t.icon className="h-4.5 w-4.5" aria-hidden="true" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Navigation chips (mobile) */}
          <nav
            aria-label="Sections admin"
            className="nice-scroll -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 md:hidden"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-bold transition-colors ${
                    active
                      ? "bg-[#d4af37] text-[#0b0b0b]"
                      : "border border-[#2a2a2a] bg-[#161616] text-[#c9c9c9]"
                  }`}
                >
                  <t.icon className="h-4 w-4" aria-hidden="true" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <main>
            {tab === "dashboard" && (
              <DashboardTab onGoProducts={() => setTab("products")} />
            )}
            {tab === "orders" && <OrdersTab />}
            {tab === "clients" && <ClientsTab />}
            {tab === "products" && <ProductsTab />}
            {tab === "settings" && <SettingsTab />}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ————— Onglet : tableau de bord ————— */

function Kpi({
  icon: Icon,
  label,
  value,
  hint,
  tone = "gold",
}: {
  icon: typeof Banknote;
  label: string;
  value: string;
  hint?: string;
  tone?: "gold" | "neutral" | "alert";
}) {
  const tones = {
    gold: "bg-[#d4af37]/10 text-[#d4af37]",
    neutral: "bg-[#161616] text-[#a3a3a3]",
    alert: "bg-[#f87171]/10 text-[#fca5a5]",
  } as const;
  return (
    <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tones[tone]}`}
        >
          <Icon className="h-4.5 w-4.5" aria-hidden="true" />
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-[#a3a3a3]">
          {label}
        </p>
      </div>
      <p className="mt-2.5 text-2xl font-extrabold text-[#f5f2e9]">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-[#a3a3a3]">{hint}</p>}
    </div>
  );
}

function DashboardTab({ onGoProducts }: { onGoProducts: () => void }) {
  const adminOrders = useShop((s) => s.adminOrders);
  const clients = useShop((s) => s.clients);
  const products = useShop((s) => s.products);
  const stock = useShop((s) => s.stock);

  const active = adminOrders.filter((o) => statusOf(o) !== "annulee");
  const revenue = active.reduce((sum, o) => sum + o.total, 0);
  const avg = active.length ? Math.round(revenue / active.length) : 0;
  const pendingCount = adminOrders.filter(
    (o) => statusOf(o) === "en_attente"
  ).length;
  const lowStock = products.filter((p) => (stock[p.id] ?? 0) <= 3);
  const promoCount = products.filter((p) => promoPct(p) !== null).length;
  const featuredCount = products.filter((p) => p.featured).length;

  // Chiffre d'affaires des 7 derniers jours (barres CSS, sans librairie).
  const days = computeLast7Days(adminOrders);

  const maxDay = Math.max(...days.map((d) => d.total), 1);
  const recent = adminOrders.slice(0, 5);

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-xl font-extrabold sm:text-2xl">Tableau de bord</h1>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Vue d&apos;ensemble de la boutique — mise à jour en direct.
        </p>
      </div>

      {/* Indicateurs clés */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Kpi
          icon={Banknote}
          label="Chiffre d'affaires"
          value={formatFCFA(revenue)}
          hint={`${active.length} commande(s) valide(s)`}
        />
        <Kpi
          icon={ShoppingBag}
          label="Commandes"
          value={String(adminOrders.length)}
          hint={`${pendingCount} en attente de confirmation`}
        />
        <Kpi
          icon={UsersRound}
          label="Comptes clients"
          value={String(clients.length)}
          hint={`${clients.filter((c) => c.pinSet).length} avec code PIN`}
        />
        <Kpi icon={TrendingUp} label="Panier moyen" value={formatFCFA(avg)} />
        <Kpi
          icon={Boxes}
          label="Produits au catalogue"
          value={String(products.length)}
          hint={`${promoCount} en promo · ${featuredCount} en vedette`}
        />
        <Kpi
          icon={AlertTriangle}
          label="Stock faible"
          value={String(lowStock.length)}
          hint="Produits à réapprovisionner (≤ 3)"
          tone={lowStock.length ? "alert" : "neutral"}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Graphique 7 jours */}
        <section
          aria-label="Chiffre d'affaires des 7 derniers jours"
          className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5 lg:col-span-3"
        >
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#a3a3a3]">
            CA — 7 derniers jours
          </h2>
          <div className="mt-4 grid h-44 grid-cols-7 items-end gap-2 sm:gap-3">
            {days.map((d) => (
              <div
                key={d.key}
                className="flex h-full flex-col items-center justify-end gap-1.5"
              >
                <span className="text-[10px] font-bold text-[#a3a3a3]">
                  {d.total > 0 ? `${Math.round(d.total / 1000)}k` : ""}
                </span>
                <div
                  className={`w-full rounded-sm ${
                    d.total > 0 ? "bg-[#d4af37]" : "bg-[#2a2a2a]"
                  }`}
                  style={{
                    height: `${Math.max(4, (d.total / maxDay) * 100)}%`,
                  }}
                  title={formatFCFA(d.total)}
                />
                <span className="text-xs font-bold capitalize text-[#c9c9c9]">
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Alertes stock */}
        <section
          aria-label="Alertes de stock"
          className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5 lg:col-span-2"
        >
          <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-[#a3a3a3]">
            <AlertTriangle
              className="h-4 w-4 text-[#fca5a5]"
              aria-hidden="true"
            />
            Stocks faibles
          </h2>
          {lowStock.length === 0 ? (
            <p className="mt-4 text-sm text-[#a3a3a3]">
              Aucun produit sous le seuil. Tout va bien !
            </p>
          ) : (
            <ul className="mt-4 grid gap-2.5">
              {lowStock.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-2.5"
                >
                  <span className="min-w-0 flex-1 truncate text-sm font-bold">
                    {p.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="shrink-0 rounded-md border-[#f87171]/40 bg-[#f87171]/10 text-[#fca5a5]"
                  >
                    {stock[p.id] ?? 0} en stock
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          <Button
            size="sm"
            variant="outline"
            className="mt-4 rounded-md border-[#d4af37]/50 bg-transparent font-bold text-[#d4af37] hover:bg-[#d4af37]/10"
            onClick={onGoProducts}
          >
            Gérer les produits
          </Button>
        </section>
      </div>

      {/* Dernières commandes */}
      <section
        aria-label="Dernières commandes"
        className="rounded-md border border-[#2a2a2a] bg-[#161616] p-5"
      >
        <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#a3a3a3]">
          Dernières commandes
        </h2>
        <ul className="mt-4 grid gap-2.5">
          {recent.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-4 py-3"
            >
              <span className="font-extrabold text-[#d4af37]">{o.id}</span>
              <span className="min-w-0 flex-1 truncate text-sm font-bold">
                {o.name}
              </span>
              <span className="text-xs text-[#a3a3a3]">
                {relDate(o.createdAt)}
              </span>
              <span className="text-sm font-extrabold">
                {formatFCFA(o.total)}
              </span>
              <StatusBadge status={statusOf(o)} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ————— Onglet : commandes ————— */

function OrdersTab() {
  const adminOrders = useShop((s) => s.adminOrders);
  const setOrderStatus = useShop((s) => s.setOrderStatus);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return adminOrders.filter((o) => {
      if (filter !== "all" && statusOf(o) !== filter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.name.toLowerCase().includes(q) ||
        o.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      );
    });
  }, [adminOrders, query, filter]);

  const selectCls =
    "rounded-md border-[#2a2a2a] bg-[#161616] text-[#f5f2e9]";

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">Commandes</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            {adminOrders.length} commande(s) — suivez et mettez à jour les
            statuts.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c6c6c]"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="N°, client, téléphone…"
              aria-label="Rechercher une commande"
              className="h-10 rounded-md border-[#2a2a2a] bg-[#161616] pl-9 text-[#f5f2e9]"
            />
          </div>
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as typeof filter)}
          >
            <SelectTrigger
              className={`h-10 w-full sm:w-44 ${selectCls}`}
              aria-label="Filtrer par statut"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className={selectCls}>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#2a2a2a] py-14 text-center text-sm text-[#a3a3a3]">
          Aucune commande ne correspond.
        </div>
      ) : (
        <ul className="grid gap-2.5">
          {list.map((o) => {
            const open = openId === o.id;
            return (
              <li
                key={o.id}
                className="rounded-md border border-[#2a2a2a] bg-[#161616]"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : o.id)}
                    aria-expanded={open}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#a3a3a3] transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                    <span className="font-extrabold text-[#d4af37]">
                      {o.id}
                    </span>
                    <span className="hidden text-xs text-[#a3a3a3] sm:inline">
                      {fmtDateTime(o.createdAt)}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {o.name}
                    </span>
                  </button>
                  <span className="text-sm font-extrabold">
                    {formatFCFA(o.total)}
                  </span>
                  <StatusBadge status={statusOf(o)} />
                  <Select
                    value={statusOf(o)}
                    onValueChange={(v) => {
                      setOrderStatus(o.id, v as OrderStatus);
                      toast({
                        title: `Commande ${o.id}`,
                        description: `Statut : ${
                          ORDER_STATUS_LABELS[v as OrderStatus]
                        }`,
                      });
                    }}
                  >
                    <SelectTrigger
                      className="h-9 w-[150px] rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-xs font-bold text-[#f5f2e9]"
                      aria-label={`Changer le statut de ${o.id}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={selectCls}>
                      {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(
                        (s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS_LABELS[s]}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {open && (
                  <div className="border-t border-[#2a2a2a] px-4 py-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[#a3a3a3]">
                          Articles
                        </p>
                        <ul className="mt-2 grid gap-1.5">
                          {o.lines.map((l) => (
                            <li
                              key={l.productId}
                              className="flex items-center justify-between gap-3 text-sm"
                            >
                              <span className="min-w-0 truncate">
                                {l.qty} × {l.name}
                              </span>
                              <span className="shrink-0 font-bold text-[#c9c9c9]">
                                {formatFCFA(l.price * l.qty)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="grid gap-1.5 text-sm">
                        <p className="text-xs font-bold uppercase tracking-wide text-[#a3a3a3]">
                          Client &amp; livraison
                        </p>
                        <p className="text-[#c9c9c9]">
                          <span className="text-[#a3a3a3]">Tél :</span>{" "}
                          <span className="font-bold text-[#f5f2e9]">
                            {o.phone}
                          </span>
                        </p>
                        {o.email && (
                          <p className="truncate text-[#c9c9c9]">
                            <span className="text-[#a3a3a3]">Email :</span>{" "}
                            {o.email}
                          </p>
                        )}
                        <p className="text-[#c9c9c9]">
                          <span className="text-[#a3a3a3]">Adresse :</span>{" "}
                          {o.address}, {o.city}
                        </p>
                        <p className="text-[#c9c9c9]">
                          <span className="text-[#a3a3a3]">Paiement :</span>{" "}
                          {o.paymentLabel}
                        </p>
                        {o.rewardUsed && (
                          <p className="text-[#c9c9c9]">
                            <span className="text-[#a3a3a3]">Fidélité :</span>{" "}
                            {o.rewardUsed.label} (−{o.rewardUsed.cost} pts) · +
                            {o.pointsEarned} pts gagnés
                          </p>
                        )}
                      </div>
                    </div>
                    <Separator className="my-3 bg-[#2a2a2a]" />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-[#a3a3a3]">
                        Sous-total {formatFCFA(o.subtotal)} · Livraison{" "}
                        {formatFCFA(o.shipping)}
                        {o.discount > 0 &&
                          ` · Réduction −${formatFCFA(o.discount)}`}
                      </span>
                      <span className="font-extrabold text-[#d4af37]">
                        Total {formatFCFA(o.total)}
                      </span>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ————— Onglet : comptes clients ————— */

function ClientsTab() {
  const clients = useShop((s) => s.clients);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? clients.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")) ||
            (c.email ?? "").toLowerCase().includes(q)
        )
      : clients;
    return [...filtered].sort((a, b) => b.totalSpent - a.totalSpent);
  }, [clients, query]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">
            Comptes clients
          </h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            {clients.length} compte(s) — créés automatiquement à la première
            commande.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c6c6c]"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom, téléphone, email…"
            aria-label="Rechercher un client"
            className="h-10 rounded-md border-[#2a2a2a] bg-[#161616] pl-9 text-[#f5f2e9]"
          />
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-md border border-dashed border-[#2a2a2a] py-14 text-center text-sm text-[#a3a3a3]">
          Aucun client ne correspond.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => (
            <ClientCard key={c.id} client={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client: c }: { client: ClientAccount }) {
  const tier = tierFor(c.lifetimePoints);
  const deleteClient = useShop((s) => s.deleteClient);
  const [purchasesOpen, setPurchasesOpen] = useState(false);
  return (
    <div className="rounded-md border border-[#2a2a2a] bg-[#161616] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#d4af37] text-base font-extrabold text-[#0b0b0b]">
            {c.name.trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-extrabold">{c.name}</p>
            <p className="truncate text-xs text-[#a3a3a3]">{c.city}</p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="shrink-0 rounded-md border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
        >
          {tier.name}
        </Badge>
      </div>

      <dl className="mt-3 grid gap-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-[#a3a3a3]">Téléphone</dt>
          <dd className="font-bold">{c.phone}</dd>
        </div>
        {c.email && (
          <div className="flex justify-between gap-3">
            <dt className="text-[#a3a3a3]">Email</dt>
            <dd className="min-w-0 truncate font-bold">{c.email}</dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt className="text-[#a3a3a3]">Commandes</dt>
          <dd className="font-bold">{c.ordersCount}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#a3a3a3]">Total dépensé</dt>
          <dd className="font-bold text-[#d4af37]">
            {formatFCFA(c.totalSpent)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="flex items-center gap-1.5 text-[#a3a3a3]">
            <Gem className="h-3.5 w-3.5" aria-hidden="true" />
            Points
          </dt>
          <dd className="font-bold">
            {c.points} pts
            <span className="ml-1 text-xs font-normal text-[#a3a3a3]">
              ({c.lifetimePoints} à vie)
            </span>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-[#a3a3a3]">Connexion</dt>
          <dd>
            {c.pinSet ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#86efac]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                PIN défini
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#fca5a5]">
                <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                PIN non défini
              </span>
            )}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[#a3a3a3]">Dernière commande</dt>
          <dd className="font-bold">
            {c.lastOrderAt ? relDate(c.lastOrderAt) : "—"}
          </dd>
        </div>
      </dl>

      {/* Actions : suivi des achats + suppression du compte */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-md border-[#d4af37]/50 bg-transparent font-bold text-[#d4af37] hover:bg-[#d4af37]/10"
          onClick={() => setPurchasesOpen(true)}
        >
          <History className="h-4 w-4" aria-hidden="true" />
          Suivi des achats
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="rounded-md border-[#f87171]/40 bg-transparent font-bold text-[#fca5a5] hover:bg-[#f87171]/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Supprimer le compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-md border-[#2a2a2a] bg-[#161616]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#f5f2e9]">
                Supprimer le compte de {c.name} ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#a3a3a3]">
                Le compte disparaît de la liste des clients (points fidélité
                inclus). Les commandes déjà passées restent dans
                l&apos;historique de la boutique. Action immédiate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-md border-[#2a2a2a] bg-transparent text-[#f5f2e9] hover:bg-[#1e1e1e]">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-md bg-[#f87171] font-bold text-[#0b0b0b] hover:bg-[#ef4444]"
                onClick={() => {
                  deleteClient(c.id);
                  toast({
                    title: "Compte supprimé",
                    description: `${c.name} a été retiré des comptes clients.`,
                  });
                }}
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <ClientOrdersDialog
        client={c}
        open={purchasesOpen}
        onClose={() => setPurchasesOpen(false)}
      />
    </div>
  );
}

/* ————— Suivi des achats d'un client (dialog) ————— */

function ClientOrdersDialog({
  client,
  open,
  onClose,
}: {
  client: ClientAccount;
  open: boolean;
  onClose: () => void;
}) {
  const adminOrders = useShop((s) => s.adminOrders);

  const orders = useMemo(
    () =>
      adminOrders
        .filter((o) => phoneMatches(client.phone, o.phone))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [adminOrders, client.phone]
  );
  const valid = useMemo(
    () => orders.filter((o) => statusOf(o) !== "annulee"),
    [orders]
  );
  const spent = valid.reduce((sum, o) => sum + o.subtotal, 0);
  const avg = valid.length ? Math.round(spent / valid.length) : 0;

  // Produit le plus acheté par ce client (hors commandes annulées).
  const topProduct = useMemo(() => {
    const tally = new Map<string, { name: string; qty: number }>();
    for (const o of valid)
      for (const l of o.lines) {
        const cur = tally.get(l.productId) ?? { name: l.name, qty: 0 };
        cur.qty += l.qty;
        tally.set(l.productId, cur);
      }
    return (
      [...tally.values()].sort((a, b) => b.qty - a.qty)[0] ?? null
    );
  }, [valid]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md border-[#2a2a2a] bg-[#161616] text-[#f5f2e9] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#f5f2e9]">
            Suivi des achats — {client.name}
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Historique complet des commandes de ce client ({client.phone}).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { label: "Commandes valides", value: String(valid.length) },
            { label: "Total dépensé", value: formatFCFA(spent) },
            { label: "Panier moyen", value: formatFCFA(avg) },
            {
              label: "Points à vie",
              value: `${client.lifetimePoints} pts`,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-md border border-[#2a2a2a] bg-[#0b0b0b] p-3"
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#a3a3a3]">
                {s.label}
              </p>
              <p className="mt-1 text-sm font-extrabold text-[#f5f2e9]">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {topProduct && (
          <p className="rounded-md border border-[#d4af37]/30 bg-[#d4af37]/10 px-3 py-2 text-xs font-bold text-[#d4af37]">
            Produit le plus acheté : {topProduct.name} ({topProduct.qty} unité
            {topProduct.qty > 1 ? "s" : ""})
          </p>
        )}

        <div className="grid gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[#a3a3a3]">
            Historique ({orders.length})
          </p>
          {orders.length === 0 ? (
            <p className="rounded-md border border-dashed border-[#2a2a2a] py-8 text-center text-sm text-[#a3a3a3]">
              Aucune commande enregistrée pour ce client.
            </p>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-2.5 text-sm"
              >
                <span className="font-extrabold text-[#d4af37]">{o.id}</span>
                <span className="text-xs text-[#a3a3a3]">
                  {fmtDateTime(o.createdAt)}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-[#c9c9c9]">
                  {o.lines.map((l) => `${l.qty}× ${l.name}`).join(" · ")}
                </span>
                <span className="font-extrabold">{formatFCFA(o.total)}</span>
                <StatusBadge status={statusOf(o)} />
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ————— Mise en promo rapide (dialog) ————— */

function PromoDialog({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const applyPromo = useShop((s) => s.applyPromo);
  const removePromo = useShop((s) => s.removePromo);
  const [percent, setPercent] = useState("10");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // Réinitialise le champ quand on ouvre sur un nouveau produit.
  if (open && product && loadedFor !== product.id) {
    setLoadedFor(product.id);
    setPercent(String(promoPct(product) ?? 10));
  }

  if (!product) return null;

  const current = promoPct(product);
  const base =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : product.price;
  const pct = Math.min(90, Math.max(1, Math.round(Number(percent) || 0)));
  const newPrice = Math.round((base * (100 - pct)) / 100);

  const apply = () => {
    if (!Number.isFinite(Number(percent)) || Number(percent) < 1) {
      toast({
        title: "Réduction invalide",
        description: "Indiquez un pourcentage entre 1 et 90.",
        variant: "destructive",
      });
      return;
    }
    if (newPrice >= base) {
      toast({
        title: "Réduction trop faible",
        description: "Le nouveau prix doit être inférieur au prix actuel.",
        variant: "destructive",
      });
      return;
    }
    applyPromo(product.id, pct);
    toast({
      title: "Promo appliquée",
      description: `${product.name} : ${formatFCFA(base)} → ${formatFCFA(newPrice)} (−${pct} %)`,
    });
    onClose();
  };

  const inputCls =
    "h-10 rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-[#f5f2e9]";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="rounded-md border-[#2a2a2a] bg-[#161616] text-[#f5f2e9] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#f5f2e9]">
            <BadgePercent
              className="h-5 w-5 text-[#d4af37]"
              aria-hidden="true"
            />
            Mettre en promo
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            {product.name}
          </DialogDescription>
        </DialogHeader>

        {current !== null && (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-2.5 text-sm">
            <span className="font-bold text-[#d4af37]">
              Promo en cours : −{current} % ({formatFCFA(product.oldPrice!)}{" "}
              → {formatFCFA(product.price)})
            </span>
            <Button
              size="sm"
              variant="outline"
              className="rounded-md border-[#f87171]/50 bg-transparent font-bold text-[#fca5a5] hover:bg-[#f87171]/10"
              onClick={() => {
                removePromo(product.id);
                toast({
                  title: "Promo retirée",
                  description: `${product.name} : retour à ${formatFCFA(product.oldPrice!)}`,
                });
                onClose();
              }}
            >
              Retirer
            </Button>
          </div>
        )}

        <div className="grid gap-3">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Réductions rapides"
          >
            {[5, 10, 15, 20, 30].map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={Number(percent) === v}
                onClick={() => setPercent(String(v))}
                className={`rounded-md px-3 py-1.5 text-sm font-bold transition-colors ${
                  Number(percent) === v
                    ? "bg-[#d4af37] text-[#0b0b0b]"
                    : "border border-[#2a2a2a] bg-[#0b0b0b] text-[#c9c9c9] hover:border-[#d4af37]/50 hover:text-[#d4af37]"
                }`}
              >
                −{v} %
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-pct" className="text-[#f5f2e9]">
              Réduction personnalisée (%)
            </Label>
            <Input
              id="promo-pct"
              type="number"
              min={1}
              max={90}
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
              className={inputCls}
            />
          </div>
          <div className="rounded-md border border-[#2a2a2a] bg-[#0b0b0b] p-4">
            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-sm text-[#a3a3a3] line-through">
                {formatFCFA(base)}
              </span>
              <span className="text-xl font-extrabold text-[#d4af37]">
                {formatFCFA(newPrice)}
              </span>
              <span className="rounded-md bg-[#d4af37] px-2 py-0.5 text-xs font-extrabold text-[#0b0b0b]">
                −{pct} %
              </span>
            </div>
            <p className="mt-1.5 text-xs text-[#a3a3a3]">
              Le client économise {formatFCFA(base - newPrice)}. Le prix barré
              s&apos;affiche sur le site.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-md border-[#2a2a2a] bg-transparent font-bold text-[#f5f2e9] hover:bg-[#1e1e1e]"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="button"
            className="rounded-md bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
            onClick={apply}
          >
            Appliquer la promo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ————— Onglet : produits ————— */

function ProductsTab() {
  const products = useShop((s) => s.products);
  const stock = useShop((s) => s.stock);
  const setStock = useShop((s) => s.setStock);
  const deleteProduct = useShop((s) => s.deleteProduct);
  const updateProduct = useShop((s) => s.updateProduct);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoTarget, setPromoTarget] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "promo" | "low" | "featured">(
    "all"
  );

  const promoCount = products.filter((p) => promoPct(p) !== null).length;
  const lowCount = products.filter((p) => (stock[p.id] ?? 0) <= 3).length;
  const featuredCount = products.filter((p) => p.featured).length;

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = products.filter(
      (p) =>
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
    if (filter === "promo") base = base.filter((p) => promoPct(p) !== null);
    if (filter === "low")
      base = base.filter((p) => (stock[p.id] ?? 0) <= 3);
    if (filter === "featured") base = base.filter((p) => p.featured);
    return base;
  }, [products, query, filter, stock]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold sm:text-2xl">Produits</h1>
          <p className="mt-1 text-sm text-[#a3a3a3]">
            {products.length} produit(s) — ajoutez, retirez, mettez en promo,
            taguez, ajustez les stocks.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative sm:w-56">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c6c6c]"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher…"
              aria-label="Rechercher un produit"
              className="h-10 rounded-md border-[#2a2a2a] bg-[#161616] pl-9 text-[#f5f2e9]"
            />
          </div>
          <Button
            className="h-10 rounded-md bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Nouveau produit
          </Button>
        </div>
      </div>

      {/* Filtres rapides */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filtrer les produits"
      >
        {(
          [
            ["all", `Tous (${products.length})`],
            ["promo", `En promo (${promoCount})`],
            ["low", `Stock faible (${lowCount})`],
            ["featured", `En vedette (${featuredCount})`],
          ] as const
        ).map(([id, label]) => {
          const active = filter === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(id)}
              className={`rounded-md px-3.5 py-2 text-sm font-bold transition-colors ${
                active
                  ? "bg-[#d4af37] text-[#0b0b0b]"
                  : "border border-[#2a2a2a] bg-[#161616] text-[#c9c9c9] hover:border-[#d4af37]/50 hover:text-[#d4af37]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <ul className="grid gap-2.5">
        {list.map((p) => {
          const qty = stock[p.id] ?? 0;
          const low = qty <= 3;
          const promo = promoPct(p);
          return (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md border border-[#2a2a2a] bg-[#161616] p-3 sm:p-4"
            >
              <SafeImg
                src={imgFor(p.imageKeys[0])}
                alt={p.name}
                className="h-14 w-14 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate font-bold">{p.name}</p>
                <p className="mt-0.5 text-xs text-[#a3a3a3]">
                  {CATEGORIES.find((c) => c.id === p.category)?.name ??
                    p.category}{" "}
                  · {p.brand}
                </p>
                {(p.tags?.length ?? 0) > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {p.tags!.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-[#d4af37]/30 bg-[#d4af37]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#d4af37]"
                      >
                        {t}
                      </span>
                    ))}
                    {(p.tags?.length ?? 0) > 3 && (
                      <span className="text-[10px] font-bold text-[#a3a3a3]">
                        +{p.tags!.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-right">
                {promo !== null && (
                  <Badge
                    variant="outline"
                    className="mb-1 inline-block rounded-md border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37]"
                  >
                    Promo −{promo} %
                  </Badge>
                )}
                <span className="block font-extrabold text-[#d4af37]">
                  {formatFCFA(p.price)}
                </span>
                {p.oldPrice && p.oldPrice > p.price && (
                  <span className="text-xs text-[#a3a3a3] line-through">
                    {formatFCFA(p.oldPrice)}
                  </span>
                )}
              </div>

              {/* Stock modifiable en un clin d'œil */}
              <label className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                Stock
                <Input
                  type="number"
                  min={0}
                  value={qty}
                  onChange={(e) =>
                    setStock(p.id, Math.max(0, Number(e.target.value) || 0))
                  }
                  aria-label={`Stock de ${p.name}`}
                  className={`h-9 w-20 rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-center font-bold text-[#f5f2e9] ${
                    low ? "border-[#f87171]/60 text-[#fca5a5]" : ""
                  }`}
                />
              </label>

              {/* Mise en avant */}
              <label className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                Vedette
                <Switch
                  checked={p.featured ?? false}
                  onCheckedChange={(v) => updateProduct(p.id, { featured: v })}
                  aria-label={`Mettre ${p.name} en vedette`}
                />
              </label>

              <div className="ml-auto flex items-center gap-1.5">
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Gérer la promo de ${p.name}`}
                  className={`h-9 w-9 rounded-md hover:bg-[#1e1e1e] ${
                    promo !== null
                      ? "text-[#d4af37]"
                      : "text-[#c9c9c9] hover:text-[#d4af37]"
                  }`}
                  onClick={() => {
                    setPromoTarget(p);
                    setPromoOpen(true);
                  }}
                >
                  <BadgePercent className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Modifier ${p.name}`}
                  className="h-9 w-9 rounded-md text-[#c9c9c9] hover:bg-[#1e1e1e] hover:text-white"
                  onClick={() => {
                    setEditing(p);
                    setDialogOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Supprimer ${p.name}`}
                      className="h-9 w-9 rounded-md text-[#fca5a5] hover:bg-[#f87171]/10 hover:text-[#fca5a5]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-md border-[#2a2a2a] bg-[#161616]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-[#f5f2e9]">
                        Supprimer ce produit ?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[#a3a3a3]">
                        « {p.name} » disparaîtra du catalogue et des paniers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-md border-[#2a2a2a] bg-transparent text-[#f5f2e9] hover:bg-[#1e1e1e]">
                        Annuler
                      </AlertDialogCancel>
                      <AlertDialogAction
                        className="rounded-md bg-[#f87171] font-bold text-[#0b0b0b] hover:bg-[#ef4444]"
                        onClick={() => {
                          deleteProduct(p.id);
                          toast({ title: "Produit supprimé", description: p.name });
                        }}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          );
        })}
      </ul>

      <ProductDialog
        open={dialogOpen}
        product={editing}
        onClose={() => setDialogOpen(false)}
      />
      <PromoDialog
        open={promoOpen}
        product={promoTarget}
        onClose={() => setPromoOpen(false)}
      />
    </div>
  );
}

/* ————— Formulaire produit (création / édition) ————— */

interface ProductForm {
  name: string;
  brand: string;
  category: CategoryId;
  price: string;
  oldPrice: string;
  availability: "in_stock" | "on_order";
  leadTimeDays: string;
  stockQty: string;
  warrantyMonths: string;
  shortDescription: string;
  description: string;
  featuresText: string;
  practicalText: string;
  featured: boolean;
  imageKey: string;
  source: string;
  tags: string[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  brand: "Générique",
  category: "cuisine",
  price: "",
  oldPrice: "",
  availability: "in_stock",
  leadTimeDays: "3",
  stockQty: "10",
  warrantyMonths: "6",
  shortDescription: "",
  description: "",
  featuresText: "",
  practicalText: "",
  featured: false,
  imageKey: "none",
  source: "Ajouté via l'admin",
  tags: [],
};

const IMAGE_KEYS = Object.keys(IMG).filter((k) => k.startsWith("p_"));

function ProductDialog({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}) {
  const addProduct = useShop((s) => s.addProduct);
  const updateProduct = useShop((s) => s.updateProduct);
  const setStock = useShop((s) => s.setStock);
  const stock = useShop((s) => s.stock);

  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const allProducts = useShop((s) => s.products);

  // Suggestions : base fixe + tags déjà utilisés dans le catalogue.
  const tagSuggestions = useMemo(() => {
    const set = new Set<string>(TAG_SUGGESTIONS);
    for (const p of allProducts) for (const t of p.tags ?? []) set.add(t);
    return [...set];
  }, [allProducts]);

  // Pré-remplit le formulaire quand on ouvre en mode édition.
  if (open && product && loadedId !== product.id) {
    setLoadedId(product.id);
    setForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: String(product.price),
      oldPrice: product.oldPrice ? String(product.oldPrice) : "",
      availability: product.availability,
      leadTimeDays: product.leadTimeDays ? String(product.leadTimeDays) : "3",
      stockQty: String(stock[product.id] ?? 0),
      warrantyMonths: product.warrantyMonths
        ? String(product.warrantyMonths)
        : "",
      shortDescription: product.shortDescription,
      description: product.description,
      featuresText: product.features.join("\n"),
      practicalText: product.practical
        .filter((l) => !/^Garantie boutique/i.test(l))
        .join("\n"),
      featured: product.featured ?? false,
      imageKey: product.imageKeys[0] ?? "none",
      source: product.source,
      tags: product.tags ?? [],
    });
    setTagInput("");
  }

  const set = (patch: Partial<ProductForm>) =>
    setForm((f) => ({ ...f, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = form.name.trim();
    const price = Number(form.price);
    if (!name || !Number.isFinite(price) || price <= 0) {
      toast({
        title: "Champs requis",
        description: "Le nom et un prix valide sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const features = form.featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const practical = form.practicalText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const warranty = Number(form.warrantyMonths);
    const hasWarranty = Number.isFinite(warranty) && warranty > 0;
    if (hasWarranty) {
      practical.push(`Garantie boutique : ${Math.round(warranty)} mois`);
    }

    const oldPriceNum = Number(form.oldPrice);
    const leadDays = Number(form.leadTimeDays);
    const imageKeys =
      form.imageKey !== "none" && IMG[form.imageKey] ? [form.imageKey] : [];

    const stockQty = Math.max(0, Number(form.stockQty) || 0);
    const tags = [...new Set(form.tags.map((t) => t.trim()).filter(Boolean))];

    if (product) {
      updateProduct(product.id, {
        name,
        brand: form.brand.trim() || "Générique",
        category: form.category,
        price: Math.round(price),
        oldPrice:
          Number.isFinite(oldPriceNum) && oldPriceNum > price
            ? Math.round(oldPriceNum)
            : undefined,
        availability: form.availability,
        leadTimeDays:
          form.availability === "on_order" && Number.isFinite(leadDays)
            ? Math.max(1, Math.round(leadDays))
            : undefined,
        shortDescription: form.shortDescription.trim() || name,
        description:
          form.description.trim() || form.shortDescription.trim() || name,
        features,
        practical,
        featured: form.featured,
        warrantyMonths: hasWarranty ? Math.round(warranty) : undefined,
        imageKeys,
        tags: tags.length ? tags : undefined,
        source: form.source.trim() || "Ajouté via l'admin",
      });
      setStock(product.id, stockQty);
      toast({ title: "Produit modifié", description: name });
    } else {
      const id = `p-admin-${Date.now().toString(36)}`;
      const newProduct: Product = {
        id,
        slug: `${slugify(name) || "produit"}-${id.slice(-4)}`,
        name,
        brand: form.brand.trim() || "Générique",
        category: form.category,
        price: Math.round(price),
        oldPrice:
          Number.isFinite(oldPriceNum) && oldPriceNum > price
            ? Math.round(oldPriceNum)
            : undefined,
        availability: form.availability,
        leadTimeDays:
          form.availability === "on_order" && Number.isFinite(leadDays)
            ? Math.max(1, Math.round(leadDays))
            : undefined,
        imageKeys,
        shortDescription: form.shortDescription.trim() || name,
        description:
          form.description.trim() || form.shortDescription.trim() || name,
        features,
        practical,
        featured: form.featured,
        warrantyMonths: hasWarranty ? Math.round(warranty) : undefined,
        tags: tags.length ? tags : undefined,
        source: form.source.trim() || "Ajouté via l'admin",
      };
      addProduct(newProduct, stockQty);
      toast({ title: "Produit ajouté", description: name });
    }
    onClose();
  };

  const inputCls =
    "h-10 rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-[#f5f2e9]";
  const selectCls = "rounded-md border-[#2a2a2a] bg-[#161616] text-[#f5f2e9]";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-md border-[#2a2a2a] bg-[#161616] text-[#f5f2e9] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-[#f5f2e9]">
            {product ? "Modifier le produit" : "Nouveau produit"}
          </DialogTitle>
          <DialogDescription className="text-[#a3a3a3]">
            Les champs marqués * sont obligatoires. Le produit apparaît
            immédiatement sur le site.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-3.5">
          <div className="grid gap-2">
            <Label htmlFor="pf-name" className="text-[#f5f2e9]">
              Nom du produit *
            </Label>
            <Input
              id="pf-name"
              value={form.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="Ex. : Blender Moulinex 2 L"
              className={inputCls}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="pf-brand" className="text-[#f5f2e9]">
                Marque
              </Label>
              <Input
                id="pf-brand"
                value={form.brand}
                onChange={(e) => set({ brand: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pf-cat" className="text-[#f5f2e9]">
                Catégorie *
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => set({ category: v as CategoryId })}
              >
                <SelectTrigger id="pf-cat" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectCls}>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="pf-price" className="text-[#f5f2e9]">
                Prix (FCFA) *
              </Label>
              <Input
                id="pf-price"
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set({ price: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pf-old" className="text-[#f5f2e9]">
                Prix barré (promo)
              </Label>
              <Input
                id="pf-old"
                type="number"
                min={0}
                value={form.oldPrice}
                onChange={(e) => set({ oldPrice: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pf-stock" className="text-[#f5f2e9]">
                Stock
              </Label>
              <Input
                id="pf-stock"
                type="number"
                min={0}
                value={form.stockQty}
                onChange={(e) => set({ stockQty: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          {Number(form.oldPrice) > Number(form.price) &&
            Number(form.price) > 0 && (
              <p className="text-xs font-bold text-[#d4af37]">
                Promo : −
                {Math.round(
                  ((Number(form.oldPrice) - Number(form.price)) /
                    Number(form.oldPrice)) *
                    100
                )}{' '}
                % — le prix barré s&apos;affiche sur le site.
              </p>
            )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="pf-avail" className="text-[#f5f2e9]">
                Disponibilité
              </Label>
              <Select
                value={form.availability}
                onValueChange={(v) =>
                  set({ availability: v as ProductForm["availability"] })
                }
              >
                <SelectTrigger id="pf-avail" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectCls}>
                  <SelectItem value="in_stock">En stock</SelectItem>
                  <SelectItem value="on_order">Sur commande</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.availability === "on_order" && (
              <div className="grid gap-2">
                <Label htmlFor="pf-lead" className="text-[#f5f2e9]">
                  Délai (jours)
                </Label>
                <Input
                  id="pf-lead"
                  type="number"
                  min={1}
                  value={form.leadTimeDays}
                  onChange={(e) => set({ leadTimeDays: e.target.value })}
                  className={inputCls}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="pf-warranty" className="text-[#f5f2e9]">
                Garantie (mois)
              </Label>
              <Input
                id="pf-warranty"
                type="number"
                min={0}
                value={form.warrantyMonths}
                onChange={(e) => set({ warrantyMonths: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pf-short" className="text-[#f5f2e9]">
              Description courte *
            </Label>
            <Input
              id="pf-short"
              value={form.shortDescription}
              onChange={(e) => set({ shortDescription: e.target.value })}
              placeholder="Une ligne qui donne envie"
              className={inputCls}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pf-desc" className="text-[#f5f2e9]">
              Description complète
            </Label>
            <Textarea
              id="pf-desc"
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              className="rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-[#f5f2e9]"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="pf-features" className="text-[#f5f2e9]">
                Points forts (1 par ligne)
              </Label>
              <Textarea
                id="pf-features"
                value={form.featuresText}
                onChange={(e) => set({ featuresText: e.target.value })}
                rows={4}
                className="rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-[#f5f2e9]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pf-practical" className="text-[#f5f2e9]">
                Infos pratiques (1 par ligne)
              </Label>
              <Textarea
                id="pf-practical"
                value={form.practicalText}
                onChange={(e) => set({ practicalText: e.target.value })}
                rows={4}
                className="rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-[#f5f2e9]"
              />
            </div>
          </div>

          {/* Tags / étiquettes */}
          <div className="grid gap-2">
            <Label htmlFor="pf-tags" className="text-[#f5f2e9]">
              Tags / étiquettes
            </Label>
            <Input
              id="pf-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const v = tagInput.trim();
                  if (v && !form.tags.includes(v))
                    set({ tags: [...form.tags, v] });
                  setTagInput("");
                }
              }}
              onBlur={() => {
                const v = tagInput.trim();
                if (v && !form.tags.includes(v))
                  set({ tags: [...form.tags, v] });
                setTagInput("");
              }}
              placeholder="Ex. : Best-seller — Entrée pour valider"
              className={inputCls}
            />
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    aria-label={`Retirer le tag ${t}`}
                    className="inline-flex items-center gap-1 rounded-md border border-[#d4af37]/40 bg-[#d4af37]/10 px-2 py-1 text-xs font-bold text-[#d4af37] hover:bg-[#d4af37]/20"
                    onClick={() =>
                      set({ tags: form.tags.filter((x) => x !== t) })
                    }
                  >
                    {t}
                    <span aria-hidden="true">×</span>
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {tagSuggestions
                .filter((t) => !form.tags.includes(t))
                .slice(0, 8)
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-2 py-1 text-xs font-bold text-[#c9c9c9] hover:border-[#d4af37]/50 hover:text-[#d4af37]"
                    onClick={() => set({ tags: [...form.tags, t] })}
                  >
                    + {t}
                  </button>
                ))}
            </div>
            <p className="text-xs text-[#a3a3a3]">
              Les tags s&apos;affichent sur le site et servent de filtres dans
              le catalogue.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="pf-img" className="text-[#f5f2e9]">
                Illustration
              </Label>
              <Select
                value={form.imageKey}
                onValueChange={(v) => set({ imageKey: v })}
              >
                <SelectTrigger id="pf-img" className={inputCls}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={selectCls}>
                  <SelectItem value="none">Aucune (placeholder)</SelectItem>
                  {IMAGE_KEYS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k.replace("p_", "").replaceAll("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid content-end gap-2">
              <Label
                htmlFor="pf-featured"
                className="flex items-center justify-between text-[#f5f2e9]"
              >
                Mettre en vedette (accueil)
                <Switch
                  id="pf-featured"
                  checked={form.featured}
                  onCheckedChange={(v) => set({ featured: v })}
                />
              </Label>
            </div>
          </div>

          <div className="mt-1 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-md border-[#2a2a2a] bg-transparent font-bold text-[#f5f2e9] hover:bg-[#1e1e1e]"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="rounded-md bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
            >
              {product ? "Enregistrer" : "Ajouter le produit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ————— Onglet : réglages ————— */

function SettingsTab() {
  const banner = useShop((s) => s.banner);
  const setBanner = useShop((s) => s.setBanner);
  const adminOrders = useShop((s) => s.adminOrders);
  const resetDemoData = useShop((s) => s.resetDemoData);
  const adminLogout = useShop((s) => s.adminLogout);

  const [text, setText] = useState(banner.text);
  const [enabled, setEnabled] = useState(banner.enabled);

  const exportCsv = () => {
    const header = [
      "Numéro",
      "Date",
      "Client",
      "Téléphone",
      "Email",
      "Ville",
      "Articles",
      "Sous-total (FCFA)",
      "Réduction (FCFA)",
      "Livraison (FCFA)",
      "Total (FCFA)",
      "Paiement",
      "Statut",
    ];
    const rows = adminOrders.map((o) => [
      o.id,
      fmtDateTime(o.createdAt),
      o.name,
      o.phone,
      o.email ?? "",
      o.city,
      o.lines.map((l) => `${l.qty}x ${l.name}`).join(" | "),
      String(o.subtotal),
      String(o.discount),
      String(o.shipping),
      String(o.total),
      o.paymentLabel,
      ORDER_STATUS_LABELS[statusOf(o)],
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(";"))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "commandes-maison-cauris.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: "Export réussi",
      description: `${adminOrders.length} commande(s) exportée(s).`,
    });
  };

  const card = "rounded-md border border-[#2a2a2a] bg-[#161616] p-5 sm:p-6";

  return (
    <div className="grid max-w-3xl gap-5">
      <div>
        <h1 className="text-xl font-extrabold sm:text-2xl">Réglages</h1>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Pilotez le site public et vos données.
        </p>
      </div>

      {/* Bandeau d'annonce */}
      <section className={card} aria-label="Bandeau d'annonce">
        <h2 className="flex items-center gap-2 font-extrabold">
          <Megaphone
            className="h-4.5 w-4.5 text-[#d4af37]"
            aria-hidden="true"
          />
          Bandeau d&apos;annonce du site
        </h2>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Affiche un message en haut de la boutique (promotions, fermeture,
          livraison offerte…).
        </p>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between gap-4">
            <Label
              htmlFor="banner-enabled"
              className="text-sm font-bold text-[#f5f2e9]"
            >
              Afficher le bandeau
            </Label>
            <Switch
              id="banner-enabled"
              checked={enabled}
              onCheckedChange={(v) => {
                setEnabled(v);
                setBanner(v, text);
                toast({ title: v ? "Bandeau activé" : "Bandeau désactivé" });
              }}
            />
          </div>
          <Input
            id="banner-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ex. : Livraison offerte à Cotonou jusqu'au 30 du mois !"
            className="h-11 rounded-md border-[#2a2a2a] bg-[#0b0b0b] text-[#f5f2e9]"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 flex-1 truncate rounded-md border border-[#2a2a2a] bg-[#0b0b0b] px-3 py-2 text-xs text-[#a3a3a3]">
              Aperçu :{" "}
              <span className="font-bold text-[#d4af37]">
                {text.trim() || "(vide)"}
              </span>
            </p>
            <Button
              size="sm"
              className="rounded-md bg-[#d4af37] font-extrabold text-[#0b0b0b] hover:bg-[#bfa032]"
              onClick={() => {
                setBanner(enabled, text);
                toast({ title: "Bandeau enregistré" });
              }}
            >
              Enregistrer
            </Button>
          </div>
        </div>
      </section>

      {/* Export CSV */}
      <section className={card} aria-label="Export des commandes">
        <h2 className="flex items-center gap-2 font-extrabold">
          <Download
            className="h-4.5 w-4.5 text-[#d4af37]"
            aria-hidden="true"
          />
          Export des commandes
        </h2>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Téléchargez toutes les commandes au format CSV (ouvrable dans Excel).
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-md border-[#d4af37]/50 bg-transparent font-bold text-[#d4af37] hover:bg-[#d4af37]/10"
          onClick={exportCsv}
          disabled={adminOrders.length === 0}
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Exporter ({adminOrders.length})
        </Button>
      </section>

      {/* Session */}
      <section className={card} aria-label="Session administrateur">
        <h2 className="flex items-center gap-2 font-extrabold">
          <LogOut className="h-4.5 w-4.5 text-[#d4af37]" aria-hidden="true" />
          Session
        </h2>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Fermez la session admin sur cet appareil.
        </p>
        <Button
          variant="outline"
          className="mt-4 rounded-md border-[#2a2a2a] bg-transparent font-bold text-[#f5f2e9] hover:bg-[#1e1e1e]"
          onClick={() => {
            adminLogout();
            toast({ title: "Session fermée" });
          }}
        >
          Se déconnecter
        </Button>
      </section>

      {/* Réinitialisation */}
      <section
        className="rounded-md border border-[#f87171]/30 bg-[#161616] p-5 sm:p-6"
        aria-label="Réinitialisation des données"
      >
        <h2 className="flex items-center gap-2 font-extrabold text-[#fca5a5]">
          <RotateCcw className="h-4.5 w-4.5" aria-hidden="true" />
          Réinitialiser les données
        </h2>
        <p className="mt-1 text-sm text-[#a3a3a3]">
          Remet le catalogue, les stocks, les comptes et les commandes à
          l&apos;état de démonstration. À utiliser avec précaution.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="mt-4 rounded-md border-[#f87171]/50 bg-transparent font-bold text-[#fca5a5] hover:bg-[#f87171]/10"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Réinitialiser
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-md border-[#2a2a2a] bg-[#161616]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#f5f2e9]">
                Tout réinitialiser ?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#a3a3a3]">
                Catalogue, stocks, comptes clients, commandes et fidélité
                reviennent aux données de démo. Cette action est immédiate.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-md border-[#2a2a2a] bg-transparent text-[#f5f2e9] hover:bg-[#1e1e1e]">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                className="rounded-md bg-[#f87171] font-bold text-[#0b0b0b] hover:bg-[#ef4444]"
                onClick={() => {
                  resetDemoData();
                  toast({
                    title: "Données réinitialisées",
                    description: "La démo repart de zéro.",
                  });
                }}
              >
                Réinitialiser
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}
