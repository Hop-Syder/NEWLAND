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
    tagline: "Réfrigérateurs, micro-ondes, machines à laver, ventilateurs…",
    imageKey: "cat_appareils",
  },
  {
    id: "cuisine",
    name: "Cuisine",
    tagline: "Batteries antiadhésives, casseroles, ustensiles malins…",
    imageKey: "cat_cuisine",
  },
  {
    id: "maison",
    name: "Maison & Bureau",
    tagline: "Bureaux, fauteuils, canapés : un intérieur confortable.",
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
      "Compact et simple, idéal pour réchauffer et décongeler au quotidien.",
    description:
      "Ce micro-ondes Hisense de 20 litres trouve facilement sa place dans une cuisine de toutes les tailles. Ses commandes simples permettent de réchauffer les plats, de décongeler rapidement et de préparer les petits déjeuners sans y penser trop longtemps. Une valeur sûre, vendue et assurée localement à Cotonou.",
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
      "Micro-ondes + grill : pour gratiner, rôtir et réchauffer en un appareil.",
    description:
      "Le Syinix 20 L avec grill combine deux fonctions dans un seul appareil : réchauffer comme un micro-ondes classique, et griller pour dorer pains, poulets et gratins. Une solution pratique pour les cuisines où chaque centimètre compte.",
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
      "Grand volume 249 L, congélateur en bas : frais et organisé toute l'année.",
    description:
      "Avec ses 249 litres et son congélateur en bas, ce réfrigérateur TCL offre un vrai confort d'organisation pour une famille : les produits frais à hauteur des yeux, les surgelés accessibles en bas. Un modèle sobre et efficace, adapté au climat béninois.",
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
      "Grande capacité 8 kg pour le linge de toute la famille, sans effort.",
    description:
      "La machine à laver TCL de 8 kg prend en charge les grosses lessives familiales : draps, uniformes, pagnes. Ses programmes simples se choisissent en un geste, et la grande capacité réduit le nombre de lessives par semaine.",
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
      "Quatre brûleurs à gaz encastrables pour cuisiner comme un chef.",
    description:
      "La plaque encastrable Focus F405B équipé de quatre brûleurs s'intègre dans le plan de travail pour une cuisine nette et performante. Les feux se règlent finement, du mijoté doux à la friture vive — idéal pour la cuisine béninoise exigeante.",
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
      "Évacue fumées et odeurs de friture : la cuisine reste fraîche.",
    description:
      "Installée au-dessus de la cuisson, cette hotte décorative Focus Line aspire les fumées et les odeurs dès qu'elles apparaissent. Un air plus sain dans la cuisine, des murs qui restent propres plus longtemps.",
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
      "8 fonctions en 1 : piment, tomate, jus, bouillie… le compagnon des cuisines béninoises.",
    description:
      "Grand bol de 4 litres et huit fonctions réunies dans un seul appareil : mixer le piment et la tomate, préparer les jus, broyer les épices, préparer la bouillie. C'est le Blender « Bardefu » très populaire dans les marchés et boutiques de Cotonou.",
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
      "Compact et robuste : parfait pour le piment, les épices et les petits jus.",
    description:
      "Ce duo blender + moulin Binatone de 350 watts gère les préparations du quotidien sans prendre de place : sauce tomate, piment, épices moulues, petits smoothies. Son bol de 1,5 L convient aux couples et petites familles.",
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
      "Brumisation + ventilation : la fraîcheur qui soulage pendant la saison chaude.",
    description:
      "Ce ventilateur colonne de 16 pouces projette une fine brume d'eau en plus du flux d'air : la sensation de fraîcheur est immédiate, même aux heures les plus chaudes. Idéal pour le salon, la terrasse ou une boutique.",
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
      "Se pince partout : bureau, lit, coin lecture — une brise personnelle.",
    description:
      "Petit, léger et muni d'une pince solide, ce ventilateur de table s'accroche où vous en avez besoin : pied de lit, bureau d'étudiant, comptoir de boutique. Une brise dirigée exactement là où il faut, pour un budget mini.",
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
      "Marmite géante, faitout, poêles, couvercles : une cuisine complète d'un coup.",
    description:
      "De la marmite géante pour le riz de fête à la poêle pour les œufs du matin, ce set de 23 pièces couvre tous les besoins d'une famille : marmites antiadhésives de tailles variées, faitout, poêles et couvercles assortis. Le revêtement antiadhésif facilite la cuisson comme le nettoyage.",
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
      "L'essentiel antiadhésif à petit prix : marmites, poêle et couvercles.",
    description:
      "Un set de 13 pièces qui rassemble le nécessaire pour cuisiner chaque jour sans se ruiner : marmites de tailles moyennes, poêle et couvercles. Le revêtement antiadhésif permet de cuisiner avec moins d'huile et de nettoyer en un geste.",
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
      "Casseroles épaisses qui répartissent bien la chaleur et durent.",
    description:
      "Cet ensemble de casseroles mise sur la qualité de fabrication : fond épais qui diffuse uniformément la chaleur, parois solides, poignées bien fixées. Des ustensiles qui accompagnent la cuisine quotidienne année après année.",
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
      "Trois petits outils malins qui rendent la cuisine tellement plus simple.",
    description:
      "Un aiguiseur pour retrouver des lames qui coupent vraiment, un éplucheur efficace pour les ignames et les pommes de terre, des ciseaux robustes pour tout le reste. Le trio discret qui fait gagner un temps précieux chaque jour.",
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
      "Solides et empilables : pour la cuisine, la lessive et le rangement.",
    description:
      "Un seau et des bols en plastique souple mais résistant : laver les légumes, tremper le linge, transporter l'eau, ranger les petits objets. Trois tailles qui s'emboîtent pour un rangement sans encombre.",
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
      "Grand plateau de travail et rangements : un vrai poste de travail.",
    description:
      "Le bureau Eden D1494 offre un plateau généreux pour étaler dossiers, ordinateur et cahiers, avec des rangements pour garder un espace net. Conçu pour un usage quotidien soutenu, à la maison comme dans un bureau d'entreprise.",
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
      "Soutien lombaire et réglages complets pour de longues journées assis.",
    description:
      "Le fauteuil Flexon MF est pensé pour les longues heures de travail : assise rembourrée, soutien lombaire, accoudoirs et hauteur réglables. Il préserve le dos des professionnels qui passent la journée au bureau.",
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
      "Confort au quotidien à prix maîtrisé : pivotante, rembourrée, réglable.",
    description:
      "Une chaise de bureau simple et bien pensée : assise rembourrée confortable, rotation complète pour se tourner vers son écran ou ses dossiers, réglage en hauteur. Le bon équilibre entre confort et budget pour un bureau à la maison.",
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
      "Le grand salon qui accueille toute la famille et les invités.",
    description:
      "Ce canapé d'angle en bois massif structure le salon : sept places pour la famille réunie, une assise ferme qui dure, et un habillage soigné. Fabriqué et livré par un atelier de Cotonou, il se commande avec le tissu de votre choix.",
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
