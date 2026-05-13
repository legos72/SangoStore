"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/",              label: "Accueil",    icon: Home,         cart: false },
  { href: "/produits",      label: "Catégories", icon: LayoutGrid,   cart: false },
  { href: "/produits",      label: "Recherche",  icon: Search,       cart: false, isSearch: true },
  { href: "/panier",        label: "Panier",     icon: ShoppingCart, cart: true  },
  { href: "/compte",        label: "Compte",     icon: User,         cart: false },
];

export function GlobalBottomNav() {
  const pathname    = usePathname();
  const { totalItems } = useCart();

  /* Hide on Mode Africaine — it has its own bottom nav */
  if (pathname.startsWith("/mode-africaine")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 sm:hidden border-t bg-white"
      style={{ borderColor: "#E5E7EB" }}
    >
      <div
        className="flex items-center justify-around px-1 py-1"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 4px)" }}
      >
        {TABS.map(({ href, label, icon: Icon, cart, isSearch }, idx) => {
          const active = label === "Accueil"
            ? pathname === "/"
            : !isSearch && pathname.startsWith(href) && href !== "/";

          return (
            <Link
              key={`${href}-${idx}`}
              href={isSearch ? "/produits" : href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all relative min-w-0",
                active ? "text-orange-600" : "text-gray-400"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-orange-500" />
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
