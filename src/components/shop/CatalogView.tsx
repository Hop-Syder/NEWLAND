"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, SearchX, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORIES,
  PRODUCTS,
  countByCategory,
  type Product,
} from "@/lib/products";
import { useShop } from "@/lib/store";
import { Reveal } from "./Reveal";
import { ProductCard } from "./ProductCard";

type SortKey = "pertinence" | "prix_asc" | "prix_desc" | "nom";

function matchesSearch(p: Product, q: string): boolean {
  const query = q.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    p.name,
    p.brand,
    p.shortDescription,
    p.description,
    ...p.features,
  ]
    .join(" ")
    .toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

export function CatalogView() {
  const catalogCategory = useShop((s) => s.catalogCategory);
  const openCatalog = useShop((s) => s.openCatalog);
  const searchQuery = useShop((s) => s.searchQuery);
  const setSearch = useShop((s) => s.setSearch);

  const [sort, setSort] = useState<SortKey>("pertinence");
  const [onlyStock, setOnlyStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(() =>
    Math.max(...PRODUCTS.map((p) => p.price))
  );

  const ABS_MAX = Math.max(...PRODUCTS.map((p) => p.price));

  const results = useMemo(() => {
    const cat = catalogCategory === "all" ? null : catalogCategory;
    let list = PRODUCTS.filter(
      (p) => (!cat || p.category === cat) && matchesSearch(p, searchQuery)
    );
    if (onlyStock) list = list.filter((p) => p.availability === "in_stock");
    list = list.filter((p) => p.price <= maxPrice);

    switch (sort) {
      case "prix_asc":
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case "prix_desc":
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case "nom":
        list = [...list].sort((a, b) => a.name.localeCompare(b.name, "fr"));
        break;
      default:
        // pertinence : produits en avant d'abord, puis prix croissant
        list = [...list].sort(
          (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || a.price - b.price
        );
    }
    return list;
  }, [catalogCategory, searchQuery, onlyStock, maxPrice, sort]);

  const activeCategoryLabel =
    catalogCategory === "all"
      ? "Tout le catalogue"
      : (CATEGORIES.find((c) => c.id === catalogCategory)?.name ?? "Catalogue");

  const resetFilters = () => {
    setOnlyStock(false);
    setMaxPrice(ABS_MAX);
    setSort("pertinence");
    setSearch("");
    openCatalog("all");
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:py-10">
      {/* En-tête du catalogue */}
      <Reveal>
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wide text-[#8a6a14]">
            Catalogue
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#0b0b0b] sm:text-4xl">
            {activeCategoryLabel}
          </h1>
        </div>
      </Reveal>

      {/* Onglets catégories */}
      <Reveal delay={60}>
        <div
          role="tablist"
          aria-label="Filtrer par catégorie"
          className="mb-6 flex flex-wrap gap-2"
        >
          <button
            type="button"
            role="tab"
            aria-selected={catalogCategory === "all"}
            onClick={() => openCatalog("all")}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition-colors ${
              catalogCategory === "all"
                ? "bg-[#141414] text-white"
                : "border border-[#d8d4ca] bg-white text-[#111111] hover:bg-[#eeebe4]"
            }`}
          >
            <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            Tout ({PRODUCTS.length})
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={catalogCategory === c.id}
              onClick={() => openCatalog(c.id)}
              className={`rounded-md px-4 py-2 text-sm font-bold transition-colors ${
                catalogCategory === c.id
                  ? "bg-[#141414] text-white"
                  : "border border-[#d8d4ca] bg-white text-[#111111] hover:bg-[#eeebe4]"
              }`}
            >
              {c.name} ({countByCategory(c.id)})
            </button>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Barre latérale de filtres */}
        <aside aria-label="Filtres" className="lg:sticky lg:top-40 lg:self-start">
          <Reveal direction="left">
            <div className="rounded-md border border-[#e6e3db] bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-base font-extrabold text-[#8a6a14]">
                <SlidersHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
                Filtres
              </p>

              <Separator className="my-4" />

              {/* Recherche locale */}
              <div className="grid gap-2">
                <Label htmlFor="filter-search" className="text-sm font-bold">
                  Recherche
                </Label>
                <Input
                  id="filter-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Blender, marmite…"
                  className="h-10 rounded-md border-[#d8d4ca]"
                />
              </div>

              {/* Prix maximum */}
              <div className="mt-5 grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="filter-price" className="text-sm font-bold">
                    Budget maximum
                  </Label>
                  <span className="rounded-md bg-[#f4eeda] px-2 py-0.5 text-xs font-extrabold text-[#8a6a14]">
                    {new Intl.NumberFormat("fr-FR").format(maxPrice)} FCFA
                  </span>
                </div>
                <input
                  id="filter-price"
                  type="range"
                  min={0}
                  max={ABS_MAX}
                  step={1000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-md bg-[#e6e3db] accent-[#d4af37]"
                  aria-valuemin={0}
                  aria-valuemax={ABS_MAX}
                  aria-valuenow={maxPrice}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>0 FCFA</span>
                  <span>{new Intl.NumberFormat("fr-FR").format(ABS_MAX)} FCFA</span>
                </div>
              </div>

              {/* Disponibilité */}
              <div className="mt-5">
                <p className="text-sm font-bold">Disponibilité</p>
                <label
                  htmlFor="filter-stock"
                  className="mt-2 flex cursor-pointer items-center gap-2.5 text-sm"
                >
                  <Checkbox
                    id="filter-stock"
                    checked={onlyStock}
                    onCheckedChange={(v) => setOnlyStock(v === true)}
                  />
                  Uniquement en stock
                </label>
              </div>

              <Button
                variant="outline"
                className="mt-5 w-full rounded-md border-[#d8d4ca] text-[#8a6a14] hover:bg-[#eeebe4]"
                onClick={resetFilters}
              >
                Réinitialiser
              </Button>
            </div>
          </Reveal>
        </aside>

        {/* Résultats */}
        <div>
          <Reveal delay={80}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#e6e3db] bg-white px-4 py-3">
              <p className="text-sm text-muted-foreground" aria-live="polite">
                <span className="font-extrabold text-[#111111]">
                  {results.length}
                </span>{" "}
                produit{results.length > 1 ? "s" : ""}
                {searchQuery.trim() && (
                  <>
                    {" "}
                    pour «&nbsp;
                    <span className="font-bold text-[#8a6a14]">
                      {searchQuery.trim()}
                    </span>
                    &nbsp;»
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <Label htmlFor="filter-sort" className="whitespace-nowrap text-sm">
                  Trier par
                </Label>
                <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                  <SelectTrigger
                    id="filter-sort"
                    className="h-9 w-52 rounded-md border-[#d8d4ca]"
                    aria-label="Trier les produits"
                  >
                    <SelectValue placeholder="Pertinence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pertinence">Pertinence</SelectItem>
                    <SelectItem value="prix_asc">
                      Prix croissant
                    </SelectItem>
                    <SelectItem value="prix_desc">
                      Prix décroissant
                    </SelectItem>
                    <SelectItem value="nom">Nom (A → Z)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Reveal>

          {results.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-[#d8d4ca] bg-white py-16 text-center">
              <SearchX className="h-10 w-10 text-[#8f8f8f]" aria-hidden="true" />
              <p className="text-lg font-extrabold text-[#111111]">
                Aucun produit ne correspond
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Essayez un autre mot-clé ou élargissez le budget.
              </p>
              <Button
                variant="outline"
                className="mt-1 rounded-md border-[#111111] text-[#8a6a14] hover:bg-[#f4eeda]"
                onClick={resetFilters}
              >
                Tout afficher
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => (
                <Reveal key={p.id} delay={(i % 6) * 60}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
