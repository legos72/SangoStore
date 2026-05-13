"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/images/v2.png",   alt: "Diaspora africaine – La diaspora au service des familles" },
  { src: "/images/v4.png",   alt: "Produits africains de qualité – Livraison vers Bangui"    },
  { src: "/images/Art1.png", alt: "Artisanat et mode africaine"                              },
  { src: "/images/liv.png",  alt: "Livraison internationale vers Bangui"                     },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (SLIDES.length <= 1 || paused) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(440px, 60vw, 580px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background slides ───────────────────────────────────────────── */}
      {SLIDES.map(({ src, alt }, i) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0"
          )}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover object-center"
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      {/* ── Dark gradient overlays ──────────────────────────────────────── */}
      {/* Desktop: gradient from left (text side) */}
      <div
        className="absolute inset-0 hidden sm:block"
        style={{ background: "linear-gradient(100deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.72) 38%, rgba(5,5,5,0.28) 65%, rgba(5,5,5,0.08) 100%)" }}
      />
      {/* Mobile: uniform overlay */}
      <div
        className="absolute inset-0 sm:hidden"
        style={{ background: "rgba(0,0,0,0.60)" }}
      />

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-[520px]">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest mb-4 sm:mb-5"
            style={{ background: "rgba(212,150,30,0.15)", color: "#D4961E", border: "1px solid rgba(212,150,30,0.35)" }}
          >
            ✦ La Diaspora au service des familles
          </div>

          {/* Title */}
          <h1 className="text-[28px] xs:text-[34px] sm:text-[46px] lg:text-[52px] font-extrabold leading-[1.08] tracking-tight text-white mb-3 sm:mb-4">
            Envoyez le meilleur<br />
            à vos proches en{" "}
            <span style={{ color: "#D4961E" }}>Afrique.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/68 text-sm sm:text-[15px] leading-relaxed mb-6 sm:mb-8 max-w-sm sm:max-w-[420px]">
            Marketplace premium dédiée à la diaspora africaine.
            Achetez en toute confiance et faites-vous livrer rapidement.
          </p>

          {/* CTAs */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3">
            <Link
              href="/produits"
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97] whitespace-nowrap"
              style={{ background: "#D4961E", color: "#fff", boxShadow: "0 4px 20px rgba(212,150,30,0.42)" }}
            >
              Explorer les produits
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/register?role=vendeur"
              className="flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl font-semibold text-sm transition-all text-white border border-white/30 hover:bg-white/10 hover:border-white/55 whitespace-nowrap"
            >
              Devenir vendeur
            </Link>
          </div>
        </div>
      </div>

      {/* ── Slide dots ──────────────────────────────────────────────────── */}
      {SLIDES.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={cn("rounded-full transition-all duration-300",
                i !== current && "bg-white/35 hover:bg-white/60 w-2 h-2"
              )}
              style={i === current ? { background: "#D4961E", width: "28px", height: "6px" } : {}}
            />
          ))}
        </div>
      )}

      {/* ── Arrow buttons (desktop) ─────────────────────────────────────── */}
      {SLIDES.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide précédente"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm items-center justify-center text-white border border-white/20 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            aria-label="Slide suivante"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm items-center justify-center text-white border border-white/20 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </section>
  );
}
