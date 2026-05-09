"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag, Truck, Menu, X, Search, MapPin, Globe,
  Package, ShoppingCart, User, LogOut, ChevronDown,
  LayoutDashboard, Shield, Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoCart } from "@/components/ui/LogoCart";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

interface StoredUser {
  name: string;
  role: string;
  email?: string;
}

const ROLE_DASHBOARD: Record<string, { href: string; label: string; icon: React.ElementType; color: string }> = {
  vendeur:      { href: "/dashboard/vendeur",      label: "Espace vendeur",      icon: Store,           color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
  admin:        { href: "/dashboard/admin",         label: "Dashboard Admin",     icon: Shield,          color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
  transporteur: { href: "/dashboard/transporteur",  label: "Espace transporteur", icon: Truck,           color: "text-blue-600 bg-blue-50 hover:bg-blue-100"       },
};

export function Navbar() {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [searchQuery, setSearchQuery]   = useState("");
  const [currentUser, setCurrentUser]   = useState<StoredUser | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef                     = useRef<HTMLDivElement>(null);
  const pathname                        = usePathname();
  const router                          = useRouter();
  const { locale }                      = useI18n();
  const { totalItems }                  = useCart();
  const nav                             = translations.nav;

  // Read auth state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("sango_user");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {}
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const NAV_LINKS = [
    { href: "/produits",          label: t(nav.products, locale),   icon: ShoppingBag },
    { href: "/transporteurs",     label: "Envoyer un colis",        icon: Truck       },
    { href: "/suivi",             label: "Suivre mon colis",         icon: Package     },
    { href: "/retrait",           label: "Points relais",           icon: MapPin      },
    { href: "/comment-ca-marche", label: t(nav.howItWorks, locale), icon: Package     },
  ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produits?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("sango_user");
    localStorage.removeItem("sango_token");
    setCurrentUser(null);
    setUserMenuOpen(false);
    router.push("/");
  }

  const initials = currentUser?.name
    ? currentUser.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const dashboardInfo = currentUser ? ROLE_DASHBOARD[currentUser.role] ?? null : null;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ backgroundColor: "rgba(253,252,248,0.97)", borderColor: "#E2D9C8" }}>
      {/* Top banner */}
      <div className="hidden sm:block text-white text-xs py-1.5 text-center" style={{ background: "linear-gradient(90deg, #0A1120 0%, #1a1206 50%, #0A1120 100%)" }}>
        <span className="inline-flex items-center gap-1.5 text-orange-300">
          <Globe className="w-3 h-3" />
          <span className="text-white/70">Diaspora → Bangui</span>
          <span className="text-orange-400/60 mx-1">·</span>
          Paiement sécurisé Orange Money &amp; Cash
          <span className="text-orange-400/60 mx-1">·</span>
          <span className="text-white/70">Escrow garanti</span>
        </span>
      </div>

      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <LogoCart size={34} />
            <div>
              <span className="text-base sm:text-lg font-extrabold text-red-600">Sango</span>
              <span className="text-base sm:text-lg font-extrabold text-orange-500">Store</span>
            </div>
          </Link>

          {/* Desktop search bar — visible sm+ */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-xs mx-3 lg:max-w-sm">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(nav.search, locale)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-gray-50/80 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-colors"
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-2 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  pathname === href
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Search icon — mobile only */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Cart */}
            <Link
              href="/panier"
              className="relative p-2 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              aria-label="Mon panier"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-orange-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center px-1 leading-none">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Currency + Language — xl+ */}
            <div className="hidden xl:flex items-center gap-1">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>

            {/* Auth — user menu if logged in, buttons if not */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in">
                    {/* User info */}
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                    </div>

                    {/* Dashboard link — pro roles only */}
                    {dashboardInfo && (
                      <Link
                        href={dashboardInfo.href}
                        onClick={() => setUserMenuOpen(false)}
                        className={cn("flex items-center gap-2.5 mx-2 mt-1.5 mb-0.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors", dashboardInfo.color)}
                      >
                        <dashboardInfo.icon className="w-4 h-4 flex-shrink-0" />
                        {dashboardInfo.label}
                      </Link>
                    )}

                    {/* Client-only links */}
                    {currentUser.role === "client" && (
                      <Link
                        href="/commandes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-400" />
                        Mes commandes
                      </Link>
                    )}

                    <Link
                      href="/compte"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Mon compte
                    </Link>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="btn-primary text-sm py-2 px-4 whitespace-nowrap"
              >
                {t(nav.login, locale)}
              </Link>
            )}

            {/* Hamburger — mobile/tablet */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile quick-access strip (lg:hidden) ─────────────────── */}
        <div className="lg:hidden border-t border-gray-100/80 -mx-4 sm:-mx-6 px-3 py-2 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[
            { href: "/produits",      label: "Produits",          icon: ShoppingBag, active: "bg-orange-500 text-white border-orange-500", idle: "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600" },
            { href: "/transporteurs", label: "Envoyer un colis",  icon: Truck,       active: "bg-blue-600 text-white border-blue-600",   idle: "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600" },
            { href: "/suivi",         label: "Suivre mon colis",  icon: Package,     active: "bg-green-600 text-white border-green-600", idle: "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-600" },
          ].map(({ href, label, icon: Icon, active, idle }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all shadow-sm",
                pathname === href ? active : idle
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <form onSubmit={handleSearch} className="sm:hidden pb-3 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(nav.search, locale)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
              />
            </div>
          </form>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-3 space-y-0.5 animate-fade-in">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                  pathname === href ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}

            {/* Language + Currency in mobile menu */}
            <div className="flex items-center gap-2 px-3 py-2">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {currentUser ? (
                <>
                  {/* Dashboard button — pro roles */}
                  {dashboardInfo && (
                    <Link
                      href={dashboardInfo.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn("flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold transition-colors", dashboardInfo.color)}
                    >
                      <dashboardInfo.icon className="w-4 h-4 flex-shrink-0" />
                      {dashboardInfo.label}
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/compte" className="btn-secondary text-sm py-2.5 justify-center" onClick={() => setMobileOpen(false)}>
                      Mon compte
                    </Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-secondary text-sm py-2.5 justify-center text-red-500">
                      Se déconnecter
                    </button>
                  </div>
                </>
              ) : (
                <Link href="/auth/login" className="btn-primary text-sm py-2.5 justify-center w-full" onClick={() => setMobileOpen(false)}>
                  {t(nav.login, locale)}
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
