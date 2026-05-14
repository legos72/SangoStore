"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronRight, LayoutGrid, List, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { cn } from "@/lib/utils";

// ─── Données statiques ────────────────────────────────────────────────────────


const CATEGORIES = [
  { slug: "homme",      label: "Homme",           shortLabel: "Homme",     tags: ["homme"],                               grad: "from-slate-800   to-slate-600",   emoji: "👔", img: "/categories/homme.png" },
  { slug: "femme",      label: "Femme",            shortLabel: "Femme",     tags: ["femme"],                               grad: "from-rose-900    to-rose-700",    emoji: "👗", img: "/categories/femme.png" },
  { slug: "tissu",      label: "Tissus & Couture", shortLabel: "Tissus",    tags: ["tissu","wax","bazin"],                  grad: "from-amber-900   to-amber-600",   emoji: "🧵", img: "/categories/tissu.png" },
  { slug: "mariage",    label: "Mariage",          shortLabel: "Mariage",   tags: ["mariage"],                             grad: "from-purple-900  to-purple-700",  emoji: "💍", img: null },
  { slug: "enfant",     label: "Enfants",          shortLabel: "Enfants",   tags: ["enfant"],                              grad: "from-emerald-900 to-emerald-700", emoji: "🧒", img: "/categories/enfant.png" },
  { slug: "accessoire", label: "Accessoires",      shortLabel: "Accesso.", tags: ["accessoire","sac","bijou","chaussure"], grad: "from-orange-900  to-orange-600",  emoji: "👜", img: "/categories/accessoire.png" },
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

// ─── Slides texte ────────────────────────────────────────────────────────────

const HERO_SLIDES = [
  {
    badge:   "COLLECTION AFRICAINE ✦",
    line1:   "L'élégance africaine,",
    line2:   "notre fierté",
    sub:     "Découvrez nos vêtements, tissus et accessoires africains de qualité supérieure.",
    cta:     "Découvrir la collection",
    bg:      "/baniereModeAfricain/bannier11.png",
    overlay: "linear-gradient(to right, rgba(12,2,6,0.90) 0%, rgba(12,2,6,0.75) 25%, rgba(12,2,6,0.35) 48%, rgba(12,2,6,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "MARIAGE & CÉRÉMONIE ✦",
    line1:   "Sublimez votre",
    line2:   "grand jour",
    sub:     "Collections spéciales pour mariages et cérémonies africaines.",
    cta:     "Voir la collection mariage",
    bg:      "/baniereModeAfricain/bannier11.png",
    overlay: "linear-gradient(to right, rgba(12,2,6,0.90) 0%, rgba(12,2,6,0.75) 25%, rgba(12,2,6,0.35) 48%, rgba(12,2,6,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "TISSUS & WAX AUTHENTIQUES ✦",
    line1:   "Wax & Bazin,",
    line2:   "couleurs d'Afrique",
    sub:     "Les plus beaux tissus africains directement sélectionnés pour vous.",
    cta:     "Voir les tissus",
    bg:      "/baniereModeAfricain/bannier2Pane.png",
    overlay: "linear-gradient(to right, rgba(4,8,20,0.92) 0%, rgba(4,8,20,0.78) 25%, rgba(4,8,20,0.38) 48%, rgba(4,8,20,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "MODE HOMME PREMIUM ✦",
    line1:   "Le style africain",
    line2:   "au masculin",
    sub:     "Tenues africaines brodées pour homme — élégance et tradition.",
    cta:     "Voir la collection homme",
    bg:      "/baniereModeAfricain/bannier11.png",
    overlay: "linear-gradient(to right, rgba(12,2,6,0.90) 0%, rgba(12,2,6,0.75) 25%, rgba(12,2,6,0.35) 48%, rgba(12,2,6,0.06) 65%, transparent 80%)",
  },
];

// ─── Mini cadre bannière ──────────────────────────────────────────────────────

const BANNER_IMAGES = [
  "/categories/petBan1.png",
  "/categories/ManFemPet.png",
  "/categories/sacPetc.png",
  "/categories/sacPetCad.png",
];

// ─── Hero Banner ─────────────────────────────────────────────────────────────

function HeroSlider({ onCta }: { onCta: () => void }) {
  const [current,   setCurrent]   = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const timer       = useRef<ReturnType<typeof setInterval>>();
  const bannerTimer = useRef<ReturnType<typeof setInterval>>();

  function go(i: number) {
    clearInterval(timer.current);
    setCurrent(i);
    timer.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 4500);
  }

  useEffect(() => {
    timer.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    bannerTimer.current = setInterval(() => setBannerIdx(i => (i + 1) % BANNER_IMAGES.length), 3200);
    return () => clearInterval(bannerTimer.current);
  }, []);

  const s = HERO_SLIDES[current];

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ height: "clamp(260px, 50vw, 460px)" }}
    >
      {/* Backgrounds par slide */}
      {HERO_SLIDES.map((slide, i) => (
        <img
          key={`bg-${i}`}
          src={slide.bg}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Overlay gauche par slide */}
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={`ov-${i}`}
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{ background: slide.overlay, opacity: i === current ? 1 : 0 }}
        />
      ))}

      {/* Lueur or subtile — bas gauche */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 22% 90%, rgba(212,150,30,0.10) 0%, transparent 50%)" }}
      />


      {/* Contenu — texte gauche + mini cadre droit */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-8">

        {/* Texte slider */}
        <div className="max-w-[260px] xs:max-w-xs sm:max-w-sm lg:max-w-md py-8 sm:py-10">
          <span
            className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4"
            style={{ background: "rgba(212,150,30,0.15)", border: "1px solid rgba(212,150,30,0.35)", color: "#D4961E" }}
          >
            {s.badge}
          </span>

          <h1 className="text-[22px] xs:text-[26px] sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-2 sm:mb-3">
            {s.line1}<br />
            <span style={{ color: "#D4961E" }}>{s.line2}</span>
          </h1>

          <p className="hidden xs:block text-white/65 text-xs sm:text-sm lg:text-base mb-5 sm:mb-7 leading-relaxed">
            {s.sub}
          </p>

          <button
            onClick={onCta}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-95 hover:brightness-110 touch-manipulation"
            style={{ background: "#D4961E", boxShadow: "0 4px 18px rgba(212,150,30,0.45)" }}
          >
            {s.cta} <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Mini cadre — visible sm+ */}
        <div
          className="hidden sm:block relative flex-shrink-0 rounded-2xl overflow-hidden select-none"
          style={{
            width: "clamp(100px, 14vw, 175px)",
            aspectRatio: "3/4",
            border: "1px solid rgba(212,150,30,0.32)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          }}
        >
          {BANNER_IMAGES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt="Mode africaine"
              className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700"
              style={{ opacity: i === bannerIdx ? 1 : 0 }}
              loading={i === 0 ? "eager" : "lazy"}
            />
          ))}
          <div
            className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }}
          />
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {BANNER_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:      i === bannerIdx ? 14 : 5,
                  height:     5,
                  background: i === bannerIdx ? "#D4961E" : "rgba(255,255,255,0.55)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dots slider texte */}
      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 lg:left-8 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-300 touch-manipulation"
            style={{
              width:      i === current ? 20 : 7,
              height:     7,
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

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of CATEGORIES) {
      counts[cat.slug] = products.filter(p =>
        cat.tags.some(tag => p.tags?.includes(tag))
      ).length;
    }
    return counts;
  }, [products]);

  const displayed = useMemo(() => {
    let list = [...products];
    if (activeCat) {
      const cat = CATEGORIES.find(c => c.slug === activeCat);
      if (cat) list = list.filter(p => cat.tags.some(tag => p.tags?.includes(tag)));
    }
    if (activeStyle !== "tous") {
      list = list.filter(p => p.tags?.includes(activeStyle));
    }
    if (sortBy === "newest")          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === "price_asc")  list.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    else                              list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
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
    /* pb-safe : espace pour bottom nav mobile + safe area notch iPhone */
    <div
      className="min-h-screen"
      style={{
        background: "#FDFCF8",
        paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
      }}
    >

      {/* ── Hero ── */}
      <HeroSlider onCta={scrollToCatalog} />

      {/* ── Catégories ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight">
            Nos catégories africaines
          </h2>
          <button
            onClick={() => { setActiveCat(null); setActiveStyle("tous"); scrollToCatalog(); }}
            className="flex items-center gap-1 text-sm font-semibold transition-colors touch-manipulation flex-shrink-0"
            style={{ color: "#D4961E" }}
          >
            Voir tout <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Grille : 3 cols mobile → 6 cols tablet+ */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {CATEGORIES.map(cat => {
            const active = activeCat === cat.slug;
            const count  = catCounts[cat.slug] ?? 0;
            return (
              <button
                key={cat.slug}
                onClick={() => selectCat(cat.slug)}
                className={cn(
                  "group flex flex-col rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-200 border-2 touch-manipulation",
                  active
                    ? "scale-[1.03] shadow-lg"
                    : "border-transparent hover:border-orange-200 hover:shadow-md"
                )}
                style={active ? { borderColor: "#D4961E", boxShadow: "0 4px 18px rgba(212,150,30,0.25)" } : {}}
              >
                {/* Image */}
                <div className={cn("aspect-square w-full relative overflow-hidden bg-gradient-to-br", cat.grad)}>
                  {cat.img ? (
                    <img
                      src={cat.img}
                      alt={cat.label}
                      className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl sm:text-4xl select-none">{cat.emoji}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  {count > 0 && (
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] sm:text-[9px] text-white/80 font-semibold z-10 leading-tight">
                      {count} produit{count > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {/* Label : shortLabel sur mobile, label complet sur tablet+ */}
                <div className={cn(
                  "px-1 py-1.5 sm:py-2 text-center transition-colors",
                  active ? "bg-orange-50" : "bg-white group-hover:bg-gray-50"
                )}>
                  <p className={cn(
                    "text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2",
                    active ? "text-orange-600" : "text-gray-800"
                  )}>
                    {/* Version courte mobile, complète tablet */}
                    <span className="sm:hidden">{cat.shortLabel}</span>
                    <span className="hidden sm:inline">{cat.label}</span>
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
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8"
      >

        {/* Header : titre + contrôles — empilés sur mobile, inline sur tablet */}
        <div className="mb-4 sm:mb-5">
          <div className="flex items-center justify-between gap-3 mb-2 sm:mb-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-gray-900 tracking-tight">
              {activeLabel ?? "Produits populaires"}
              {displayed.length > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">
                  ({displayed.length})
                </span>
              )}
            </h2>

            {/* Contrôles — visibles en ligne sur tous les écrans */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-[11px] sm:text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg pl-2.5 sm:pl-3 pr-6 py-1.5 appearance-none focus:outline-none focus:border-orange-400 cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px]">▾</span>
              </div>

              {/* View toggle */}
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 transition-colors touch-manipulation", viewMode === "grid" ? "text-white" : "bg-white text-gray-400")}
                  style={viewMode === "grid" ? { background: "#D4961E" } : {}}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn("p-1.5 transition-colors touch-manipulation", viewMode === "list" ? "text-white" : "bg-white text-gray-400")}
                  style={viewMode === "list" ? { background: "#D4961E" } : {}}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Style tabs — scroll horizontal edge-to-edge sur mobile */}
        <div
          className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 overflow-x-auto pb-2 mb-4 sm:mb-5"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {STYLE_TABS.map(tab => {
            const active = activeStyle === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStyle(tab.id)}
                className={cn(
                  "whitespace-nowrap px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 border touch-manipulation",
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

        {/* Produits */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: "#D4961E" }} />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-14 sm:py-16 text-center rounded-2xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-3">👗</span>
            <p className="text-gray-400 text-sm mb-3">Aucun produit dans cette sélection.</p>
            <button
              onClick={() => { setActiveCat(null); setActiveStyle("tous"); }}
              className="text-sm font-semibold hover:underline touch-manipulation"
              style={{ color: "#D4961E" }}
            >
              Voir tous les produits mode
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* 2 cols mobile → 3 cols tablet → 4 cols desktop */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {displayed.map(p => <ProductCard key={p.id} product={p} variant="grid" />)}
          </div>
        ) : (
          <div className="space-y-2.5 sm:space-y-3">
            {displayed.map(p => <ProductCard key={p.id} product={p} variant="list" />)}
          </div>
        )}
      </section>
    </div>
  );
}
