"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronRight, SlidersHorizontal, X, Grid3x3, List,
  ChevronLeft, ChevronDown, Star, Zap, Truck, Tag, ChevronUp,
} from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ─── Config catégories ──────────────────────────────────────────────────── */

type SubCat = { label: string; icon: string };
type CatConfig = {
  title: string;
  description: string;
  apiCategory: ProductCategory;
  gradientFrom: string;
  gradientTo: string;
  bannerImg: string;
  heroBg?: string;
  subcategories: SubCat[];
  brands: string[];
};

const CATEGORY_CONFIG: Record<string, CatConfig> = {
  "mode-femme": {
    title: "Mode Femme",
    description: "Robes, sacs, bijoux et accessoires tendance pour femmes",
    apiCategory: "mode",
    gradientFrom: "#6b1938", gradientTo: "#c4286a",
    bannerImg: "/categoriHome/femme.png",
    subcategories: [
      { label: "Robes",       icon: "👗" }, { label: "Sacs",        icon: "👜" },
      { label: "Chaussures",  icon: "👠" }, { label: "Bijoux",      icon: "💍" },
      { label: "Vêtements",   icon: "👚" }, { label: "Montres",     icon: "⌚" },
      { label: "Accessoires", icon: "🧣" }, { label: "Parfums",     icon: "🌸" },
      { label: "Maquillage",  icon: "💄" },
    ],
    brands: ["Zara", "H&M", "Mango", "Shein", "Nike", "Adidas", "Puma", "Gucci", "Louis Vuitton"],
  },
  "mode-homme": {
    title: "Mode Homme",
    description: "Sneakers, chemises, montres et accessoires pour hommes",
    apiCategory: "mode",
    gradientFrom: "#0f172a", gradientTo: "#1e40af",
    bannerImg: "/categoriHome/HCatH.png",
    heroBg: "/BaniereCategHome/c1.png",
    subcategories: [
      { label: "Sneakers",    icon: "👟" }, { label: "Chemises",    icon: "👔" },
      { label: "Pantalons",   icon: "👖" }, { label: "T-shirts",    icon: "👕" },
      { label: "Vestes",      icon: "🧥" }, { label: "Montres",     icon: "⌚" },
      { label: "Ceintures",   icon: "🪢" }, { label: "Chaussures",  icon: "👞" },
      { label: "Accessoires", icon: "🕶️" },
    ],
    brands: ["Nike", "Adidas", "Puma", "Lacoste", "Hugo Boss", "Tommy Hilfiger", "Levi's", "Calvin Klein"],
  },
  electronique: {
    title: "Électronique",
    description: "Smartphones, ordinateurs, TV et accessoires high-tech",
    apiCategory: "electronique",
    gradientFrom: "#1e3a5f", gradientTo: "#1d4ed8",
    bannerImg: "/categoriHome/electro.png",
    subcategories: [
      { label: "Smartphones",     icon: "📱" }, { label: "Ordinateurs",      icon: "💻" },
      { label: "TV & Audio",      icon: "📺" }, { label: "Gaming",           icon: "🎮" },
      { label: "Accessoires",     icon: "🎧" }, { label: "Photo & Caméra",   icon: "📷" },
      { label: "Tablettes",       icon: "📟" }, { label: "Montres connectées",icon: "⌚" },
    ],
    brands: ["Samsung", "Apple", "Xiaomi", "Huawei", "Sony", "LG", "HP", "Dell", "Lenovo", "Asus"],
  },
  beaute: {
    title: "Beauté & Soins",
    description: "Cosmétiques, soins du visage, parfums et produits capillaires",
    apiCategory: "beaute",
    gradientFrom: "#7f1d1d", gradientTo: "#e11d48",
    bannerImg: "/categoriHome/Soin1.png",
    subcategories: [
      { label: "Soins visage", icon: "🧴" }, { label: "Maquillage", icon: "💄" },
      { label: "Parfums",      icon: "🌸" }, { label: "Cheveux",    icon: "💇" },
      { label: "Corps",        icon: "🧼" }, { label: "Ongles",     icon: "💅" },
    ],
    brands: ["L'Oréal", "Nivea", "Garnier", "Maybelline", "Dove", "Schwarzkopf", "Neutrogena", "Clinique"],
  },
  maison: {
    title: "Maison & Décoration",
    description: "Mobilier, décoration, cuisine et électroménager pour votre intérieur",
    apiCategory: "maison",
    gradientFrom: "#064e3b", gradientTo: "#059669",
    bannerImg: "/categoriHome/lit.png",
    subcategories: [
      { label: "Cuisine",        icon: "🍳" }, { label: "Décoration",    icon: "🪴" },
      { label: "Éclairage",      icon: "💡" }, { label: "Meubles",       icon: "🛋️" },
      { label: "Literie",        icon: "🛏️" }, { label: "Électroménager",icon: "🏠" },
      { label: "Organisation",   icon: "📦" }, { label: "Jardin",        icon: "🌿" },
    ],
    brands: ["IKEA", "Tefal", "Philips", "Moulinex", "Samsung", "LG", "Bosch", "Braun"],
  },
  alimentation: {
    title: "Supermarché",
    description: "Produits alimentaires, épices africaines, conserves et boissons",
    apiCategory: "alimentation",
    gradientFrom: "#7c2d12", gradientTo: "#ea580c",
    bannerImg: "/categoriHome/alim.png",
    subcategories: [
      { label: "Conserves",       icon: "🥫" }, { label: "Boissons",       icon: "🥤" },
      { label: "Épices",          icon: "🌶️" }, { label: "Snacks",         icon: "🍿" },
      { label: "Bio & Naturel",   icon: "🌿" }, { label: "Produits locaux",icon: "🌍" },
      { label: "Céréales",        icon: "🌾" }, { label: "Huiles",         icon: "🫙" },
    ],
    brands: ["Maggi", "Jumbo", "Nestlé", "Unilever", "Kiri", "Candia", "Coca-Cola", "Sobebra"],
  },
  sport: {
    title: "Sport & Loisirs",
    description: "Équipement sportif, fitness et activités de plein air",
    apiCategory: "sport",
    gradientFrom: "#4c1d95", gradientTo: "#7c3aed",
    bannerImg: "/categoriHome/alte.png",
    subcategories: [
      { label: "Fitness",    icon: "💪" }, { label: "Football",   icon: "⚽" },
      { label: "Basketball", icon: "🏀" }, { label: "Tennis",     icon: "🎾" },
      { label: "Natation",   icon: "🏊" }, { label: "Vélo",       icon: "🚴" },
      { label: "Camping",    icon: "⛺" }, { label: "Running",    icon: "🏃" },
    ],
    brands: ["Nike", "Adidas", "Puma", "Under Armour", "Reebok", "New Balance", "Decathlon", "Wilson"],
  },
};

