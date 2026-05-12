"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, Heart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/mode-africaine",           label: "Accueil",    icon: Home,          cart: false },
  { href: "/mode-africaine#catalogue", label: "Catégories", icon: LayoutGrid,    cart: false },
  { href: "/panier",                   label: "Panier",     icon: ShoppingCart,  cart: true  },
  { href: "/favoris",                  label: "Favoris",    icon: Heart,         cart: false },
  { href: "/compte",                   label: "Compte",     icon: User,          cart: false },
];

export function AfricanBottomNav() {
  const pathname  = usePathname();
  const { totalItems } = useCart();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t"
      style={{ background: "#FDFCF8", borderColor: "#E2D9C8" }}
    >
      <div className="flex items-center justify-around px-1 py-1" style={{ paddingBottom: "env(safe-area-inset-bottom, 4px)" }}>
        {TABS.map(({ href, label, icon: Icon, cart }) => {
          const hrefBase = href.split("#")[0];
          const active   = pathname === hrefBase || (hrefBase !== "/mode-africaine" && pathname.startsWith(hrefBase));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative min-w-0",
                active ? "text-orange-600" : "text-gray-400"
              )}
            >
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ background: "#D4961E" }}
                />
              )}
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
                {cart && totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] bg-orange-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </div>
              <span className={cn("text-[10px] font-semibold leading-none truncate", active && "text-orange-600")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
