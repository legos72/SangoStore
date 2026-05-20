import Link from "next/link";
import { ArrowRight, Phone, ChevronRight, Shirt, ShoppingBag, Briefcase, Smartphone, Sparkles, Hop as Home, UtensilsCrossed, Dumbbell, Truck, Package, Shield } from "lucide-react";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TrendingSection } from "@/components/home/TrendingSection";
import { FlashSaleSection } from "@/components/home/FlashSaleSection";
import { PromoBlocks } from "@/components/home/PromoBlocks";
import { NewArrivalsSection } from "@/components/home/NewArrivalsSection";
import { HomeTransporters } from "@/components/home/HomeTransporters";
import { CountryScroll } from "@/components/home/CountryScroll";
import { COUNTRIES } from "@/lib/countries";

const SUPPORT_PHONE    = "+221 78 686 39 69";
const SUPPORT_WHATSAPP = "221786863969";

const SIDEBAR_CATEGORIES = [
  { slug: "mode",         href: "/mode-africaine",         label: "Mode Africaine",   Icon: Shirt,           iconColor: "#D4961E" },
  { slug: "mode-femme",   href: "/categorie/mode-femme",   label: "Mode Femme",       Icon: ShoppingBag,     iconColor: "#F472B6" },
  { slug: "mode-homme",   href: "/categorie/mode-homme",   label: "Mode Homme",       Icon: Briefcase,       iconColor: "#64748B" },
  { slug: "electronique", href: "/categorie/electronique", label: "Électronique",     Icon: Smartphone,      iconColor: "#3B82F6" },
  { slug: "beaute",       href: "/categorie/beaute",       label: "Beauté & Santé",   Icon: Sparkles,        iconColor: "#EC4899" },
  { slug: "maison",       href: "/categorie/maison",       label: "Maison & Bureau",  Icon: Home,            iconColor: "#10B981" },
  { slug: "alimentation", href: "/categorie/alimentation", label: "Alimentation",     Icon: UtensilsCrossed, iconColor: "#F97316" },
  { slug: "sport",        href: "/categorie/sport",        label: "Sports & Loisirs", Icon: Dumbbell,        iconColor: "#8B5CF6" },
  { slug: "transport",    href: "/transporteurs",          label: "Envoi de colis",   Icon: Truck,           iconColor: "#06B6D4" },
];

const TRUST_ITEMS = [
  { Icon: Shield,  color: "#1B3A2D", title: "Paiement sécurisé", sub: "100% sécurisé"   },
  { Icon: Truck,   color: "#2563EB", title: "Livraison rapide",  sub: "Afrique & monde" },
  { Icon: Package, color: "#D97706", title: "Retour facile",     sub: "7 jours garantis"},
  { Icon: Phone,   color: "#16A34A", title: "Support 24/7",      sub: "Assistance dédiée"},
];

const HOW_IT_WORKS = [
  { step: "01", icon: "📱", title: "Choisissez votre produit",   desc: "Parcourez nos produits envoyés par la diaspora depuis la France, le Sénégal, le Cameroun…" },
  { step: "02", icon: "💳", title: "Payez en toute sécurité",    desc: "Orange Money ou cash. Votre argent est bloqué en escrow jusqu'à la livraison."            },
  { step: "03", icon: "🚚", title: "Le vendeur expédie via GP",  desc: "Le vendeur choisit un transporteur certifié. Le colis part vers Bangui."                   },
  { step: "04", icon: "🇨🇫", title: "Récupérez à Bangui",       desc: "Le colis arrive au point de retrait. Vous récupérez, l'argent est libéré au vendeur."       },
];

