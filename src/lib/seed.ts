/**
 * Données de démonstration pour le tableau de bord administrateur.
 *
 * L'admin doit pouvoir « suivre le site » dès la première ouverture :
 * ces clients et commandes fictifs (mais cohérents avec le catalogue réel)
 * alimentent les statistiques, la liste des comptes et le suivi des
 * commandes. Ils sont persistés dans le store puis modifiables.
 */

import { getProduct } from "./products";
import { pointsForAmount, REWARDS } from "./loyalty";
import type { ClientAccount, Order, OrderStatus, PaymentMethod } from "./store";

/* ————— Stocks initiaux du catalogue ————— */

export const SEED_STOCK: Record<string, number> = {
  "p-hisense-mo20": 12,
  "p-syinix-mo20g": 7,
  "p-tcl-frigo249": 3,
  "p-tcl-laveuse8": 5,
  "p-focus-plaque405": 2,
  "p-focus-hotte620": 4,
  "p-moulinex-8en1": 18,
  "p-binatone-350": 22,
  "p-ventbrum-16": 9,
  "p-ventpince": 30,
  "p-batterie-23": 14,
  "p-batterie-13": 26,
  "p-casseroles-set": 11,
  "p-kit-cuisine": 35,
  "p-seaux-bols": 28,
  "p-bureau-eden": 3,
  "p-fauteuil-flexon": 2,
  "p-chaise-bureau": 8,
  "p-canape-7places": 4,
};

/* ————— Clients de démonstration ————— */

interface SeedClient {
  name: string;
  phone: string;
  email: string;
  city: string;
  pinSet: boolean;
  createdDaysAgo: number;
}

const SEED_CLIENTS_BASE: SeedClient[] = [
  {
    name: "Adjoa Kponou",
    phone: "+229 01 97 45 12 88",
    email: "adjoa.kponou@gmail.com",
    city: "Cotonou",
    pinSet: true,
    createdDaysAgo: 46,
  },
  {
    name: "Rachidou Bio",
    phone: "+229 01 96 22 70 31",
    email: "rachidou.bio@yahoo.fr",
    city: "Parakou",
    pinSet: true,
    createdDaysAgo: 38,
  },
  {
    name: "Sètondji Ahouansou",
    phone: "+229 01 66 38 90 47",
    email: "setondji.a@gmail.com",
    city: "Abomey-Calavi",
    pinSet: true,
    createdDaysAgo: 30,
  },
  {
    name: "Marcelline Dossou",
    phone: "+229 01 95 11 64 02",
    email: "marcelline.dossou@outlook.com",
    city: "Porto-Novo",
    pinSet: false,
    createdDaysAgo: 22,
  },
  {
    name: "Ibrahim Tchaïdou",
    phone: "+229 01 97 88 23 15",
    email: "i.tchaidou@gmail.com",
    city: "Cotonou",
    pinSet: true,
    createdDaysAgo: 18,
  },
  {
    name: "Grâce Adjovi",
    phone: "+229 01 61 55 07 92",
    email: "grace.adjovi@gmail.com",
    city: "Abomey-Calavi",
    pinSet: true,
    createdDaysAgo: 12,
  },
  {
    name: "Pascal Houénou",
    phone: "+229 01 96 74 39 20",
    email: "p.houenou@orange.fr",
    city: "Bohicon",
    pinSet: false,
    createdDaysAgo: 7,
  },
  {
    name: "Fatoulatou Lawani",
    phone: "+229 01 90 46 81 53",
    email: "fatou.lawani@gmail.com",
    city: "Cotonou",
    pinSet: true,
    createdDaysAgo: 4,
  },
];

/* ————— Commandes de démonstration ————— */

const ZONE_FEES: Record<string, number> = {
  cotonou: 2000,
  calavi: 2500,
  autres: 5000,
};

interface SeedOrderSpec {
  clientIdx: number;
  daysAgo: number;
  hour: number;
  /** Produits du catalogue avec quantité. */
  lines: { id: string; qty: number }[];
  zone: keyof typeof ZONE_FEES;
  city: string;
  district: string;
  payment: PaymentMethod;
  paymentLabel: string;
  status: OrderStatus;
  /** Récompense fidélité consommée (index dans REWARDS). */
  rewardIdx?: number;
}

