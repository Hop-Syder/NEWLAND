"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PRODUCTS, type Product } from "@/lib/products";
import {
  pointsForAmount,
  rewardDiscount,
  type Reward,
} from "@/lib/loyalty";
import { SEED_STOCK, buildSeedData } from "@/lib/seed";

export type View =
  | "home"
  | "catalog"
  | "product"
  | "cart"
  | "checkout"
  | "success"
  | "account";

export type AccountTab = "overview" | "orders" | "loyalty" | "settings";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
  /** Préférences enregistrées dans l'espace client (Paramètres). */
  city?: string;
  district?: string;
  address?: string;
  defaultPayment?: PaymentMethod;
  /** Alertes commande par WhatsApp (par défaut : oui). */
  notifyWhatsApp?: boolean;
}

/** Ligne figée d'une commande passée (le prix au moment de l'achat). */
export interface OrderLine {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

/** Statut d'une commande, géré par l'administrateur. */
export type OrderStatus = "en_attente" | "confirmee" | "livree" | "annulee";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "En attente",
  confirmee: "Confirmée",
  livree: "Livrée",
  annulee: "Annulée",
};

export interface Order {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  subtotal: number;
  /** Réduction fidélité appliquée (0 si aucune). */
  discount: number;
  shipping: number;
  total: number;
  paymentId: PaymentMethod;
  paymentLabel: string;
  city: string;
  district: string;
  address: string;
  zoneLabel: string;
  eta: string;
  /** Points gagnés sur cette commande. */
  pointsEarned: number;
  /** Récompense fidélité consommée, le cas échéant. */
  rewardUsed: { label: string; cost: number } | null;
  name: string;
  phone: string;
  email?: string;
  /** Statut de suivi (géré par l'admin). Défaut : en attente. */
  status?: OrderStatus;
}

/** Compte client vu par l'administrateur (registre global). */
export interface ClientAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  city: string;
  /** Le client a-t-il déjà défini son code PIN de connexion ? */
  pinSet: boolean;
  /** Solde de points actuel. */
  points: number;
  /** Points cumulés à vie (paliers Bronze / Argent / Or). */
  lifetimePoints: number;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  lastOrderAt: string | null;
}

/** Données saisies au checkout, transmises à placeOrder. */
export interface PlaceOrderInput {
  name: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  address: string;
  paymentId: PaymentMethod;
  paymentLabel: string;
  zoneLabel: string;
  eta: string;
  shipping: number;
}

export type PaymentMethod =
  | "mtn_momo"
  | "moov_money"
  | "celtiis_cash"
  | "card"
  | "cash_on_delivery";

export const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  hint: string;
}[] = [
  {
    id: "mtn_momo",
    label: "MTN MoMo",
    hint: "Demande de paiement sur votre numéro MTN.",
  },
  {
    id: "moov_money",
    label: "Moov Money",
    hint: "Demande de paiement sur votre numéro Moov.",
  },
  {
    id: "celtiis_cash",
    label: "Celtiis Cash",
    hint: "Via votre compte Celtiis.",
  },
  {
    id: "card",
    label: "Carte bancaire (Visa / Mastercard)",
    hint: "Paiement sécurisé via CinetPay.",
  },
  {
    id: "cash_on_delivery",
    label: "Paiement à la livraison (espèces)",
    hint: "Espèces à la réception.",
  },
];

export interface DeliveryZone {
  id: string;
  label: string;
  fee: number;
  eta: string;
}

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "cotonou",
    label: "Cotonou (centre et environs)",
    fee: 2000,
    eta: "24–48 h",
  },
  {
    id: "calavi",
    label: "Abomey-Calavi, Sèmè-Podji, Akpro-Missérété",
    fee: 2500,
    eta: "24–72 h",
  },
  {
    id: "benin_autres",
    label: "Autres villes du Bénin (Parakou, Bohicon, Porto-Novo…)",
    fee: 5000,
    eta: "2 à 5 jours",
  },
];

export const FREE_SHIPPING_THRESHOLD = 100000;

/** Durée de la garantie boutique sur chaque commande. */
export const WARRANTY_DAYS = 90;

interface ShopState {
  view: View;
  productId: string | null;
  catalogCategory: string; // "all" | CategoryId
  searchQuery: string;
  cart: CartLine[];

  /** Compte client — créé automatiquement à la première commande. */
  customer: Customer | null;
  /** Historique complet des commandes du client. */
  orders: Order[];
  /** Dernière commande passée (écran de confirmation). */
  lastOrder: Order | null;