export default function HomePage() {
  return (
    <>
      {/* ── Desktop : sidebar + hero + barre de confiance ──────────── */}
      <div className="hidden lg:flex bg-white border-b border-[#EAE2D2]">

        {/* Sidebar catégories */}
        <aside className="w-56 flex-shrink-0 border-r border-[#EAE2D2] bg-[#FDFCF8] py-1">
          {SIDEBAR_CATEGORIES.map(cat => (
            <Link
              key={cat.slug}
              href={cat.href}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#F0F7F4] hover:text-[#1B3A2D] transition-colors group"
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${cat.iconColor}16` }}
              >
                <cat.Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cat.iconColor }} />
              </div>
              <span className="flex-1 truncate font-medium text-[13px]">{cat.label}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-[#1B3A2D] transition-colors flex-shrink-0" />
            </Link>
          ))}
          <div className="border-t border-[#EAE2D2] mt-1 pt-1">
            <Link
              href="/produits"
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] font-bold text-[#1B3A2D] hover:bg-[#F0F7F4] transition-colors"
            >
              Voir toutes les catégories
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </div>
        </aside>

        {/* Colonne droite */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 px-3 pt-3">
            <HeroSection />
          </div>

          {/* Barre de confiance */}
          <div className="mx-3 mt-2 border-t border-[#EAE2D2] grid grid-cols-4 divide-x divide-[#EAE2D2]">
            {TRUST_ITEMS.map(({ Icon, color, title, sub }) => (
              <div key={title} className="flex items-center gap-3 px-4 py-3.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}14` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-gray-900 leading-tight">{title}</p>
                  <p className="text-[11px] text-gray-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mobile : hero seul ─────────────────────────────────────── */}
      <div className="lg:hidden">
        <HeroSection />
      </div>

      {/* ── Catégories populaires — mobile ─────────────────────────── */}
      <div className="lg:hidden">
        <CategoriesSection />
      </div>

      {/* ── Pays d'origine ─────────────────────────────────────────── */}
      <section className="py-3.5 bg-white border-t border-[#EAE2D2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 flex items-center gap-1.5">
              <span className="w-[3px] h-4 rounded-full bg-orange-400 flex-shrink-0" />
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-gray-400 whitespace-nowrap">
                Pays d&apos;origine
              </span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto flex-1" style={{ scrollbarWidth: "none" }}>
              <Link
                href="/produits"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0 text-white transition-all"
                style={{ background: "#1B3A2D" }}
              >
                <span className="text-sm leading-none">🌍</span>
                Tous les pays
              </Link>
              {COUNTRIES.map(country => (
                <Link
                  key={country.code}
                  href={`/produits?country=${country.code}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap flex-shrink-0 bg-[#FDFCF8] border border-[#E8E0D0] text-gray-600 hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50 transition-all"
                >
                  <span className="text-sm leading-none">{country.flag}</span>
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Blocs promo ────────────────────────────────────────────── */}
      <PromoBlocks />

      {/* ── Flash Sale ─────────────────────────────────────────────── */}
      <FlashSaleSection />

      {/* ── Tendances ──────────────────────────────────────────────── */}
      <TrendingSection />

      {/* ── Nouvelles arrivées ─────────────────────────────────────── */}
      <NewArrivalsSection />

      {/* ── Produits populaires ────────────────────────────────────── */}
      <FeaturedProducts />

      {/* ── Support client ─────────────────────────────────────────── */}
      <section className="px-4 sm:px-6 py-4" style={{ backgroundColor: "#FAF7F1" }}>
        <div className="max-w-7xl mx-auto">
          <div
            className="bg-white border border-[#EAE2D2] rounded-2xl px-4 sm:px-6 py-3.5 shadow-card flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0"
          >
            {/* Gauche */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "#F0F7F4" }}
                >
                  🎧
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 flex">
                  <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-green-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500 border-2 border-white" />
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold text-green-600 uppercase tracking-widest mb-0.5">
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

            {/* Droite */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white transition-all hover:brightness-110 active:scale-[0.97] whitespace-nowrap"
                style={{ background: "#22c55e", boxShadow: "0 2px 10px rgba(34,197,94,0.28)" }}
              >
                <span className="text-sm leading-none">💬</span>
                WhatsApp
              </a>
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-600 bg-cream-100 border border-[#EAE2D2] hover:border-orange-300 hover:text-orange-600 transition-all whitespace-nowrap"
              >
                <Phone className="w-3 h-3 flex-shrink-0 text-orange-400" />
                {SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Transporteurs ──────────────────────────────────────────── */}
      <HomeTransporters />

      {/* ── Parcourir par pays ─────────────────────────────────────── */}
      <CountryScroll />

      {/* ── Comment ça marche ──────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="inline-block w-5 h-[2px] rounded-full" style={{ background: "#D4961E" }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "#D4961E" }}>
                Simple & sécurisé
              </span>
              <span className="inline-block w-5 h-[2px] rounded-full" style={{ background: "#D4961E" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              Pensé pour la diaspora africaine, simple depuis votre téléphone
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-8 relative">
            {/* Ligne de connexion desktop */}
            <div
              className="hidden lg:block absolute top-[52px] left-[calc(12.5%+2rem)] right-[calc(12.5%+2rem)] h-px"
              style={{ background: "linear-gradient(90deg, transparent, #EAE2D2 20%, #D4961E 50%, #EAE2D2 80%, transparent)" }}
            />

            {HOW_IT_WORKS.map(({ step, icon, title, desc }, index) => (
              <div key={step} className="relative text-center">
                {/* Numéro de connecteur entre étapes */}
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-px z-0" />
                )}
                <div className="relative z-10">
                  <div
                    className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-2xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 relative"
                    style={{
                      background: "#FDFCF8",
                      border: "2px solid #EAE2D2",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    }}
                  >
                    {icon}
                    <span
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[9px] font-extrabold flex items-center justify-center leading-none"
                      style={{ background: "#D4961E" }}
                    >
                      {step}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 mb-1.5 text-xs sm:text-sm leading-tight px-1">{title}</h3>
                  <p className="text-[10px] sm:text-xs text-gray-500 leading-relaxed hidden sm:block px-2">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link href="/comment-ca-marche" className="btn-outline-orange text-sm">
              En savoir plus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-20"
        style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #0D2318 45%, #0A1C12 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="inline-block w-8 h-px" style={{ background: "rgba(212,150,30,0.5)" }} />
            <span
              className="text-[11px] font-extrabold uppercase tracking-[0.16em]"
              style={{ color: "#E8AE38" }}
            >
              ✦ Bangui Market ✦
            </span>
            <span className="inline-block w-8 h-px" style={{ background: "rgba(212,150,30,0.5)" }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
            Prêt à recevoir vos produits à Bangui ?
          </h2>
          <p className="text-white/50 mb-9 max-w-md mx-auto text-sm leading-relaxed">
            Créez votre compte gratuitement et commandez dès aujourd&apos;hui depuis n&apos;importe où dans le monde.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="font-bold px-8 py-3.5 rounded-xl transition-all text-sm hover:brightness-110 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #E8AE38 0%, #D4961E 100%)",
                color: "#1a0f00",
                boxShadow: "0 4px 22px rgba(212,150,30,0.40)",
              }}
            >
              Créer mon compte
            </Link>
            <Link
              href="/produits"
              className="font-semibold px-8 py-3.5 rounded-xl transition-all text-sm text-white hover:bg-white/8 active:scale-95"
              style={{ border: "1.5px solid rgba(255,255,255,0.20)" }}
            >
              Parcourir les produits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
