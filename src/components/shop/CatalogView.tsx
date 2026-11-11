"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal, SearchX, LayoutGrid, X } from "lucide-react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  CATEGORIES,
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
    ...(p.tags ?? []),
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
  const products = useShop((s) => s.products);

  const [sort, setSort] = useState<SortKey>("pertinence");
  const [onlyStock, setOnlyStock] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const ABS_MAX = products.length
    ? Math.max(...products.map((p) => p.price))
    : 0;
  const [maxPrice, setMaxPrice] = useState<number>(ABS_MAX);

  // Étiquettes disponibles (posées par l'admin), triées alphabétiquement.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) for (const t of p.tags ?? []) set.add(t);
    return [...set].sort((a, b) => a.localeCompare(b, "fr"));
  }, [products]);

  // Nombre de filtres actifs pour badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (catalogCategory !== "all") count++;
    if (searchQuery.trim()) count++;
    if (onlyStock) count++;
    if (activeTag) count++;
    if (maxPrice < ABS_MAX) count++;
    return count;
  }, [catalogCategory, searchQuery, onlyStock, activeTag, maxPrice, ABS_MAX]);

  const results = useMemo(() => {
    const cat = catalogCategory === "all" ? null : catalogCategory;
    let list = products.filter(
      (p) => (!cat || p.category === cat) && matchesSearch(p, searchQuery)
    );
    if (onlyStock) list = list.filter((p) => p.availability === "in_stock");
    if (activeTag)
      list = list.filter((p) => (p.tags ?? []).includes(activeTag));
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
        list = [...list].sort(
          (a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || a.price - b.price
        );
    }
    return list;
  }, [products, catalogCategory, searchQuery, onlyStock, activeTag, maxPrice, sort]);

  const activeCategoryLabel =
    catalogCategory === "all"
      ? "Tout le catalogue"
      : (CATEGORIES.find((c) => c.id === catalogCategory)?.name ?? "Catalogue");

  const resetFilters = () => {
    setOnlyStock(false);
    setActiveTag(null);
    setMaxPrice(ABS_MAX);
    setSort("pertinence");
    setSearch("");
    openCatalog("all");
    setMobileFilterOpen(false);
  };

  // Contenu des filtres réutilisé entre desktop (sidebar) et mobile (sheet)
  const filterFieldsContent = (
    <div className="grid gap-5">
      {/* Recherche */}
      <div className="grid gap-2">
        <Label htmlFor="filter-search" className="text-sm font-bold">
          Recherche
        </Label>
        <Input
          id="filter-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Blender, réfrigérateur, TV…"
          className="h-10 rounded-md border-[#d8d4ca]"
        />
      </div>

      {/* Prix maximum */}
      <div className="grid gap-2">
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
      <div>
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

      {activeFiltersCount > 0 && (
        <Button
          variant="outline"
          className="mt-2 w-full rounded-md border-[#d8d4ca] text-[#8a6a14] hover:bg-[#eeebe4]"
          onClick={resetFilters}
        >
          Réinitialiser tous les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 lg:py-10">
      {/* En-tête du catalogue */}
      <Reveal>
        <div className="mb-4 lg:mb-6">
          <p className="text-xs font-bold uppercase tracking-wide text-[#8a6a14]">
            Catalogue
          </p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-[#0b0b0b] sm:text-3xl lg:text-4xl">
            {activeCategoryLabel}
          </h1>
        </div>
      </Reveal>

      {/* Onglets catégories - Défilement horizontal fluide sur mobile */}
      <Reveal delay={60}>
        <div
          role="tablist"
          aria-label="Filtrer par catégorie"
          className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={catalogCategory === "all"}
            onClick={() => openCatalog("all")}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all sm:rounded-md sm:text-sm ${
              catalogCategory === "all"
                ? "bg-[#141414] text-white shadow-sm ring-1 ring-black"
                : "border border-[#d8d4ca] bg-white text-[#111111] hover:bg-[#eeebe4]"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            Tout ({products.length})
          </button>
          {CATEGORIES.map((c) => {
            const count = products.filter((p) => p.category === c.id).length;
            const isSelected = catalogCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => openCatalog(c.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all sm:rounded-md sm:text-sm ${
                  isSelected
                    ? "bg-[#141414] text-white shadow-sm ring-1 ring-black"
                    : "border border-[#d8d4ca] bg-white text-[#111111] hover:bg-[#eeebe4]"
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </Reveal>

      {/* Filtre par étiquettes - Chips horizontales défilables sur mobile */}
      {allTags.length > 0 && (
        <Reveal delay={80}>
          <div
            role="group"
            aria-label="Filtrer par étiquette"
            className="no-scrollbar -mx-4 mb-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
          >
            <span className="shrink-0 text-xs font-bold text-[#808080]">
              Étiquettes :
            </span>
            {allTags.map((t) => {
              const active = activeTag === t;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setActiveTag(active ? null : t)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                    active
                      ? "bg-[#d4af37] text-[#0b0b0b]"
                      : "border border-[#d8d4ca] bg-white text-[#111111] hover:bg-[#f4eeda]"
                  }`}
                >
                  {t}
                  {active && <X className="ml-1 inline h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* Barre d'action Mobile : Filtres + Nb Produits + Tri */}
      <div className="mb-4 flex items-center justify-between gap-2 rounded-lg border border-[#e6e3db] bg-white p-2.5 shadow-xs lg:hidden">
        <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="relative flex items-center gap-2 border-[#d8d4ca] font-bold text-[#111111]"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#8a6a14]" />
              <span>Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4af37] text-[10px] font-extrabold text-[#0b0b0b]">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl p-6">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="flex items-center gap-2 text-lg font-extrabold text-[#8a6a14]">
                <SlidersHorizontal className="h-5 w-5" />
                Filtres & Préférences
              </SheetTitle>
            </SheetHeader>
            {filterFieldsContent}
            <div className="mt-6">
              <Button
                className="w-full bg-[#141414] py-3 text-sm font-bold text-white hover:bg-black"
                onClick={() => setMobileFilterOpen(false)}
              >
                Afficher les {results.length} produit{results.length > 1 ? "s" : ""}
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <p className="text-xs font-bold text-muted-foreground">
          <span className="text-[#111111]">{results.length}</span> produit{results.length > 1 ? "s" : ""}
        </p>

        <div className="w-36">
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger
              className="h-8 rounded-md border-[#d8d4ca] text-xs"
              aria-label="Trier les produits"
            >
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pertinence">Pertinence</SelectItem>
              <SelectItem value="prix_asc">Prix croissant</SelectItem>
              <SelectItem value="prix_desc">Prix décroissant</SelectItem>
              <SelectItem value="nom">Nom (A → Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* Barre latérale de filtres Desktop uniquement (lg:block) */}
        <aside aria-label="Filtres" className="hidden lg:sticky lg:top-40 lg:block lg:self-start">
          <Reveal direction="left">
            <div className="rounded-md border border-[#e6e3db] bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-base font-extrabold text-[#8a6a14]">
                <SlidersHorizontal className="h-4.5 w-4.5" aria-hidden="true" />
                Filtres
              </p>

              <Separator className="my-4" />

              {filterFieldsContent}
            </div>
          </Reveal>
        </aside>

        {/* Liste des Résultats */}
        <div>
          {/* Barre de tri Desktop */}
          <div className="hidden lg:block">
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
                  <Label htmlFor="filter-sort-desktop" className="whitespace-nowrap text-sm">
                    Trier par
                  </Label>
                  <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
                    <SelectTrigger
                      id="filter-sort-desktop"
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
          </div>

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
            <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3">
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
