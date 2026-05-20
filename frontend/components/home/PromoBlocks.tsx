import Link from "next/link";
import { ArrowRight } from "lucide-react";

const BLOCKS = [
  {
    id: "promos",
    href: "/produits?promos=true",
    label: "Offres spéciales",
    title: "Jusqu'à -30%",
    sub: "sur une sélection de produits de la diaspora",
    cta: "Voir les promos",
    emoji: "🎁",
    bg: "linear-gradient(135deg, #0d3320 0%, #14532d 50%, #166534 100%)",
    labelColor: "rgba(134,239,172,0.9)",
    subColor: "rgba(187,247,208,0.75)",
    accentColor: "rgba(134,239,172,0.20)",
  },
  {
    id: "livraison",
    href: "/transporteurs",
    label: "Livraison certifiée",
    title: "Diaspora → Bangui",
    sub: "Transporteurs vérifiés, livraison sécurisée",
    cta: "Trouver un GP",
    emoji: "✈️",
    bg: "linear-gradient(135deg, #0f1f40 0%, #1e3a5f 50%, #1d4ed8 100%)",
    labelColor: "rgba(147,197,253,0.9)",
    subColor: "rgba(191,219,254,0.75)",
    accentColor: "rgba(147,197,253,0.18)",
  },
] as const;

export function PromoBlocks() {
  return (
    <section className="px-4 sm:px-6 py-4 sm:py-5 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {BLOCKS.map(b => (
            <Link
              key={b.id}
              href={b.href}
              className="relative rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.018] active:scale-[0.982]"
              style={{
                background: b.bg,
                minHeight: "clamp(100px, 24vw, 140px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
              }}
            >
              {/* Blobs décoratifs */}
              <div
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <div
                className="absolute right-4 -bottom-4 w-20 h-20 rounded-full"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
              <div
                className="absolute left-0 bottom-0 w-full h-1/2 rounded-b-2xl"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.12), transparent)" }}
              />

              <div className="relative p-3.5 sm:p-5 h-full flex flex-col justify-between">
                {/* Label */}
                <p
                  className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.14em] leading-none"
                  style={{ color: b.labelColor }}
                >
                  {b.label}
                </p>

                {/* Titre */}
                <p className="text-sm sm:text-lg font-black text-white leading-tight mt-2">
                  {b.title}
                </p>

                {/* Sub */}
                <p
                  className="text-[9px] sm:text-[11px] leading-snug mt-1"
                  style={{ color: b.subColor }}
                >
                  {b.sub}
                </p>

                {/* CTA */}
                <div className="mt-3">
                  <span
                    className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-white px-2.5 py-1 rounded-full leading-none transition-all group-hover:gap-2"
                    style={{ background: b.accentColor, border: "1px solid rgba(255,255,255,0.15)" }}
                  >
                    {b.cta}
                    <ArrowRight className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>

              {/* Emoji */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-3xl sm:text-4xl select-none opacity-70 group-hover:scale-110 group-hover:opacity-90 transition-all duration-300">
                {b.emoji}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
