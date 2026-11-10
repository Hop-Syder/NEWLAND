import { IMG } from "@/lib/images";

export type CategoryId = "appareils" | "cuisine" | "maison";
export type Availability = "in_stock" | "on_order";

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: CategoryId;
  price: number; // FCFA
  oldPrice?: number; // prix constaté ailleurs / avant remise
  availability: Availability;
  leadTimeDays?: number; // pour les articles sur commande
  imageKeys: string[]; // clés dans IMG (galerie)
  shortDescription: string;
  description: string;
  features: string[];
  practical: string[]; // informations pratiques
  featured?: boolean;
  /** Garantie boutique en mois (renseigné pour les produits ajoutés via l'admin). */
  warrantyMonths?: number;
  source: string; // référence marché du prix constaté
}

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  imageKey: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "appareils",
    name: "Appareils ménagers",
    tagline: "Frigos, micro-ondes, lave-linge…",
    imageKey: "cat_appareils",
  },
  {
    id: "cuisine",
    name: "Cuisine",
    tagline: "Marmites, poêles, ustensiles…",
    imageKey: "cat_cuisine",
  },
  {
    id: "maison",
    name: "Maison & Bureau",
    tagline: "Bureaux, fauteuils, canapés…",
    imageKey: "cat_maison",
  },
];

/**
 * Catalogue basé sur des produits réellement vendus au Bénin et des prix
 * constatés en ligne (boutiques et vendeurs de Cotonou), arrondis au FCFA.
 * Aucun produit fictif : chaque référence correspond à un article commercialisé
 * localement au moment de la création du site.
 */
