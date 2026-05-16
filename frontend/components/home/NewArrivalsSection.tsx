"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductCardSkeleton } from "@/components/product/ProductCardSkeleton";
import { api } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Product } from "@/lib/types";

export function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.products.list({ section: "newarrival", limit: "12", sortBy: "newest" } as any)
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
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex gap-1">
              <button onClick={() => scroll("left")}
                className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-green-300 hover:text-green-600 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => scroll("right")}
                className="w-7 h-7 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:border-green-300 hover:text-green-600 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <Link href="/produits?sortBy=newest"
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: "#1B3A2D" }}>
              Voir tout <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

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
