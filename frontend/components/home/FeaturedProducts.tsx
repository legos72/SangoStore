"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, X, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { FlagImage } from "@/components/ui/FlagImage";
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
    ref.current.scrollBy({ left: dir === "right" ? 180 : -180, behavior: "smooth" });
  }

  return (
    <div className="relative flex items-center">
      {/* Fades — desktop only */}
      <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50/90 to-transparent z-10 pointer-events-none" />
      <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50/90 to-transparent z-10 pointer-events-none" />

      {/* Arrows — desktop only, minimal */}
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-0 z-20 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center hover:bg-orange-50 hover:border-orange-300 active:scale-90 transition-all duration-150"
        aria-label="Défiler à gauche"
      >
        <ChevronLeft className="w-3 h-3 text-gray-500" />
      </button>

      <div
        ref={ref}
        className="flex items-center gap-1.5 overflow-x-auto scroll-smooth sm:px-6"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>

      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-0 z-20 w-5 h-5 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center hover:bg-orange-50 hover:border-orange-300 active:scale-90 transition-all duration-150"
        aria-label="Défiler à droite"
      >
        <ChevronRight className="w-3 h-3 text-gray-500" />
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
        <div className="mb-3 sm:mb-7 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50/60 overflow-hidden">

          {/* Category row */}
          <div className="px-2 sm:px-4 py-1.5 sm:py-2.5 border-b border-gray-100/80">
            {/* Label — desktop only */}
            <div className="hidden sm:flex items-center gap-2 mb-1.5">
              <span className="w-[3px] h-3 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {t(f.category, locale)}
              </span>
            </div>
            <ScrollRow>
              {CATEGORY_KEYS.map(({ value, icon }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-150 select-none",
                    chipDisabled,
                    activeCategory === value
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-orange-300 hover:text-orange-600"
                  )}
                >
                  <span className="text-[11px] sm:text-[12px] leading-none">{icon}</span>
                  <span>{value === "all" ? t(f.all, locale) : CATEGORY_LABELS[value as ProductCategory]}</span>
                </button>
              ))}
            </ScrollRow>
          </div>

          {/* Country row */}
          <div className="px-2 sm:px-4 py-1.5 sm:py-2.5">
            {/* Label — desktop only */}
            <div className="hidden sm:flex items-center gap-2 mb-1.5">
              <span className="w-[3px] h-3 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {t(f.country, locale)}
              </span>
            </div>
            <ScrollRow>
              <button
                onClick={() => setActiveCountry(null)}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-150 select-none",
                  chipDisabled,
                  activeCountry === null
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-800"
                )}
              >
                <span className="text-[11px] leading-none">🌍</span>
                <span>{t(f.allCountries, locale)}</span>
              </button>

              {COUNTRIES.map(country => (
                <button
                  key={country.code}
                  onClick={() => setActiveCountry(activeCountry === country.code ? null : country.code)}
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-150 select-none",
                    chipDisabled,
                    activeCountry === country.code
                      ? "bg-gray-800 text-white"
                      : "bg-white text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-800"
                  )}
                >
                  <FlagImage code={country.code} size="sm" />
                  <span>{country.name}</span>
                </button>
              ))}
            </ScrollRow>
          </div>

          {/* Active filter tags */}
          {hasFilters && (
            <div className="flex items-center flex-wrap gap-1 px-2 sm:px-4 py-1.5 bg-orange-50 border-t border-orange-100">
              {activeCategory !== "all" && (
                <span className="inline-flex items-center gap-0.5 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  {CATEGORY_ICONS[activeCategory as ProductCategory]} {CATEGORY_LABELS[activeCategory as ProductCategory]}
                  <button onClick={() => setActiveCategory("all")} className="opacity-75 hover:opacity-100 ml-0.5">
                    <X className="w-2 h-2" />
                  </button>
                </span>
              )}
              {activeCountry && (
                <span className="inline-flex items-center gap-0.5 bg-gray-700 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <FlagImage code={activeCountry} size="sm" />
                  {COUNTRIES.find(c => c.code === activeCountry)?.name}
                  <button onClick={() => setActiveCountry(null)} className="opacity-75 hover:opacity-100 ml-0.5">
                    <X className="w-2 h-2" />
                  </button>
                </span>
              )}
              <button
                onClick={() => { setActiveCategory("all"); setActiveCountry(null); }}
                className="text-[10px] text-orange-500 hover:text-orange-700 font-semibold underline underline-offset-2 transition-colors ml-0.5"
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
