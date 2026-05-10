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
    { icon: Lock,   label: "Paiement sécurisé", sub: "Escrow protégé" },
    { icon: Shield, label: "Vendeurs vérifiés",  sub: "Profils validés" },
    { icon: Star,   label: "Satisfaction",       sub: "Garantie retour" },
  ];

  return (
    <footer style={{ background: "linear-gradient(180deg, #0D1321 0%, #060C18 100%)" }} className="text-gray-400">

      {/* Top accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

      {/* ── Trust strip ─────────────────────────────────────── */}
      <div className="border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
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

      {/* ── Main content ────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">

          {/* Brand col */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 select-none">
              <LogoCart size={40} />
              <span
                className="leading-none tracking-tight text-[20px]"
                style={{ fontFamily: "var(--font-poppins), sans-serif" }}
              >
                <span
                  className="font-extrabold"
                  style={{
                    background: "linear-gradient(120deg, #f97316 0%, #f59e0b 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >Sango</span><span className="font-semibold text-slate-300">Store</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-[280px] mb-6">
              La marketplace de la diaspora centrafricaine. Achetez, vendez et expédiez en toute confiance vers Bangui.
            </p>

            {/* Contact */}
            <ul className="space-y-2.5 text-sm mb-6">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>Bangui, République Centrafricaine</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>+236 72 123 456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <span>contact@sangostore.com</span>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-2">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 border border-white/8 hover:border-orange-500/40 flex items-center justify-center transition-all"
                aria-label="Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-gray-400 hover:fill-orange-400" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 border border-white/8 hover:border-orange-500/40 flex items-center justify-center transition-all"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-orange-500/20 border border-white/8 hover:border-orange-500/40 flex items-center justify-center transition-all"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-gray-400" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Nav cols */}
          {[
            { title: t(f.marketplace, locale), links: FOOTER_LINKS.marketplace },
            { title: t(f.myAccount, locale),   links: FOOTER_LINKS.compte      },
            { title: t(f.helpLegal, locale),   links: FOOTER_LINKS.aide        },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <span className="w-4 h-[2px] bg-orange-500 rounded-full inline-block" />
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-gray-400 hover:text-orange-400 transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-400" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

            <p className="text-xs text-gray-600 text-center sm:text-left order-2 sm:order-1">
              © {new Date().getFullYear()} <span className="text-gray-500 font-medium">SangoStore</span> by Legos — Tous droits réservés
            </p>

            {/* Payment badges */}
            <div className="flex items-center gap-2 order-1 sm:order-2">
              <span className="text-[11px] text-gray-600 mr-1">Paiements :</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500/15 border border-orange-500/25 text-orange-400 text-[11px] font-bold rounded-md">
                🟠 Orange Money
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 text-[11px] font-bold rounded-md">
                💵 Cash
              </span>
            </div>
          </div>

          <p className="text-[11px] text-gray-700 mt-3 text-center flex items-center justify-center gap-1.5">
            <Lock className="w-3 h-3 text-gray-600" />
            Paiements sécurisés par escrow — votre argent est protégé jusqu'à la livraison
          </p>
        </div>
      </div>
    </footer>
  );
}
