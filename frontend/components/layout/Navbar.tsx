"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Truck, Menu, X, Search, Package, ShoppingCart, User, LogOut, ChevronDown, ChevronRight, Shield, Building2, Shirt, Briefcase, Smartphone, Gem, Hop as Home, Coffee, Dumbbell, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { LogoCart } from "@/components/ui/LogoCart";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

const ROLE_DASHBOARD: Record<string, { href: string; label: string; icon: React.ElementType; color: string }> = {
  vendeur:      { href: "/dashboard/vendeur",      label: "Espace vendeur",      icon: Building2,  color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
  admin:        { href: "/dashboard/admin",         label: "Dashboard Admin",     icon: Shield, color: "text-blue-600 bg-blue-50 hover:bg-blue-100"       },
  transporteur: { href: "/dashboard/transporteur",  label: "Espace transporteur", icon: Truck,  color: "text-teal-600 bg-teal-50 hover:bg-teal-100"       },
};

const SEARCH_CATEGORIES = [
  { value: "",             label: "Toutes les catégories" },
  { value: "mode",         label: "Mode Africaine"        },
  { value: "electronique", label: "Électronique"          },
  { value: "beaute",       label: "Beauté & Soins"        },
  { value: "maison",       label: "Maison & Déco"         },
  { value: "alimentation", label: "Alimentation"          },
  { value: "sport",        label: "Sport & Loisirs"       },
];

const DESKTOP_CATEGORIES = [
  { slug: "mode",         href: "/mode-africaine",         label: "Mode Africaine",   Icon: Shirt,           iconColor: "#D4961E" },
  { slug: "mode-femme",   href: "/categorie/mode-femme",   label: "Mode Femme",       Icon: ShoppingBag,     iconColor: "#F472B6" },
  { slug: "mode-homme",   href: "/categorie/mode-homme",   label: "Mode Homme",       Icon: Briefcase,       iconColor: "#64748B" },
  { slug: "electronique", href: "/categorie/electronique", label: "Électronique",     Icon: Smartphone,      iconColor: "#3B82F6" },
  { slug: "beaute",       href: "/categorie/beaute",       label: "Beauté & Santé",   Icon: Gem,        iconColor: "#EC4899" },
  { slug: "maison",       href: "/categorie/maison",       label: "Maison & Bureau",  Icon: Home,            iconColor: "#10B981" },
  { slug: "alimentation", href: "/categorie/alimentation", label: "Alimentation",     Icon: Coffee, iconColor: "#F97316" },
  { slug: "sport",        href: "/categorie/sport",        label: "Sports & Loisirs", Icon: Dumbbell,        iconColor: "#8B5CF6" },
  { slug: "transport",    href: "/transporteurs",          label: "Envoi de colis",   Icon: Truck,           iconColor: "#06B6D4" },
];

export function Navbar() {
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchCategory,  setSearchCategory]  = useState("");
  const [userMenuOpen,    setUserMenuOpen]    = useState(false);
  const [categoriesOpen,  setCategoriesOpen]  = useState(false);
  const [promoCount,      setPromoCount]      = useState(0);
  const [scrolled,        setScrolled]        = useState(false);
  const userMenuRef                           = useRef<HTMLDivElement>(null);
  const categoriesRef                         = useRef<HTMLDivElement>(null);
  const pathname                              = usePathname();
  const router                                = useRouter();
  const { locale }                            = useI18n();
  const { totalItems }                        = useCart();
  const { user: currentUser, logout }         = useAuth();
  const nav                                   = translations.nav;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    api.products.list({ promo: "true", limit: "1" } as any)
      .then((res: any) => setPromoCount(Number(res?.total ?? res?.data?.length ?? 0)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) setCategoriesOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isCategoryPage = pathname.startsWith("/categorie") || pathname === "/mode-africaine";

  const NAV_LINKS = isCategoryPage
    ? [
        { href: "/mode-africaine",         label: "Mode Africaine",  icon: Shirt           },
        { href: "/categorie/mode-femme",   label: "Mode Femme",      icon: ShoppingBag     },
        { href: "/categorie/mode-homme",   label: "Mode Homme",      icon: Briefcase       },
        { href: "/categorie/electronique", label: "Électronique",    icon: Smartphone      },
        { href: "/categorie/beaute",       label: "Beauté & Soins",  icon: Gem        },
        { href: "/categorie/maison",       label: "Maison",          icon: Home            },
        { href: "/categorie/alimentation", label: "Supermarché",     icon: Coffee },
        { href: "/categorie/sport",        label: "Sport & Loisirs", icon: Dumbbell        },
        { href: "/produits",               label: "Autres",          icon: Package         },
      ]
    : [
        { href: "/",                    label: "Accueil",        icon: Home    },
        { href: "/mode-africaine",      label: "Mode Africaine", icon: Shirt   },
        { href: "/produits?promo=true", label: "Promotions",     icon: Tag     },
        { href: "/transporteurs",       label: "Envoi de colis", icon: Truck   },
        { href: "/suivi",               label: "Suivi colis",    icon: Package },
      ];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams({ search: searchQuery.trim() });
      if (searchCategory) params.set("category", searchCategory);
      router.push(`/produits?${params.toString()}`);
      setSearchOpen(false);
    }
  }

  function handleLogout() {
    logout();
    setUserMenuOpen(false);
    router.push("/");
  }

  const initials      = currentUser?.name
    ? currentUser.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  const dashboardInfo = currentUser ? ROLE_DASHBOARD[currentUser.role] ?? null : null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-white transition-shadow duration-300",
        scrolled ? "shadow-[0_2px_16px_rgba(0,0,0,0.10)]" : "shadow-sm",
      )}
      style={{ borderBottom: "1px solid #EAE2D2" }}
    >

      {/* ── Barre superieure ──────────────────────────────────────────────── */}
      <div className="hidden sm:block text-xs py-1.5" style={{ background: "#1B3A2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-white/70 text-[11px]">
            <Truck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            Livraison rapide et sécurisée dans toute l&apos;Afrique
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-white/40 text-[11px]">Support :</span>
            <a href="tel:+221786863969" className="text-white/80 hover:text-white font-medium text-[11px] transition-colors">
              +221 78 686 39 69
            </a>
            <a
              href="https://wa.me/221786863969"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* ── Ligne principale ──────────────────────────────────────────── */}
          <div className="flex items-center h-14 sm:h-16 gap-3 sm:gap-4">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 select-none">
              <LogoCart size={34} />
              <span className="leading-none tracking-tight text-[20px] sm:text-[22px]">
                <span
                  className="font-black italic"
                  style={{
                    background: "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >Sango</span><span className="font-bold" style={{ color: "#1B3A2D" }}>Store</span>
              </span>
            </Link>

            {/* Barre de recherche desktop */}
            <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md lg:max-w-2xl mx-2 lg:mx-6">
              <div className="flex w-full rounded-xl overflow-hidden border-[1.5px] border-[#E8E0D0] hover:border-orange-300 bg-[#FDFCF8] transition-all duration-200 focus-within:border-orange-400 focus-within:shadow-[0_0_0_3px_rgba(212,150,30,0.10)]">
                <select
                  value={searchCategory}
                  onChange={e => setSearchCategory(e.target.value)}
                  className="border-r border-[#E8E0D0] bg-cream-100 px-2 lg:px-3 text-xs text-gray-600 focus:outline-none cursor-pointer min-w-[110px] lg:min-w-[150px] appearance-none font-medium"
                >
                  {SEARCH_CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit, une marque..."
                  className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-transparent min-w-0 text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="px-4 sm:px-5 text-white flex items-center flex-shrink-0 transition-all hover:brightness-110 active:brightness-90"
                  style={{ background: "#1B3A2D" }}
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Actions droite */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ml-auto sm:ml-0">

              {/* Recherche mobile */}
              <button
                className="sm:hidden p-2 rounded-xl text-gray-500 hover:bg-cream-100 transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Compte */}
              {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl hover:bg-cream-100 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 ring-2 ring-white"
                      style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2d6a4f 100%)" }}
                    >
                      {initials}
                    </div>
                    <div className="hidden sm:block text-left">
                      <div className="text-[10px] text-gray-400 leading-none">Compte</div>
                      <div className="text-xs font-semibold text-gray-800 max-w-[72px] truncate leading-tight mt-0.5">
                        {currentUser.name.split(" ")[0]}
                      </div>
                    </div>
                    <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200", userMenuOpen && "rotate-180")} />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#EAE2D2] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] py-1.5 z-50 animate-slide-down">
                      <div className="px-4 py-3 border-b border-cream-200">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2d6a4f 100%)" }}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
                          </div>
                        </div>
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
                        <Link
                          href="/commandes"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-100 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          Mes commandes
                        </Link>
                      )}
                      <Link
                        href="/compte"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-cream-100 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        Mon compte
                      </Link>
                      <div className="border-t border-cream-200 mt-1 pt-1">
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
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-cream-100 transition-colors text-sm font-semibold text-gray-700 border border-transparent hover:border-[#EAE2D2]"
                >
                  <User className="w-4 h-4 text-gray-500" />
                  Se connecter
                </Link>
              )}

              {/* Panier */}
              <Link
                href="/panier"
                className="relative flex items-center gap-1.5 px-2.5 py-2 hover:bg-cream-100 rounded-xl transition-colors"
                aria-label="Mon panier"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                  {totalItems > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 leading-none"
                      style={{ background: "#D4961E" }}
                    >
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline text-sm font-medium text-gray-600">Panier</span>
              </Link>

              {/* Hamburger mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-cream-100 transition-colors ml-0.5"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* ── Mobile quick-access pills ──────────────────────────────────── */}
          <div
            className="lg:hidden -mx-4 sm:-mx-6 px-3 py-2.5 flex items-center gap-2 overflow-x-auto border-t border-cream-200"
            style={{ scrollbarWidth: "none" }}
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/" && pathname.startsWith(href.split("?")[0]));
              const isGold   = href === "/mode-africaine";
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all",
                    isActive
                      ? "text-white shadow-sm"
                      : isGold
                      ? "text-amber-700 border border-amber-200 bg-amber-50 hover:bg-amber-100"
                      : "bg-white text-gray-700 border border-cream-300 hover:border-cream-400 shadow-sm"
                  )}
                  style={isActive ? { background: isGold ? "#D4961E" : "#1B3A2D" } : {}}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Mobile search */}
          {searchOpen && (
            <form onSubmit={handleSearch} className="sm:hidden pb-3 animate-slide-down">
              <div className="flex rounded-xl overflow-hidden border-[1.5px] border-[#E8E0D0] focus-within:border-orange-400 transition-colors">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="flex-1 pl-4 pr-2 py-2.5 text-sm focus:outline-none bg-cream-50"
                />
                <button type="submit" className="px-4 text-white flex-shrink-0" style={{ background: "#1B3A2D" }}>
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-cream-200 py-3 space-y-0.5 animate-slide-down">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                    pathname === href ? "text-white" : "text-gray-700 hover:bg-cream-100"
                  )}
                  style={pathname === href ? { background: "#1B3A2D" } : {}}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </Link>
              ))}
              <div className="flex items-center gap-2 px-3 py-2">
                <CurrencySwitcher />
                <LanguageSwitcher />
              </div>
              <div className="pt-3 border-t border-cream-200 space-y-2">
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
                      <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-secondary text-sm py-2.5 justify-center text-red-500">
                        Se déconnecter
                      </button>
                    </div>
                  </>
                ) : (
                  <Link href="/auth/login" className="btn-primary text-sm py-3 justify-center w-full" onClick={() => setMobileOpen(false)}>
                    {t(nav.login, locale)}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Navigation desktop secondaire ──────────────────────────────── */}
        <div
          className="hidden lg:block border-t"
          style={{ borderColor: "#EAE2D2", background: "#FDFCF8" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-10">

            {/* Toutes les catégories */}
            <div className="relative h-full w-56 flex-shrink-0" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen(o => !o)}
                className="w-full flex items-center gap-2 h-full px-4 text-white text-[13px] font-semibold transition-all hover:opacity-95"
                style={{ background: "#1B3A2D" }}
              >
                <Menu className="w-4 h-4" />
                Toutes les catégories
                <ChevronDown className={cn("w-3.5 h-3.5 ml-auto transition-transform duration-200", categoriesOpen && "rotate-180")} />
              </button>

              {categoriesOpen && (
                <div
                  className="absolute left-0 top-full w-64 bg-white border border-[#EAE2D2] rounded-b-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] z-50 py-1.5 animate-slide-down"
                  onMouseLeave={() => setCategoriesOpen(false)}
                >
                  {DESKTOP_CATEGORIES.map(cat => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#F0F7F4] hover:text-[#1B3A2D] transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cat.iconColor}18` }}>
                        <cat.Icon className="w-3.5 h-3.5" style={{ color: cat.iconColor }} />
                      </div>
                      <span className="flex-1 font-medium">{cat.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-[#1B3A2D] transition-colors" />
                    </Link>
                  ))}
                  <div className="border-t border-cream-200 mt-1.5 pt-1">
                    <Link
                      href="/produits"
                      onClick={() => setCategoriesOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-[#1B3A2D] hover:bg-[#F0F7F4] transition-colors"
                    >
                      Voir toutes les catégories
                      <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-cream-300 mx-3 flex-shrink-0" />

            {/* Liens rapides */}
            <div className="flex items-center gap-0.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {[
                { href: "/",                    label: "Accueil",        icon: Home,    gold: false, promo: false },
                { href: "/mode-africaine",      label: "Mode Africaine", icon: Shirt,   gold: true,  promo: false },
                { href: "/produits?promo=true", label: "Promotions",     icon: Tag,     gold: false, promo: true  },
                { href: "/transporteurs",       label: "Envoi de colis", icon: Truck,   gold: false, promo: false },
                { href: "/suivi",               label: "Suivi colis",    icon: Package, gold: false, promo: false },
              ].map(({ href, label, icon: Icon, gold, promo }) => {
                const base = href.split("?")[0];
                const isActive = pathname === base || (base !== "/" && pathname.startsWith(base));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap flex-shrink-0",
                      isActive
                        ? gold ? "bg-amber-50 text-amber-700 font-semibold" : "bg-cream-200 text-gray-900 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-cream-100"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: gold ? "#D4961E" : undefined }} />
                    {label}
                    {promo && promoCount > 0 && (
                      <span
                        className="min-w-[16px] h-[16px] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-1 leading-none"
                        style={{ background: "#D4961E" }}
                      >
                        {promoCount > 99 ? "99+" : promoCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Switchers */}
            <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
              <CurrencySwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
