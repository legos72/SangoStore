import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { slug: "femme",      label: "Femme",            img: "/categories/femme.png",      href: "/mode-africaine#femme",      emoji: "👗" },
  { slug: "homme",      label: "Homme",             img: "/categories/homme.png",      href: "/mode-africaine#homme",      emoji: "👔" },
  { slug: "enfant",     label: "Enfants",           img: "/categories/enfant.png",     href: "/mode-africaine#enfant",     emoji: "👶" },
  { slug: "accessoire", label: "Accessoires",       img: "/categories/accessoire.png", href: "/mode-africaine#accessoire", emoji: "👜" },
  { slug: "tissu",      label: "Tissus & Couture",  img: "/categories/tissu.png",      href: "/mode-africaine#tissu",      emoji: "🧵" },
  { slug: "mariage",    label: "Mariage",           img: null,                         href: "/mode-africaine#mariage",    emoji: "💍" },
];

export function CategoriesSection() {
  return (
    <section className="py-10 sm:py-14" style={{ backgroundColor: "#F7F4EE" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <p
              className="text-[10px] font-extrabold uppercase tracking-widest mb-1"
              style={{ color: "#D4961E" }}
            >
              ✦ Mode Africaine
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Catégories populaires
            </h2>
          </div>
          <Link
            href="/mode-africaine"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Tout voir <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ slug, label, img, href, emoji }) => (
            <Link
              key={slug}
              href={href}
              className="group relative overflow-hidden rounded-2xl block"
              style={{ aspectRatio: "3/4", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
            >
              {img ? (
                <img
                  src={img}
                  alt={label}
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl"
                  style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2D5C45 100%)" }}
                >
                  {emoji}
                </div>
              )}

              {/* Gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)" }}
              />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                <span className="text-white text-[10px] sm:text-xs font-bold leading-tight block">{label}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="sm:hidden mt-5 text-center">
          <Link
            href="/mode-africaine"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            Voir toutes les catégories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
