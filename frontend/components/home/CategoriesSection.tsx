"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Shirt, Smartphone, Sparkles, Home, UtensilsCrossed, Dumbbell, ShoppingBag, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

const MAIN_CATEGORIES = [
  { slug: "mode",         href: "/mode-africaine",         label: "Mode Africaine", shortLabel: "Africaine", img: "/categories/homme.png",    grad: "from-amber-900   to-amber-700",   Icon: Shirt,           iconColor: "#F59E0B" },
  { slug: "mode-femme",   href: "/categorie/mode-femme",   label: "Mode Femme",     shortLabel: "Femme",     img: "/categoriHome/Mf1h.png",   grad: "from-pink-900    to-pink-700",    Icon: ShoppingBag,     iconColor: "#F472B6" },
  { slug: "mode-homme",   href: "/categorie/mode-homme",   label: "Mode Homme",     shortLabel: "Homme",     img: "/categoriHome/HCatH.png",  grad: "from-slate-900   to-slate-700",   Icon: Briefcase,       iconColor: "#94A3B8" },
  { slug: "electronique", href: "/categorie/electronique", label: "Électronique",   shortLabel: "Électro",   img: "/categoriHome/electro.png", grad: "from-blue-900    to-blue-700",    Icon: Smartphone,      iconColor: "#60A5FA" },
  { slug: "beaute",       href: "/categorie/beaute",       label: "Beauté & Soins", shortLabel: "Beauté",    img: "/categoriHome/Soin1.png",  grad: "from-rose-900    to-rose-700",    Icon: Sparkles,        iconColor: "#F472B6" },
  { slug: "maison",       href: "/categorie/maison",       label: "Maison",         shortLabel: "Maison",    img: "/categoriHome/lit.png",    grad: "from-emerald-900 to-emerald-700", Icon: Home,            iconColor: "#34D399" },
  { slug: "alimentation", href: "/categorie/alimentation", label: "Supermarché",    shortLabel: "Aliment.",  img: "/categoriHome/alim.png",   grad: "from-orange-900  to-orange-700",  Icon: UtensilsCrossed, iconColor: "#FB923C" },
  { slug: "sport",        href: "/categorie/sport",        label: "Sport & Loisirs",shortLabel: "Sport",     img: "/categoriHome/alte.png",   grad: "from-violet-900  to-violet-700",  Icon: Dumbbell,        iconColor: "#A78BFA" },
];

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
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
  }, [updateArrows]);

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  }

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-0.5" style={{ color: "#F59E0B" }}>
              Catégories populaires
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Découvrez nos catégories</h2>
          </div>
          <Link
            href="/produits"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold transition-colors hover:opacity-80"
            style={{ color: "#1B3A2D" }}
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carousel avec flèches Jumia-style */}
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
                           text-gray-500 hover:border-amber-300 hover:text-amber-600
                           transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
          >
            {MAIN_CATEGORIES.map(({ slug, href, label, shortLabel, img, grad, Icon, iconColor }) => (
              <Link
                key={slug}
                href={href}
                className="group flex flex-col rounded-xl sm:rounded-2xl overflow-hidden border-2 border-transparent flex-shrink-0
                           hover:border-amber-300 hover:shadow-[0_4px_18px_rgba(212,150,30,0.25)]
                           transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
                style={{ width: "clamp(100px, 18vw, 160px)" }}
              >
                <div className={`aspect-square w-full relative overflow-hidden bg-gradient-to-br ${grad}`}>
                  {img ? (
                    <img
                      src={img} alt={label}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                <div className="flex justify-center -mt-3.5 relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center
                                  shadow-[0_2px_8px_rgba(0,0,0,0.22)] border-2 border-white">
                    <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                  </div>
                </div>

                <div className="px-1.5 pt-1 pb-2 text-center bg-white group-hover:bg-amber-50 transition-colors">
                  <p className="text-[9px] sm:text-[11px] font-bold leading-tight text-gray-800 group-hover:text-amber-700 transition-colors hyphens-auto break-words">
                    {label}
                  </p>
                </div>
              </Link>
            ))}
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
                           text-gray-500 hover:border-amber-300 hover:text-amber-600
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
