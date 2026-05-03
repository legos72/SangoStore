"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Package } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

export function Footer() {
  const { locale } = useI18n();
  const f = translations.footer;
  const nav = translations.nav;

  const FOOTER_LINKS = {
    marketplace: [
      { href: "/produits",           label: t(nav.products, locale)      },
      { href: "/transporteurs",      label: t(nav.transporters, locale)  },
      { href: "/retrait",            label: t(nav.pickup, locale)        },
      { href: "/comment-ca-marche",  label: t(nav.howItWorks, locale)    },
    ],
    compte: [
      { href: "/auth/login",         label: t(nav.login, locale)         },
      { href: "/auth/register",      label: t(nav.start, locale)         },
      { href: "/dashboard",          label: "Dashboard"                  },
      { href: "/dashboard/vendeur",  label: "Espace vendeur"             },
    ],
    aide: [
      { href: "/faq",                label: "FAQ"                        },
      { href: "/contact",            label: "Contact"                    },
      { href: "/cgv",                label: "CGV"                        },
      { href: "/confidentialite",    label: "Confidentialité"            },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-600" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10">

          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-extrabold text-white">Sango</span>
                <span className="text-xl font-extrabold text-orange-400">Store</span>
                <span className="text-xs text-gray-500 font-medium ml-1">by Legos</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              {t(f.tagline, locale)}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>Bangui, République Centrafricaine</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>+236 72 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>contact@sangomarket.cf</span>
              </div>
            </div>

          </div>

          {/* Links */}
          {[
            { title: t(f.marketplace, locale), links: FOOTER_LINKS.marketplace },
            { title: t(f.myAccount, locale),   links: FOOTER_LINKS.compte      },
            { title: t(f.helpLegal, locale),   links: FOOTER_LINKS.aide        },
          ].map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-white font-semibold text-sm mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-gray-400 hover:text-orange-400 transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs text-gray-500 text-center sm:text-left">
              © 2024 SangoStore by Legos. {t(f.rights, locale)}
            </p>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <span className="text-xs text-gray-500">{t(f.payments, locale)}</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-md">Orange Money</span>
                <span className="px-2.5 py-1 bg-gray-800 text-gray-300 text-xs font-bold rounded-md">Cash</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-3 text-center">
            🔒 {t(f.escrowNote, locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}
