"use client";

import { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Grid3x3, List, SlidersHorizontal, AlertCircle, RefreshCw,
  X, Search, Zap, Truck, Star, ShieldCheck, ChevronRight,
  ArrowRight,
} from "lucide-react";
import { SearchAndFilter } from "@/components/product/SearchAndFilter";
import { CountryFilter } from "@/components/product/CountryFilter";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { ProductFilters, Product, ProductCategory } from "@/lib/types";
import { cn, CATEGORY_LABELS } from "@/lib/utils";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

// ─── Données statiques ────────────────────────────────────────────────────────

const QUICK_CATS = [
  { id: "mode"        as ProductCategory, label: "Mode",         emoji: "👗" },
  { id: "electronique"as ProductCategory, label: "Électronique", emoji: "📱" },
  { id: "beaute"      as ProductCategory, label: "Beauté",       emoji: "💄" },
  { id: "maison"      as ProductCategory, label: "Maison",       emoji: "🏠" },
  { id: "alimentation"as ProductCategory, label: "Alimentaire",  emoji: "🥘" },
  { id: "sport"       as ProductCategory, label: "Sport",        emoji: "⚽" },
  { id: "jouets"      as ProductCategory, label: "Enfants",      emoji: "🧸" },
  { id: "sante"       as ProductCategory, label: "Santé",        emoji: "💊" },
  { id: "auto"        as ProductCategory, label: "Auto",         emoji: "🚗" },
];

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

// Mapping sous-catégories "mode" → seller_category slug en base
// Les autres sous-cats (Smartphones, Maquillage…) passent en search texte
const SUBCAT_SELLER_MAP: Record<string, string> = {
  "Mode Africaine": "mode-africaine",
  "Mode Femme":     "mode-femme",
  "Mode Homme":     "mode-homme",
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Récents",   icon: "✨" },
  { value: "price_asc",  label: "Prix ↑",    icon: "💰" },
  { value: "price_desc", label: "Prix ↓",    icon: "💸" },
  { value: "rating",     label: "Top notés", icon: "⭐" },
];

