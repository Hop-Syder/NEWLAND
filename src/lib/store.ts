"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct } from "@/lib/products";
import {
  pointsForAmount,
  rewardDiscount,
  type Reward,
} from "@/lib/loyalty";

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
}

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
            const p = getProduct(l.productId);
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
          };

          return {
            orders: [order, ...s.orders],
            lastOrder: order,
            customer,
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
      }),
    }
  )
);

/** Numéro de commande lisible — ex. MC-48213. */
function makeOrderId(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `MC-${n}`;
}

/** Total du panier en FCFA (hors frais de livraison). */
export function cartSubtotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => {
    const p = getProduct(line.productId);
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