export const PRODUCTS: Product[] = [
  // ---------------------------- APPAREILS MÉNAGERS ----------------------------
  {
    id: "p-hisense-mo20",
    slug: "micro-ondes-hisense-20l-blanc",
    name: "Micro-ondes Hisense 20 L — blanc",
    brand: "Hisense",
    category: "appareils",
    price: 58000,
    availability: "in_stock",
    imageKeys: ["p_microondes"],
    shortDescription:
      "Compact, pour réchauffer et décongeler.",
    description:
      "Un micro-ondes compact et simple pour réchauffer et décongeler chaque jour.",
    features: [
      "Capacité : 20 litres",
      "Coloris blanc, habillage facile à nettoyer",
      "Décongélation rapide par poids",
      "Plateau tournant amovible",
    ],
    practical: [
      "Garantie boutique : 6 mois",
      "Livraison Cotonou sous 24–48 h",
      "Paiement Mobile Money accepté",
    ],
    featured: true,
    source: "Prix constaté : Le Mars Club, Cotonou (58 000 FCFA)",
  },
  {
    id: "p-syinix-mo20g",
    slug: "micro-ondes-grill-syinix-20l",
    name: "Micro-ondes avec grill Syinix 20 L",
    brand: "Syinix",
    category: "appareils",
    price: 70000,
    availability: "in_stock",
    imageKeys: ["p_microondes", "p_blender"],
    shortDescription:
      "Micro-ondes + grill 2 en 1.",
    description:
      "Réchauffe comme un micro-ondes et grille pains, poulets et gratins, en un seul appareil.",
    features: [
      "Capacité : 20 litres",
      "Fonction grill pour dorer et gratiner",
      "Plusieurs niveaux de puissance",
      "Minuterie intégrée",
    ],
    practical: [
      "Garantie boutique : 6 mois",
      "Livraison Cotonou sous 24–48 h",
      "Démonstration possible à la livraison",
    ],
    featured: true,
    source: "Prix constaté : Le Mars Club, Cotonou (70 000 FCFA)",
  },
  {
    id: "p-tcl-frigo249",
    slug: "refrigerateur-tcl-249l",
    name: "Réfrigérateur TCL 249 L — congélateur en bas",
    brand: "TCL",
    category: "appareils",
    price: 299000,
    availability: "on_order",
    leadTimeDays: 3,
    imageKeys: ["p_frigo"],
    shortDescription:
      "249 L, congélateur en bas.",
    description:
      "249 litres avec congélateur en bas : produits frais à hauteur des yeux, surgelés accessibles.",
    features: [
      "Volume total : 249 litres",
      "Congélateur en bas, porte inversable",
      "Balconnets transparents ajustables",
      "Éclairage intérieur LED",
    ],
    practical: [
      "Disponible sur commande : livraison sous 3 jours",
      "Garantie boutique : 12 mois",
      "Montage et mise en marche inclus à Cotonou",
    ],
    featured: true,
    source: "Prix constaté : Le Mars Club, Cotonou (299 000 FCFA)",
  },
  {
    id: "p-tcl-laveuse8",
    slug: "machine-a-laver-tcl-8kg",
    name: "Machine à laver TCL 8 kg",
    brand: "TCL",
    category: "appareils",
    price: 299000,
    availability: "in_stock",
    imageKeys: ["p_lavelinge"],
    shortDescription:
      "Grande capacité 8 kg.",
    description:
      "8 kg pour les grosses lessives familiales, avec des programmes simples à choisir.",
    features: [
      "Capacité de lavage : 8 kg",
      "Programmes de lavage sélectionnables",
      "Hublot large pour un chargement facile",
      "Pieds réglables pour une installation stable",
    ],
    practical: [
      "Garantie boutique : 12 mois",
      "Livraison Cotonou sous 24–48 h",
      "Installation à domicile disponible",
    ],
    source: "Prix constaté : Le Mars Club, Cotonou (299 000 FCFA)",
  },
  {
    id: "p-focus-plaque405",
    slug: "plaque-gaz-focus-f405b",
    name: "Plaque à gaz encastrable Focus F405B",
    brand: "Focus Line",
    category: "appareils",
    price: 199000,
    availability: "on_order",
    leadTimeDays: 4,
    imageKeys: ["p_plaque"],
    shortDescription:
      "4 brûleurs à gaz encastrables.",
    description:
      "Quatre brûleurs à gaz encastrables, du mijoté doux à la friture vive.",
    features: [
      "4 brûleurs à gaz",
      "Encastrement plan de travail",
      "Grilles en fonte robustes",
      "Allumage intégré",
    ],
    practical: [
      "Disponible sur commande : livraison sous 4 jours",
      "Garantie boutique : 12 mois",
      "Conseils d'installation fournis",
    ],
    source: "Prix constaté : Le Mars Club, Cotonou (199 000 FCFA)",
  },
  {
    id: "p-focus-hotte620",
    slug: "hotte-focus-line-f620b",
    name: "Hotte décorative Focus Line F620B",
    brand: "Focus Line",
    category: "appareils",
    price: 155000,
    availability: "on_order",
    leadTimeDays: 4,
    imageKeys: ["p_hotte"],
    shortDescription:
      "Évacue fumées et odeurs.",
    description:
      "Aspire fumées et odeurs dès la cuisson : un air plus sain et des murs propres.",
    features: [
      "Largeur adaptée aux plaques 60 cm",
      "Fonction extraction et recyclage",
      "Éclairage de plan de cuisson intégré",
      "Filtres démontables, lavables",
    ],
    practical: [
      "Disponible sur commande : livraison sous 4 jours",
      "Garantie boutique : 12 mois",
      "Filtre à charbon disponible en accessoire",
    ],
    source: "Prix constaté : Le Mars Club, Cotonou (155 000 FCFA)",
  },
  {
    id: "p-moulinex-8en1",
    slug: "blender-moulinex-multifonction-4l",
    name: "Blender multifonction Moulinex 8-en-1 — 4 L",
    brand: "Moulinex",
    category: "appareils",
    price: 28500,
    oldPrice: 35000,
    availability: "in_stock",
    imageKeys: ["p_blender", "p_blender2"],
    shortDescription:
      "8 fonctions en 1, bol XXL 4 L.",
    description:
      "Le fameux blender 4 L très populaire au Bénin : piment, tomate, jus, bouillie et épices.",
    features: [
      "Bol XXL : 4 litres",
      "8 fonctions : mixer, broyer, hacher…",
      "Lames inox résistantes",
      "Base antidérapante",
    ],
    practical: [
      "Garantie boutique : 3 mois",
      "Livraison Cotonou sous 24–48 h",
      "Accessoires de rechange disponibles localement",
    ],
    featured: true,
    source: "Prix constaté : vendeurs Cotonou (28 500 FCFA)",
  },
  {
    id: "p-binatone-350",
    slug: "blender-binatone-350w-1-5l",
    name: "Blender-moulin Binatone 350 W — 1,5 L",
    brand: "Binatone",
    category: "appareils",
    price: 18500,
    availability: "in_stock",
    imageKeys: ["p_blender2", "p_blender"],
    shortDescription:
      "Compact : piment, épices, petits jus.",
    description:
      "Blender + moulin de 350 W pour la sauce tomate, le piment et les épices du quotidien.",
    features: [
      "Puissance : 350 W",
      "Bol : 1,5 litre",
      "Moulin à épices inclus",
      "Bocal facile à rincer",
    ],
    practical: [
      "Garantie boutique : 3 mois",
      "Livraison Cotonou sous 24–48 h",
      "Paiement Mobile Money accepté",
    ],
    source: "Prix constaté : AfricaPlace, livraison Bénin (18 500 FCFA)",
  },
  {
    id: "p-ventbrum-16",
    slug: "ventilateur-brumisateur-16-pouces",
    name: "Ventilateur brumisateur 16 pouces — 75 W",
    brand: "Shoppyit",
    category: "appareils",
    price: 54500,
    availability: "in_stock",
    imageKeys: ["p_ventbrum"],
    shortDescription:
      "Brumisation + ventilation.",
    description:
      "Projette une fine brume en plus du flux d'air : fraîcheur immédiate aux heures chaudes.",
    features: [
      "Diamètre : 16 pouces",
      "Puissance : 75 W",
      "Alimentation : AC 220–240 V, 50 Hz",
      "Réservoir d'eau pour la brumisation",
    ],
    practical: [
      "Garantie boutique : 6 mois",
      "Livraison Cotonou sous 24–48 h",
      "Notice en français incluse",
    ],
    featured: true,
    source: "Prix constaté : Shoppyit Bénin (54 500 FCFA)",
  },
  {
    id: "p-ventpince",
    slug: "ventilateur-de-table-a-pince",
    name: "Ventilateur de table à pince",
    brand: "Générique",
    category: "appareils",
    price: 6000,
    availability: "in_stock",
    imageKeys: ["p_ventpince"],
    shortDescription:
      "Se pince partout, brise dirigée.",
    description:
      "Se fixe partout grâce à sa pince : lit, bureau, comptoir — pour un budget mini.",
    features: [
      "Fixation par pince robuste",
      "Oscillation réglable à la main",
      "Câble suffisant pour usage de table",
      "Protection du ventilateur par grille",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Idéal cadeau ou première installation",
      "Paiement Mobile Money accepté",
    ],
    source: "Prix constaté : vendeurs Cotonou (6 000 FCFA)",
  },

  // --------------------------------- CUISINE ---------------------------------
  {
    id: "p-batterie-23",
    slug: "batterie-antiadhesive-23-pieces",
    name: "Batterie de cuisine antiadhésive — 23 pièces",
    brand: "Générique",
    category: "cuisine",
    price: 45000,
    availability: "in_stock",
    imageKeys: ["p_batterie23"],
    shortDescription:
      "Cuisine complète : 23 pièces.",
    description:
      "De la marmite géante à la poêle : 23 pièces antiadhésives pour toute la famille.",
    features: [
      "23 pièces assorties",
      "Revêtement antiadhésif",
      "Marmite XXL pour les grandes quantités",
      "Poignées isolantes",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Emballage renforcé",
      "Paiement à la livraison possible",
    ],
    featured: true,
    source: "Prix constaté : vendeurs Cotonou (45 000 FCFA)",
  },
  {
    id: "p-batterie-13",
    slug: "batterie-antiadhesive-13-pieces",
    name: "Batterie antiadhésive — 13 pièces",
    brand: "Générique",
    category: "cuisine",
    price: 10000,
    oldPrice: 15000,
    availability: "in_stock",
    imageKeys: ["p_batterie13"],
    shortDescription:
      "L'essentiel antiadhésif, petit prix.",
    description:
      "Le nécessaire antiadhésif à petit prix : marmites, poêle et couvercles.",
    features: [
      "13 pièces assorties",
      "Revêtement antiadhésif",
      "Adapté feux à gaz",
      "Nettoyage facile",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Paiement Mobile Money accepté",
      "Idéal pour équiper une première maison",
    ],
    featured: true,
    source: "Prix constaté : vendeurs Cotonou (10 000 FCFA)",
  },
  {
    id: "p-casseroles-set",
    slug: "ensemble-casseroles-qualite",
    name: "Ensemble de casseroles — qualité renforcée",
    brand: "Générique",
    category: "cuisine",
    price: 19000,
    availability: "in_stock",
    imageKeys: ["p_casseroles"],
    shortDescription:
      "Fonds épais, cuisson homogène.",
    description:
      "Fond épais qui diffuse bien la chaleur, parois solides et poignées bien fixées.",
    features: [
      "Fonds épais à diffusion homogène",
      "Plusieurs diamètres assortis",
      "Poignées résistantes à la chaleur",
      "Compatible gaz et plaque électrique",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Contrôle qualité à la réception",
      "Paiement à la livraison possible",
    ],
    source: "Prix constaté : vendeurs Cotonou (19 000 FCFA)",
  },
  {
    id: "p-kit-cuisine",
    slug: "kit-cuisine-aiguiseur-eplucheur-ciseaux",
    name: "Kit cuisine : aiguiseur, éplucheur et ciseaux",
    brand: "Générique",
    category: "cuisine",
    price: 3500,
    availability: "in_stock",
    imageKeys: ["p_kitcuisine"],
    shortDescription:
      "Aiguiseur, éplucheur, ciseaux.",
    description:
      "Un aiguiseur, un éplucheur et des ciseaux : le trio qui fait gagner du temps.",
    features: [
      "Aiguiseur 2 étapes (grossier / fin)",
      "Éplucheur lame inox",
      "Ciseaux de cuisine multi-usages",
      "Format compact, rangement facile",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Petit prix : idéal en plus d'une commande",
      "Paiement Mobile Money accepté",
    ],
    source: "Prix constaté : vendeurs Cotonou (3 500 FCFA)",
  },
  {
    id: "p-seaux-bols",
    slug: "ensemble-seaux-et-bols-serie-de-3",
    name: "Ensemble seau et bols — série de 3",
    brand: "Générique",
    category: "cuisine",
    price: 3700,
    availability: "in_stock",
    imageKeys: ["p_seaux"],
    shortDescription:
      "Solides et empilables, 3 tailles.",
    description:
      "Trois tailles qui s'emboîtent, pour la cuisine, la lessive et le rangement.",
    features: [
      "3 pièces de tailles progressives",
      "Plastique épais, anses renforcées",
      "Empilables pour gagner de la place",
      "Faciles à rincer",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Coloris selon disponibilité",
      "Paiement à la livraison possible",
    ],
    source: "Prix constaté : vendeurs Cotonou (3 700 FCFA)",
  },

  // ------------------------------ MAISON & BUREAU ------------------------------
  {
    id: "p-bureau-eden",
    slug: "bureau-eden-d1494",
    name: "Bureau Eden D1494",
    brand: "Mobideco",
    category: "maison",
    price: 145000,
    availability: "on_order",
    leadTimeDays: 5,
    imageKeys: ["p_bureau"],
    shortDescription:
      "Grand plateau + rangements.",
    description:
      "Plateau généreux et caisson à tiroirs pour un poste de travail net, à la maison ou au bureau.",
    features: [
      "Plateau de travail spacieux",
      "Caisson à tiroirs intégré",
      "Structure pour usage intensif",
      "Finition facile à nettoyer",
    ],
    practical: [
      "Disponible sur commande : livraison sous 5 jours",
      "Montage par nos soins à Cotonou",
      "Adapté aux entreprises (devis pour plusieurs postes)",
    ],
    featured: true,
    source: "Prix constaté : Mobideco-Bénin (145 000 FCFA)",
  },
  {
    id: "p-fauteuil-flexon",
    slug: "fauteuil-ergonomique-flexon-mf",
    name: "Fauteuil ergonomique Flexon MF",
    brand: "Mobideco",
    category: "maison",
    price: 325000,
    availability: "on_order",
    leadTimeDays: 5,
    imageKeys: ["p_fauteuil"],
    shortDescription:
      "Soutien lombaire, tout réglable.",
    description:
      "Assise rembourrée, soutien lombaire et réglages complets pour de longues journées.",
    features: [
      "Dossier ergonomique à soutien lombaire",
      "Hauteur et inclinaison réglables",
      "Accoudoirs rembourrés",
      "Base à 5 branches, roulettes",
    ],
    practical: [
      "Disponible sur commande : livraison sous 5 jours",
      "Garantie vendeur",
      "Essai de posture à la livraison",
    ],
    source: "Prix constaté : Mobideco-Bénin (325 000 FCFA)",
  },
  {
    id: "p-chaise-bureau",
    slug: "chaise-bureau-pivotante-59-900",
    name: "Chaise de bureau pivotante ergonomique",
    brand: "Générique",
    category: "maison",
    price: 59900,
    availability: "in_stock",
    imageKeys: ["p_chaise"],
    shortDescription:
      "Pivotante, rembourrée, réglable.",
    description:
      "Simple et bien pensée : assise rembourrée, rotation 360° et réglage en hauteur.",
    features: [
      "Assise rembourrée",
      "Rotation 360°",
      "Réglage de hauteur",
      "Roulettes adaptées aux sols",
    ],
    practical: [
      "Livraison Cotonou sous 24–48 h",
      "Montage simple, notice fournie",
      "Paiement Mobile Money accepté",
    ],
    source: "Prix constaté : annonce Cotonou, Coinafrique (59 900 FCFA)",
  },
  {
    id: "p-canape-7places",
    slug: "canape-7-places-bois-massif",
    name: "Canapé 7 places en bois massif",
    brand: "Avenue des Meubles",
    category: "maison",
    price: 299999,
    availability: "on_order",
    leadTimeDays: 7,
    imageKeys: ["p_canape"],
    shortDescription:
      "7 places, bois massif.",
    description:
      "Sept places en bois massif, fabriqué à Cotonou, tissu au choix à la commande.",
    features: [
      "7 places, configuration d'angle",
      "Structure en bois massif",
      "Assise ferme et durable",
      "Tissu au choix selon disponibilité",
    ],
    practical: [
      "Fabrication locale : livraison sous 7 jours",
      "Choix du tissu à la commande",
      "Montage et installation à domicile",
    ],
    featured: true,
    source: "Prix constaté : Avenue des Meubles, Cotonou (299 999 FCFA)",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getCategory(id: CategoryId): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function productsOfCategory(cat: CategoryId): Product[] {
  return PRODUCTS.filter((p) => p.category === cat);
}

export function relatedProducts(product: Product, count = 4): Product[] {
  const same = PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  );
  const others = PRODUCTS.filter(
    (p) => p.category !== product.category && p.featured
  );
  return [...same, ...others].slice(0, count);
}

export function countByCategory(cat: CategoryId): number {
  return PRODUCTS.filter((p) => p.category === cat).length;
}

export function priceRangeOf(cat?: CategoryId): [number, number] {
  const list = cat ? productsOfCategory(cat) : PRODUCTS;
  const prices = list.map((p) => p.price);
  return [Math.min(...prices), Math.max(...prices)];
}