  /** Carte de fidélité. */
  loyaltyPoints: number;
  lifetimePoints: number;
  /** Récompense armée, appliquée à la prochaine commande. */
  activeReward: Reward | null;

  accountTab: AccountTab;

  /** — Espace administrateur (/admin) — */
  /** Catalogue éditable depuis l'admin (base : catalogue statique). */
  products: Product[];
  /** Stock par identifiant produit. */
  stock: Record<string, number>;
  /** Registre de tous les comptes clients (démo + réels). */
  clients: ClientAccount[];
  /** Toutes les commandes du site, vues par l'admin. */
  adminOrders: Order[];
  /** Session administrateur (démo : mot de passe dans AdminView). */
  adminLoggedIn: boolean;
  /** Bandeau d'annonce contrôlé depuis l'admin et affiché sur le site. */
  banner: { enabled: boolean; text: string };

  /** — Sécurité du compte — */
  /** Code PIN à 4 chiffres choisi par le client après sa première commande.
   *  null = pas encore défini. Démo : stocké sur l'appareil ; en production il
   *  serait haché côté serveur (bcrypt/argon2) et jamais expédié en clair. */
  pin: string | null;
  /** Date (ISO) de définition du code PIN. */
  pinSetAt: string | null;
  /** Email auquel la copie des identifiants a été envoyée (simulation). */
  credentialsSentTo: string | null;
  /** Compte déverrouillé sur cet appareil (déconnexion → verrouillé). */
  sessionActive: boolean;

  goHome: () => void;
  openCatalog: (category?: string) => void;
  openProduct: (id: string) => void;
  openCart: () => void;
  openCheckout: () => void;
  openAccount: (tab?: AccountTab) => void;
  setSearch: (q: string) => void;

  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  /** Crée ou met à jour le compte client (espace client → Paramètres). */
  saveCustomer: (c: Customer) => void;
  setAccountTab: (tab: AccountTab) => void;
  /** Arme / retire la récompense fidélité pour la prochaine commande. */
  setActiveReward: (reward: Reward | null) => void;
  /** Définit (ou change) le code PIN à 4 chiffres et envoie la copie des
   *  identifiants (numéro + PIN) par email — simulation. */
  setPin: (pin: string) => void;
  /** Renvoie la copie des identifiants par email. Retourne l'email utilisé,
   *  ou null si aucun email n'est enregistré. */
  resendCredentials: () => string | null;
  /** Déverrouille l'espace client sur cet appareil (après vérification). */
  unlock: () => void;
  /** Verrouille l'espace client (déconnexion). */
  logout: () => void;
  placeOrder: (input: PlaceOrderInput) => void;
  resetToHome: () => void;

  /* ————— Actions administrateur ————— */
  addProduct: (p: Product, stockQty: number) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  setStock: (id: string, qty: number) => void;
  /** Met un produit en promo : le prix actuel devient le prix barré et le
   *  prix baisse du pourcentage indiqué (ex. 15 → −15 %). */
  applyPromo: (id: string, percent: number) => void;
  /** Retire la promo : le prix barré redevient le prix de vente. */
  removePromo: (id: string) => void;
  /** Change le statut d'une commande (adminOrders + commandes du client). */
  setOrderStatus: (orderId: string, status: OrderStatus) => void;
  /** Supprime définitivement un compte client (registre admin). */
  deleteClient: (id: string) => void;
  /** Connexion admin. Retourne true si le mot de passe est correct. */
  adminLogin: (password: string) => boolean;
  adminLogout: () => void;
  setBanner: (enabled: boolean, text?: string) => void;
  /** Réinitialise toutes les données (démo) à leur état d'origine. */
  resetDemoData: () => void;
}

/** Mot de passe admin de démonstration (pas de backend en démo). */
export const ADMIN_PASSWORD = "cauris2026";

/** Données de démo injectées au premier chargement (persistées ensuite). */
const SEED = buildSeedData();

