import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { HomeTransporters } from "@/components/home/HomeTransporters";
import { COUNTRIES } from "@/lib/countries";

const MAIN_CATEGORIES = [
  { slug: "mode",         href: "/mode-africaine",             label: "Mode Africaine",     count: "12 990", img: "/categories/femme.png",      emoji: "👗", bg: "#FEF3E2" },
  { slug: "electronique", href: "/produits?category=electronique", label: "Électronique",   count: "8 750",  img: null,                         emoji: "📱", bg: "#EFF6FF" },
  { slug: "beaute",       href: "/produits?category=beaute",   label: "Beauté & Soins",     count: "6 240",  img: null,                         emoji: "💄", bg: "#FDF2F8" },
  { slug: "maison",       href: "/produits?category=maison",   label: "Maison & Décoration",count: "4 810",  img: "/categories/Marier.png",     emoji: "🏠", bg: "#F0FDF4" },
  { slug: "alimentation", href: "/produits?category=alimentation", label: "Alimentation",  count: "7 100",  img: null,                         emoji: "🥗", bg: "#FFFBEB" },
  { slug: "sport",        href: "/produits?category=sport",    label: "Sport & Loisirs",    count: "3 860",  img: null,                         emoji: "⚽", bg: "#F5F3FF" },
];

const SUPPORT_PHONE    = "+221 78 686 39 69";
const SUPPORT_WHATSAPP = "221786863969";

const HOW_IT_WORKS = [
  { step: "01", icon: "📱", title: "Choisissez votre produit",   desc: "Parcourez nos produits envoyés par la diaspora depuis la France, le Sénégal, le Cameroun…" },
  { step: "02", icon: "💳", title: "Payez en toute sécurité",    desc: "Orange Money ou cash. Votre argent est bloqué en escrow jusqu'à la livraison."            },
  { step: "03", icon: "🚚", title: "Le vendeur expédie via GP",  desc: "Le vendeur choisit un transporteur certifié. Le colis part vers Bangui."                   },
  { step: "04", icon: "🇨🇫", title: "Récupérez à Bangui",       desc: "Le colis arrive au point de retrait. Vous récupérez, l'argent est libéré au vendeur."       },
];

export default function HomePage() {
  return (
    <>
      <HeroSection />

      {/* ── Catégories populaires ───────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1B3A2D" }}>
                Catégories populaires
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Découvrez nos catégories</h2>
            </div>
            <Link
              href="/produits"
              className="flex items-center gap-1 text-sm font-semibold hover:underline"
              style={{ color: "#1B3A2D" }}
            >
              Voir toutes les catégories <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
            {MAIN_CATEGORIES.map(({ slug, href, label, count, img, emoji, bg }) => (
              <Link
                key={slug}
                href={href}
                className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-all"
              >
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden relative flex-shrink-0 flex items-center justify-center"
                  style={{ background: bg }}
                >
                  {img ? (
                    <img
                      src={img}
                      alt={label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl">{emoji}</span>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-green-800 transition-colors leading-tight">
                    {label}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{count} produits</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produits tendance ──────────────────────────────────────────── */}
      <FeaturedProducts />

      {/* ── Support client strip ────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-3" style={{ backgroundColor: "#F7F4EE" }}>
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-orange-100/80 rounded-2xl px-4 sm:px-5 py-3
                          shadow-[0_1px_8px_rgba(249,115,22,0.07)]
                          flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">

            {/* Left — icon + status + title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-sm">
                  🎧
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-white" />
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest mb-px">
                  Support en ligne
                </p>
                <p className="text-xs sm:text-[13px] font-semibold text-gray-800 leading-tight">
                  Besoin d&apos;aide pour commander ?
                  <span className="hidden sm:inline text-[11px] font-normal text-gray-400 ml-2">
                    Notre équipe répond en quelques minutes — 7j/7
                  </span>
                </p>
              </div>
            </div>

            {/* Right — action buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold
                           transition-all hover:scale-[1.03] active:scale-[0.97] whitespace-nowrap"
                style={{
                  background: "#22c55e",
                  color: "#fff",
                  boxShadow: "0 2px 10px rgba(34,197,94,0.28)",
                }}
              >
                <span className="text-sm leading-none">💬</span>
                WhatsApp
              </a>
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-600
                           bg-gray-50 border border-gray-200 hover:border-orange-300 hover:text-orange-600
                           transition-all whitespace-nowrap"
              >
                <Phone className="w-3 h-3 flex-shrink-0 text-orange-400" />
                {SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transporters ────────────────────────────────────────────────── */}
      <HomeTransporters />

      {/* ── Browse by country (après Transporteurs) ─────────────────────── */}
      <section className="py-8 sm:py-14 text-white" style={{ background: "linear-gradient(160deg, #0F1928 0%, #0A1120 60%, #1a1206 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5 sm:mb-8">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Origine</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Acheter par pays d'origine</h2>
            <p className="text-gray-400 mt-1 text-xs sm:text-sm">Découvrez les produits envoyés depuis chaque pays</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {COUNTRIES.filter(c => c.code !== "CF").map((country) => (
              <Link
                key={country.code}
                href={`/produits?country=${country.code}`}
                className="group bg-white/5 border border-white/8 hover:bg-orange-500/12 hover:border-orange-500/35 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-all"
              >
                <span className="text-2xl sm:text-3xl">{country.flag}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-white text-xs sm:text-sm truncate">{country.name}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 group-hover:text-orange-400 transition-colors flex items-center gap-1">
                    Voir <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-8 sm:py-14" style={{ backgroundColor: "#F7F4EE" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Comment ça marche ?</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">Simple, sécurisé, pensé pour l'Afrique</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }, index) => (
              <div key={step} className="relative text-center p-3 sm:p-5">
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-orange-200 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 mx-auto bg-orange-50 border-2 border-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-2 sm:mb-3">
                    {icon}
                  </div>
                  <div className="text-orange-500 text-[10px] sm:text-xs font-bold mb-1">ÉTAPE {step}</div>
                  <h3 className="font-bold text-gray-900 mb-1 sm:mb-1.5 text-xs sm:text-sm">{title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed hidden sm:block">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5 sm:mt-8">
            <Link href="/comment-ca-marche" className="btn-outline-orange text-sm">
              En savoir plus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Escrow trust */}
      <section className="py-8 sm:py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-5xl flex-shrink-0">🔒</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Votre argent est toujours protégé</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Notre système d'<strong>escrow</strong> bloque votre paiement jusqu'à ce que vous récupériez votre colis.
                    Si la livraison échoue, vous êtes remboursé automatiquement.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-green py-1 px-3 text-xs">✓ Paiement bloqué en escrow</span>
                    <span className="badge-green py-1 px-3 text-xs">✓ Libération à la récupération</span>
                    <span className="badge-green py-1 px-3 text-xs">✓ Remboursement garanti</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* CTA banner */}
      <section className="py-10 sm:py-14 bg-orange-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Prêt à recevoir vos produits à Bangui ?
          </h2>
          <p className="text-orange-100 mb-7 max-w-lg mx-auto text-sm">
            Créez votre compte gratuitement et commandez dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-7 py-3 rounded-xl transition-colors text-sm">
              Créer mon compte
            </Link>
            <Link href="/produits" className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-xl transition-colors text-sm">
              Parcourir les produits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
