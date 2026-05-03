"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Grid3x3, List, SlidersHorizontal, AlertCircle, RefreshCw } from "lucide-react";
import { SearchAndFilter } from "@/components/product/SearchAndFilter";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { ProductFilters, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

function ProduitsContent() {
  const searchParams    = useSearchParams();
  const initialCountry  = searchParams.get("country")  || undefined;
  const initialSearch   = searchParams.get("search")   || undefined;
  const initialCategory = (searchParams.get("category") || undefined) as ProductFilters["category"];

  const [filters, setFilters] = useState<ProductFilters>({
    countryCode: initialCountry,
    search:      initialSearch,
    category:    initialCategory,
    sortBy:      "newest",
  });
  const [view, setView]           = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [products, setProducts]   = useState<Product[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.products.list({
      search:   filters.search,
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
      .catch(() => {
        setProducts([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="page-container py-6 sm:py-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            {filters.search ? `Résultats pour "${filters.search}"` : "Tous les produits"}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {loading
              ? "Chargement…"
              : error
              ? "Erreur de chargement"
              : `${total} produit${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
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
            <span className="hidden sm:inline">{filtersOpen ? "Masquer" : "Filtres"}</span>
          </button>

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-white shadow-sm text-orange-600" : "text-gray-400 hover:text-gray-600")}
              aria-label="Vue grille"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-white shadow-sm text-orange-600" : "text-gray-400 hover:text-gray-600")}
              aria-label="Vue liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters panel */}
      {filtersOpen && (
        <div className="card p-4 sm:p-5 mb-6 animate-fade-in">
          <SearchAndFilter filters={filters} onChange={setFilters} totalResults={total} />
        </div>
      )}

      {/* Skeleton loading */}
      {loading && (
        <div className={cn(
          "grid gap-4",
          view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        )}>
          {Array.from({ length: view === "grid" ? 12 : 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} variant={view} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="card p-10 sm:p-16 text-center">
          <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Impossible de charger les produits</h3>
          <p className="text-gray-500 text-sm mb-4">Vérifiez votre connexion et réessayez.</p>
          <button
            onClick={() => setFilters({ sortBy: "newest" })}
            className="btn-primary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && products.length === 0 && (
        <div className="card p-10 sm:p-16 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
          <p className="text-gray-500 text-sm">Essayez de modifier vos filtres ou de changer de pays.</p>
          <button onClick={() => setFilters({ sortBy: "newest" })} className="btn-primary mt-4">
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Product grid/list */}
      {!loading && !error && products.length > 0 && (
        <div className={cn(
          "grid gap-4",
          view === "grid" ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"
        )}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              variant={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProduitsPage() {
  return (
    <Suspense fallback={<div className="page-container py-16 text-center text-gray-400">Chargement…</div>}>
      <ProduitsContent />
    </Suspense>
  );
}
