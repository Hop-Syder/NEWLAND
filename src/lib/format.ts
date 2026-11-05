/** Formatage des prix en francs CFA (usage courant au Bénin : espaces pour milliers). */
export function formatFCFA(amount: number): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted.replaceAll("\u202f", " ")} FCFA`;
}

/** Date longue en français : « 5 novembre 2026 ». */
export function formatDateLong(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Génère un numéro de commande lisible, ex. MC-48213. */
export function makeOrderId(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `MC-${n}`;
}