const SORT_OPTIONS = [
  { value: "newest",     label: "Pertinence"       },
  { value: "price_asc",  label: "Prix croissant"   },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating",     label: "Top notés"        },
];

const PAGE_SIZE = 20;

/* ─── Accordion sidebar ──────────────────────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  );
}

/* ─── Page principale ────────────────────────────────────────────────────── */
function CategoryPageContent() {
  const params = useParams();
  const slug   = typeof params.slug === "string" ? params.slug : "";
  const config = CATEGORY_CONFIG[slug];

  const [products,       setProducts]       = useState<Product[]>([]);
  const [total,          setTotal]          = useState(0);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(false);
  const [activeSub,      setActiveSub]      = useState<string | null>(null);
  const [sortBy,         setSortBy]         = useState("newest");
  const [minPrice,       setMinPrice]       = useState("");
  const [maxPrice,       setMaxPrice]       = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStock,        setInStock]        = useState(false);
  const [onPromo,        setOnPromo]        = useState(false);
  const [fastDelivery,   setFastDelivery]   = useState(false);
  const [minRating,      setMinRating]      = useState(0);
  const [showAllBrands,  setShowAllBrands]  = useState(false);
  const [view,           setView]           = useState<"grid" | "list">("grid");
  const [page,           setPage]           = useState(1);
  const [drawerOpen,     setDrawerOpen]     = useState(false);
  const [sortOpen,       setSortOpen]       = useState(false);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const fetchProducts = useCallback(() => {
    if (!config) return;
    setLoading(true); setError(false);
    const p: Record<string, string> = {
      category: config.apiCategory,
      sortBy,
      page: page.toString(),
      limit: PAGE_SIZE.toString(),
    };
    if (activeSub)             p.search      = activeSub;
    if (minPrice)              p.minPrice    = minPrice;
    if (maxPrice)              p.maxPrice    = maxPrice;
    if (onPromo)               p.section     = "flashsale";
    if (fastDelivery)          p.fastDelivery = "true";
    if (selectedBrands.length) p.brands      = selectedBrands.join(",");
    if (minRating > 0)         p.minRating   = minRating.toString();

    api.products.list(p as any)
      .then((res: any) => {
        setProducts((res.data ?? []).map(apiToProduct));
        setTotal(res.pagination?.total ?? 0);
      })
      .catch(() => { setProducts([]); setError(true); })
      .finally(() => setLoading(false));
  }, [config, activeSub, sortBy, minPrice, maxPrice, onPromo, fastDelivery, selectedBrands, minRating, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { setPage(1); }, [activeSub, sortBy, minPrice, maxPrice, onPromo, fastDelivery, selectedBrands, minRating]);

  if (!config) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F7F4EE] gap-4">
        <div className="text-4xl mb-2">🔍</div>
        <p className="text-xl font-bold text-gray-800">Catégorie introuvable</p>
        <Link href="/" className="text-amber-600 underline text-sm">Retour à l&apos;accueil</Link>
      </div>
    );
  }

  const totalPages        = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const visibleBrands     = showAllBrands ? config.brands : config.brands.slice(0, 5);
  const activeFilterCount = [
    activeSub, minPrice || maxPrice, onPromo, fastDelivery,
    selectedBrands.length > 0, minRating > 0,
  ].filter(Boolean).length;

  function toggleBrand(brand: string) {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }

  function resetFilters() {
    setActiveSub(null); setMinPrice(""); setMaxPrice("");
    setSelectedBrands([]); setInStock(false); setOnPromo(false);
    setFastDelivery(false); setMinRating(0); setPage(1);
  }

  /* ── Contenu sidebar (réutilisé desktop + drawer mobile) ─────────────── */
  function SidebarBody() {
    return (
      <div>
        {/* Sous-catégories */}
        <FilterSection title="Sous-catégories">
          <div className="space-y-0.5">
            {config.subcategories.map(sub => (
              <button
                key={sub.label}
                onClick={() => { setActiveSub(activeSub === sub.label ? null : sub.label); setDrawerOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-left transition-all",
                  activeSub === sub.label ? "font-semibold text-white" : "text-gray-600 hover:bg-gray-50 font-medium"
                )}
                style={activeSub === sub.label ? { background: config.gradientTo } : {}}
              >
                <span className="text-sm leading-none">{sub.icon}</span>
                <span className="flex-1">{sub.label}</span>
                {activeSub === sub.label && <X className="w-3 h-3 flex-shrink-0 opacity-70" />}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Prix */}
        <FilterSection title="Prix (FCFA)">
          <div className="flex items-center gap-2">
            <input
              type="number" placeholder="Min" min={0} value={minPrice}
              onChange={e => setMinPrice(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-400"
            />
            <span className="text-gray-300">—</span>
            <input
              type="number" placeholder="Max" min={0} value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-400"
            />
          </div>
        </FilterSection>

        {/* Marques */}
        <FilterSection title="Marques">
          <div className="space-y-2">
            {visibleBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    selectedBrands.includes(brand) ? "border-transparent" : "border-gray-300 group-hover:border-gray-400"
                  )}
                  style={selectedBrands.includes(brand) ? { background: config.gradientTo, borderColor: config.gradientTo } : {}}
                  onClick={() => toggleBrand(brand)}
                >
                  {selectedBrands.includes(brand) && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors" onClick={() => toggleBrand(brand)}>
                  {brand}
                </span>
              </label>
            ))}
          </div>
          {config.brands.length > 5 && (
            <button onClick={() => setShowAllBrands(!showAllBrands)}
              className="mt-2 text-xs font-bold transition-colors" style={{ color: config.gradientTo }}>
              {showAllBrands ? "Voir moins" : `Voir plus (${config.brands.length - 5})`}
            </button>
          )}
        </FilterSection>

        {/* Notes clients */}
        <FilterSection title="Notes clients" defaultOpen={false}>
          <div className="space-y-1.5">
            {[4, 3, 2].map(rating => (
              <button
                key={rating}
                onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition-all",
                  minRating === rating ? "text-white font-semibold" : "text-gray-600 hover:bg-gray-50"
                )}
                style={minRating === rating ? { background: config.gradientTo } : {}}
              >
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < rating ? "fill-amber-400 text-amber-400" : "text-gray-200")} />
                  ))}
                </span>
                <span className="text-xs">{rating}★ et plus</span>
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Options */}
        <FilterSection title="Options" defaultOpen={false}>
          <div className="space-y-2.5">
            {[
              { state: onPromo,      setter: setOnPromo,      label: "En promotion",       Icon: Tag,   color: "#f59e0b" },
              { state: fastDelivery, setter: setFastDelivery, label: "Livraison rapide",    Icon: Truck, color: "#3b82f6" },
              { state: inStock,      setter: setInStock,      label: "En stock seulement",  Icon: Zap,   color: "#10b981" },
            ].map(({ state, setter, label, Icon, color }) => (
              <label key={label} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    state ? "border-transparent" : "border-gray-300 group-hover:border-gray-400")}
                  style={state ? { background: color, borderColor: color } : {}}
                  onClick={() => setter(!state)}
                >
                  {state && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600 group-hover:text-gray-900 transition-colors" onClick={() => setter(!state)}>
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                  {label}
                </div>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4EE]">

      {/* ── Bannière ─────────────────────────────────────────────────────── */}
      {config.heroBg ? (
        /* Full-image hero */
        <div className="relative overflow-hidden" style={{ minHeight: "180px" }}>
          <img
            src={config.heroBg} alt={config.title}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Overlay dégradé gauche pour lisibilité du texte */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.05) 100%)" }} />
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">{config.title}</span>
            </div>
          </div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-1.5">
              {config.title}
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-xs sm:max-w-sm leading-relaxed mb-3">
              {config.description}
            </p>
            <span className="inline-flex items-center gap-1.5 bg-black/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-sm">
              {loading ? "Chargement…" : `${total.toLocaleString()} produit${total !== 1 ? "s" : ""} disponible${total !== 1 ? "s" : ""}`}
            </span>
          </div>
        </div>
      ) : (
        /* Gradient hero par défaut */
        <div
          className="relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 100%)` }}
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-3">
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-medium">{config.title}</span>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex items-center gap-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-1.5">
                {config.title}
              </h1>
              <p className="text-white/65 text-sm sm:text-base max-w-md leading-relaxed">
                {config.description}
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {loading ? "Chargement…" : `${total.toLocaleString()} produit${total !== 1 ? "s" : ""} disponible${total !== 1 ? "s" : ""}`}
                </span>
              </div>
            </div>
            <div className="hidden sm:block flex-shrink-0 w-36 h-36 lg:w-48 lg:h-48">
              <img
                src={config.bannerImg} alt={config.title}
                className="w-full h-full object-cover object-top rounded-2xl"
                style={{ filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.35))", opacity: 0.92 }}
              />
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-64 h-64 rounded-full bg-white/[0.03] pointer-events-none" />
        </div>
      )}

      {/* ── Sous-catégories ────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => setActiveSub(null)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all border",
                !activeSub ? "text-white border-transparent shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}
              style={!activeSub ? { background: config.gradientTo } : {}}
            >
              Tout voir
            </button>
            {config.subcategories.map(sub => (
              <button
                key={sub.label}
                onClick={() => setActiveSub(activeSub === sub.label ? null : sub.label)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all border",
                  activeSub === sub.label
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                )}
                style={activeSub === sub.label ? { background: config.gradientTo } : {}}
              >
                <span className="text-sm leading-none">{sub.icon}</span>
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu ──────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex gap-5">

          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-56 xl:w-60 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-4">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" style={{ color: config.gradientTo }} />
                  Filtrage
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-[10px] font-bold text-red-400 hover:text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> Réinitialiser
                  </button>
                )}
              </div>
              <SidebarBody />
            </div>
          </aside>

          {/* Zone produits */}
          <div className="flex-1 min-w-0">

            {/* Barre contrôles */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className={cn(
                    "lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all",
                    activeFilterCount > 0 ? "bg-amber-50 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-600"
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Filtrage
                  {activeFilterCount > 0 && (
                    <span className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                      style={{ background: config.gradientTo }}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <p className="hidden sm:block text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{loading ? "…" : total.toLocaleString()}</span>
                  {" "}produit{total !== 1 ? "s" : ""} trouvé{total !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-700 hover:border-gray-300 transition-all whitespace-nowrap"
                  >
                    <span className="hidden sm:inline text-gray-400">Trier :</span>
                    <span className="font-bold">{SORT_OPTIONS.find(o => o.value === sortBy)?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {sortOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[180px]">
                        {SORT_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                            className={cn("w-full text-left px-4 py-2.5 text-xs transition-colors",
                              sortBy === opt.value ? "font-bold" : "text-gray-600 hover:bg-gray-50 font-medium")}
                            style={sortBy === opt.value ? { background: `${config.gradientTo}18`, color: config.gradientTo } : {}}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl p-1">
                  <button onClick={() => setView("grid")}
                    className={cn("p-1.5 rounded-lg transition-colors", view === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600")}>
                    <Grid3x3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setView("list")}
                    className={cn("p-1.5 rounded-lg transition-colors", view === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:text-gray-600")}>
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Chips filtres actifs */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeSub && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: config.gradientTo }}>
                    {activeSub}
                    <button onClick={() => setActiveSub(null)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedBrands.map(brand => (
                  <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-full text-xs font-semibold">
                    {brand} <button onClick={() => toggleBrand(brand)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 border border-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                    {minPrice && maxPrice
                      ? `${Number(minPrice).toLocaleString()} – ${Number(maxPrice).toLocaleString()} FCFA`
                      : minPrice ? `Min ${Number(minPrice).toLocaleString()} FCFA`
                      : `Max ${Number(maxPrice).toLocaleString()} FCFA`}
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
                    {minRating}★ et plus <button onClick={() => setMinRating(0)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {onPromo && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-xs font-semibold">
                    En promotion <button onClick={() => setOnPromo(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {fastDelivery && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold">
                    Livraison rapide <button onClick={() => setFastDelivery(false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button onClick={resetFilters} className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
                  Effacer tout
                </button>
              </div>
            )}

            {/* Produits */}
            {loading && (
              <div className={cn("grid gap-3", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} variant={view} />)}
              </div>
            )}
            {!loading && error && (
              <div className="bg-white rounded-2xl p-10 text-center border border-red-100">
                <p className="text-gray-600 font-semibold mb-3">Impossible de charger les produits</p>
                <button onClick={fetchProducts} className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ background: config.gradientTo }}>
                  Réessayer
                </button>
              </div>
            )}
            {!loading && !error && products.length === 0 && (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-600 font-semibold mb-1">Aucun produit trouvé</p>
                <p className="text-gray-400 text-sm mb-4">Essayez de modifier vos filtres</p>
                <button onClick={resetFilters} className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ background: config.gradientTo }}>
                  Réinitialiser les filtres
                </button>
              </div>
            )}
            {!loading && !error && products.length > 0 && (
              <div className={cn("grid gap-3", view === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1")}>
                {products.map(product => <ProductCard key={product.id} product={product} variant={view} />)}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-40 hover:border-gray-300">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let p = i + 1;
                  if (totalPages > 7) {
                    if (page <= 4)                   p = i < 5 ? i + 1 : i === 5 ? -1 : totalPages;
                    else if (page >= totalPages - 3) p = i === 0 ? 1 : i === 1 ? -1 : totalPages - (6 - i);
                    else                             p = i === 0 ? 1 : i === 1 ? -1 : i === 5 ? -2 : i === 6 ? totalPages : page + (i - 3);
                  }
                  if (p < 0) return <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={cn("w-9 h-9 rounded-xl border text-sm font-semibold transition-all",
                        page === p ? "text-white border-transparent" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300")}
                      style={page === p ? { background: config.gradientTo } : {}}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 disabled:opacity-40 hover:border-gray-300">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Drawer mobile ─────────────────────────────────────────────────── */}
      <div className={cn("fixed inset-0 z-50 lg:hidden transition-all duration-300", drawerOpen ? "pointer-events-auto" : "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300", drawerOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setDrawerOpen(false)} />
        <div className={cn("absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl transition-transform duration-300 ease-out flex flex-col", drawerOpen ? "translate-y-0" : "translate-y-full")}
          style={{ maxHeight: "90vh" }}>
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" style={{ color: config.gradientTo }} />
              Filtrage
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ background: config.gradientTo }}>{activeFilterCount}</span>
              )}
            </h3>
            <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-xl bg-gray-100 text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1 px-5 py-4">
            <SidebarBody />
          </div>
          <div className="border-t border-gray-100 px-5 py-4 flex gap-3">
            {activeFilterCount > 0 && (
              <button onClick={() => { resetFilters(); setDrawerOpen(false); }}
                className="flex-1 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600">
                Réinitialiser
              </button>
            )}
            <button onClick={() => setDrawerOpen(false)}
              className="flex-[2] py-3 rounded-2xl text-white text-sm font-bold"
              style={{ background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 100%)` }}>
              Voir {loading ? "…" : `${total.toLocaleString()} produit${total !== 1 ? "s" : ""}`}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center"><p className="text-gray-400 text-sm">Chargement…</p></div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
