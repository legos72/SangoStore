"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TriangleAlert, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";
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

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const pageSlice  = products.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  function goTo(p: number) {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  }

  return (
    <section className="py-8 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6 sm:mb-8">
          <SectionHeader
            label="Populaires"
            title="Les articles les plus populaires"
            subtitle="Sélectionnés par nos acheteurs de la diaspora"
            href="/produits"
            hrefLabel={t(h.seeAll, locale)}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50/60 rounded-2xl border border-red-100">
            <TriangleAlert className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-gray-700 font-semibold mb-1">Impossible de charger les produits</p>
            <p className="text-gray-400 text-sm mb-5">Vérifiez votre connexion et réessayez.</p>
            <button
              onClick={() => { setLoading(true); setError(false); }}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-cream-100 rounded-2xl border border-cream-300">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">Aucun produit disponible</p>
          </div>
        ) : (
          <>
            {/* Desktop : grille paginée 4 colonnes */}
            <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {pageSlice.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Mobile : 2 colonnes */}
            <div className="grid grid-cols-2 gap-2.5 sm:hidden">
              {products.slice(0, 8).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination desktop */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 0}
                  className="w-9 h-9 rounded-full border-[1.5px] border-[#EAE2D2] flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: i === page ? 28 : 9,
                      height: 9,
                      background: i === page
                        ? "linear-gradient(90deg, #D4961E, #B87814)"
                        : "#E5E7EB",
                    }}
                    aria-label={`Page ${i + 1}`}
                  />
                ))}

                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages - 1}
                  className="w-9 h-9 rounded-full border-[1.5px] border-[#EAE2D2] flex items-center justify-center text-gray-400 hover:border-orange-400 hover:text-orange-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Voir tout mobile */}
            <div className="sm:hidden mt-6 text-center">
              <Link href="/produits" className="btn-outline-orange">
                {t(h.seeAll, locale)}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
