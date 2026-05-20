"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product } from "@/lib/types";

const PER_PAGE = 4;

export function FeaturedProducts() {
  const { locale } = useI18n();
  const h = translations.home;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [page, setPage]         = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.products.list({ sortBy: "newest" } as any)
      .then((res: any) => {
        setProducts((res.data ?? []).slice(0, 16).map(apiToProduct));
      })
      .catch(() => {
        setProducts([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalPages  = Math.ceil(products.length / PER_PAGE);
  const pageSlice   = products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  function goTo(p: number) {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  }

  return (
    <section className="py-5 sm:py-10 bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: "#F59E0B" }}>
              Produits tendances
            </p>
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">
              Les articles les plus populaires
            </h2>
          </div>
          <Link href="/produits" className="btn-outline-orange text-sm hidden sm:flex">
            {t(h.seeAll, locale)} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10 sm:py-16 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-1">Impossible de charger les produits</p>
            <p className="text-gray-400 text-sm mb-4">Vérifiez votre connexion et réessayez.</p>
            <button
              onClick={() => { setLoading(true); setError(false); }}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 sm:py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">Aucun produit disponible</p>
          </div>
        ) : (
          <>
            {/* ── Desktop : grille paginée 4 colonnes ── */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {pageSlice.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ── Mobile : grille 2 colonnes, tous les produits ── */}
            <div className="grid grid-cols-2 gap-2.5 sm:hidden">
              {products.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* ── Pagination desktop ── */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 0}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                    style={{
                      background: i === page ? "#B8860B" : "#D1D5DB",
                      transform: i === page ? "scale(1.3)" : "scale(1)",
                    }}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}

                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages - 1}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Voir tout — mobile */}
            <div className="sm:hidden mt-5 text-center">
              <Link href="/produits" className="btn-outline-orange">
                {t(h.seeAll, locale)} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
