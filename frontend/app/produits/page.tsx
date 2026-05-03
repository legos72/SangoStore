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
  const searchParams   = useSearchParams();
  const initialCountry = searchParams.get("country") || undefined;

  const [filters, setFilters]     = useState<ProductFilters>({ countryCode: initialCountry, sortBy: "newest" });
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
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Tous les produits</h1>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          {loading
            ? "Chargement…"
            : error
            ? "Erreur de chargement"
            : `${total} produit${total !== 1 ? "s" : ""} disponible${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filters toggle + view switcher */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="btn-secondary text-sm gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {filtersOpen ? "Masquer les filtres" : "Afficher les filtres"}
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={cn("p-2 rounded-lg transition-colors", view === "grid" ? "bg-orange-100 text-orange-600" : "text-gray-400 hover:bg-gray-100")}
            aria-label="Vue grille"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={cn("p-2 rounded-lg transition-colors", view === "list" ? "bg-orange-100 text-orange-600" : "text-gray-400 hover:bg-gray-100")}
            aria-label="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {filtersOpen && (
        <div className="card p-5 mb-6 animate-fade-in">
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
