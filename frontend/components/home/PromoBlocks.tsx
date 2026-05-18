import Link from "next/link";

// ─── Données statiques (facilement remplaçables par une API admin) ────────────

const BLOCKS = [
  {
    id: "promos",
    href: "/produits?promos=true",
    label: "Offres spéciales",
    title: "Jusqu'à\n-30%",
    sub: "sur une sélection de produits",
    cta: "Voir les promos",
    emoji: "🎁",
    bg: "linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)",
    labelColor: "#86efac",
    subColor: "#bbf7d0",
  },
  {
    id: "livraison",
    href: "/transporteurs",
    label: "Livraison certifiée",
    title: "Diaspora\n→ Bangui",
    sub: "Transporteurs vérifiés, livraison sécurisée",
    cta: "Trouver un GP",
    emoji: "✈️",
    bg: "linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 60%, #2563eb 100%)",
    labelColor: "#93c5fd",
    subColor: "#bfdbfe",
  },
] as const;

export function PromoBlocks() {
  return (
    <section className="px-3 sm:px-6 py-2.5 sm:py-3 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {BLOCKS.map(b => (
            <Link
              key={b.id}
              href={b.href}
              className="relative rounded-2xl overflow-hidden group transition-transform duration-200 hover:scale-[1.015] active:scale-[0.985]"
              style={{ background: b.bg, minHeight: "clamp(88px, 22vw, 124px)" }}
            >
              {/* Decorative blobs */}
              <div className="absolute -right-5 -top-5 w-24 h-24 rounded-full"
                style={{ background: "rgba(255,255,255,0.12)" }} />
              <div className="absolute right-2 -bottom-3 w-14 h-14 rounded-full"
                style={{ background: "rgba(255,255,255,0.08)" }} />

              <div className="relative p-3 sm:p-4 h-full flex flex-col justify-between">
                {/* Label */}
                <p className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-none"
                  style={{ color: b.labelColor }}>
                  {b.label}
                </p>

                {/* Title */}
                <p className="text-sm sm:text-base font-black text-white leading-tight mt-1"
                  style={{ whiteSpace: "pre-line" }}>
                  {b.title}
                </p>

                {/* Sub */}
                <p className="text-[9px] sm:text-[10px] leading-tight mt-0.5"
                  style={{ color: b.subColor }}>
                  {b.sub}
                </p>

                {/* CTA */}
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-white bg-white/20 px-2 py-1 rounded-full leading-none">
                    {b.cta} →
                  </span>
                </div>
              </div>

              {/* Emoji decoration */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-2xl sm:text-3xl select-none opacity-75 group-hover:scale-110 transition-transform duration-200">
                {b.emoji}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
