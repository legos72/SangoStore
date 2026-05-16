"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Grid3x3, List, SlidersHorizontal, AlertCircle, RefreshCw,
  X, Search, Phone,
} from "lucide-react";
import { SearchAndFilter } from "@/components/product/SearchAndFilter";
import { CountryFilter } from "@/components/product/CountryFilter";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { ProductFilters, Product, ProductCategory } from "@/lib/types";
import { cn, CATEGORY_LABELS } from "@/lib/utils";

const SUPPORT_WHATSAPP = "221786863969";
const SUPPORT_PHONE    = "+221 78 686 39 69";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

const SUBCATEGORIES: Record<string, string[]> = {
  "mode_femme":    ["Sacs", "Chaussures", "Bijoux", "Robes", "Talons", "Vêtements", "Montres", "Accessoires", "Lunettes", "Parfums", "Maquillage"],
  "mode_homme":    ["Sneakers", "Chaussures", "Souliers", "Chemises", "Pantalons", "T-shirts", "Vestes", "Montres", "Ceintures", "Lunettes", "Accessoires"],
  "mode":          ["Mode Africaine", "Mode Femme", "Mode Homme", "Accessoires"],
  "maison":        ["Cuisine", "Décoration", "Éclairage", "Meubles", "Rideaux", "Literie", "Électroménager", "Organisation"],
  "alimentation":  ["Alimentaire", "Boissons", "Épices", "Snacks", "Bio", "Conserves", "Produits locaux"],
  "beaute":        ["Soins", "Maquillage", "Parfums", "Cheveux", "Corps"],
  "sport":         ["Fitness", "Football", "Basketball", "Tennis", "Natation", "Vélo", "Camping"],
  "electronique":  ["Smartphones", "Ordinateurs", "TV & Audio", "Gaming", "Accessoires"],
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Récents"    },
  { value: "price_asc",  label: "Prix ↑"     },
  { value: "price_desc", label: "Prix ↓"     },
  { value: "rating",     label: "Top notés"  },
];

function countActive(f: ProductFilters) {
  return [f.countryCode, f.category, f.minPrice, f.maxPrice].filter(v => v != null).length;
}

