/**
 * Correspondance entre clés d'illustrations et URLs réelles (recherche d'images).
 * Ce fichier est régénéré par scripts/build_images.py à partir des résultats
 * de recherche d'images ; les clés restent stables.
 */

export const IMG: Record<string, string[]> = {
  hero: [],
  cat_appareils: [],
  cat_cuisine: [],
  cat_maison: [],
  p_microondes: [],
  p_frigo: [],
  p_lavelinge: [],
  p_blender: [],
  p_blender2: [],
  p_ventbrum: [],
  p_ventpince: [],
  p_batterie23: [],
  p_batterie13: [],
  p_casseroles: [],
  p_kitcuisine: [],
  p_seaux: [],
  p_bureau: [],
  p_fauteuil: [],
  p_chaise: [],
  p_canape: [],
  p_plaque: [],
  p_hotte: [],
};

export function imgFor(key: string, index = 0): string | undefined {
  const list = IMG[key];
  if (!list || list.length === 0) return undefined;
  return list[index % list.length];
}

export function galleryFor(key: string): string[] {
  const list = IMG[key] ?? [];
  // La galerie affiche les photos disponibles (1 à 3) du même produit.
  return list.filter(Boolean);
}
