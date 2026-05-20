"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield, Lock, Star, ArrowRight, MessageCircle } from "lucide-react";
import { LogoCart } from "@/components/ui/LogoCart";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

export function Footer() {
  const { locale } = useI18n();
  const f = translations.footer;
  const nav = translations.nav;

  const FOOTER_LINKS = {
    marketplace: [
      { href: "/produits",          label: t(nav.products, locale)     },
      { href: "/transporteurs",     label: t(nav.transporters, locale) },
      { href: "/retrait",           label: t(nav.pickup, locale)       },
      { href: "/comment-ca-marche", label: t(nav.howItWorks, locale)   },
    ],
    compte: [
      { href: "/auth/login",        label: t(nav.login, locale)        },
      { href: "/auth/register",     label: t(nav.start, locale)        },
      { href: "/dashboard",         label: "Dashboard"                 },
      { href: "/dashboard/vendeur", label: "Espace vendeur"            },
    ],
    aide: [
      { href: "/faq",               label: "FAQ"                       },
      { href: "/contact",           label: "Contact"                   },
      { href: "/cgv",               label: "CGV"                       },
      { href: "/confidentialite",   label: "Confidentialité"           },
    ],
  };

  const TRUST = [
    { icon: Lock,   label: "Paiement sécurisé", sub: "Escrow protégé"  },
    { icon: Shield, label: "Vendeurs vérifiés",  sub: "Profils validés" },
    { icon: Star,   label: "Satisfaction",       sub: "Garantie retour" },
  ];

  return (
    <footer className="text-gray-400" style={{ background: "linear-gradient(180deg, #0A1018 0%, #060B14 100%)" }}>

      {/* Accent bar */}
      <div className="h-[2px]" style={{ background: "linear-gradient(90deg, transparent 0%, #D4961E 35%, #E8AE38 50%, #D4961E 65%, transparent 100%)" }} />

      {/* Trust strip */}
      <div className="border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(212,150,30,0.10)",
                    border: "1px solid rgba(212,150,30,0.20)",
                  }}
                >
                  <Icon className="w-4 h-4 text-orange-400" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-xs font-semibold leading-none">{label}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">{sub}</p>
                </div>
                <p className="sm:hidden text-[11px] text-gray-300 font-medium leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12">

          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 select-none">
              <LogoCart size={42} />
              <span className="leading-none tracking-tight text-[22px]">
                <span
                  style={{
                    background: "linear-gradient(135deg, #D4961E 0%, #E8AE38 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 900,
                    fontStyle: "italic",
                  }}
                >Sango</span><span className="font-semibold text-slate-300">Store</span>
              </span>
            </Link>

            <p className="text-sm text-gray-500 leading-relaxed max-w-[300px] mb-7">
              La marketplace de la diaspora centrafricaine. Achetez, vendez et expédiez en toute confiance vers Bangui.
            </p>

            {/* Contact */}
            <ul className="space-y-3 text-sm mb-7">
              {[
                { Icon: MapPin, text: "Bangui, République Centrafricaine" },
                { Icon: Phone,  text: "+236 72 123 456" },
                { Icon: Mail,   text: "contact@sangostore.com" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-gray-500 hover:text-gray-300 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {[
                {
                  label: "Facebook",
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  ),
                },
                {
                  label: "WhatsApp",
                  icon: <MessageCircle className="w-3.5 h-3.5" />,
                },
                {
                  label: "Instagram",
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                },
              ].map(({ label, icon }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 transition-all duration-200 hover:text-orange-400"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,150,30,0.12)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,150,30,0.25)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {[
            { title: t(f.marketplace, locale), links: FOOTER_LINKS.marketplace },
            { title: t(f.myAccount, locale),   links: FOOTER_LINKS.compte      },
            { title: t(f.helpLegal, locale),   links: FOOTER_LINKS.aide        },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-bold text-[11px] uppercase tracking-[0.14em] mb-5 flex items-center gap-2">
                <span
                  className="inline-block w-4 h-[2px] rounded-full"
                  style={{ background: "#D4961E" }}
                />
                {title}
              </h4>
              <ul className="space-y-3.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-orange-500" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-xs text-gray-600 text-center sm:text-left order-2 sm:order-1">
              © {new Date().getFullYear()} <span className="text-gray-500 font-semibold">SangoStore</span> by Legos — Tous droits réservés
            </p>

            {/* Modes de paiement */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <span className="text-[11px] text-gray-600 mr-1">Paiements :</span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 text-orange-400 text-[11px] font-bold rounded-lg"
                style={{ background: "rgba(212,150,30,0.10)", border: "1px solid rgba(212,150,30,0.20)" }}
              >
                🟠 Orange Money
              </span>
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 text-gray-400 text-[11px] font-bold rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                💵 Cash
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-700 mt-3 text-center flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-gray-600" />
            Paiements sécurisés par escrow — votre argent est protégé jusqu&apos;à la livraison
          </p>
        </div>
      </div>
    </footer>
  );
}
