"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag, Truck, Menu, X, Search,
  Package, ShoppingCart, User, LogOut, ChevronDown,
  LayoutDashboard, Shield, Store, Shirt, MapPin, Globe,
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
  vendeur:      { href: "/dashboard/vendeur",      label: "Espace vendeur",      icon: Store,  color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
  admin:        { href: "/dashboard/admin",         label: "Dashboard Admin",     icon: Shield, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
  transporteur: { href: "/dashboard/transporteur",  label: "Espace transporteur", icon: Truck,  color: "text-blue-600 bg-blue-50 hover:bg-blue-100"       },
};

/* Secondary nav links (desktop row 2) */
const SECONDARY_LINKS = [
  { href: "/produits",       label: "Produits",         dropdown: true  },
  { href: "/mode-africaine", label: "Mode Africaine",   dropdown: false, gold: true },
  { href: "/transporteurs",  label: "Diaspora",         dropdown: true  },
  { href: "/suivi",          label: "Suivi colis",      dropdown: false },
  { href: "/comment-ca-marche", label: "Comment ça marche", dropdown: false },
];

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sango_user");
      if (raw) setCurrentUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Mobile quick-access tabs */
  const MOBILE_TABS = [
    { href: "/produits",       label: "Produits",         icon: ShoppingBag, active: "bg-orange-500 text-white border-orange-500",    idle: "bg-white text-gray-700 border-gray-200 hover:border-orange-400 hover:text-orange-600" },
    { href: "/mode-africaine", label: "Mode Africaine",   icon: Shirt,       active: "text-white border-transparent",                 idle: "text-[#B87814] border-[#E8C97A] bg-[#FEFCF0] hover:bg-orange-50", gold: true },
    { href: "/transporteurs",  label: "Envoyer un colis", icon: Truck,       active: "bg-blue-600 text-white border-blue-600",         idle: "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600" },
    { href: "/suivi",          label: "Suivi colis",      icon: Package,     active: "bg-green-600 text-white border-green-600",       idle: "bg-white text-gray-700 border-gray-200 hover:border-green-400 hover:text-green-600" },
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">

      {/* ── TOP BAR — dark green ──────────────────────────────────────── */}
      <div
        className="hidden sm:flex items-center justify-between text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8"
        style={{ background: "#1B3A2D" }}
      >
        <span className="flex items-center gap-1.5 text-green-200/75">
          <Globe className="w-3 h-3 text-green-400 flex-shrink-0" />
          🚀 Livraison rapide et sécurisée dans tous les pays d&apos;Afrique
        </span>
        <span className="flex items-center gap-2 flex-shrink-0">
          <a href="tel:+221786863969" className="flex items-center gap-1 text-white/70 hover:text-white transition-colors">
            📞 +221 78 686 39 69
          </a>
          <span className="text-white/25">|</span>
          <a
            href="https://wa.me/221786863969"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all hover:opacity-90"
            style={{ background: "#22c55e", color: "#fff" }}
          >
            💬 WhatsApp
          </a>
        </span>
      </div>

      {/* ── MAIN NAV ROW ─────────────────────────────────────────────── */}
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-14 sm:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 select-none">
            <LogoCart size={36} />
            <div className="leading-none">
              <div
                className="text-[18px] sm:text-[20px] font-extrabold tracking-tight leading-none"
                style={{
                  background: "linear-gradient(120deg, #f97316 0%, #f59e0b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontFamily: "var(--font-poppins), sans-serif",
                }}
              >
                SangoStore
              </div>
              <div className="hidden sm:block text-[9px] text-gray-400 font-medium tracking-wide mt-0.5">
                La diaspora au service des familles
              </div>
            </div>
          </Link>

          {/* Search bar — desktop */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 min-w-0 mx-2 lg:mx-4">
            <div className="relative w-full flex rounded-xl border border-gray-200 bg-gray-50/80 overflow-hidden focus-within:ring-2 focus-within:ring-orange-500/25 focus-within:border-orange-400 transition-all">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t(nav.search, locale)}
                className="flex-1 pl-9 pr-3 py-2.5 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-auto sm:ml-0">

            {/* Search icon — mobile */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Compte — desktop */}
            {currentUser ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-[11px] font-bold text-gray-800 leading-none truncate max-w-[80px]">
                      {currentUser.name.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-gray-400 capitalize leading-none mt-0.5">{currentUser.role}</div>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 transition-transform duration-200", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-1.5 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-gray-50">
                      <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                    </div>
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
                    {currentUser.role === "client" && (
                      <Link href="/commandes" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                        <Package className="w-4 h-4 text-gray-400" />
                        Mes commandes
                      </Link>
                    )}
                    <Link href="/compte" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4 text-gray-400" />
                      Mon compte
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left">
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
                className="hidden sm:flex flex-col items-start px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-[11px] font-bold text-gray-800 leading-none">Compte</span>
                </div>
                <span className="text-[10px] text-orange-500 font-medium leading-none mt-0.5 ml-5">Se connecter</span>
              </Link>
            )}

            {/* Panier */}
            <Link
              href="/panier"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors relative"
              aria-label="Mon panier"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] bg-orange-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5 leading-none">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-[11px] font-bold text-gray-800 leading-none">Panier</div>
                <div className="text-[10px] text-gray-400 leading-none mt-0.5">
                  {totalItems === 0 ? "0 article" : `${totalItems} article${totalItems > 1 ? "s" : ""}`}
                </div>
              </div>
            </Link>

            {/* Currency + Language — xl+ */}
            <div className="hidden xl:flex items-center gap-1">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>

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

        {/* ── SECONDARY NAV ROW (desktop only) ─────────────────────── */}
        <div className="hidden lg:flex items-center gap-1 border-t border-gray-100 py-1.5 -mx-4 px-4">
          {SECONDARY_LINKS.map(({ href, label, dropdown, gold }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap",
                  gold
                    ? isActive
                      ? "text-[#D4961E] font-bold bg-orange-50"
                      : "text-[#B87814] font-semibold hover:bg-orange-50/70 hover:text-[#D4961E]"
                    : isActive
                    ? "bg-orange-50 text-orange-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {label}
                {dropdown && <ChevronDown className="w-3 h-3 opacity-50" />}
              </Link>
            );
          })}

          {/* Devenir vendeur — CTA style */}
          <Link
            href="/auth/register?role=vendeur"
            className="ml-auto flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-bold transition-all text-white hover:opacity-90"
            style={{ background: "#1B3A2D" }}
          >
            Devenir vendeur
          </Link>
        </div>

        {/* ── Mobile quick-access strip ─────────────────────────────── */}
        <div
          className="lg:hidden border-t border-gray-100/80 -mx-4 sm:-mx-6 px-3 py-2 flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {MOBILE_TABS.map(({ href, label, icon: Icon, active, idle, gold }) => {
            const isActive = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all shadow-sm",
                  isActive ? active : idle
                )}
                style={isActive && gold ? { background: "#D4961E", boxShadow: "0 2px 8px rgba(212,150,30,0.35)" } : {}}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
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
            {SECONDARY_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                  pathname === href ? "bg-orange-50 text-orange-600" : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/auth/register?role=vendeur"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 mx-3 py-3 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "#1B3A2D" }}
            >
              Devenir vendeur
            </Link>

            <div className="flex items-center gap-2 px-3 py-2">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {currentUser ? (
                <>
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
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="btn-secondary text-sm py-2.5 justify-center text-red-500"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="btn-primary text-sm py-2.5 justify-center w-full"
                  onClick={() => setMobileOpen(false)}
                >
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
