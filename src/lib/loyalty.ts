/**
 * Programme de fidélité Maison Cauris.
 *
 * Règle simple définie par la boutique :
 *  - chaque tranche de 10 000 FCFA payés rapporte 5 points ;
 *  - 100 points s'échangent contre −5 % sur une commande ;
 *  - 80 points s'échangent contre −7 000 FCFA sur une commande.
 */

import { formatFCFA } from "./format";

export const POINTS_UNIT = 10_000; // FCFA payés par tranche
export const POINTS_PER_UNIT = 5; // points gagnés par tranche

export interface Reward {
  id: string;
  /** Coût en points. */
  cost: number;
  label: string;
  short: string;
  kind: "percent" | "amount";
  /** 5 pour −5 %, 7000 pour −7 000 FCFA. */
  value: number;
}

export const REWARDS: Reward[] = [
  {
    id: "f7000",
    cost: 80,
    label: "7 000 FCFA de réduction",
    short: "−7 000 F",
    kind: "amount",
    value: 7000,
  },
  {
    id: "pct5",
    cost: 100,
    label: "5 % de réduction",
    short: "−5 %",
    kind: "percent",
    value: 5,
  },
];

/** Points gagnés pour un montant payé (tranches de 10 000 F × 5 pts). */
export function pointsForAmount(total: number): number {
  return Math.floor(total / POINTS_UNIT) * POINTS_PER_UNIT;
}

/** Montant déduit de la récompense sur un sous-total donné. */
export function rewardDiscount(reward: Reward, subtotal: number): number {
  if (reward.kind === "amount") return Math.min(reward.value, subtotal);
  return Math.round((subtotal * reward.value) / 100);
}

export function rewardLabel(reward: Reward): string {
  return reward.kind === "amount"
    ? `−${formatFCFA(reward.value)}`
    : `−${reward.value} %`;
}

export interface Tier {
  name: string;
  min: number;
}

/** Paliers honorifiques (cosmétiques) selon les points cumulés à vie. */
export const TIERS: Tier[] = [
  { name: "Bronze", min: 0 },
  { name: "Argent", min: 100 },
  { name: "Or", min: 250 },
];

export function tierFor(lifetimePoints: number): Tier {
  let current = TIERS[0];
  for (const t of TIERS) if (lifetimePoints >= t.min) current = t;
  return current;
}

/** Prochain palier, ou null si le client est au rang Or. */
export function nextTier(lifetimePoints: number): Tier | null {
  return TIERS.find((t) => t.min > lifetimePoints) ?? null;
}

/** Récompense la moins chère atteignable — pour l'encouragement « encore X pts ». */
export function cheapestReward(): Reward {
  return REWARDS.reduce((a, b) => (a.cost <= b.cost ? a : b));
}
