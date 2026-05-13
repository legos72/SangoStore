"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/images/v2.png",   alt: "Mode africaine – Style & Qualité" },
  { src: "/images/v4.png",   alt: "Produits africains de qualité" },
  { src: "/images/Art1.png", alt: "Artisanat africain" },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (SLIDES.length <= 1 || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "#09090B" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-12 py-10 sm:py-14 lg:py-16">

          {/* Left — text content */}
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1">

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-5"
              style={{ background: "rgba(212,150,30,0.12)", color: "#D4961E", border: "1px solid rgba(212,150,30,0.25)" }}
            >
              ✦ La Diaspora au service des familles
            </div>

            {/* Title */}
            <h1 className="text-[28px] xs:text-[34px] sm:text-[44px] lg:text-[52px] font-extrabold leading-[1.1] tracking-tight text-white mb-4 sm:mb-5">
              Envoyez le meilleur<br className="hidden sm:block" />{" "}
              à vos proches en{" "}
              <span style={{ color: "#D4961E" }}>Afrique.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-7 sm:mb-8 max-w-lg mx-auto lg:mx-0">
              Produits sélectionnés par la diaspora, livrés directement à Bangui.
              Paiement sécurisé, escrow garanti.
            </p>

            {/* CTAs */}
            <div className="flex flex-col xs:flex-row items-center lg:items-start justify-center lg:justify-start gap-3">
              <Link
                href="/produits"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97] whitespace-nowrap"
                style={{ background: "#D4961E", color: "#fff", boxShadow: "0 4px 20px rgba(212,150,30,0.4)" }}
              >
                <ShoppingBag className="w-4 h-4" />
                Commander maintenant
              </Link>
              <Link
                href="/comment-ca-marche"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all text-white/75 hover:text-white border border-white/20 hover:border-white/40 whitespace-nowrap"
              >
                Comment ça marche
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Slide dots */}
            {SLIDES.length > 1 && (
              <div className="flex items-center gap-1.5 mt-7 justify-center lg:justify-start">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Slide ${i + 1}`}
                    className={cn("rounded-full transition-all duration-300",
                      i === current ? "w-6 h-1.5" : "w-1.5 h-1.5 bg-white/25 hover:bg-white/50"
                    )}
                    style={i === current ? { background: "#D4961E" } : {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right — hero image slider */}
          <div
            className="relative order-1 lg:order-2 w-full xs:max-w-[300px] sm:max-w-[360px] lg:max-w-[400px] xl:max-w-[460px] flex-shrink-0 mx-auto lg:mx-0"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Nav arrows */}
            {SLIDES.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Slide précédente"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  aria-label="Slide suivante"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm flex items-center justify-center text-white border border-white/20 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}

            <div
              className="relative overflow-hidden rounded-2xl"
              style={{ aspectRatio: "4/5", boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(212,150,30,0.12)" }}
            >
              {SLIDES.map(({ src, alt }, i) => (
                <img
                  key={src}
                  src={src}
                  alt={alt}
                  className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-700",
                    i === current ? "opacity-100" : "opacity-0"
                  )}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ))}
              {/* Bottom gradient */}
              <div
                className="absolute inset-x-0 bottom-0 h-20 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(9,9,11,0.55), transparent)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
