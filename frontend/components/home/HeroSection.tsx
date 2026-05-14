"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ShieldCheck, Truck, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

// Pour ajouter une image : copier dans /public/images/ et ajouter une entrée ici
const SLIDES = [
  { src: "/images/v2.png",   alt: "Bangui Market – La diaspora au service des familles" },
  { src: "/images/v4.png",   alt: "Bangui Market – Vendez vos produits depuis l'étranger vers la Centrafrique" },
  { src: "/images/Art1.png", alt: "Bangui Market – Des milliers de produits à portée de main" },
  { src: "/images/liv.png",  alt: "Bangui Market – Livraison internationale vers Bangui" },
];

export function HeroSection() {
  const { locale } = useI18n();
  const hero = translations.hero;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (SLIDES.length <= 1 || paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-900 h-auto sm:h-[360px] md:h-[440px] lg:h-[500px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map(({ src, alt }, i) => (
        <div
          key={src}
          className={cn(
            "sm:absolute sm:inset-0 transition-opacity duration-1000",
            /* Mobile : empile les slides, seul le courant est visible */
            i === current ? "opacity-100 relative sm:z-10" : "opacity-0 absolute inset-0 sm:z-0"
          )}
        >
          {/* Mobile : image entière, hauteur naturelle, aucun crop */}
          <img
            src={src}
            alt={alt}
            className="block sm:hidden w-full h-auto object-contain"
            loading={i === 0 ? "eager" : "lazy"}
          />
          {/* Desktop : Next/Image fill avec cover */}
          <div className="hidden sm:block absolute inset-0">
            <Image
              src={src}
              alt={alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover object-[center_25%]"
            />
          </div>
        </div>
      ))}

      {/* Flèches de navigation — cachées sur mobile (swipe natif suffit) */}
      {SLIDES.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Slide précédente"
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm items-center justify-center transition-all border border-white/20"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={next}
            aria-label="Slide suivante"
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/35 hover:bg-black/55 backdrop-blur-sm items-center justify-center transition-all border border-white/20"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </>
      )}

      {/* Barre de confiance + dots */}
      <div className="relative sm:absolute bottom-0 left-0 right-0 z-20 bg-black/70 sm:bg-black/50 backdrop-blur-sm border-t border-white/10">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2">

          {/* Badges de confiance */}
          <div className="flex items-center gap-2 sm:gap-6 flex-1">
            {[
              { icon: ShieldCheck, label: t(hero.trust.escrow, locale),   color: "text-green-400"  },
              { icon: Truck,       label: t(hero.trust.gp, locale),        color: "text-blue-400"   },
              { icon: CheckCircle, label: t(hero.trust.payment, locale),   color: "text-orange-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-1 sm:gap-1.5">
                <Icon className={cn("w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0", color)} />
                <span className="text-white/85 text-[9px] sm:text-xs font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Dots de navigation */}
          {SLIDES.length > 1 && (
            <div className="flex items-center gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === current
                      ? "w-5 h-1.5 bg-orange-400"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                  )}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
