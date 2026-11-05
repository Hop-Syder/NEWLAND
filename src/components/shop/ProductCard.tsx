"use client";

import { ShoppingBasket, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { type Product, getProduct, getCategory } from "@/lib/products";
import { imgFor } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import { useShop } from "@/lib/store";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { SafeImg } from "./SafeImg";

export function ProductCard({ product }: { product: Product }) {
  const openProduct = useShop((s) => s.openProduct);
  const addToCart = useShop((s) => s.addToCart);

  const quickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} — ${formatFCFA(product.price)}`,
    });
  };

  const openDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    openProduct(product.id);
  };

  return (
    <article
      className="hover-lift group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm focus-within:ring-2 focus-within:ring-[#e8842c]"
      tabIndex={0}
      role="button"
      aria-label={`Voir la fiche produit : ${product.name}`}
      onClick={openDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openProduct(product.id);
        }
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#f2ecdf]">
        <SafeImg
          src={imgFor(product.imageKeys[0])}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        <div className="absolute left-3 top-3">
          <AvailabilityBadge
            availability={product.availability}
            leadTimeDays={product.leadTimeDays}
          />
        </div>
        {product.oldPrice && (
          <span className="absolute right-3 top-3 rounded-full bg-[#e8842c] px-2.5 py-1 text-xs font-extrabold text-white shadow">
            Promo
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[#7a8a75]">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {product.oldPrice && (
              <p className="text-xs text-muted-foreground line-through">
                {formatFCFA(product.oldPrice)}
              </p>
            )}
            <p className="text-lg font-extrabold text-[#1b5e3f]">
              {formatFCFA(product.price)}
            </p>
          </div>
          <button
            type="button"
            aria-label={`Ajouter ${product.name} au panier`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1b5e3f] text-white transition-colors hover:bg-[#14503a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e8842c] active:scale-95 motion-reduce:transition-none"
            onClick={quickAdd}
          >
            <ShoppingBasket className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="mt-1 inline-flex items-center gap-1.5 self-start text-sm font-bold text-[#b05f14] hover:underline"
          onClick={openDetail}
        >
          Voir la fiche
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

/** Petite carte catégorie pour l'accueil. */
export function CategoryCard({
  categoryId,
  count,
  onClick,
}: {
  categoryId: string;
  count: number;
  onClick: () => void;
}) {
  const cat = getCategory(categoryId as never);
  if (!cat) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Explorer la catégorie ${cat.name}`}
      className="hover-lift group relative block h-52 w-full overflow-hidden rounded-2xl text-left shadow-sm sm:h-60"
    >
      <SafeImg
        src={imgFor(cat.imageKey)}
        alt={cat.name}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#123d29]/85 via-[#123d29]/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <h3 className="text-lg font-extrabold text-white sm:text-xl">
          {cat.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-white/85">{cat.tagline}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#e8842c] px-3 py-1 text-xs font-extrabold text-white">
          {count} article{count > 1 ? "s" : ""} à découvrir
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}