export const useShop = create<ShopState>()(
  persist(
    (set, get) => ({
      view: "home",
      productId: null,
      catalogCategory: "all",
      searchQuery: "",
      cart: [],
      customer: null,
      orders: [],
      lastOrder: null,
      loyaltyPoints: 0,
      lifetimePoints: 0,
      activeReward: null,
      accountTab: "overview",
      products: PRODUCTS,
      stock: SEED_STOCK,
      clients: SEED.clients,
      adminOrders: SEED.adminOrders,
      adminLoggedIn: false,
      banner: { enabled: false, text: "" },
      pin: null,
      pinSetAt: null,
      credentialsSentTo: null,
      sessionActive: false,

      goHome: () =>
        set({ view: "home", productId: null, searchQuery: "" }),

      openCatalog: (category) =>
        set((s) => ({
          view: "catalog",
          catalogCategory: category ?? s.catalogCategory ?? "all",
          productId: null,
        })),

      openProduct: (id) => set({ view: "product", productId: id }),

      openCart: () => set({ view: "cart" }),

      openCheckout: () => set({ view: "checkout" }),

      openAccount: (tab) =>
        set((s) => ({
          view: "account",
          accountTab: tab ?? s.accountTab ?? "overview",
        })),

      setSearch: (q) => set({ searchQuery: q }),

      addToCart: (productId, qty = 1) =>
        set((s) => {
          const existing = s.cart.find((l) => l.productId === productId);
          if (existing) {
            return {
              cart: s.cart.map((l) =>
                l.productId === productId ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { cart: [...s.cart, { productId, qty }] };
        }),

      setQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((l) => l.productId !== productId)
              : s.cart.map((l) =>
                  l.productId === productId ? { ...l, qty } : l
                ),
        })),

      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) })),

      clearCart: () => set({ cart: [] }),

      saveCustomer: (c) =>
        set((s) => ({
          customer: c,
          // Création manuelle du compte : session ouverte d'office.
          sessionActive: s.customer ? s.sessionActive : true,
          // Le registre admin reste synchronisé avec les coordonnées.
          clients: s.clients.map((cl) =>
            phoneMatches(cl.phone, c.phone)
              ? { ...cl, name: c.name, email: c.email ?? cl.email, city: c.city ?? cl.city }
              : cl
          ),
        })),

      setAccountTab: (tab) => set({ accountTab: tab }),

      setActiveReward: (reward) => set({ activeReward: reward }),

      setPin: (pin) =>
        set((s) => ({
          pin,
          pinSetAt: new Date().toISOString(),
          // Le compte est déverrouillé et la copie des identifiants
          // (numéro + code PIN) part par email — simulation d'envoi.
          sessionActive: true,
          credentialsSentTo: s.customer?.email ?? null,
          // Le registre admin apprend que ce client est sécurisé.
          clients: s.clients.map((cl) =>
            s.customer && phoneMatches(cl.phone, s.customer.phone)
              ? { ...cl, pinSet: true }
              : cl
          ),
        })),

      resendCredentials: () => {
        const email = get().customer?.email ?? null;
        if (email) set({ credentialsSentTo: email });
        return email;
      },

      unlock: () => set({ sessionActive: true }),

      logout: () => set({ sessionActive: false }),

      placeOrder: (input) =>
        set((s) => {
          // 1. Photo figée du panier au moment de la commande.
          const lines: OrderLine[] = s.cart.flatMap((l) => {
            const p = s.products.find((pr) => pr.id === l.productId);
            return p
              ? [{ productId: p.id, name: p.name, price: p.price, qty: l.qty }]
              : [];
          });
          const subtotal = lines.reduce(
            (sum, l) => sum + l.price * l.qty,
            0
          );

          // 2. Réduction fidélité éventuelle + total.
          const reward = s.activeReward;
          const discount = reward ? rewardDiscount(reward, subtotal) : 0;
          const total = Math.max(0, subtotal - discount) + input.shipping;

          // 3. Points gagnés sur le montant payé, récompense consommée.
          const pointsEarned = pointsForAmount(total);

          // 4. Le compte se crée automatiquement au premier achat,
          //    et les coordonnées restent toujours à jour.
          const customer: Customer = {
            name: input.name,
            phone: input.phone,
            email: input.email || s.customer?.email,
            city: input.city,
            district: input.district,
            address: input.address,
            defaultPayment: input.paymentId,
            notifyWhatsApp: s.customer?.notifyWhatsApp ?? true,
          };

          const order: Order = {
            id: makeOrderId(),
            createdAt: new Date().toISOString(),
            lines,
            subtotal,
            discount,
            shipping: input.shipping,
            total,
            paymentId: input.paymentId,
            paymentLabel: input.paymentLabel,
            city: input.city,
            district: input.district,
            address: input.address,
            zoneLabel: input.zoneLabel,
            eta: input.eta,
            pointsEarned,
            rewardUsed: reward
              ? { label: reward.label, cost: reward.cost }
              : null,
            name: input.name,
            phone: input.phone,
            email: input.email || customer.email,
            status: "en_attente",
          };

          // Le registre global (admin) enregistre la commande et le compte.
          const existingClient = s.clients.find((cl) =>
            phoneMatches(cl.phone, input.phone)
          );
          const clients = existingClient
            ? s.clients.map((cl) =>
                cl.id === existingClient.id
                  ? {
                      ...cl,
                      name: customer.name,
                      email: customer.email ?? cl.email,
                      city: customer.city ?? cl.city,
                      ordersCount: cl.ordersCount + 1,
                      totalSpent: cl.totalSpent + subtotal,
                      points: cl.points + pointsEarned - (reward?.cost ?? 0),
                      lifetimePoints: cl.lifetimePoints + pointsEarned,
                      lastOrderAt: order.createdAt,
                    }
                  : cl
              )
            : [
                {
                  id: `c-${Date.now()}`,
                  name: customer.name,
                  phone: customer.phone,
                  email: customer.email,
                  city: customer.city ?? input.city,
                  pinSet: s.pin !== null,
                  points: pointsEarned - (reward?.cost ?? 0),
                  lifetimePoints: pointsEarned,
                  ordersCount: 1,
                  totalSpent: subtotal,
                  createdAt: order.createdAt,
                  lastOrderAt: order.createdAt,
                },
                ...s.clients,
              ];

          return {
            orders: [order, ...s.orders],
            adminOrders: [order, ...s.adminOrders],
            lastOrder: order,
            customer,
            clients,
            loyaltyPoints:
              s.loyaltyPoints + pointsEarned - (reward?.cost ?? 0),
            lifetimePoints: s.lifetimePoints + pointsEarned,
            activeReward: null,
            cart: [],
            // Le système enregistre le client et ouvre sa session :
            // identifiants = numéro de téléphone + code PIN (à définir).
            sessionActive: true,
            view: "success",
          };
        }),

      resetToHome: () =>
        set({ view: "home", productId: null, lastOrder: null }),

      /* ————— Administrateur ————— */

      addProduct: (p, stockQty) =>
        set((s) => ({
          products: [p, ...s.products],
          stock: { ...s.stock, [p.id]: stockQty },
        })),

      updateProduct: (id, patch) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      deleteProduct: (id) =>
        set((s) => {
          const stock = { ...s.stock };
          delete stock[id];
          return {
            products: s.products.filter((p) => p.id !== id),
            stock,
            // Un produit supprimé ne doit plus rester dans le panier.
            cart: s.cart.filter((l) => l.productId !== id),
          };
        }),

      setStock: (id, qty) =>
        set((s) => ({ stock: { ...s.stock, [id]: Math.max(0, qty) } })),

      applyPromo: (id, percent) =>
        set((s) => ({
          products: s.products.map((p) => {
            if (p.id !== id) return p;
            const pct = Math.min(90, Math.max(1, Math.round(percent)));
            // Le prix actuel devient la référence barrée ; le prix baisse.
            const base = p.oldPrice && p.oldPrice > p.price ? p.oldPrice : p.price;
            const newPrice = Math.max(0, Math.round((base * (100 - pct)) / 100));
            if (newPrice >= base) return p;
            return { ...p, oldPrice: base, price: newPrice };
          }),
        })),

      removePromo: (id) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id === id && p.oldPrice && p.oldPrice > p.price
              ? { ...p, price: p.oldPrice, oldPrice: undefined }
              : p
          ),
        })),

      setOrderStatus: (orderId, status) =>
        set((s) => ({
          adminOrders: s.adminOrders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
          orders: s.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
          lastOrder:
            s.lastOrder?.id === orderId
              ? { ...s.lastOrder, status }
              : s.lastOrder,
        })),

      adminLogin: (password) => {
        const ok = password === ADMIN_PASSWORD;
        if (ok) set({ adminLoggedIn: true });
        return ok;
      },

      adminLogout: () => set({ adminLoggedIn: false }),

      deleteClient: (id) =>
        set((s) => {
          const target = s.clients.find((cl) => cl.id === id);
          const isDeviceCustomer =
            !!target && !!s.customer && phoneMatches(s.customer.phone, target.phone);
          return {
            clients: s.clients.filter((cl) => cl.id !== id),
            // Si l'admin supprime le compte du client connecté sur cet
            // appareil, on ferme proprement sa session locale aussi.
            ...(isDeviceCustomer
              ? {
                  customer: null,
                  orders: [],
                  lastOrder: null,
                  loyaltyPoints: 0,
                  lifetimePoints: 0,
                  activeReward: null,
                  pin: null,
                  pinSetAt: null,
                  credentialsSentTo: null,
                  sessionActive: false,
                }
              : {}),
          };
        }),

      setBanner: (enabled, text) =>
        set((s) => ({
          banner: {
            enabled,
            text: text !== undefined ? text : s.banner.text,
          },
        })),

      resetDemoData: () =>
        set(() => {
          const fresh = buildSeedData();
          return {
            cart: [],
            customer: null,
            orders: [],
            lastOrder: null,
            loyaltyPoints: 0,
            lifetimePoints: 0,
            activeReward: null,
            pin: null,
            pinSetAt: null,
            credentialsSentTo: null,
            sessionActive: false,
            products: PRODUCTS,
            stock: SEED_STOCK,
            clients: fresh.clients,
            adminOrders: fresh.adminOrders,
            banner: { enabled: false, text: "" },
          };
        }),
    }),
    {
      name: "maison-cauris-shop",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        cart: s.cart,
        customer: s.customer,
        orders: s.orders,
        lastOrder: s.lastOrder,
        loyaltyPoints: s.loyaltyPoints,
        lifetimePoints: s.lifetimePoints,
        activeReward: s.activeReward,
        pin: s.pin,
        pinSetAt: s.pinSetAt,
        credentialsSentTo: s.credentialsSentTo,
        sessionActive: s.sessionActive,
        products: s.products,
        stock: s.stock,
        clients: s.clients,
        adminOrders: s.adminOrders,
        adminLoggedIn: s.adminLoggedIn,
        banner: s.banner,
      }),
    }
  )
);

