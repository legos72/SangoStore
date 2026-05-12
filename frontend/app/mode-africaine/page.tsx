"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { ChevronRight, LayoutGrid, List, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

// ─── Données statiques ────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    badge: "COLLECTION AFRICAINE ✦",
    line1: "L'élégance africaine,",
    line2: "notre fierté",
    sub:   "Découvrez nos vêtements, tissus et accessoires africains de qualité supérieure.",
    cta:   "Découvrir la collection",
    bg:    "linear-gradient(135deg, #0F0A02 0%, #1E1206 50%, #0A0604 100%)",
    deco:  "👗",
  },
  {
    badge: "TISSUS & WAX AUTHENTIQUES ✦",
    line1: "Wax & Bazin,",
    line2: "couleurs d'Afrique",
    sub:   "Les plus beaux tissus africains directement sélectionnés pour vous.",
    cta:   "Voir les tissus",
    bg:    "linear-gradient(135deg, #100408 0%, #1E0810 50%, #0A0204 100%)",
    deco:  "🧵",
  },
  {
    badge: "MARIAGE & CÉRÉMONIE ✦",
    line1: "Sublimez votre",
    line2: "grand jour",
    sub:   "Collections spéciales pour mariages et cérémonies africaines.",
    cta:   "Voir la collection",
    bg:    "linear-gradient(135deg, #06080F 0%, #0A1020 50%, #060408 100%)",
    deco:  "💍",
  },
];

const CATEGORIES = [
  { slug: "homme",      label: "Homme",              tags: ["homme"],                               grad: "from-slate-800   to-slate-600",   emoji: "👔", img: null },
  { slug: "femme",      label: "Femme",               tags: ["femme"],                               grad: "from-rose-900    to-rose-700",    emoji: "👗", img: null },
  { slug: "tissu",      label: "Tissus & Couture",    tags: ["tissu","wax","bazin"],                  grad: "from-amber-900   to-amber-600",   emoji: "🧵", img: null },
  { slug: "mariage",    label: "Mariage & Cérémonie", tags: ["mariage"],                             grad: "from-purple-900  to-purple-700",  emoji: "💍", img: null },
  { slug: "enfant",     label: "Enfants",             tags: ["enfant"],                              grad: "from-emerald-900 to-emerald-700", emoji: "🧒", img: "/images/enfantCate.png" },
  { slug: "accessoire", label: "Accessoires",         tags: ["accessoire","sac","bijou","chaussure"], grad: "from-orange-900  to-orange-600",  emoji: "👜", img: null },
];

const STYLE_TABS = [
  { id: "tous",      label: "Tous" },
  { id: "bazin",     label: "Bazin" },
  { id: "wax",       label: "Wax" },
  { id: "boubou",    label: "Boubou" },
  { id: "tunique",   label: "Tuniques" },
  { id: "robe",      label: "Robes" },
  { id: "ensemble",  label: "Ensembles" },
];

const SORT_OPTIONS = [
  { value: "popular",    label: "Populaires" },
  { value: "newest",     label: "Nouveautés" },
  { value: "price_asc",  label: "Prix ↑" },
  { value: "price_desc", label: "Prix ↓" },
];

// ─── Hero Slider ─────────────────────────────────────────────────────────────

