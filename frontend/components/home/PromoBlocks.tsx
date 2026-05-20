import Link from "next/link";
import { ArrowRight, Percent, Plane } from "lucide-react";

const BLOCKS = [
  {
    id:     "promos",
    href:   "/produits?promos=true",
    label:  "Offres spéciales",
    title:  "Jusqu'à -30%",
    sub:    "sur une sélection de produits de la diaspora",
    cta:    "Voir les promos",
    icon:   Percent,
    bg:     "linear-gradient(135deg, #0A2918 0%, #12462A 50%, #1A6340 100%)",
    glow:   "rgba(52,211,153,.18)",
    badge:  "rgba(52,211,153,.15)",
    badgeText: "rgba(110,231,183,.95)",
  },
  {
    id:     "livraison",
    href:   "/transporteurs",
    label:  "Livraison certifiée",
    title:  "Diaspora → Bangui",
    sub:    "Transporteurs vérifiés, livraison sécurisée",
    cta:    "Trouver un GP",
    icon:   Plane,
    bg:     "linear-gradient(135deg, #061226 0%, #0F2448 50%, #153566 100%)",
    glow:   "rgba(96,165,250,.18)",
    badge:  "rgba(96,165,250,.14)",
    badgeText: "rgba(147,197,253,.95)",
  },
] as const;

export function PromoBlocks() {
  return (
    <section className="px-4 sm:px-6 py-4 sm:py-5" style={{ background: "#F5F2EC" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {BLOCKS.map(b => {
            const BlockIcon = b.icon;
            return (
              <Link
                key={b.id}
                href={b.href}
                className="relative rounded-2xl overflow-hidden group transition-all duration-300 hover:scale-[1.016] active:scale-[0.984]"
                style={{
                  background: b.bg,
                  minHeight:  "clamp(96px, 22vw, 136px)",
                  boxShadow:  "0 4px 24px rgba(0,0,0,.22), 0 1px 4px rgba(0,0,0,.14)",
                }}
              >
                {/* Decorative blobs */}
                <div
                  className="absolute -right-10 -top-10 w-36 h-36 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,.06)" }}
                />
                <div
                  className="absolute -right-2 bottom-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,.04)" }}
                />
                {/* Glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 80% 20%, ${b.glow} 0%, transparent 60%)` }}
                />
                {/* Bottom fade */}
                <div
                  className="absolute inset-0 pointer-events-none rounded-2xl"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,.18), transparent 55%)" }}
                />

                <div className="relative p-3.5 sm:p-5 h-full flex flex-col justify-between">
                  {/* Label badge */}
                  <span
                    className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.14em] px-2 py-1 rounded-full leading-none w-fit"
                    style={{ background: b.badge, color: b.badgeText, border: `1px solid ${b.badge}` }}
                  >
                    <BlockIcon className="w-2.5 h-2.5" />
                    {b.label}
                  </span>

                  <div className="mt-1.5">
                    <p className="text-base sm:text-xl font-black text-white leading-tight">{b.title}</p>
                    <p
                      className="text-[9px] sm:text-[11px] leading-snug mt-1"
                      style={{ color: "rgba(255,255,255,.60)" }}
                    >
                      {b.sub}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-3">
                    <span
                      className="inline-flex items-center gap-1.5 text-[9px] sm:text-[11px] font-bold text-white px-3 py-1.5 rounded-full leading-none transition-all group-hover:gap-2.5"
                      style={{ background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.16)" }}
                    >
                      {b.cta}
                      <ArrowRight className="w-2.5 h-2.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                {/* Big icon */}
                <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none opacity-14 group-hover:opacity-20 transition-opacity duration-300">
                  <BlockIcon
                    className="text-white group-hover:scale-110 transition-transform duration-300"
                    style={{ width: "clamp(36px, 7vw, 52px)", height: "clamp(36px, 7vw, 52px)" }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
