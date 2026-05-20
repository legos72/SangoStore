"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Shield, Lock, Star, ArrowRight, MessageCircle, Truck, Package } from "lucide-react";
import { LogoCart } from "@/components/ui/LogoCart";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

export function Footer() {
  const { locale } = useI18n();
  const f   = translations.footer;
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
    { icon: Lock,    label: "Paiement sécurisé", sub: "Escrow protégé"          },
    { icon: Shield,  label: "Vendeurs vérifiés",  sub: "Profils validés"         },
    { icon: Truck,   label: "Livraison GP",        sub: "Transporteurs certifiés" },
    { icon: Star,    label: "Satisfaction",        sub: "Garantie retour"         },
  ];

  return (
    <footer style={{ background: "linear-gradient(175deg, #09140F 0%, #060B08 100%)" }}>

      {/* ── Gold accent bar ── */}
      <div
        className="h-[3px]"
        style={{ background: "linear-gradient(90deg, transparent 0%, #B87814 20%, #E0A320 40%, #D4961E 50%, #E0A320 60%, #B87814 80%, transparent 100%)" }}
      />

      {/* ── Trust strip ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TRUST.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                  style={{
                    background: "rgba(200,133,10,.08)",
                    border: "1px solid rgba(200,133,10,.18)",
                  }}
                >
                  <Icon className="w-4.5 h-4.5 text-amber-400" style={{ width: 17, height: 17 }} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-white text-xs font-semibold leading-tight">{label}</p>
                  <p className="text-gray-600 text-[11px] mt-0.5">{sub}</p>
                </div>
                <p className="sm:hidden text-[11px] text-gray-400 font-medium leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-12">

          {/* ── Brand column ── */}
          <div className="col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 select-none group">
              <div className="transition-transform group-hover:scale-105">
                <LogoCart size={44} />
              </div>
              <span className="leading-none tracking-tight text-[23px]">
                <span
                  style={{
                    background: "linear-gradient(135deg, #E0A320 0%, #D4961E 50%, #B87814 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 900,
                    fontStyle: "italic",
                  }}
                >Sango</span><span className="font-semibold text-slate-400">Store</span>
              </span>
            </Link>

            <p className="text-[13px] text-gray-500 leading-relaxed max-w-[290px] mb-7">
              La marketplace de la diaspora centrafricaine. Achetez, vendez et expédiez en toute confiance vers Bangui.
            </p>

            {/* Contact */}
            <ul className="space-y-3 mb-7">
              {[
                { Icon: MapPin, text: "Bangui, République Centrafricaine" },
                { Icon: Phone,  text: "+236 72 123 456" },
                { Icon: Mail,   text: "contact@sangostore.com" },
              ].map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2.5 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer">
                  <div
                    className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(200,133,10,.08)" }}
                  >
                    <Icon className="w-3 h-3 text-amber-500" />
                  </div>
                  <span className="text-sm">{text}</span>
                </li>
              ))}
            </ul>

            {/* Social links */}
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
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-amber-400 transition-all duration-200 group"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background  = "rgba(200,133,10,0.12)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(200,133,10,0.28)";
                    (e.currentTarget as HTMLElement).style.transform   = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background  = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.transform   = "";
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* ── Nav columns ── */}
          {[
            { title: t(f.marketplace, locale), links: FOOTER_LINKS.marketplace },
            { title: t(f.myAccount, locale),   links: FOOTER_LINKS.compte      },
            { title: t(f.helpLegal, locale),   links: FOOTER_LINKS.aide        },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-extrabold text-[10px] uppercase tracking-[0.16em] mb-5 flex items-center gap-2">
                <span
                  className="inline-block w-5 h-[2.5px] rounded-full flex-shrink-0"
                  style={{ background: "linear-gradient(90deg, #D4961E, #E0A320)" }}
                />
                {title}
              </h4>
              <ul className="space-y-3.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-[13px] text-gray-500 hover:text-white transition-colors flex items-center gap-1.5 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-amber-500 flex-shrink-0" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Newsletter strip ── */}
      <div
        className="border-t border-b"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(200,133,10,.04)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-sm">Restez informé des meilleures offres</p>
              <p className="text-gray-500 text-xs mt-0.5">Promotions exclusives, nouveaux produits et actualités SangoStore</p>
            </div>
            <div className="flex w-full sm:w-auto gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 sm:w-60 px-4 py-2.5 rounded-xl text-sm focus:outline-none text-gray-200 placeholder-gray-600"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1.5px solid rgba(255,255,255,0.10)",
                }}
              />
              <button
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-all hover:brightness-110"
                style={{
                  background: "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
                  boxShadow: "0 2px 12px rgba(200,133,10,.30)",
                }}
              >
                S&apos;abonner
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-700 text-center sm:text-left order-2 sm:order-1">
            © {new Date().getFullYear()} <span className="text-gray-500 font-semibold">SangoStore</span> by Legos — Tous droits réservés
          </p>

          {/* Paiements */}
          <div className="flex items-center gap-2 order-1 sm:order-2">
            <span className="text-[11px] text-gray-700 mr-1 font-medium">Paiements acceptés :</span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-amber-400 text-[11px] font-bold rounded-lg transition-colors cursor-default"
              style={{ background: "rgba(200,133,10,.08)", border: "1px solid rgba(200,133,10,.18)" }}
            >
              <span className="text-sm leading-none">🟠</span> Orange Money
            </span>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-gray-400 text-[11px] font-bold rounded-lg transition-colors cursor-default"
              style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.08)" }}
            >
              <span className="text-sm leading-none">💵</span> Cash
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3">
          <Lock className="w-3 h-3 text-gray-700" />
          <p className="text-[11px] text-gray-700 text-center">
            Paiements sécurisés par escrow — votre argent est protégé jusqu&apos;à la livraison confirmée
          </p>
        </div>
      </div>
    </footer>
  );
}
