"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";

export function CountryScroll() {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  }

  return (
    <section className="py-6 sm:py-10 text-white" style={{ background: "linear-gradient(160deg, #0F1928 0%, #0A1120 60%, #1a1206 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-orange-400 text-[10px] font-extrabold uppercase tracking-widest mb-0.5">Origine</p>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Acheter par pays d&apos;origine</h2>
          </div>
          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-90"
              aria-label="Défiler à gauche"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center transition-all active:scale-90"
              aria-label="Défiler à droite"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Scrollable row */}
        <div
          ref={ref}
          className="flex items-center gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {COUNTRIES.filter(c => c.code !== "CF").map((country) => (
            <Link
              key={country.code}
              href={`/produits?country=${country.code}`}
              className="group flex-shrink-0 bg-white/5 border border-white/10 hover:bg-orange-500/15 hover:border-orange-500/40 rounded-xl px-3 py-2.5 flex items-center gap-2.5 transition-all"
              style={{ minWidth: "140px" }}
            >
              <span className="text-2xl leading-none flex-shrink-0">{country.flag}</span>
              <div className="min-w-0">
                <div className="font-semibold text-white text-xs truncate">{country.name}</div>
                <div className="text-[10px] text-gray-500 mt-0.5 group-hover:text-orange-400 transition-colors flex items-center gap-0.5">
                  Voir <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
