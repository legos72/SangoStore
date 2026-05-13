import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    slug:  "mode",
    label: "Mode Africaine",
    sub:   "Vêtements & Tissus",
    img:   "/categories/femme.png",
    href:  "/mode-africaine",
    grad:  "",
    emoji: "👗",
  },
  {
    slug:  "electronique",
    label: "Électronique",
    sub:   "Téléphones & High-tech",
    img:   null,
    href:  "/produits?category=electronique",
    grad:  "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    emoji: "📱",
  },
  {
    slug:  "beaute",
    label: "Beauté & Soins",
    sub:   "Cosmétiques & Parfums",
    img:   null,
    href:  "/produits?category=beaute",
    grad:  "linear-gradient(135deg, #3d0c11 0%, #7c2d44 100%)",
    emoji: "💄",
  },
  {
    slug:  "maison",
    label: "Maison & Décoration",
    sub:   "Déco & Mobilier",
    img:   null,
    href:  "/produits?category=maison",
    grad:  "linear-gradient(135deg, #1b3a2d 0%, #2d5c45 100%)",
    emoji: "🏠",
  },
  {
    slug:  "alimentation",
    label: "Alimentation",
    sub:   "Épicerie africaine",
    img:   null,
    href:  "/produits?category=alimentation",
    grad:  "linear-gradient(135deg, #1a2e0f 0%, #3a5c1a 100%)",
    emoji: "🥗",
  },
  {
    slug:  "sport",
    label: "Sport & Loisirs",
    sub:   "Fitness & Jeux",
    img:   null,
    href:  "/produits?category=sport",
    grad:  "linear-gradient(135deg, #1a1a1a 0%, #404040 100%)",
    emoji: "🏋️",
  },
];

export function CategoriesSection() {
  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest mb-1" style={{ color: "#D4961E" }}>
              ✦ Catégories populaires
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Découvrez nos catégories
            </h2>
          </div>
          <Link
            href="/produits"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Voir toutes les catégories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ slug, label, sub, img, href, grad, emoji }) => (
            <Link
              key={slug}
              href={href}
              className="group relative overflow-hidden rounded-2xl block"
              style={{ aspectRatio: "3/4", boxShadow: "0 2px 16px rgba(0,0,0,0.10)" }}
            >
              {img ? (
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-2"
                  style={{ background: grad }}
                >
                  <span className="text-3xl sm:text-4xl">{emoji}</span>
                </div>
              )}

              {/* Gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 group-hover:opacity-90"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)" }}
              />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <span className="text-white text-[10px] sm:text-xs font-bold leading-tight block">{label}</span>
                <span className="text-white/60 text-[9px] leading-none mt-0.5 hidden sm:block">{sub}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-5 text-center">
          <Link
            href="/produits"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500"
          >
            Voir toutes les catégories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
