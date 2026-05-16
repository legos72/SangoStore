"use client";

import { useState, useEffect, useRef } from "react";
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

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              <button onClick={() => scroll("left")}
                className="w-7 h-7 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll("right")}
                className="w-7 h-7 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link href="/produits?section=flashsale"
              className="flex items-center gap-1 text-xs font-semibold text-yellow-400 hover:opacity-80 transition-opacity">
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
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
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2"
          style={{ scrollbarWidth: "none" }}
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0" style={{ width: "clamp(140px, 40vw, 190px)" }}>
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map(product => (
                <div key={product.id} className="flex-shrink-0" style={{ width: "clamp(140px, 40vw, 190px)" }}>
                  <ProductCard product={product} />
                </div>
              ))
          }
        </div>
      </div>
    </section>
  );
}