function ProduitsContent() {
  const searchParams    = useSearchParams();
  const initialCountry  = searchParams.get("country")  || undefined;
  const initialSearch   = searchParams.get("search")   || undefined;
  const initialCategory = (searchParams.get("category") || undefined) as ProductFilters["category"];
  const genre           = searchParams.get("genre")    || undefined;

  const [filters, setFilters] = useState<ProductFilters>({
    countryCode: initialCountry,
    search:      initialSearch,
    category:    initialCategory,
    sortBy:      "newest",
  });
  const [activeSub, setActiveSub]     = useState<string | undefined>(undefined);
  const [view, setView]               = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [products, setProducts]       = useState<Product[]>([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(false);

  const subKey  = filters.category ? (genre ? `${filters.category}_${genre}` : filters.category) : undefined;
  const subcats = subKey ? SUBCATEGORIES[subKey] : undefined;

  const pageTitle = genre === "femme" ? "Mode Femme"
    : genre === "homme" ? "Mode Homme"
    : filters.category ? (CATEGORY_LABELS[filters.category] ?? "Produits")
    : filters.search ? `"${filters.search}"`
    : "Tous les produits";

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => { setActiveSub(undefined); }, [filters.category, genre]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.products.list({
      search:   activeSub || filters.search,
      country:  filters.countryCode,
      category: filters.category,
      sortBy:   filters.sortBy,
      minPrice: filters.minPrice?.toString(),
      maxPrice: filters.maxPrice?.toString(),
    } as any)
      .then((res: any) => {
        setProducts((res.data ?? []).map(apiToProduct));
        setTotal(res.pagination?.total ?? 0);
      })
      .catch(() => { setProducts([]); setError(true); })
      .finally(() => setLoading(false));
  }, [filters, activeSub]);

  const fCount = countActive(filters);

  return (
    <div className="min-h-screen bg-[#F7F4EE]">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* ── Page header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {pageTitle}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
              {loading ? "Chargement…" : error ? "Erreur de chargement" : `${total} produit${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          {/* Desktop: view toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView("grid")} aria-label="Vue grille"
              className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-white shadow-sm text-orange-600" : "text-gray-400 hover:text-gray-600")}>
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} aria-label="Vue liste"
              className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-white shadow-sm text-orange-600" : "text-gray-400 hover:text-gray-600")}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── MOBILE compact bar ─────────────────────────────────── */}
        <div className="flex sm:hidden items-center gap-2 mb-3">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher…"
              value={filters.search || ""}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {filters.search && (
              <button onClick={() => setFilters(f => ({ ...f, search: undefined }))} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-shrink-0",
              fCount > 0
                ? "bg-orange-50 border-orange-300 text-orange-700"
                : "bg-white border-gray-200 text-gray-600"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs">Filtres</span>
            {fCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {fCount}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1 flex-shrink-0">
            <button onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-orange-500 text-white" : "text-gray-400")}>
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-orange-500 text-white" : "text-gray-400")}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile: active filter chips */}
        {fCount > 0 && (
          <div className="flex sm:hidden flex-wrap gap-1.5 mb-3">
            {filters.countryCode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-semibold">
                {filters.countryCode}
                <button onClick={() => setFilters(f => ({ ...f, countryCode: undefined }))}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-semibold">
                {CATEGORY_LABELS[filters.category] ?? filters.category}
                <button onClick={() => setFilters(f => ({ ...f, category: undefined }))}><X className="w-3 h-3" /></button>
              </span>
            )}
            {(filters.minPrice != null || filters.maxPrice != null) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-semibold">
                Prix filtré
                <button onClick={() => setFilters(f => ({ ...f, minPrice: undefined, maxPrice: undefined }))}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button
              onClick={() => setFilters(f => ({ sortBy: f.sortBy }))}
              className="text-[11px] text-gray-400 underline underline-offset-2"
            >
              Effacer tout
            </button>
          </div>
        )}

        {/* ── DESKTOP: controls + filter panel ───────────────────── */}
        <div className="hidden sm:block mb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all",
                filtersOpen
                  ? "bg-orange-50 border-orange-300 text-orange-700"
                  : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:bg-orange-50"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              {filtersOpen ? "Masquer les filtres" : "Filtres"}
              {fCount > 0 && !filtersOpen && (
                <span className="ml-1 w-5 h-5 bg-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {fCount}
                </span>
              )}
            </button>
          </div>
          {filtersOpen && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-6 animate-fade-in !overflow-visible">
              <SearchAndFilter filters={filters} onChange={setFilters} totalResults={total} />
            </div>
          )}
        </div>

        {/* ── Support mini-strip ──────────────────────────────────── */}
        <div className="flex items-center justify-between bg-white border border-orange-100/80 rounded-2xl px-3 sm:px-4 py-2.5 mb-4 shadow-[0_1px_6px_rgba(249,115,22,0.06)]">
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="w-7 h-7 rounded-xl bg-orange-50 flex items-center justify-center text-sm">🎧</div>
              <span className="absolute -bottom-0.5 -right-0.5 flex">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 border border-white" />
              </span>
            </div>
            <div>
              <p className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest leading-none">Support en ligne</p>
              <p className="text-xs text-gray-700 font-medium mt-px">Besoin d&apos;aide pour commander ?</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <a
              href={`https://wa.me/${SUPPORT_WHATSAPP}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#22c55e" }}
            >
              💬 WhatsApp
            </a>
            <a
              href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-gray-600 bg-gray-50 border border-gray-200 hover:border-orange-300 transition-colors"
            >
              <Phone className="w-3 h-3" /> Appeler
            </a>
          </div>
        </div>

        {/* ── Sous-catégories ─────────────────────────────────────── */}
        {subcats && subcats.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-4" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveSub(undefined)}
              className={cn(
                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                !activeSub
                  ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
              )}
            >
              Tout voir
            </button>
            {subcats.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSub(activeSub === sub ? undefined : sub)}
                className={cn(
                  "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                  activeSub === sub
                    ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                )}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* ── Products ────────────────────────────────────────────── */}
        {loading && (
          <div className={cn("grid gap-2.5 sm:gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1")}>
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} variant={view} />)}
          </div>
        )}

        {!loading && error && (
          <div className="bg-white rounded-2xl p-10 text-center border border-red-100 shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-4">Impossible de charger les produits</p>
            <button onClick={() => setFilters({ sortBy: "newest" })} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600 font-semibold mb-1">Aucun produit trouvé</p>
            <p className="text-gray-400 text-sm">Modifiez vos filtres ou réinitialisez</p>
            <button onClick={() => setFilters({ sortBy: "newest" })} className="btn-primary mt-4 text-sm">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className={cn("grid gap-2.5 sm:gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1")}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} variant={view} />
            ))}
          </div>
        )}
      </div>

      {/* ── MOBILE FILTER DRAWER ───────────────────────────────── */}
      <div className={cn(
        "fixed inset-0 z-50 sm:hidden transition-all duration-300",
        drawerOpen ? "pointer-events-auto" : "pointer-events-none"
      )}>
        {/* Backdrop */}
        <div
          className={cn("absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        {/* Sliding panel */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out flex flex-col",
            drawerOpen ? "translate-y-0" : "translate-y-full"
          )}
          style={{ maxHeight: "88vh" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Drawer header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Filtres & Tri</h3>
              {fCount > 0 && (
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {fCount} actif{fCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable filter content */}
          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">

            {/* Sort */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Trier par</p>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters(f => ({ ...f, sortBy: opt.value as ProductFilters["sortBy"] }))}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all",
                      filters.sortBy === opt.value
                        ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-200"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Country */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pays d&apos;origine</p>
              <CountryFilter
                selected={filters.countryCode || null}
                onChange={code => setFilters(f => ({ ...f, countryCode: code || undefined }))}
              />
            </div>

            {/* Category */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Catégorie</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters(f => ({ ...f, category: undefined }))}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left",
                    !filters.category ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-600 border-gray-200"
                  )}
                >
                  🛍️ Toutes
                </button>
                {CATEGORIES.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilters(f => ({ ...f, category: value }))}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left",
                      filters.category === value ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-600 border-gray-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Prix (FCFA)</p>
              <div className="flex items-center gap-3">
                <input
                  type="number" placeholder="Min" min={0}
                  value={filters.minPrice || ""}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value ? +e.target.value : undefined }))}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <span className="text-gray-300 font-light text-lg">—</span>
                <input
                  type="number" placeholder="Max" min={0}
                  value={filters.maxPrice || ""}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value ? +e.target.value : undefined }))}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="border-t border-gray-100 px-5 py-4 flex gap-3 flex-shrink-0">
            <button
              onClick={() => setFilters(f => ({ sortBy: f.sortBy }))}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
            <button
              onClick={() => setDrawerOpen(false)}
              className="flex-[2] py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-sm shadow-orange-200"
            >
              Voir {loading ? "…" : `${total} produit${total !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProduitsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Chargement…</p>
      </div>
    }>
      <ProduitsContent />
    </Suspense>
  );
}