const SEED_ORDER_SPECS: SeedOrderSpec[] = [
  {
    clientIdx: 0,
    daysAgo: 21,
    hour: 10,
    lines: [{ id: "p-batterie-23", qty: 1 }, { id: "p-kit-cuisine", qty: 2 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Cadjèhon",
    payment: "mtn_momo",
    paymentLabel: "MTN MoMo",
    status: "livree",
  },
  {
    clientIdx: 0,
    daysAgo: 25,
    hour: 11,
    lines: [{ id: "p-syinix-mo20g", qty: 1 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Haie Vive",
    payment: "mtn_momo",
    paymentLabel: "MTN MoMo",
    status: "livree",
  },
  {
    clientIdx: 1,
    daysAgo: 19,
    hour: 15,
    lines: [{ id: "p-ventbrum-16", qty: 1 }],
    zone: "autres",
    city: "Parakou",
    district: "Banikani",
    payment: "cash_on_delivery",
    paymentLabel: "Paiement à la livraison (espèces)",
    status: "livree",
  },
  {
    clientIdx: 2,
    daysAgo: 17,
    hour: 9,
    lines: [{ id: "p-moulinex-8en1", qty: 2 }],
    zone: "calavi",
    city: "Abomey-Calavi",
    district: "Zogbadjè",
    payment: "moov_money",
    paymentLabel: "Moov Money",
    status: "livree",
  },
  {
    clientIdx: 0,
    daysAgo: 14,
    hour: 11,
    lines: [{ id: "p-hisense-mo20", qty: 1 }, { id: "p-seaux-bols", qty: 1 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Fidjrossè",
    payment: "mtn_momo",
    paymentLabel: "MTN MoMo",
    status: "livree",
    rewardIdx: 0,
  },
  {
    clientIdx: 3,
    daysAgo: 12,
    hour: 16,
    lines: [{ id: "p-batterie-13", qty: 3 }],
    zone: "autres",
    city: "Porto-Novo",
    district: "Djègan-Kpehouiè",
    payment: "celtiis_cash",
    paymentLabel: "Celtiis Cash",
    status: "annulee",
  },
  {
    clientIdx: 4,
    daysAgo: 10,
    hour: 14,
    lines: [{ id: "p-tcl-frigo249", qty: 1 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Akpakpa",
    payment: "card",
    paymentLabel: "Carte bancaire (Visa / Mastercard)",
    status: "livree",
  },
  {
    clientIdx: 5,
    daysAgo: 8,
    hour: 12,
    lines: [
      { id: "p-casseroles-set", qty: 1 },
      { id: "p-binatone-350", qty: 1 },
    ],
    zone: "calavi",
    city: "Abomey-Calavi",
    district: "Togba",
    payment: "mtn_momo",
    paymentLabel: "MTN MoMo",
    status: "confirmee",
  },
  {
    clientIdx: 1,
    daysAgo: 6,
    hour: 17,
    lines: [{ id: "p-ventpince", qty: 4 }],
    zone: "autres",
    city: "Parakou",
    district: "Albarika",
    payment: "cash_on_delivery",
    paymentLabel: "Paiement à la livraison (espèces)",
    status: "livree",
  },
  {
    clientIdx: 6,
    daysAgo: 5,
    hour: 10,
    lines: [{ id: "p-chaise-bureau", qty: 1 }, { id: "p-kit-cuisine", qty: 1 }],
    zone: "autres",
    city: "Bohicon",
    district: "Sodohomè",
    payment: "moov_money",
    paymentLabel: "Moov Money",
    status: "en_attente",
  },
  {
    clientIdx: 7,
    daysAgo: 3,
    hour: 18,
    lines: [{ id: "p-syinix-mo20g", qty: 1 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Gbédjromèdé",
    payment: "mtn_momo",
    paymentLabel: "MTN MoMo",
    status: "confirmee",
  },
  {
    clientIdx: 2,
    daysAgo: 2,
    hour: 9,
    lines: [{ id: "p-seaux-bols", qty: 2 }, { id: "p-batterie-13", qty: 1 }],
    zone: "calavi",
    city: "Abomey-Calavi",
    district: "Zogbadjè",
    payment: "cash_on_delivery",
    paymentLabel: "Paiement à la livraison (espèces)",
    status: "en_attente",
  },
  {
    clientIdx: 4,
    daysAgo: 1,
    hour: 13,
    lines: [{ id: "p-bureau-eden", qty: 1 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Akpakpa",
    payment: "card",
    paymentLabel: "Carte bancaire (Visa / Mastercard)",
    status: "confirmee",
  },
  {
    clientIdx: 7,
    daysAgo: 0,
    hour: 8,
    lines: [{ id: "p-moulinex-8en1", qty: 1 }, { id: "p-kit-cuisine", qty: 1 }],
    zone: "cotonou",
    city: "Cotonou",
    district: "Gbédjromèdé",
    payment: "mtn_momo",
    paymentLabel: "MTN MoMo",
    status: "en_attente",
  },
];

const ETAS: Record<string, string> = {
  cotonou: "24–48 h",
  calavi: "24–72 h",
  autres: "2 à 5 jours",
};

function isoDaysAgo(days: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 12 + (days % 3) * 17, 0, 0);
  return d.toISOString();
}

function makeSeedOrderId(i: number): string {
  const bases = [48213, 48367, 48402, 48477, 48510, 48589, 48634, 48690, 48745, 48801, 48856, 48902, 48947];
  return `NL-${bases[i % bases.length]}`;
}

/** Construit les commandes de démo complètes (montants calculés, pas copiés). */
function buildSeedOrders(): Order[] {
  return SEED_ORDER_SPECS.map((spec, i) => {
    const lines = spec.lines.flatMap((l) => {
      const p = getProduct(l.id);
      return p
        ? [
            {
              productId: p.id,
              name: p.name,
              price: p.price,
              qty: l.qty,
            },
          ]
        : [];
    });
    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const reward =
      spec.rewardIdx !== undefined ? REWARDS[spec.rewardIdx] : undefined;
    const discount = reward
      ? reward.kind === "amount"
        ? Math.min(reward.value, subtotal)
        : Math.round((subtotal * reward.value) / 100)
      : 0;
    const shipping = ZONE_FEES[spec.zone];
    const total = Math.max(0, subtotal - discount) + shipping;
    const client = SEED_CLIENTS_BASE[spec.clientIdx];

    const order: Order = {
      id: makeSeedOrderId(i),
      createdAt: isoDaysAgo(spec.daysAgo, spec.hour),
      lines,
      subtotal,
      discount,
      shipping,
      total,
      paymentId: spec.payment,
      paymentLabel: spec.paymentLabel,
      city: spec.city,
      district: spec.district,
      address: `${spec.district}, ${spec.city}`,
      zoneLabel:
        spec.zone === "cotonou"
          ? "Cotonou (centre et environs)"
          : spec.zone === "calavi"
            ? "Abomey-Calavi, Sèmè-Podji, Akpro-Missérété"
            : "Autres villes du Bénin",
      eta: ETAS[spec.zone],
      pointsEarned: pointsForAmount(total),
      rewardUsed: reward ? { label: reward.label, cost: reward.cost } : null,
      name: client.name,
      phone: client.phone,
      email: client.email,
      status: spec.status,
    };
    return order;
  });
}

/** Construit les comptes clients de démo agrégés depuis leurs commandes. */
function buildSeedClients(orders: Order[]): ClientAccount[] {
  return SEED_CLIENTS_BASE.map((c, idx) => {
    // Toutes les commandes comptent dans l'historique, mais les annulées
    // n'entrent ni dans la dépense ni dans les points.
    const allMine = orders.filter((o) => o.phone === c.phone);
    const valid = allMine.filter((o) => o.status !== "annulee");
    const pointsEarned = valid.reduce((sum, o) => sum + o.pointsEarned, 0);
    const pointsSpent = valid.reduce(
      (sum, o) => sum + (o.rewardUsed?.cost ?? 0),
      0
    );
    const last = allMine
      .map((o) => o.createdAt)
      .sort()
      .at(-1);

    return {
      id: `c-${idx + 1}`,
      name: c.name,
      phone: c.phone,
      email: c.email,
      city: c.city,
      pinSet: c.pinSet,
      points: pointsEarned - pointsSpent,
      lifetimePoints: pointsEarned,
      ordersCount: allMine.length,
      totalSpent: valid.reduce((sum, o) => sum + o.subtotal, 0),
      createdAt: isoDaysAgo(c.createdDaysAgo, 9),
      lastOrderAt: last ?? null,
    } satisfies ClientAccount;
  });
}

/** Données prêtes à injecter dans le store au premier chargement. */
export function buildSeedData(): {
  clients: ClientAccount[];
  adminOrders: Order[];
} {
  const adminOrders = buildSeedOrders();
  const clients = buildSeedClients(adminOrders);
  return { clients, adminOrders };
}