function HeroSlider({ onCta }: { onCta: () => void }) {
  const [current, setCurrent] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>();

  function go(i: number) {
    clearInterval(timer.current);
    setCurrent(i);
    timer.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 4500);
  }

  useEffect(() => {
    timer.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(timer.current);
  }, []);

  const s = HERO_SLIDES[current];

  return (
    <div className="relative overflow-hidden" style={{ minHeight: 260 }}>
      {/* Background slides */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ background: slide.bg, opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Subtle gold pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg,#D4961E 0,#D4961E 1px,transparent 0,transparent 50%)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex items-center gap-6 lg:gap-10">
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-extrabold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(212,150,30,0.15)", border: "1px solid rgba(212,150,30,0.35)", color: "#D4961E" }}
          >
            {s.badge}
          </span>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            {s.line1}<br />
            <span style={{ color: "#D4961E" }}>{s.line2}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/65 text-sm sm:text-base max-w-md mb-7 leading-relaxed">
            {s.sub}
          </p>

          {/* CTA */}
          <button
            onClick={onCta}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 hover:brightness-110"
            style={{ background: "#D4961E", boxShadow: "0 4px 18px rgba(212,150,30,0.45)" }}
          >
            {s.cta} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Decorative image slot — placeholder for actual product/model photo */}
        <div
          className="hidden sm:flex w-44 lg:w-60 h-52 lg:h-68 flex-shrink-0 rounded-2xl items-center justify-center select-none"
          style={{ background: "rgba(212,150,30,0.07)", border: "1px solid rgba(212,150,30,0.15)" }}
        >
          <span className="text-7xl lg:text-8xl">{s.deco}</span>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:   i === current ? 24 : 8,
              height:  8,
              background: i === current ? "#D4961E" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function ModeAfricainePage() {
  const [products,    setProducts]    = useState<Product[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [activeCat,   setActiveCat]   = useState<string | null>(null);
  const [activeStyle, setActiveStyle] = useState("tous");
  const [sortBy,      setSortBy]      = useState("popular");
  const [viewMode,    setViewMode]    = useState<"grid" | "list">("grid");
  const catalogRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.products.list({ category: "mode", limit: "60" });
        setProducts(res.data ?? []);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Nombre de produits par catégorie (calculé côté client)
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat.slug] = products.filter(p =>
        cat.tags.some(tag => p.tags?.includes(tag))
      ).length;
    }
    return counts;
  }, [products]);

  // Produits filtrés + triés
  const displayed = useMemo(() => {
    let list = [...products];
    if (activeCat) {
      const cat = CATEGORIES.find(c => c.slug === activeCat);
      if (cat) list = list.filter(p => cat.tags.some(tag => p.tags?.includes(tag)));
    }
    if (activeStyle !== "tous") {
      list = list.filter(p => p.tags?.includes(activeStyle));
    }
    if (sortBy === "newest")     list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "price_asc")  list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return list;
  }, [products, activeCat, activeStyle, sortBy]);

  function scrollToCatalog() {
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectCat(slug: string) {
    setActiveCat(activeCat === slug ? null : slug);
    setActiveStyle("tous");
    setTimeout(scrollToCatalog, 80);
  }

  const activeLabel = activeCat ? CATEGORIES.find(c => c.slug === activeCat)?.label : null;

  return (
    <div className="min-h-screen pb-20 sm:pb-0" style={{ background: "#FDFCF8" }}>

      {/* ── Hero ── */}
      <HeroSlider onCta={scrollToCatalog} />

      {/* ── Catégories ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Nos catégories africaines
          </h2>
          <button
            onClick={() => { setActiveCat(null); setActiveStyle("tous"); scrollToCatalog(); }}
            className="flex items-center gap-1 text-sm font-semibold transition-colors"
            style={{ color: "#D4961E" }}
          >
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.slug;
            const count  = catCounts[cat.slug] ?? 0;
            return (
              <button
                key={cat.slug}
                onClick={() => selectCat(cat.slug)}
                className={cn(
                  "group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 border-2",
                  active
                    ? "scale-[1.03] shadow-lg"
                    : "border-transparent hover:border-orange-200 hover:shadow-md"
                )}
                style={active ? { borderColor: "#D4961E", boxShadow: "0 4px 18px rgba(212,150,30,0.25)" } : {}}
              >
                {/* Image area */}
                <div className={cn("aspect-square w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br", cat.grad)}>
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl select-none mb-1 relative z-10">{cat.emoji}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                  {count > 0 && (
                    <span className="absolute bottom-1.5 left-0 right-0 text-center text-[9px] text-white/80 font-semibold z-10">
                      {count} produit{count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {/* Label */}
                <div className={cn("px-1.5 py-2 text-center transition-colors", active ? "bg-orange-50" : "bg-white group-hover:bg-gray-50")}>
                  <p className={cn("text-[11px] font-bold leading-tight", active ? "text-orange-600" : "text-gray-800")}>
                    {cat.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Catalogue ── */}
      <section
        ref={catalogRef}
        id="catalogue"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {activeLabel ?? "Produits populaires"}
            {displayed.length > 0 && (
              <span className="ml-2 text-sm font-semibold text-gray-400">
                ({displayed.length})
              </span>
            )}
          </h2>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg pl-3 pr-7 py-1.5 appearance-none focus:outline-none focus:border-orange-400 cursor-pointer"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>Trier : {o.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▾</span>
            </div>

            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 transition-colors", viewMode === "grid" ? "text-white" : "bg-white text-gray-400 hover:bg-gray-50")}
                style={viewMode === "grid" ? { background: "#D4961E" } : {}}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 transition-colors", viewMode === "list" ? "text-white" : "bg-white text-gray-400 hover:bg-gray-50")}
                style={viewMode === "list" ? { background: "#D4961E" } : {}}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Style tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5" style={{ scrollbarWidth: "none" }}>
          {STYLE_TABS.map(tab => {
            const active = activeStyle === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStyle(tab.id)}
                className={cn(
                  "whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 border",
                  active
                    ? "text-white border-transparent"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
                )}
                style={active ? { background: "#1a1206", borderColor: "#1a1206" } : {}}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Products */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#D4961E" }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-3">👗</span>
            <p className="text-gray-400 text-sm mb-3">Aucun produit dans cette sélection.</p>
            <button
              onClick={() => { setActiveCat(null); setActiveStyle("tous"); }}
              className="text-sm font-semibold hover:underline"
              style={{ color: "#D4961E" }}
            >
              Voir tous les produits mode
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayed.map(p => <ProductCard key={p.id} product={p} variant="grid" />)}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map(p => <ProductCard key={p.id} product={p} variant="list" />)}
          </div>
        )}
      </section>
    </div>
  );
}