/** Numéro de commande lisible — ex. NL-48213 (NEWLAND). */
function makeOrderId(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `NL-${n}`;
}

/** Total du panier en FCFA (hors frais de livraison) — utilise le catalogue
 *  courant du store (produits ajoutés par l'admin inclus). */
export function cartSubtotal(cart: CartLine[]): number {
  const products = useShop.getState().products;
  return cart.reduce((sum, line) => {
    const p = products.find((pr) => pr.id === line.productId);
    return sum + (p ? p.price * line.qty : 0);
  }, 0);
}

/** Nombre d'articles dans le panier. */
export function cartCount(cart: CartLine[]): number {
  return cart.reduce((sum, l) => sum + l.qty, 0);
}

export interface OrderStageInfo {
  stage: 1 | 2 | 3;
  label: string;
  hint: string;
}

/** Étape de suivi déduite de l'ancienneté de la commande (simulation). */
export function orderStage(order: Order, now = Date.now()): OrderStageInfo {
  const ageH = (now - new Date(order.createdAt).getTime()) / 3_600_000;
  if (ageH < 24)
    return {
      stage: 1,
      label: "En préparation",
      hint: "Vérification et emballage de vos articles.",
    };
  if (ageH < 72)
    return {
      stage: 2,
      label: "En livraison",
      hint: `En route (${order.eta}).`,
    };
  return {
    stage: 3,
    label: "Livrée",
    hint: "Colis réceptionné — merci !",
  };
}

/** Fin de la garantie boutique (90 jours après la commande). */
export function warrantyEnd(order: Order): Date {
  return new Date(
    new Date(order.createdAt).getTime() + WARRANTY_DAYS * 86_400_000
  );
}

export function warrantyActive(order: Order, now = Date.now()): boolean {
  return warrantyEnd(order).getTime() > now;
}

/** Montant déjà dépensé au total (hors réductions fidélité). */
export function lifetimeSpent(orders: Order[]): number {
  return orders.reduce((sum, o) => sum + o.subtotal, 0);
}

/* ————— Sécurité : validation des identifiants ————— */

/** Compare deux numéros en ignorant espaces, tirets et indicatif 229. */
export function phoneMatches(a: string, b: string): boolean {
  const da = a.replace(/\D/g, "").replace(/^229/, "");
  const db = b.replace(/\D/g, "").replace(/^229/, "");
  return da.length > 0 && da === db;
}

/** Code PIN valide : exactement 4 chiffres. */
export function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

/** Email plausible (validation simple côté interface). */
export function isValidEmail(email: string): boolean {
  return /^\S+@\S+\.\S+$/.test(email);
}
