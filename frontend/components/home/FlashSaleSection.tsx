"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product } from "@/lib/types";

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

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-900 text-white rounded-lg flex items-center justify-center text-xs sm:text-sm font-extrabold tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[8px] text-gray-400 mt-0.5 uppercase tracking-wide">{label}</span>
    </div>
  );
}

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

  // Use the earliest flash_sale_end among loaded products as the countdown target
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
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  return (
    <section className="py-5 sm:py-8" style={{ background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 50%, #1a0a00 100%)" }}>
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-yellow-400">
              <Zap className="w-4 h-4 text-gray-900" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-yellow-400">
                Offres limitées
              </p>
              <h2 className="text-base sm:text-xl font-extrabold text-white leading-tight">
                Flash Sale
              </h2>
            </div>

            {/* Countdown */}
            {soonestEnd && !timer.expired && (
              <div className="hidden sm:flex items-center gap-1.5 ml-3">
                <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1">Fin dans</span>
                <TimeBox value={timer.h} label="h" />
                <span className="text-white font-bold text-xs pb-4">:</span>
                <TimeBox value={timer.m} label="min" />
                <span className="text-white font-bold text-xs pb-4">:</span>
                <TimeBox value={timer.s} label="sec" />
              </div>
            )}
          </div>

          <Link href="/produits?section=flashsale"
            className="flex items-center gap-1 text-xs font-semibold text-yellow-400 hover:opacity-80 transition-opacity">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile countdown */}
        {soonestEnd && !timer.expired && (
          <div className="flex sm:hidden items-center gap-1.5 mb-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wide mr-1">Fin dans</span>
            <TimeBox value={timer.h} label="h" />
            <span className="text-white font-bold text-xs pb-4">:</span>
            <TimeBox value={timer.m} label="min" />
            <span className="text-white font-bold text-xs pb-4">:</span>
            <TimeBox value={timer.s} label="sec" />
          </div>
        )}

        {/* Scroll row */}
        <div className="relative">

          {canScrollLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-6 pointer-events-none"
              style={{ background: "linear-gradient(to right, #1a0a00 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
                className="pointer-events-auto w-8 h-8 rounded-full border border-white/25 bg-white/15 flex items-center justify-center
                           text-white hover:bg-white/25 transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col" style={{ width: "clamp(148px, 42vw, 192px)" }}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map(product => (
                  <div key={product.id} className="flex-shrink-0 flex flex-col" style={{ width: "clamp(148px, 42vw, 192px)" }}>
                    <ProductCard product={product} className="flex-1" />
                  </div>
                ))
            }
          </div>

          {canScrollRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-6 pointer-events-none"
              style={{ background: "linear-gradient(to left, #1a0a00 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("right")}
                aria-label="Défiler à droite"
                className="pointer-events-auto w-8 h-8 rounded-full border border-white/25 bg-white/15 flex items-center justify-center
                           text-white hover:bg-white/25 transition-all active:scale-90"
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
