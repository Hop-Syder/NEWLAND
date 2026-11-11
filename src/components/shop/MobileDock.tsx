"use client";

/**
 * Dock de navigation mobile (remplace le menu hamburger).
 * Inspiré des « animated icons » de 21st.dev : chaque icône joue une
 * micro-animation au tap (spring), grossit au survol (effet dock) et
 * l'indicateur actif glisse d'un item à l'autre (layoutId).
 * Toutes les animations sont désactivées si prefers-reduced-motion.
 */

import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  Home,
  LayoutGrid,
  UserRound,
  ShoppingBasket,
  type LucideIcon,
} from "lucide-react";
import { useShop, cartCount } from "@/lib/store";

const GOLD = "#d4af37";

const SPRING: Transition = { type: "spring", stiffness: 500, damping: 24 };

/** Micro-animation « icône vivante » propre à chaque item. */
const ICON_ANIMS: Record<string, Record<string, number[]>> = {
  home: { rotate: [0, -14, 10, 0], scale: [1, 1.25, 0.95, 1] },
  catalog: { scale: [1, 0.65, 1.2, 1], rotate: [0, 8, -8, 0] },
  account: { y: [0, -6, 0], scale: [1, 1.15, 1] },
  cart: { rotate: [0, 14, -12, 0], y: [0, -3, 0] },
};

interface DockItemProps {
  id: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  badge?: number;
  reducedMotion: boolean;
  onActivate: () => void;
}

function DockItem({
  id,
  label,
  icon: Icon,
  active,
  badge,
  reducedMotion,
  onActivate,
}: DockItemProps) {
  const controls = useAnimationControls();

  const handleActivate = () => {
    if (!reducedMotion) void controls.start(ICON_ANIMS[id] ?? {});
    onActivate();
  };

  return (
    <motion.button
      type="button"
      onClick={handleActivate}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      whileTap={reducedMotion ? undefined : { scale: 0.78, y: 2 }}
      whileHover={
        reducedMotion ? undefined : { y: -7, scale: 1.16, transition: SPRING }
      }
      transition={SPRING}
      className="relative flex w-14 flex-col items-center gap-0.5 rounded-md px-1 pb-1 pt-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] sm:w-16"
    >
      <span className="relative">
        <motion.span
          animate={controls}
          className="block"
          style={{ willChange: "transform" }}
        >
          <Icon
            className="h-6 w-6 transition-colors duration-300"
            style={{ color: active ? GOLD : "rgba(238,235,228,0.82)" }}
            strokeWidth={active ? 2.4 : 2}
            aria-hidden="true"
          />
        </motion.span>

        {/* Badge panier — rejoue un « pop » à chaque changement de quantité */}
        <AnimatePresence>
          {badge !== undefined && badge > 0 && (
            <motion.span
              key={badge}
              initial={reducedMotion ? false : { scale: 0, y: -6 }}
              animate={{ scale: 1, y: 0 }}
              exit={reducedMotion ? undefined : { scale: 0, opacity: 0 }}
              transition={SPRING}
              className="absolute -right-2.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-[#d4af37] px-1 text-[10px] font-extrabold text-[#0b0b0b] shadow-[0_2px_8px_rgba(212,175,55,0.55)]"
              aria-hidden="true"
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      <span
        className="text-[10px] font-bold leading-none tracking-tight transition-colors duration-300"
        style={{ color: active ? GOLD : "rgba(238,235,228,0.65)" }}
      >
        {label}
      </span>

      {/* Indicateur actif — glisse d'un item à l'autre */}
      {active && (
        <motion.span
          layoutId="dock-active-dot"
          className="absolute bottom-0 h-1 w-6 rounded-sm bg-[#d4af37]"
          transition={reducedMotion ? { duration: 0 } : SPRING}
          aria-hidden="true"
        />
      )}
    </motion.button>
  );
}

export function MobileDock() {
  const reducedMotion = !!useReducedMotion();
  const view = useShop((s) => s.view);
  const cart = useShop((s) => s.cart);
  const goHome = useShop((s) => s.goHome);
  const openCatalog = useShop((s) => s.openCatalog);
  const openCart = useShop((s) => s.openCart);
  const openAccount = useShop((s) => s.openAccount);
  const count = cartCount(cart);

  const items: Omit<DockItemProps, "reducedMotion">[] = [
    {
      id: "home",
      label: "Accueil",
      icon: Home,
      active: view === "home",
      onActivate: goHome,
    },
    {
      id: "catalog",
      label: "Catalogue",
      icon: LayoutGrid,
      active: view === "catalog" || view === "product",
      onActivate: () => openCatalog("all"),
    },
    {
      id: "account",
      label: "Compte",
      icon: UserRound,
      active: view === "account",
      onActivate: () => openAccount(),
    },
    {
      id: "cart",
      label: "Panier",
      icon: ShoppingBasket,
      active: view === "cart" || view === "checkout" || view === "success",
      badge: count,
      onActivate: openCart,
    },
  ];

  return (
    <nav
      aria-label="Navigation principale (mobile)"
      className="fixed inset-x-0 bottom-0 z-50 md:hidden"
      style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto w-fit max-w-[calc(100vw-1.5rem)]">
        <div className="flex items-end gap-1 rounded-md border border-[#d4af37]/25 bg-[#0b0b0b]/92 px-2 pt-1 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          {items.map((item) => (
            <DockItem
              key={item.id}
              {...item}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
