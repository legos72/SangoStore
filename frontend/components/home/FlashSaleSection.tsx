"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
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

// ─── Timer block (Apple/Tesla style glass) ───────────────────────────────────

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center tabular-nums font-extrabold text-sm text-white"
        style={{
          background: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(249,115,22,0.3)",
          boxShadow: "0 0 8px rgba(249,115,22,0.2), inset 0 1px 0 rgba(255,255,255,0.07)",
        }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[8px] uppercase tracking-widest mt-0.5 font-semibold" style={{ color: "rgba(251,146,60,0.65)" }}>
        {label}
      </span>
    </div>
  );
}

// ─── Skeleton card (dark shimmer) ─────────────────────────────────────────────

function FlashCardSkeleton() {
  return (
    <div
      className="flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        width: "clamp(158px, 43vw, 196px)",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flash-shimmer" style={{ height: "clamp(138px, 37vw, 172px)" }} />
      <div className="p-3 space-y-2.5">
        <div className="flash-shimmer rounded-full h-2.5 w-2/3" />
        <div className="flash-shimmer rounded-full h-2.5 w-full" />
        <div className="flash-shimmer rounded-full h-2 w-3/4" />
        <div className="flex justify-between items-center pt-0.5">
          <div className="flash-shimmer rounded-full h-5 w-20" />
          <div className="flash-shimmer rounded-xl h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Premium Flash Card ───────────────────────────────────────────────────────

function FlashCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const imgSrc = !imgError && product.images[0] ? getImageUrl(product.images[0]) : null;

  const hasPromo = product.promoPrice != null && product.promoPrice > 0 && product.promoPrice < product.price;
  const displayPrice = hasPromo ? product.promoPrice! : product.price;
  const originalPrice = hasPromo ? product.price : null;
  const discountPct = hasPromo ? Math.round((1 - product.promoPrice! / product.price) * 100) : null;

  const stockUrgent = product.stock > 0 && product.stock <= 5;
  const stockLow    = product.stock > 5  && product.stock <= 15;
  const showStock   = product.stock < 20;
  const stockMax    = stockUrgent ? 8 : 20;
  const stockRatio  = Math.max(0.1, Math.min(0.95, 1 - product.stock / stockMax));
  // "Déjà X vendus" — proxy: reviews × 4 + base, seeded by stock for stability
  const soldCount   = Math.max(14, (product.reviewCount ?? 0) * 4 + (product.stock % 7) * 3 + 12);

  const fmt = (p: number) => {
    if (product.currency === "XAF") return `${Math.round(p).toLocaleString("fr-FR")} F`;
    if (product.currency === "EUR") return `${p.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} €`;
    return `$${p.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}`;
  };

  return (
    <Link
      href={`/produits/${product.id}`}
      className="flex-shrink-0 group"
      style={{ width: "clamp(158px, 43vw, 196px)" }}
    >
      <div
        className="rounded-[20px] overflow-hidden flex flex-col transition-all duration-300 group-hover:-translate-y-1.5"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.07) inset",
        }}
      >
        {/* Image zone */}
        <div className="relative overflow-hidden" style={{ height: "clamp(138px, 37vw, 172px)" }}>
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.08] group-hover:brightness-110"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-3xl"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              📦
            </div>
          )}

          {/* Bottom gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%)" }}
          />

          {/* Flash badge */}
          {discountPct != null && (
            <div className="absolute top-2 left-2">
              <div
                className="flash-badge-pulse flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold text-white"
                style={{
                  background: "linear-gradient(135deg, #dc2626 0%, #f97316 100%)",
                  boxShadow: "0 0 10px rgba(239,68,68,0.55), 0 0 20px rgba(249,115,22,0.25)",
                }}
              >
                <Zap className="w-2.5 h-2.5 fill-white stroke-none" />
                -{discountPct}%
              </div>
            </div>
          )}

          {/* "Presque épuisé" top-right */}
          {stockUrgent && (
            <div
              className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white"
              style={{ background: "rgba(220,38,38,0.85)", backdropFilter: "blur(4px)" }}
            >
              Rare
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-3 pt-2.5 pb-3 flex flex-col gap-2">

          {/* Title */}
          <p
            className="text-white/90 text-[11px] sm:text-xs font-semibold leading-tight line-clamp-2"
            style={{ minHeight: "2.4em" }}
          >
            {product.title}
          </p>

          {/* Price row */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-extrabold" style={{ color: "#fb923c" }}>
              {fmt(displayPrice)}
            </span>
            {originalPrice != null && (
              <span className="text-[10px] line-through" style={{ color: "rgba(255,255,255,0.35)" }}>
                {fmt(originalPrice)}
              </span>
            )}
          </div>

          {/* Stock urgency bar */}
          {showStock && (
            <div className="space-y-1">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${stockRatio * 100}%`,
                    background: stockUrgent
                      ? "linear-gradient(90deg, #ef4444, #f97316)"
                      : stockLow
                      ? "linear-gradient(90deg, #f97316, #fbbf24)"
                      : "linear-gradient(90deg, #f97316, #fbbf24)",
                  }}
                />
              </div>
              <div className="flex items-center justify-between gap-1">
                {stockUrgent ? (
                  <span className="text-[9px] font-bold" style={{ color: "#f87171" }}>
                    ⚡ {product.stock} restant{product.stock > 1 ? "s" : ""}
                  </span>
                ) : (
                  <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {product.stock} en stock
                  </span>
                )}
                <span className="text-[9px] font-semibold flex-shrink-0" style={{ color: "rgba(251,146,60,0.65)" }}>
                  {soldCount} vendus
                </span>
              </div>
            </div>
          )}

          {/* CTA */}
          <div
            className="w-full py-2 rounded-xl text-[11px] font-bold text-white text-center transition-all duration-200 group-active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f97316 0%, #dc2626 100%)",
              boxShadow: "0 2px 10px rgba(249,115,22,0.3)",
            }}
          >
            Acheter
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -210 : 210, behavior: "smooth" });
  }

  return (
    <section
      className="py-6 sm:py-10 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #7c2d12 100%)",
      }}
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 15% 50%, rgba(249,115,22,0.07) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 85% 30%, rgba(239,68,68,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-4 sm:mb-6">

          {/* Left: icon + title */}
          <div className="flex items-center gap-3">
            {/* Animated icon */}
            <div
              className="flash-icon-pulse w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
                boxShadow: "0 0 20px rgba(249,115,22,0.45), 0 0 40px rgba(249,115,22,0.15)",
              }}
            >
              <Zap className="w-5 h-5 text-white fill-white stroke-none" />
            </div>

            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "#fb923c" }}>
                Offres limitées
              </p>
              <h2
                className="text-xl sm:text-2xl font-black text-white leading-none tracking-tight mt-0.5"
                style={{ textShadow: "0 0 24px rgba(249,115,22,0.35)" }}
              >
                Flash Sale
              </h2>
            </div>
          </div>

          {/* Right: countdown + voir tout */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {soonestEnd && !timer.expired && (
              <div className="flex items-center gap-1.5">
                <span
                  className="hidden sm:block text-[9px] uppercase tracking-widest font-semibold mr-0.5"
                  style={{ color: "rgba(251,146,60,0.6)" }}
                >
                  Fin dans
                </span>
                <TimeBlock value={timer.h} label="h" />
                <span className="text-base font-black pb-4" style={{ color: "rgba(249,115,22,0.5)" }}>:</span>
                <TimeBlock value={timer.m} label="min" />
                <span className="text-base font-black pb-4" style={{ color: "rgba(249,115,22,0.5)" }}>:</span>
                <TimeBlock value={timer.s} label="sec" />
              </div>
            )}
            <Link
              href="/produits?section=flashsale"
              className="flex items-center gap-1 text-xs font-bold transition-opacity hover:opacity-70"
              style={{ color: "#fb923c" }}
            >
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile: countdown label */}
        {soonestEnd && !timer.expired && (
          <p className="sm:hidden text-[9px] uppercase tracking-widest font-semibold mb-3 -mt-2" style={{ color: "rgba(251,146,60,0.6)" }}>
            Fin dans
          </p>
        )}

        {/* ── Scroll row ───────────────────────────────────────────────────── */}
        <div className="relative">

          {/* Left fade + arrow */}
          {canScrollLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-8 pointer-events-none"
              style={{ background: "linear-gradient(to right, #0f172a 40%, transparent)" }}
            >
              <button
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
                className="pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center text-white
                           transition-all active:scale-90 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cards row */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-1"
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
                    <FlashCard product={product} />
                  </div>
                ))
            }
          </div>

          {/* Right fade + arrow */}
          {canScrollRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-8 pointer-events-none"
              style={{ background: "linear-gradient(to left, #7c2d12 30%, transparent)" }}
            >
              <button
                onClick={() => scroll("right")}
                aria-label="Défiler à droite"
                className="pointer-events-auto w-9 h-9 rounded-full flex items-center justify-center text-white
                           transition-all active:scale-90 hover:scale-105"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
                }}
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
