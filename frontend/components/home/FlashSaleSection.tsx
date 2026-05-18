"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Heart, Star, ShoppingCart } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import { useCart } from "@/contexts/CartContext";
import type { Product } from "@/lib/types";

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(end: string | null | undefined) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    if (!end) return;
    const endMs = new Date(end).getTime();
    function tick() {
      const diff = endMs - Date.now();
      if (diff <= 0) { setTime({ h: 0, m: 0, s: 0, expired: true }); return; }
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);
  return time;
}

// ─── Timer block (compact dark box) ──────────────────────────────────────────

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-px">
      <span className="w-7 h-7 rounded-md bg-gray-900 text-white text-[11px] font-extrabold flex items-center justify-center tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[7px] text-gray-400 uppercase tracking-wide font-medium">{label}</span>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function FlashCardSkeleton() {
  return (
    <div
      className="flex-shrink-0 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
      style={{ width: "clamp(148px, 40vw, 175px)" }}
    >
      <div className="shimmer-bg" style={{ height: "clamp(145px, 38vw, 170px)" }} />
      <div className="p-2.5 space-y-2">
        <div className="shimmer-bg rounded-full h-2.5 w-full" />
        <div className="shimmer-bg rounded-full h-2.5 w-3/4" />
        <div className="shimmer-bg rounded-full h-4 w-20 mt-1" />
        <div className="flex justify-between items-center pt-1">
          <div className="shimmer-bg rounded-full h-2 w-16" />
          <div className="shimmer-bg rounded-xl h-7 w-7" />
        </div>
      </div>
    </div>
  );
}

// ─── Flash Deal Card ──────────────────────────────────────────────────────────

function FlashDealCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked]       = useState(false);
  const [added, setAdded]       = useState(false);
  const { addItem }             = useCart();

  const imgSrc    = !imgError && product.images[0] ? getImageUrl(product.images[0]) : null;
  const hasPromo  = product.promoPrice != null && product.promoPrice > 0 && product.promoPrice < product.price;
  const display   = hasPromo ? product.promoPrice! : product.price;
  const original  = hasPromo ? product.price : null;
  const pct       = hasPromo ? Math.round((1 - product.promoPrice! / product.price) * 100) : null;

  const fmt = (p: number) => {
    if (product.currency === "XAF") return `${Math.round(p).toLocaleString("fr-FR")} F`;
    if (product.currency === "EUR") return `${p.toLocaleString("fr-FR")} €`;
    return `$${p.toLocaleString("fr-FR")}`;
  };

  function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  }

  const stars = Math.round(product.rating || 4);

  return (
    <Link
      href={`/produits/${product.id}`}
      className="group flex-shrink-0"
      style={{ width: "clamp(148px, 40vw, 175px)" }}
    >
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm transition-all duration-200 group-hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] group-hover:-translate-y-0.5">

        {/* Image zone */}
        <div className="relative overflow-hidden bg-gray-50" style={{ height: "clamp(145px, 38vw, 170px)" }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-300">📦</div>
          )}

          {/* Promo badge */}
          {pct != null && (
            <div className="absolute top-2 left-2 px-1.5 py-[3px] rounded-[6px] text-[10px] font-extrabold text-white leading-none"
              style={{ background: "#EF4444" }}>
              -{pct}%
            </div>
          )}

          {/* Favorite */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 shadow-sm flex items-center justify-center transition-all active:scale-90 hover:bg-white"
          >
            <Heart className={`w-3 h-3 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
          </button>
        </div>

        {/* Content */}
        <div className="px-2.5 pt-2 pb-2.5 flex flex-col gap-1.5">

          {/* Title */}
          <p className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-snug" style={{ minHeight: "2.5em" }}>
            {product.title}
          </p>

          {/* Prices */}
          <div>
            <p className="text-sm font-extrabold leading-none" style={{ color: "#EF4444" }}>
              {fmt(display)}
            </p>
            {original != null && (
              <p className="text-[10px] text-gray-400 line-through mt-0.5 leading-none">
                {fmt(original)}
              </p>
            )}
          </div>

          {/* Stars + cart */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            <div className="flex items-center gap-px flex-shrink-0">
              {[1, 2, 3, 4, 5].map(s => (
                <Star key={s} className={`w-2 h-2 ${s <= stars ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
              {(product.reviewCount ?? 0) > 0 && (
                <span className="text-[9px] text-gray-400 ml-0.5">({product.reviewCount})</span>
              )}
            </div>
            <button
              onClick={handleCart}
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
              style={{
                background: added ? "#22c55e" : "#F59E0B",
                boxShadow: "0 2px 6px rgba(245,158,11,0.35)",
              }}
            >
              {added
                ? <span className="text-white text-[10px] font-black">✓</span>
                : <ShoppingCart className="w-3.5 h-3.5 text-white" />
              }
            </button>
          </div>

        </div>
      </div>
    </Link>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const soonestEnd = products
    .filter(p => p.flashSaleEnd)
    .map(p => p.flashSaleEnd as string)
    .sort()[0] ?? null;

  const timer = useCountdown(soonestEnd);

  useEffect(() => {
    api.products.list({ section: "flashsale", limit: "12" } as any)
      .then((res: any) => setProducts((res.data ?? []).map(apiToProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, loading]);

  if (!loading && products.length === 0) return null;

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -195 : 195, behavior: "smooth" });
  }

  return (
    <section className="pt-4 pb-5 sm:pt-5 sm:pb-7 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4">

          {/* Left: icon + title */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)" }}
            >
              <Zap className="w-3.5 h-3.5 text-white fill-white stroke-none" />
            </div>
            <div>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-orange-500">
                Offres limitées
              </p>
              <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight tracking-tight">
                Offres Flash
              </h2>
            </div>
          </div>

          {/* Right: countdown + voir tout */}
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {soonestEnd && !timer.expired && (
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase tracking-wide font-semibold text-gray-400 mr-0.5 whitespace-nowrap">
                  Fin dans
                </span>
                <TimeBlock value={timer.h} label="h" />
                <span className="text-xs font-bold text-gray-400 pb-3.5">:</span>
                <TimeBlock value={timer.m} label="min" />
                <span className="text-xs font-bold text-gray-400 pb-3.5">:</span>
                <TimeBlock value={timer.s} label="sec" />
              </div>
            )}
            <Link
              href="/produits?section=flashsale"
              className="flex items-center gap-0.5 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Scroll row ──────────────────────────────────────────────────── */}
        <div className="relative">

          {canScrollLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-6 pointer-events-none"
              style={{ background: "linear-gradient(to right, white 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
                className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto pb-1.5"
            style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ scrollSnapAlign: "start" }}>
                    <FlashCardSkeleton />
                  </div>
                ))
              : products.map(product => (
                  <div key={product.id} style={{ scrollSnapAlign: "start" }}>
                    <FlashDealCard product={product} />
                  </div>
                ))
            }
          </div>

          {canScrollRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-6 pointer-events-none"
              style={{ background: "linear-gradient(to left, white 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("right")}
                aria-label="Défiler à droite"
                className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-all active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
