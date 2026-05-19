"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag, Truck, Menu, X, Search,
  Package, ShoppingCart, User, LogOut, ChevronDown, ChevronRight,
  Shield, Store, Shirt, Briefcase, Smartphone, Sparkles,
  Home, UtensilsCrossed, Dumbbell, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoCart } from "@/components/ui/LogoCart";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { CurrencySwitcher } from "@/components/ui/CurrencySwitcher";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/lib/i18n/context";
import { translations, t } from "@/lib/i18n/translations";

const ROLE_DASHBOARD: Record<string, { href: string; label: string; icon: React.ElementType; color: string }> = {
  vendeur:      { href: "/dashboard/vendeur",      label: "Espace vendeur",      icon: Store,  color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
  admin:        { href: "/dashboard/admin",         label: "Dashboard Admin",     icon: Shield, color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
  transporteur: { href: "/dashboard/transporteur",  label: "Espace transporteur", icon: Truck,  color: "text-blue-600 bg-blue-50 hover:bg-blue-100"       },
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
  { slug: "mode",         href: "/mode-africaine",         label: "Mode Africaine",   Icon: Shirt,           iconColor: "#F59E0B" },
  { slug: "mode-femme",   href: "/categorie/mode-femme",   label: "Mode Femme",       Icon: ShoppingBag,     iconColor: "#F472B6" },
  { slug: "mode-homme",   href: "/categorie/mode-homme",   label: "Mode Homme",       Icon: Briefcase,       iconColor: "#94A3B8" },
  { slug: "electronique", href: "/categorie/electronique", label: "Électronique",     Icon: Smartphone,      iconColor: "#60A5FA" },
  { slug: "beaute",       href: "/categorie/beaute",       label: "Beauté & Santé",   Icon: Sparkles,        iconColor: "#F472B6" },
  { slug: "maison",       href: "/categorie/maison",       label: "Maison & Bureau",  Icon: Home,            iconColor: "#34D399" },
  { slug: "alimentation", href: "/categorie/alimentation", label: "Alimentation",     Icon: UtensilsCrossed, iconColor: "#FB923C" },
  { slug: "sport",        href: "/categorie/sport",        label: "Sports & Loisirs", Icon: Dumbbell,        iconColor: "#A78BFA" },
  { slug: "transport",    href: "/transporteurs",          label: "Envoi de colis",   Icon: Truck,           iconColor: "#6EE7B7" },
];

export function Navbar() {
  const [mobileOpen,      setMobileOpen]      = useState(false);
  const [searchOpen,      setSearchOpen]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState("");
  const [searchCategory,  setSearchCategory]  = useState("");
  const [userMenuOpen,    setUserMenuOpen]    = useState(false);
  const [categoriesOpen,  setCategoriesOpen]  = useState(false);
  const userMenuRef                           = useRef<HTMLDivElement>(null);
  const categoriesRef                         = useRef<HTMLDivElement>(null);
  const pathname                              = usePathname();
  const router                                = useRouter();
  const { locale }                            = useI18n();
  const { totalItems }                        = useCart();
  const { user: currentUser, logout }         = useAuth();
  const nav                                   = translations.nav;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
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
        { href: "/categorie/beaute",       label: "Beauté & Soins",  icon: Sparkles        },
        { href: "/categorie/maison",       label: "Maison",          icon: Home            },
        { href: "/categorie/alimentation", label: "Supermarché",     icon: UtensilsCrossed },
        { href: "/categorie/sport",        label: "Sport & Loisirs", icon: Dumbbell        },
        { href: "/produits",               label: "Autres",          icon: Package         },
      ]
    : [
        { href: "/produits",       label: "Produits",        icon: ShoppingBag },
        { href: "/mode-africaine", label: "Mode Africaine",  icon: Shirt       },
        { href: "/transporteurs",  label: "Envoi de colis",  icon: Truck       },
        { href: "/suivi",          label: "Suivi colis",     icon: Package     },
        { href: "/auth/register",  label: "Devenir vendeur", icon: Store       },
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
    <header className="sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: "1px solid #E5E7EB" }}>

      {/* ── Barre verte supérieure ─────────────────────────────────────── */}
      <div className="hidden sm:block text-xs py-2" style={{ background: "#1B3A2D" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-white/80">
            <Truck className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
            Livraison rapide et sécurisée dans tous les pays d&apos;Afrique
          </span>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-white/55">Besoin d&apos;aide ?</span>
            <a href="tel:+221786863969" className="text-white font-medium hover:text-green-300 transition-colors">
              +221 78 686 39 69
            </a>
            <a
              href="https://wa.me/221786863969"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-green-500 hover:bg-green-400 text-white px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-colors"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </div>

      <nav>
        <div className="px-4 sm:px-6 lg:px-0">

        {/* ── Ligne principale : Logo + Recherche + Icônes ───────────── */}
        <div className="flex items-center h-14 sm:h-16 gap-3 sm:gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 select-none lg:w-60 lg:pl-3">
            <LogoCart size={34} />
            <span
              className="leading-none tracking-tight text-[19px] sm:text-[21px]"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              <span className="font-black italic" style={{ color: "#D4A520" }}>Sango</span><span className="font-bold" style={{ color: "#1B3A2D" }}>Store</span>
            </span>
          </Link>

          {/* Barre de recherche desktop avec dropdown catégories */}
          <form onSubmit={handleSearch} className="hidden sm:flex flex-1 max-w-md lg:max-w-xl mx-2 lg:mx-4">
            <div
              className="flex w-full rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 bg-white transition-all"
              style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <select
                value={searchCategory}
                onChange={e => setSearchCategory(e.target.value)}
                className="border-r border-gray-200 bg-gray-50/80 px-2 lg:px-3 text-xs text-gray-600 focus:outline-none cursor-pointer min-w-[110px] lg:min-w-[145px] appearance-none"
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
                className="flex-1 px-3 py-2 text-sm focus:outline-none bg-white min-w-0"
              />
              <button
                type="submit"
                className="px-3 sm:px-4 text-white flex items-center flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ background: "#1B3A2D" }}
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Actions droite */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ml-auto sm:ml-0 lg:pr-8">

            {/* Icône recherche — mobile uniquement */}
            <button
              className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Rechercher"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Compte */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ background: "#1B3A2D" }}
                  >
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-[10px] text-gray-400 leading-none">Compte</div>
                    <div className="text-xs font-semibold text-gray-800 max-w-[70px] truncate leading-tight mt-0.5">
                      {currentUser.name.split(" ")[0]}
                    </div>
                  </div>
                  <ChevronDown className={cn("w-3.5 h-3.5 text-gray-400 hidden sm:block transition-transform duration-200", userMenuOpen && "rotate-180")} />
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
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
              >
                <User className="w-4 h-4 text-gray-500" />
                Se connecter
              </Link>
            )}

            {/* Panier */}
            <Link
              href="/panier"
              className="relative flex items-center gap-1.5 px-2 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Mon panier"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5"
                    style={{ background: "#1B3A2D" }}
                  >
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-sm text-gray-600">Panier</span>
            </Link>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile quick-access ────────────────────────────────────── */}
        <div
          className="lg:hidden border-t border-gray-100/80 -mx-4 sm:-mx-6 px-3 py-2 flex items-center gap-2 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
            const isGold = href === "/mode-africaine";
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap flex-shrink-0 transition-all shadow-sm",
                  isActive
                    ? "text-white border-transparent"
                    : isGold
                    ? "text-amber-700 border-amber-200 bg-amber-50 hover:bg-amber-100"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
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
          <form onSubmit={handleSearch} className="sm:hidden pb-3 animate-fade-in">
            <div className="flex rounded-xl overflow-hidden border border-gray-200">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="flex-1 pl-4 pr-2 py-2.5 text-sm focus:outline-none bg-gray-50"
              />
              <button type="submit" className="px-4 text-white flex-shrink-0" style={{ background: "#1B3A2D" }}>
                <Search className="w-4 h-4" />
              </button>
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
                  pathname === href ? "text-white" : "text-gray-700 hover:bg-gray-50"
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
        </div>

        {/* ── Navigation desktop secondaire — pleine largeur ──────────── */}
        <div className="hidden lg:flex items-center border-t border-gray-100/80 h-11 overflow-visible">

          {/* Toutes les catégories */}
          <div className="relative h-full w-60 flex-shrink-0" ref={categoriesRef}>
            <button
              onClick={() => setCategoriesOpen(o => !o)}
              className="w-full flex items-center gap-2 h-full px-3 text-white text-[13px] font-semibold transition-colors hover:opacity-95"
              style={{ background: "#1B3A2D" }}
            >
              <Menu className="w-4 h-4" />
              Toutes les catégories
              <ChevronDown className={cn("w-3.5 h-3.5 ml-1 transition-transform duration-200", categoriesOpen && "rotate-180")} />
            </button>

            {categoriesOpen && (
              <div
                className="absolute left-0 top-full w-60 bg-white border border-gray-100 rounded-b-xl shadow-2xl z-50 py-1 animate-fade-in"
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                {DESKTOP_CATEGORIES.map(cat => (
                  <Link
                    key={cat.slug}
                    href={cat.href}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-700 hover:bg-[#F0F7F4] hover:text-[#1B3A2D] transition-colors group"
                  >
                    <cat.Icon className="w-4 h-4 flex-shrink-0" style={{ color: cat.iconColor }} />
                    {cat.label}
                    <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-200 group-hover:text-[#1B3A2D] transition-colors" />
                  </Link>
                ))}
                <div className="border-t border-gray-100 mt-1">
                  <Link
                    href="/produits"
                    onClick={() => setCategoriesOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-semibold text-[#1B3A2D] hover:bg-[#F0F7F4] transition-colors"
                  >
                    Voir toutes les catégories
                    <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Liens rapides */}
          <div className="flex items-center px-3 gap-0.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <Link
              href="/produits?promo=true"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Tag className="w-3.5 h-3.5 text-orange-400" />
              Promotions
              <span className="text-[8px] font-extrabold uppercase px-1.5 py-px rounded-full bg-orange-500 text-white leading-none">NOUVEAU</span>
            </Link>
            <Link
              href="/transporteurs"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
                pathname.startsWith("/transporteurs") ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Truck className="w-3.5 h-3.5 text-gray-400" />
              Envoi de colis
            </Link>
            <Link
              href="/mode-africaine"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
                pathname === "/mode-africaine" ? "bg-amber-50 text-amber-700 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Shirt className="w-3.5 h-3.5" style={{ color: pathname === "/mode-africaine" ? "#D4961E" : "#9CA3AF" }} />
              Mode africaine
            </Link>
            <Link
              href="/produits"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
                pathname === "/produits" ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Store className="w-3.5 h-3.5 text-gray-400" />
              Boutiques officielles
            </Link>
            <Link
              href="/suivi"
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap flex-shrink-0",
                pathname.startsWith("/suivi") ? "bg-gray-100 text-gray-900 font-semibold" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Package className="w-3.5 h-3.5 text-gray-400" />
              Suivi colis
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
