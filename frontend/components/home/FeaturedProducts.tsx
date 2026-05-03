"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, X, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { COUNTRIES } from "@/lib/countries";
import { CATEGORY_LABELS, CATEGORY_ICONS, cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { ProductCategory, Product } from "@/lib/types";

const CATEGORY_KEYS: { value: ProductCategory | "all"; icon: string }[] = [
  { value: "all",          icon: "🛍️" },
  { value: "electronique", icon: "📱" },
  { value: "mode",         icon: "👗" },
  { value: "alimentation", icon: "🥘" },
  { value: "beaute",       icon: "💄" },
  { value: "maison",       icon: "🏠" },
  { value: "sante",        icon: "💊" },
  { value: "sport",        icon: "⚽" },
  { value: "jouets",       icon: "🧸" },
  { value: "auto",         icon: "🚗" },
  { value: "autre",        icon: "📦" },
];

function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "right" ? 220 : -220, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center">
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-xl" />
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 hover:shadow-md active:scale-95 transition-all duration-150"
        aria-label="Défiler à gauche"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
      </button>

      <div
        ref={ref}
        className="flex items-center gap-2 overflow-x-auto scroll-smooth px-8"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 z-20 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 hover:shadow-md active:scale-95 transition-all duration-150"
        aria-label="Défiler à droite"
      >
        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
      </button>
    </div>
  );
}

export function FeaturedProducts() {
  const { locale } = useI18n();
  const f = translations.filter;
  const h = translations.home;

  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [activeCountry, setActiveCountry]   = useState<string | null>(null);
  const [filtered, setFiltered]             = useState<Product[]>([]);
  const [totalCount, setTotalCount]         = useState(0);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    api.products.list({
      category: activeCategory !== "all" ? activeCategory : undefined,
      country:  activeCountry ?? undefined,
      sortBy:   "newest",
    } as any)
      .then((res: any) => {
        const items = (res.data ?? []).slice(0, 16).map(apiToProduct);
        setFiltered(items);
        setTotalCount(res.pagination?.total ?? items.length);
      })
      .catch(() => {
        setFiltered([]);
        setTotalCount(0);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, activeCountry]);

  const hasFilters = activeCategory !== "all" || activeCountry !== null;

  // Chip disabled style during loading
  const chipDisabled = loading ? "opacity-60 pointer-events-none" : "";

  return (
    <section className="py-5 sm:py-12 bg-white">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-3 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">{t(h.featured, locale)}</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
              {t(h.featuredSub, locale)}
              {hasFilters && !loading && !error && (
                <span className="ml-2 inline-flex items-center bg-orange-100 text-orange-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {filtered.length < totalCount
                    ? `${filtered.length} / ${totalCount} résultats`
                    : `${totalCount} résultat${totalCount !== 1 ? "s" : ""}`}
                </span>
              )}
            </p>
          </div>
          <Link href="/produits" className="btn-outline-orange text-sm hidden sm:flex">
            {t(h.seeAll, locale)} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Filter panel */}
        <div className="mb-4 sm:mb-8 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Category row */}
          <div className="px-3 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 border-b border-gray-50">
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-[0.12em] mb-2 sm:mb-3 flex items-center gap-1.5">
              <span className="w-1 h-2.5 sm:h-3 rounded-full bg-orange-400 inline-block" />
              {t(f.category, locale)}
            </p>
            <ScrollRow>
              {CATEGORY_KEYS.map(({ value, icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={cn(
                    "inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 select-none",
                    chipDisabled,
                    activeCategory === value
                      ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md shadow-orange-200 scale-[1.03]"
                      : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <span className="text-sm sm:text-base leading-none">{icon}</span>
                  <span>{value === "all" ? t(f.all, locale) : CATEGORY_LABELS[value as ProductCategory]}</span>
                </button>
              ))}
            </ScrollRow>
          </div>

          {/* Country row */}
          <div className="px-3 sm:px-5 pt-2.5 sm:pt-3.5 pb-3 sm:pb-4">
            <p className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-[0.12em] mb-2 sm:mb-3 flex items-center gap-1.5">
              <span className="w-1 h-2.5 sm:h-3 rounded-full bg-blue-400 inline-block" />
              {t(f.country, locale)}
            </p>
            <ScrollRow>
              <button
                onClick={() => setActiveCountry(null)}
                className={cn(
                  "inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 select-none",
                  chipDisabled,
                  activeCountry === null
                    ? "bg-gray-900 text-white shadow-md shadow-gray-300 scale-[1.03]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <span className="text-sm sm:text-base leading-none">🌍</span>
                <span>{t(f.allCountries, locale)}</span>
              </button>

              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => setActiveCountry(activeCountry === country.code ? null : country.code)}
                  className={cn(
                    "inline-flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 select-none",
                    chipDisabled,
                    activeCountry === country.code
                      ? "bg-gray-900 text-white shadow-md shadow-gray-300 scale-[1.03]"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <span className="text-sm sm:text-base leading-none">{country.flag}</span>
                  <span>{country.name}</span>
                </button>
              ))}
            </ScrollRow>
          </div>

          {/* Active filter tags */}
          {hasFilters && (
            <div className="flex items-center flex-wrap gap-2 px-4 sm:px-5 py-2.5 bg-orange-50/60 border-t border-orange-100">
              <span className="text-[11px] text-orange-400 font-semibold">{t(f.activeFilters, locale)} :</span>
              {activeCategory !== "all" && (
                <span className="inline-flex items-center gap-1.5 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {CATEGORY_ICONS[activeCategory as ProductCategory]} {CATEGORY_LABELS[activeCategory as ProductCategory]}
                  <button onClick={() => setActiveCategory("all")} className="ml-0.5 opacity-80 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {activeCountry && (
                <span className="inline-flex items-center gap-1.5 bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                  {COUNTRIES.find(c => c.code === activeCountry)?.flag}{" "}
                  {COUNTRIES.find(c => c.code === activeCountry)?.name}
                  <button onClick={() => setActiveCountry(null)} className="ml-0.5 opacity-80 hover:opacity-100 transition-opacity">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={() => { setActiveCategory("all"); setActiveCountry(null); }}
                className="text-xs text-orange-500 hover:text-orange-700 font-semibold underline underline-offset-2 transition-colors ml-1"
              >
                {t(f.clearAll, locale)}
              </button>
            </div>
          )}
        </div>

        {/* Skeleton loading */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          /* Error state */
          <div className="text-center py-10 sm:py-16 bg-red-50 rounded-2xl border border-red-100">
            <AlertCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
            <p className="text-gray-600 font-semibold mb-1">Impossible de charger les produits</p>
            <p className="text-gray-400 text-sm mb-4">Vérifiez votre connexion et réessayez.</p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveCountry(null); }}
              className="btn-primary text-sm inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Réessayer
            </button>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-10 sm:py-16 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-500 font-medium">{t(f.noProducts, locale)}</p>
            <button
              onClick={() => { setActiveCategory("all"); setActiveCountry(null); }}
              className="btn-primary mt-4 text-sm"
            >
              {t(f.reset, locale)}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filtered.map(product => (
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
