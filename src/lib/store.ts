"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { getProduct } from "@/lib/products";

export type View = "home" | "catalog" | "product" | "cart" | "checkout" | "success";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface Customer {
  name: string;
  phone: string;
  email?: string;
}

export interface OrderInfo {
  id: string;
  total: number;
  paymentLabel: string;
  deliveryZone: string;
  createdAt: string;
  name: string;
  phone: string;
  city: string;
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

interface ShopState {
  view: View;
  productId: string | null;
  catalogCategory: string; // "all" | CategoryId
  searchQuery: string;
  cart: CartLine[];
  customer: Customer | null;
  lastOrder: OrderInfo | null;
  /** Dialogue « Espace client » ouvert (partagé header + dock mobile). */
  accountOpen: boolean;

  goHome: () => void;
  openCatalog: (category?: string) => void;
  openProduct: (id: string) => void;
  openCart: () => void;
  openCheckout: () => void;
  setSearch: (q: string) => void;

  addToCart: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  setCustomer: (c: Customer) => void;
  setAccountOpen: (open: boolean) => void;
  placeOrder: (order: OrderInfo) => void;
  resetToHome: () => void;
}

export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      view: "home",
      productId: null,
      catalogCategory: "all",
      searchQuery: "",
      cart: [],
      customer: null,
      lastOrder: null,
      accountOpen: false,

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

      setCustomer: (c) => set({ customer: c }),

      setAccountOpen: (open) => set({ accountOpen: open }),

      placeOrder: (order) =>
        set({ lastOrder: order, view: "success", cart: [] }),

      resetToHome: () =>
        set({ view: "home", productId: null, lastOrder: null }),
    }),
    {
      name: "maison-cauris-shop",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        cart: s.cart,
        customer: s.customer,
        lastOrder: s.lastOrder,
      }),
    }
  )
);

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
