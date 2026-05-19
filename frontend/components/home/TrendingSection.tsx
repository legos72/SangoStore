"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product } from "@/lib/types";

export function TrendingSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef                = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    api.products.list({ section: "trending", limit: "12" } as any)
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  return (
    <section className="py-5 sm:py-8 bg-white border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 bg-amber-500">
                <Flame className="w-2.5 h-2.5 text-white" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">
                Tendances
              </span>
            </div>
            <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-900 leading-tight">
              Produits tendances
            </h2>
          </div>
          <Link
            href="/produits?section=trending"
            className="flex items-center gap-0.5 text-[12px] font-semibold transition-colors whitespace-nowrap pb-0.5"
            style={{ color: "#1B3A2D" }}
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">

          {canScrollLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-6 pointer-events-none"
              style={{ background: "linear-gradient(to right, white 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
                className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-gray-200
                           shadow-[0_2px_10px_rgba(0,0,0,0.15)] flex items-center justify-center
                           text-gray-500 hover:border-[#2d6a4f] hover:text-[#1B3A2D]
                           transition-all active:scale-90"
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
                  <div key={i} className="flex-shrink-0 flex flex-col" style={{ width: "clamp(160px, 43vw, 220px)" }}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map(product => (
                  <div key={product.id} className="flex-shrink-0 flex flex-col" style={{ width: "clamp(160px, 43vw, 220px)" }}>
                    <ProductCard product={product} className="flex-1" />
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
                className="pointer-events-auto w-8 h-8 rounded-full bg-white border border-gray-200
                           shadow-[0_2px_10px_rgba(0,0,0,0.15)] flex items-center justify-center
                           text-gray-500 hover:border-[#2d6a4f] hover:text-[#1B3A2D]
                           transition-all active:scale-90"
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