function countActive(f: ProductFilters) {
  return [f.countryCode, f.category, f.minPrice, f.maxPrice].filter(v => v != null).length;
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  const items = [
    { icon: <Truck className="w-3.5 h-3.5" />,      text: "Livraison Bangui",     sub: "4–8 semaines",          color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { icon: <ShieldCheck className="w-3.5 h-3.5" />, text: "Paiement sécurisé",    sub: "Orange Money & Cash",   color: "text-blue-600",    bg: "bg-blue-50 border-blue-100" },
    { icon: <Star className="w-3.5 h-3.5" />,        text: "Vendeurs vérifiés",    sub: "Qualité contrôlée",     color: "text-amber-600",   bg: "bg-amber-50 border-amber-100" },
    { icon: <Zap className="w-3.5 h-3.5" />,         text: "5 000+ produits",      sub: "Mis à jour chaque jour",color: "text-violet-600",  bg: "bg-violet-50 border-violet-100" },
  ];
  return (
    <div className="grid grid-cols-4 gap-2.5 mb-5">
      {items.map((item, i) => (
        <div key={i} className={cn("flex items-center gap-2 rounded-xl px-3 py-2.5 border", item.bg)}>
          <div className={cn("flex-shrink-0", item.color)}>{item.icon}</div>
          <div className="min-w-0">
            <p className={cn("text-[11px] font-bold leading-tight", item.color)}>{item.text}</p>
            <p className="text-[10px] text-gray-400 leading-tight truncate">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page Hero ────────────────────────────────────────────────────────────────

function PageHero({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5 select-none cursor-pointer"
      style={{
        background: "linear-gradient(135deg, #1a0d00 0%, #2d1800 40%, #1a0d00 75%, #0f0800 100%)",
        minHeight: "clamp(140px, 14vw, 200px)",
      }}
      onClick={onDiscover}
    >
      {/* Lueur dorée radiale */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 80% 50%, rgba(212,150,30,0.20) 0%, transparent 55%), radial-gradient(ellipse at 10% 80%, rgba(212,150,30,0.10) 0%, transparent 45%)",
        }}
      />
      {/* Grille de points décorative */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 grid grid-cols-6 gap-1.5 opacity-15 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-amber-300" />
        ))}
      </div>
      {/* Ligne dorée bas */}
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(212,150,30,0.4), transparent)" }} />

      <div className="relative z-10 flex items-center justify-between h-full px-6 sm:px-8 py-6 gap-4">
        <div>
          <span
            className="inline-flex items-center gap-1.5 text-[9px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full mb-3"
            style={{ background: "rgba(212,150,30,0.15)", border: "1px solid rgba(212,150,30,0.35)", color: "#D4961E" }}
          >
            ✦ MARKETPLACE AFRICAINE PREMIUM
          </span>
          <h1 className="text-2xl sm:text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight mb-1.5">
            Produits sélectionnés<br />
            <span style={{ color: "#D4961E" }}>pour la diaspora</span>
          </h1>
          <p className="text-white/55 text-xs sm:text-sm mb-4 max-w-xs">
            Vêtements, électronique, alimentation — expédiés directement à Bangui.
          </p>
          <button
            onClick={e => { e.stopPropagation(); onDiscover(); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#1a0f00] transition-all hover:brightness-105 active:scale-[0.97]"
            style={{ background: "linear-gradient(135deg, #F59E0B, #D4961E)", boxShadow: "0 4px 18px rgba(212,150,30,0.4)" }}
          >
            Découvrir <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Stats */}
        <div className="hidden xl:flex flex-col gap-3 flex-shrink-0 text-right">
          {[
            { n: "5k+",  label: "Produits"    },
            { n: "200+", label: "Vendeurs"     },
            { n: "4.8★", label: "Note moy."   },
          ].map(s => (
            <div key={s.label}>
              <p className="text-2xl font-black" style={{ color: "#D4961E" }}>{s.n}</p>
              <p className="text-[10px] text-white/45 font-bold uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Flash Sale Section ───────────────────────────────────────────────────────

function FlashSaleSection({ products }: { products: Product[] }) {
  if (products.length < 2) return null;
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-gray-900 leading-none">Flash Sale</h2>
            <p className="text-[10px] text-red-500 font-semibold">Prix réduits — offres limitées</p>
          </div>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-orange-600">
          {products.length} offre{products.length > 1 ? "s" : ""} <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
      <div
        className="-mx-3 sm:mx-0 px-3 sm:px-0 flex gap-3 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {products.slice(0, 8).map(p => (
          <div key={p.id} className="flex-shrink-0 w-40 sm:w-48">
            <ProductCard product={p} variant="grid" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────

function PromoBannerStrip({ onClick }: { onClick: () => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3 mb-5">
      {/* Livraison */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{ background: "linear-gradient(135deg, #0f3320 0%, #1a4a2e 100%)", minHeight: 68 }}
        onClick={onClick}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 85% 50%, rgba(52,211,153,0.18) 0%, transparent 60%)" }} />
        <div className="relative z-10 flex items-center gap-3 px-5 py-4">
          <span className="text-2xl select-none">🚀</span>
          <div>
            <p className="text-sm font-extrabold text-white">Livraison express Bangui</p>
            <p className="text-[11px] text-emerald-300">Via nos transporteurs vérifiés — prix fixe</p>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-400 ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
      {/* Mode Africaine */}
      <div
        className="relative rounded-2xl overflow-hidden cursor-pointer group"
        style={{ background: "linear-gradient(135deg, #2d1500 0%, #4a2200 100%)", minHeight: 68 }}
        onClick={onClick}
      >
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 85% 50%, rgba(212,150,30,0.20) 0%, transparent 60%)" }} />
        <div className="relative z-10 flex items-center gap-3 px-5 py-4">
          <span className="text-2xl select-none">🌍</span>
          <div>
            <p className="text-sm font-extrabold text-white">Mode Africaine Premium</p>
            <p className="text-[11px]" style={{ color: "#D4961E" }}>Wax, Bazin, Boubou — nouvelle collection</p>
          </div>
          <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: "#D4961E" }} />
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ──────────────────────────────────────────────────────────

function DesktopSidebar({
  filters, onChange, total,
}: {
  filters: ProductFilters;
  onChange: (f: ProductFilters) => void;
  total: number;
}) {
  const active = countActive(filters);
  return (
    <aside className="hidden lg:block w-[248px] flex-shrink-0 self-start sticky top-20">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-orange-500" />
            <span className="text-[12px] font-extrabold text-gray-800">Filtres</span>
          </div>
          {active > 0 && (
            <button
              onClick={() => onChange({ sortBy: filters.sortBy })}
              className="text-[10px] font-bold text-red-500 hover:text-red-700 transition-colors"
            >
              Effacer ({active})
            </button>
          )}
        </div>

        <div className="p-4 space-y-5">

          {/* Search */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Rechercher</p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Titre, marque…"
                value={filters.search || ""}
                onChange={e => onChange({ ...filters, search: e.target.value || undefined })}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
              />
              {filters.search && (
                <button onClick={() => onChange({ ...filters, search: undefined })} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Sort */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Trier par</p>
            <div className="grid grid-cols-2 gap-1.5">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filters, sortBy: opt.value as ProductFilters["sortBy"] })}
                  className={cn(
                    "py-2 px-2 rounded-xl border text-[11px] font-semibold transition-all text-left",
                    filters.sortBy === opt.value
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "bg-gray-50 text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50"
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Categories */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Catégorie</p>
            <div className="space-y-0.5">
              <button
                onClick={() => onChange({ ...filters, category: undefined })}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded-xl text-[12px] font-semibold transition-all",
                  !filters.category ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                )}
              >
                🛍️ Toutes catégories
              </button>
              {CATEGORIES.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => onChange({ ...filters, category: filters.category === value ? undefined : value })}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-semibold transition-all",
                    filters.category === value ? "bg-orange-500 text-white" : "text-gray-600 hover:bg-gray-50 hover:text-orange-600"
                  )}
                >
                  <span>{label}</span>
                  {filters.category === value && <X className="w-3 h-3 opacity-60" />}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Country */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Pays d&apos;origine</p>
            <CountryFilter
              selected={filters.countryCode || null}
              onChange={code => onChange({ ...filters, countryCode: code || undefined })}
            />
          </div>

          <div className="border-t border-gray-100" />

          {/* Price */}
          <div>
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Prix (FCFA)</p>
            <div className="flex items-center gap-2">
              <input
                type="number" placeholder="Min" min={0}
                value={filters.minPrice || ""}
                onChange={e => onChange({ ...filters, minPrice: e.target.value ? +e.target.value : undefined })}
                className="flex-1 min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-orange-400 transition-all"
              />
              <span className="text-gray-300 flex-shrink-0">—</span>
              <input
                type="number" placeholder="Max" min={0}
                value={filters.maxPrice || ""}
                onChange={e => onChange({ ...filters, maxPrice: e.target.value ? +e.target.value : undefined })}
                className="flex-1 min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-[12px] focus:outline-none focus:border-orange-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <p className="text-center text-[11px] text-gray-400">
            {total > 0
              ? <><span className="font-bold text-gray-700">{total}</span> produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}</>
              : "Aucun résultat"
            }
          </p>
        </div>
      </div>
    </aside>
  );
}

// ─── Quick category pills ─────────────────────────────────────────────────────

function QuickCatPills({
  active, onSelect,
}: {
  active?: ProductCategory;
  onSelect: (c?: ProductCategory) => void;
}) {
  return (
    <div
      className="-mx-3 sm:mx-0 px-3 sm:px-0 flex gap-2 overflow-x-auto pb-1 mb-4"
      style={{ scrollbarWidth: "none" }}
    >
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border",
          !active
            ? "bg-gray-900 text-white border-gray-900 shadow-sm"
            : "bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900"
        )}
      >
        🛍️ Tout
      </button>
      {QUICK_CATS.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(active === cat.id ? undefined : cat.id)}
          className={cn(
            "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all whitespace-nowrap border",
            active === cat.id
              ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
              : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
          )}
        >
          {cat.emoji} {cat.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

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

  const productGridRef = useRef<HTMLDivElement>(null);

  const subKey  = filters.category ? (genre ? `${filters.category}_${genre}` : filters.category) : undefined;
  const subcats = subKey ? SUBCATEGORIES[subKey] : undefined;

  const pageTitle = genre === "femme" ? "Mode Femme"
    : genre === "homme" ? "Mode Homme"
    : activeSub ? activeSub
    : filters.category ? (CATEGORY_LABELS[filters.category] ?? "Produits")
    : filters.search ? `"${filters.search}"`
    : "Tous les produits";

  const hasActiveFilters = !!(filters.category || filters.countryCode || filters.search || filters.minPrice || filters.maxPrice);

  const flashProducts = useMemo(() => {
    const now = new Date();
    return products.filter(p =>
      p.promoPrice != null && p.promoPrice > 0 &&
      (p.promoEnd == null || new Date(p.promoEnd) > now)
    );
  }, [products]);

  function scrollToGrid() {
    productGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  useEffect(() => { setActiveSub(undefined); }, [filters.category, genre]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    // Résoudre le filtre pour la sous-catégorie active
    const sellerCatFromSub = activeSub ? SUBCAT_SELLER_MAP[activeSub] : undefined;
    api.products.list({
      // Si la sous-cat a un seller_category dédié (ex: "Mode Africaine" → "mode-africaine"),
      // on utilise sellerCategory. Sinon on passe en search texte (ex: "Smartphones").
      search:         sellerCatFromSub ? filters.search : (activeSub || filters.search),
      sellerCategory: sellerCatFromSub,
      country:        filters.countryCode,
      category:       filters.category,
      sortBy:         filters.sortBy,
      minPrice:       filters.minPrice?.toString(),
      maxPrice:       filters.maxPrice?.toString(),
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

      {/* ══════════════════════════════════════════════════
          MOBILE ONLY — compact bar + filter chips
      ══════════════════════════════════════════════════ */}
      <div className="lg:hidden px-3 pt-3 pb-0 space-y-2 max-w-7xl mx-auto">

        {/* Search + Filtres + Vue */}
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all flex-shrink-0",
              fCount > 0 ? "bg-orange-50 border-orange-300 text-orange-700" : "bg-white border-gray-200 text-gray-600"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs">Filtres</span>
            {fCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">{fCount}</span>
            )}
          </button>
          <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1 flex-shrink-0">
            <button onClick={() => setView("grid")} className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-orange-500 text-white" : "text-gray-400")}>
              <Grid3x3 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setView("list")} className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-orange-500 text-white" : "text-gray-400")}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {fCount > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.countryCode && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-semibold">
                {filters.countryCode}<button onClick={() => setFilters(f => ({ ...f, countryCode: undefined }))}><X className="w-3 h-3" /></button>
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-semibold">
                {CATEGORY_LABELS[filters.category] ?? filters.category}<button onClick={() => setFilters(f => ({ ...f, category: undefined }))}><X className="w-3 h-3" /></button>
              </span>
            )}
            {(filters.minPrice != null || filters.maxPrice != null) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-semibold">
                Prix filtré<button onClick={() => setFilters(f => ({ ...f, minPrice: undefined, maxPrice: undefined }))}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={() => setFilters(f => ({ sortBy: f.sortBy }))} className="text-[11px] text-gray-400 underline underline-offset-2">
              Effacer tout
            </button>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════
          MAIN LAYOUT — sidebar + content
      ══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex gap-5 py-4 sm:py-5 items-start">

          {/* ── SIDEBAR (lg+) ─────────────────────────────── */}
          <DesktopSidebar filters={filters} onChange={setFilters} total={total} />

          {/* ── CONTENT ───────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Desktop header: title + view toggle */}
            <div className="hidden sm:flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{pageTitle}</h1>
                <p className="text-gray-400 text-xs mt-0.5">
                  {loading ? "Chargement…" : error ? "Erreur de chargement" : `${total} produit${total !== 1 ? "s" : ""} trouvé${total !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                <button onClick={() => setView("grid")} aria-label="Vue grille"
                  className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button onClick={() => setView("list")} aria-label="Vue liste"
                  className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:text-gray-600")}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Collapsible filter panel (sm → lg only) */}
            <div className="hidden sm:block lg:hidden mb-4">
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
                    <span className="ml-1 w-5 h-5 bg-orange-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">{fCount}</span>
                  )}
                </button>
              </div>
              {filtersOpen && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-4 animate-fade-in !overflow-visible">
                  <SearchAndFilter filters={filters} onChange={setFilters} totalResults={total} />
                </div>
              )}
            </div>

            {/* ── Trust bar (lg+) */}
            <div className="hidden lg:block">
              <TrustBar />
            </div>

            {/* ── Hero banner (lg+, pas de filtre actif) */}
            {!hasActiveFilters && (
              <div className="hidden lg:block">
                <PageHero onDiscover={scrollToGrid} />
              </div>
            )}

            {/* ── Quick category pills (toujours visible) */}
            <QuickCatPills
              active={filters.category}
              onSelect={cat => {
                setFilters(f => ({ ...f, category: cat }));
                setActiveSub(undefined);
              }}
            />

            {/* ── Sous-catégories (si catégorie sélectionnée) */}
            {subcats && subcats.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 mb-4 -mx-3 sm:mx-0 px-3 sm:px-0" style={{ scrollbarWidth: "none" }}>
                <button
                  onClick={() => setActiveSub(undefined)}
                  className={cn(
                    "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                    !activeSub ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
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
                      activeSub === sub ? "bg-orange-500 text-white shadow-sm shadow-orange-200" : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                    )}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* ── Flash Sale section */}
            {!loading && <FlashSaleSection products={flashProducts} />}

            {/* ── Promo banner strip (sm+, sans filtre catégorie) */}
            {!filters.category && !loading && products.length > 3 && (
              <div className="hidden sm:block">
                <PromoBannerStrip onClick={scrollToGrid} />
              </div>
            )}

            {/* ── Product grid ─────────────────────────────── */}
            <div ref={productGridRef}>
              {/* Sub-header products */}
              {!loading && !error && products.length > 0 && (
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-gray-400 font-medium">
                    <span className="font-bold text-gray-700">{products.length}</span> produit{products.length > 1 ? "s" : ""}
                    {flashProducts.length > 0 && (
                      <span className="ml-2 text-red-500 font-semibold">• {flashProducts.length} en promotion</span>
                    )}
                  </p>
                </div>
              )}

              {/* Mobile title */}
              <div className="flex items-center justify-between mb-2 lg:hidden">
                <h1 className="text-lg font-extrabold text-gray-900">{pageTitle}</h1>
              </div>

              {loading && (
                <div className={cn("grid gap-2.5 sm:gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
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
                <div className={cn("grid gap-2.5 sm:gap-3 lg:gap-4", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} variant={view} />
                  ))}
                </div>
              )}
            </div>

          </div>{/* /content */}
        </div>{/* /flex */}
      </div>{/* /max-w */}

      {/* ══════════════════════════════════════════════════
          MOBILE FILTER DRAWER — inchangé
      ══════════════════════════════════════════════════ */}
      <div className={cn("fixed inset-0 z-50 lg:hidden transition-all duration-300", drawerOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div
          className={cn("absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)}
        />
        <div
          className={cn("absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out flex flex-col", drawerOpen ? "translate-y-0" : "translate-y-full")}
          style={{ maxHeight: "88vh" }}
        >
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              <h3 className="font-bold text-gray-900 text-sm">Filtres & Tri</h3>
              {fCount > 0 && <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{fCount} actif{fCount > 1 ? "s" : ""}</span>}
            </div>
            <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Trier par</p>
              <div className="grid grid-cols-2 gap-2">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters(f => ({ ...f, sortBy: opt.value as ProductFilters["sortBy"] }))}
                    className={cn("py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all",
                      filters.sortBy === opt.value ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-200"
                    )}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pays d&apos;origine</p>
              <CountryFilter selected={filters.countryCode || null} onChange={code => setFilters(f => ({ ...f, countryCode: code || undefined }))} />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Catégorie</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters(f => ({ ...f, category: undefined }))}
                  className={cn("py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left",
                    !filters.category ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-600 border-gray-200"
                  )}
                >
                  🛍️ Toutes
                </button>
                {CATEGORIES.map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setFilters(f => ({ ...f, category: value }))}
                    className={cn("py-2.5 px-3 rounded-xl border text-sm font-medium transition-all text-left",
                      filters.category === value ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-600 border-gray-200"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Prix (FCFA)</p>
              <div className="flex items-center gap-3">
                <input type="number" placeholder="Min" min={0} value={filters.minPrice || ""}
                  onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value ? +e.target.value : undefined }))}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
                <span className="text-gray-300 font-light text-lg">—</span>
                <input type="number" placeholder="Max" min={0} value={filters.maxPrice || ""}
                  onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value ? +e.target.value : undefined }))}
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </div>

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
