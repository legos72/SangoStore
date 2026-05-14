"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product } from "@/lib/types";

export function FeaturedProducts() {
  const { locale } = useI18n();
  const h = translations.home;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);

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

  return (
    <section className="py-5 sm:py-10 bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-3 sm:mb-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: "#F59E0B" }}>Produits tendances</p>
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Les articles les plus populaires</h2>
          </div>
          <Link href="/produits" className="btn-outline-orange text-sm hidden sm:flex">
            {t(h.seeAll, locale)} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Skeleton loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="sm:hidden mt-6 text-center">
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
