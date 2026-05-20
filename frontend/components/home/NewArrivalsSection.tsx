"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { SectionHeader } from "@/components/ui/SectionHeader";
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
    <section className="py-8 sm:py-12" style={{ background: "#F5F2EC" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <SectionHeader
            label="Nouveautés"
            title="Derniers produits arrivés"
            subtitle="Les toutes dernières additions à notre catalogue"
            href="/produits?sortBy=newest"
            hrefLabel="Voir tout"
          />
        </div>

        <div className="relative">
          {canScrollLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-8 pointer-events-none"
              style={{ background: "linear-gradient(to right, #F5F2EC 45%, transparent)" }}
            >
              <button
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
                className="pointer-events-auto w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-[#1B3A2D] transition-all duration-150 active:scale-90"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.06)" }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0" style={{ width: "clamp(160px, 43vw, 220px)", scrollSnapAlign: "start" }}>
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map(product => (
                  <div key={product.id} className="flex-shrink-0" style={{ width: "clamp(160px, 43vw, 220px)", scrollSnapAlign: "start" }}>
                    <ProductCard product={product} />
                  </div>
                ))
            }
          </div>

          {canScrollRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-8 pointer-events-none"
              style={{ background: "linear-gradient(to left, #F5F2EC 45%, transparent)" }}
            >
              <button
                onClick={() => scroll("right")}
                aria-label="Défiler à droite"
                className="pointer-events-auto w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-[#1B3A2D] transition-all duration-150 active:scale-90"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.06)" }}
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
