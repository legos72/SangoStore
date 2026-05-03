"use client";

import Link from "next/link";
import { MOCK_STATS } from "@/lib/data";
import { ShoppingBag, Users, Package, Truck, Globe, Star } from "lucide-react";

const STAT_ITEMS = [
  {
    icon: ShoppingBag,
    value: `${MOCK_STATS.totalProducts}+`,
    label: "Produits",
    desc: "référencés dans le catalogue",
    href: "/produits",
  },
  {
    icon: Users,
    value: `${MOCK_STATS.totalSellers}`,
    label: "Vendeurs",
    desc: "vérifiés depuis 5 pays",
    href: null,
  },
  {
    icon: Package,
    value: `${MOCK_STATS.totalOrders}+`,
    label: "Livraisons",
    desc: "effectuées vers Bangui",
    href: null,
  },
  {
    icon: Truck,
    value: `${MOCK_STATS.totalTransporters}`,
    label: "Transporteurs GP",
    desc: "partenaires agréés",
    href: "/transporteurs",
  },
  {
    icon: Globe,
    value: `${MOCK_STATS.countriesActive}`,
    label: "Pays",
    desc: "d'où partent les colis",
    href: null,
  },
  {
    icon: Star,
    value: `${MOCK_STATS.satisfactionRate}%`,
    label: "Satisfaction",
    desc: "clients · noté 4,8/5",
    href: null,
  },
];

export function StatsSection() {
  return (
    <section className="bg-white border-b border-gray-100 py-4 sm:py-5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-gray-100">
          {STAT_ITEMS.map(({ icon: Icon, value, label, desc, href }) => {
            const inner = (
              <div className="flex flex-col items-center py-2 sm:py-3 px-1 sm:px-2 text-center group">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-400 mb-1 sm:mb-1.5" />
                <div className="text-base sm:text-lg font-extrabold text-gray-900 leading-tight group-hover:text-orange-600 transition-colors">
                  {value}
                </div>
                <div className="text-[10px] sm:text-[11px] text-gray-600 font-semibold mt-0.5 leading-tight">
                  {label}
                </div>
                <div className="hidden sm:block text-[10px] text-gray-400 leading-tight mt-0.5">
                  {desc}
                </div>
              </div>
            );

            return href ? (
              <Link key={label} href={href} className="hover:bg-orange-50/50 transition-colors">
                {inner}
              </Link>
            ) : (
              <div key={label}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
