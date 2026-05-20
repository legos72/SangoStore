"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Shirt, Smartphone, Gem, Hop as Home, Coffee, Dumbbell, ShoppingBag, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";

const MAIN_CATEGORIES = [
  { slug: "mode",         href: "/mode-africaine",         label: "Mode Africaine", img: "/categories/homme.png",    grad: "from-amber-950 to-amber-700",    Icon: Shirt,       iconColor: "#F59E0B", accent: "rgba(245,158,11,.15)" },
  { slug: "mode-femme",   href: "/categorie/mode-femme",   label: "Mode Femme",     img: "/categoriHome/Mf1h.png",   grad: "from-pink-950 to-pink-700",      Icon: ShoppingBag, iconColor: "#F472B6", accent: "rgba(244,114,182,.15)" },
  { slug: "mode-homme",   href: "/categorie/mode-homme",   label: "Mode Homme",     img: "/categoriHome/HCatH.png",  grad: "from-slate-950 to-slate-700",    Icon: Briefcase,   iconColor: "#94A3B8", accent: "rgba(148,163,184,.12)" },
  { slug: "electronique", href: "/categorie/electronique", label: "Électronique",   img: "/categoriHome/electro.png",grad: "from-blue-950 to-blue-700",      Icon: Smartphone,  iconColor: "#60A5FA", accent: "rgba(96,165,250,.14)" },
  { slug: "beaute",       href: "/categorie/beaute",       label: "Beauté & Soins", img: "/categoriHome/Soin1.png",  grad: "from-rose-950 to-rose-700",      Icon: Gem,         iconColor: "#F472B6", accent: "rgba(244,114,182,.14)" },
  { slug: "maison",       href: "/categorie/maison",       label: "Maison",         img: "/categoriHome/lit.png",    grad: "from-emerald-950 to-emerald-700",Icon: Home,        iconColor: "#34D399", accent: "rgba(52,211,153,.14)" },
  { slug: "alimentation", href: "/categorie/alimentation", label: "Supermarché",    img: "/categoriHome/alim.png",   grad: "from-orange-950 to-orange-700",  Icon: Coffee,      iconColor: "#FB923C", accent: "rgba(251,146,60,.14)" },
  { slug: "sport",        href: "/categorie/sport",        label: "Sport & Loisirs",img: "/categoriHome/alte.png",   grad: "from-violet-950 to-violet-700",  Icon: Dumbbell,    iconColor: "#A78BFA", accent: "rgba(167,139,250,.14)" },
];

function ScrollArrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Défiler à gauche" : "Défiler à droite"}
      className="pointer-events-auto w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-[#1B3A2D] transition-all duration-150 active:scale-90"
      style={{
        boxShadow: "0 2px 12px rgba(0,0,0,.14), 0 0 0 1px rgba(0,0,0,.06)",
      }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export function CategoriesSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
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
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  }

  return (
    <section className="py-7 sm:py-10 bg-white border-t border-[#EEE8DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <div className="section-accent">
              <span className="section-label">Catégories populaires</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Découvrez nos catégories
            </h2>
          </div>
          <Link
            href="/produits"
            className="flex items-center gap-1 text-sm font-semibold transition-colors hover:opacity-80 flex-shrink-0"
            style={{ color: "#C8850A" }}
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative">
          {canLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-6 pointer-events-none"
              style={{ background: "linear-gradient(to right, white 40%, transparent)" }}
            >
              <ScrollArrow dir="left" onClick={() => scroll("left")} />
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-none"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {MAIN_CATEGORIES.map(({ slug, href, label, img, grad, Icon, iconColor, accent }) => (
              <Link
                key={slug}
                href={href}
                className="group flex flex-col flex-shrink-0 rounded-2xl overflow-hidden border border-[#EEE8DF] hover:border-amber-200 bg-white transition-all duration-300 hover:shadow-[0_6px_24px_rgba(200,133,10,.14)] hover:-translate-y-0.5"
                style={{ width: "clamp(100px, 18vw, 155px)", scrollSnapAlign: "start" }}
              >
                {/* Image */}
                <div className={`aspect-square relative overflow-hidden bg-gradient-to-br ${grad}`}>
                  {img && (
                    <img
                      src={img}
                      alt={label}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-106 transition-transform duration-500 ease-out"
                      style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  {/* Icon badge */}
                  <div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 8px rgba(0,0,0,.20)" }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                  </div>
                </div>

                {/* Label */}
                <div
                  className="px-2 py-2.5 text-center transition-colors"
                  style={{ background: "white" }}
                >
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-800 group-hover:text-[#1B3A2D] transition-colors leading-tight">
                    {label}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {canRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-6 pointer-events-none"
              style={{ background: "linear-gradient(to left, white 40%, transparent)" }}
            >
              <ScrollArrow dir="right" onClick={() => scroll("right")} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
