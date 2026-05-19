"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product } from "@/lib/types";

export function NewArrivalsSection() {
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
    api.products.list({ section: "newarrival", limit: "12", sortBy: "newest" } as any)
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
        <div className="flex items-center justify-between mb-3 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2d6a4f 100%)" }}>
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "#1B3A2D" }}>
                Nouveautés
              </p>
              <h2 className="text-base sm:text-xl font-extrabold text-gray-900 leading-tight">
                Dernières arrivées
              </h2>
            </div>
          </div>
          <Link href="/produits?sortBy=newest"
            className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
            style={{ color: "#1B3A2D" }}>
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
                           text-gray-500 hover:border-green-300 hover:text-green-600
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
                  <div key={i} className="flex-shrink-0 flex flex-col" style={{ width: "clamp(180px, 44vw, 240px)" }}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map(product => (
                  <div key={product.id} className="flex-shrink-0 flex flex-col" style={{ width: "clamp(180px, 44vw, 240px)" }}>
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
                           text-gray-500 hover:border-green-300 hover:text-green-600
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
