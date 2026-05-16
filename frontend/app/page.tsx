import Link from "next/link";
import { ArrowRight, Phone, Shirt, Smartphone, Sparkles, Home, UtensilsCrossed, Dumbbell, ShoppingBag, Briefcase } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { HomeTransporters } from "@/components/home/HomeTransporters";
import { CountryScroll } from "@/components/home/CountryScroll";
import { COUNTRIES } from "@/lib/countries";

const MAIN_CATEGORIES = [
  { slug: "mode",         href: "/mode-africaine",                          label: "Mode Africaine",      shortLabel: "Africaine", img: "/categories/homme.png",      grad: "from-amber-900   to-amber-700",   Icon: Shirt,           iconColor: "#F59E0B" },
  { slug: "mode-femme",   href: "/produits?category=mode&genre=femme",      label: "Mode Femme",          shortLabel: "Femme",     img: "/categoriHome/femme.png",    grad: "from-pink-900    to-pink-700",    Icon: ShoppingBag,     iconColor: "#F472B6" },
  { slug: "mode-homme",   href: "/produits?category=mode&genre=homme",      label: "Mode Homme",          shortLabel: "Homme",     img: "/categoriHome/homme.png",    grad: "from-slate-900   to-slate-700",   Icon: Briefcase,       iconColor: "#94A3B8" },
  { slug: "electronique", href: "/produits?category=electronique",          label: "Électronique",        shortLabel: "Électro",   img: "/categoriHome/electro.png",   grad: "from-blue-900    to-blue-700",    Icon: Smartphone,      iconColor: "#60A5FA" },
  { slug: "beaute",       href: "/produits?category=beaute",                label: "Beauté & Soins",      shortLabel: "Beauté",    img: "/categoriHome/Soin1.png",    grad: "from-rose-900    to-rose-700",    Icon: Sparkles,        iconColor: "#F472B6" },
  { slug: "maison",       href: "/produits?category=maison",                label: "Maison & Décoration", shortLabel: "Maison",    img: "/categoriHome/lit.png",      grad: "from-emerald-900 to-emerald-700", Icon: Home,            iconColor: "#34D399" },
  { slug: "alimentation", href: "/produits?category=alimentation",          label: "Alimentation",        shortLabel: "Aliment.",  img: "/categoriHome/alim.png",     grad: "from-orange-900  to-orange-700",  Icon: UtensilsCrossed, iconColor: "#FB923C" },
  { slug: "sport",        href: "/produits?category=sport",                 label: "Sport & Loisirs",     shortLabel: "Sport",     img: "/categoriHome/alte.png",     grad: "from-violet-900  to-violet-700",  Icon: Dumbbell,        iconColor: "#A78BFA" },
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

          {/* Grid */}
          <div
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
                style={{ width: "clamp(90px, 15vw, 160px)" }}
              >
                {/* Image */}
                <div className={`aspect-square w-full relative overflow-hidden bg-gradient-to-br ${grad}`}>
                  {img ? (
                    <img
                      src={img}
                      alt={label}
                      className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Badge centré — marge négative pour chevaucher l'image */}
                <div className="flex justify-center -mt-3.5 relative z-10">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center
                                  shadow-[0_2px_8px_rgba(0,0,0,0.22)] border-2 border-white">
                    <Icon className="w-3.5 h-3.5" style={{ color: iconColor }} />
                  </div>
                </div>

                {/* Label strip */}
                <div className="px-1 pt-1 pb-1.5 text-center bg-white group-hover:bg-amber-50 transition-colors">
                  <p className="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-1 text-gray-800 group-hover:text-amber-700 transition-colors">
                    <span className="sm:hidden">{shortLabel}</span>
                    <span className="hidden sm:inline">{label}</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pays d'origine ─────────────────────────────────────────────── */}
      <section className="py-3 sm:py-4 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 flex items-center gap-1.5">
              <span className="w-[3px] h-3.5 rounded-full bg-amber-400 flex-shrink-0" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                Pays d&apos;origine
              </span>
            </span>
            <div
              className="flex items-center gap-1.5 overflow-x-auto flex-1"
              style={{ scrollbarWidth: "none" }}
            >
              <Link
                href="/produits"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap flex-shrink-0
                           bg-gray-800 text-white transition-all"
              >
                <span className="text-sm leading-none">🌍</span>
                Tous les pays
              </Link>
              {COUNTRIES.map(country => (
                <Link
                  key={country.code}
                  href={`/produits?country=${country.code}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0
                             bg-white border border-gray-200 text-gray-600
                             hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 transition-all"
                >
                  <span className="text-sm leading-none">{country.flag}</span>
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Flash Sale ─────────────────────────────────────────────────── */}
      <FlashSaleSection />

      {/* ── Tendances (admin-managed) ───────────────────────────────────── */}
      <TrendingSection />

      {/* ── Dernières arrivées ─────────────────────────────────────────── */}
      <NewArrivalsSection />

      {/* ── Produits populaires ────────────────────────────────────────── */}
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
      <CountryScroll />

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


      {/* CTA banner */}
      <section
        className="py-10 sm:py-14"
        style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #0D2318 50%, #0D1F10 100%)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Accent doré au-dessus du titre */}
          <p className="text-[11px] font-extrabold uppercase tracking-widest mb-3" style={{ color: "#F59E0B" }}>
            ✦ Bangui Market ✦
          </p>
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Prêt à recevoir vos produits à Bangui ?
          </h2>
          <p className="text-white/55 mb-8 max-w-lg mx-auto text-sm">
            Créez votre compte gratuitement et commandez dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="font-bold px-7 py-3 rounded-xl transition-all text-sm hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D4961E 100%)",
                color: "#1a0f00",
                boxShadow: "0 4px 18px rgba(212,150,30,0.4)",
              }}
            >
              Créer mon compte
            </Link>
            <Link
              href="/produits"
              className="font-semibold px-7 py-3 rounded-xl transition-all text-sm text-white hover:bg-white/10 active:scale-95"
              style={{ border: "1.5px solid rgba(255,255,255,0.25)" }}
            >
              Parcourir les produits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
