"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, CheckCircle, Package, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDES = [
  { src: "/images/v2.png",   alt: "Bangui Market – La diaspora au service des familles"              },
  { src: "/images/v4.png",   alt: "Bangui Market – Vendez vos produits depuis l'étranger"            },
  { src: "/images/Art1.png", alt: "Bangui Market – Des milliers de produits à portée de main"        },
  { src: "/images/liv.png",  alt: "Bangui Market – Livraison internationale vers Bangui"             },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Paiement sécurisé",  sub: "Transactions 100% protégées",    color: "text-green-400"  },
  { icon: Package,     label: "Livraison suivie",    sub: "Dans tous les pays d'Afrique",   color: "text-blue-400"   },
  { icon: CheckCircle, label: "Escrow garanti",      sub: "Votre argent est protégé",       color: "text-yellow-400" },
  { icon: Truck,       label: "Support 24/7",        sub: "WhatsApp & Email",               color: "text-orange-400" },
  { icon: BadgeCheck,  label: "Vendeurs certifiés",  sub: "Vérifiés et approuvés",          color: "text-purple-400" },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused,  setPaused]  = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section style={{ background: "#0D1F10" }}>

      {/* ── Contenu principal ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8 lg:gap-16 py-10 sm:py-12 lg:py-16">

          {/* Texte gauche */}
          <div className="flex-1 min-w-0">

            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-5"
              style={{ background: "rgba(212,165,30,0.15)", border: "1px solid rgba(212,165,30,0.32)", color: "#D4A520" }}
            >
              La diaspora au service des familles
            </span>

            {/* Titre */}
            <h1 className="text-[28px] xs:text-[32px] sm:text-4xl lg:text-5xl xl:text-[54px] font-black text-white leading-[1.1] tracking-tight mb-4">
              Envoyez le meilleur<br />
              à vos proches<br />
              <span style={{ color: "#F59E0B" }}>en Afrique.</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-white/55 text-sm sm:text-base max-w-sm mb-8 leading-relaxed">
              Marketplace premium dédiée à la diaspora africaine. Achetez en toute confiance et faites-vous livrer rapidement.
            </p>

            {/* Boutons CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-sm transition-all hover:brightness-110 active:scale-95"
                style={{ background: "#F59E0B", color: "#111827", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
              >
                Explorer les produits →
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl font-bold text-sm text-white transition-all hover:bg-white/10 active:scale-95"
                style={{ border: "1.5px solid rgba(255,255,255,0.25)" }}
              >
                Devenir vendeur
              </Link>
            </div>
          </div>

          {/* Carrousel images — visible md+ */}
          <div
            className="hidden md:block relative flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ width: "clamp(280px, 40%, 500px)", aspectRatio: "4/3" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {SLIDES.map(({ src, alt }, i) => (
              <div
                key={src}
                className={cn(
                  "absolute inset-0 transition-opacity duration-1000",
                  i === current ? "opacity-100" : "opacity-0"
                )}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  sizes="500px"
                  className="object-cover object-center"
                  priority={i === 0}
                />
              </div>
            ))}

            {/* Vignette intérieure */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,0.2)" }}
            />

            {/* Flèches */}
            {SLIDES.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Slide précédente"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={next}
                  aria-label="Slide suivante"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </>
            )}

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === current ? "w-5 h-1.5 bg-amber-400" : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Barre de confiance ─────────────────────────────────────────── */}
      <div className="border-t border-white/8" style={{ background: "rgba(0,0,0,0.22)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div
            className="flex items-center gap-5 sm:gap-8 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {TRUST_ITEMS.map(({ icon: Icon, label, sub, color }) => (
              <div key={label} className="flex items-center gap-2 flex-shrink-0">
                <Icon className={cn("w-4 h-4 flex-shrink-0", color)} />
                <div>
                  <div className="text-white text-xs font-semibold whitespace-nowrap">{label}</div>
                  <div className="text-white/45 text-[10px] whitespace-nowrap hidden sm:block">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
