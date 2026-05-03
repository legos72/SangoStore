"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Users, ShoppingBag, Package, Truck, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, Eye, Ban, Search,
  LayoutDashboard, Settings, Bell, LogOut, ChevronDown,
  ArrowUpRight, ArrowDownRight, Shield, Star, Clock,
  Filter, MoreVertical, RefreshCw, Zap, Globe, Menu, X,
  CreditCard, MapPin, UserCheck, BarChart3, Activity,
  ChevronRight, Send, Phone, Mail, AlertCircle,
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_ORDERS, MOCK_TRANSPORTERS, MOCK_USERS } from "@/lib/data";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

type Tab = "overview" | "users" | "products" | "orders" | "transporters" | "escrow";

// ─── Nav config ───────────────────────────────────────────────────────────────

const NAV_ITEMS: { tab: Tab; icon: any; label: string; badge?: number; color: string }[] = [
  { tab: "overview",     icon: LayoutDashboard, label: "Vue d'ensemble",  color: "text-blue-400"   },
  { tab: "users",        icon: Users,           label: "Utilisateurs",    badge: 3, color: "text-purple-400" },
  { tab: "products",     icon: ShoppingBag,     label: "Produits",        badge: 8, color: "text-amber-400"  },
  { tab: "orders",       icon: Package,         label: "Commandes",       badge: 2, color: "text-green-400"  },
  { tab: "transporters", icon: Truck,           label: "Transporteurs",   color: "text-cyan-400"   },
  { tab: "escrow",       icon: CreditCard,      label: "Escrow",          color: "text-rose-400"   },
];

// ─── KPI data ─────────────────────────────────────────────────────────────────

const KPI_CARDS = [
  { label: "Revenus ce mois",     value: "4 820 €",  sub: "+18% vs mois dernier", trend: "up",      icon: DollarSign,  gradient: "from-emerald-500 to-teal-600"   },
  { label: "Commandes totales",   value: "1 382",    sub: "+24 cette semaine",    trend: "up",      icon: Package,     gradient: "from-blue-500 to-indigo-600"    },
  { label: "Utilisateurs actifs", value: "847",      sub: "+12 aujourd'hui",      trend: "up",      icon: Users,       gradient: "from-violet-500 to-purple-600"  },
  { label: "Escrow en attente",   value: "12 400 €", sub: "38 commandes",         trend: "neutral", icon: Shield,      gradient: "from-orange-500 to-amber-600"   },
  { label: "Produits actifs",     value: "248",      sub: "8 en validation",      trend: "neutral", icon: ShoppingBag, gradient: "from-pink-500 to-rose-600"      },
  { label: "Transporteurs",       value: "18",       sub: "3 en vérification",    trend: "down",    icon: Truck,       gradient: "from-cyan-500 to-sky-600"       },
];

// ─── Activity feed ────────────────────────────────────────────────────────────

const RECENT_ACTIVITY = [
  { icon: Package,       color: "bg-blue-500/15 text-blue-400",    dot: "bg-blue-500",   text: "Nouvelle commande #DM-2024-00155 — 850 €",        time: "2 min"  },
  { icon: UserCheck,     color: "bg-purple-500/15 text-purple-400",dot: "bg-purple-500", text: "Nouveau vendeur inscrit : Fatou Diallo (Sénégal)", time: "8 min"  },
  { icon: Shield,        color: "bg-emerald-500/15 text-emerald-400",dot:"bg-emerald-500",text: "Escrow libéré — commande #DM-2024-00138",          time: "15 min" },
  { icon: AlertTriangle, color: "bg-red-500/15 text-red-400",      dot: "bg-red-500",    text: "Signalement produit : iPhone 14 (vendeur u1)",     time: "1h"     },
  { icon: Truck,         color: "bg-cyan-500/15 text-cyan-400",    dot: "bg-cyan-500",   text: "Nouveau transporteur à valider : Trans-CI Express",time: "2h"     },
  { icon: XCircle,       color: "bg-red-500/15 text-red-400",      dot: "bg-red-500",    text: "Commande annulée #DM-2024-00129 — remboursement",  time: "3h"     },
];

const PENDING_ACTIONS = [
  { label: "Vendeurs à vérifier",       count: 3, color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/50", dot: "bg-orange-500" },
  { label: "Produits à valider",        count: 8, color: "from-blue-500/20 to-blue-500/5",    border: "border-blue-500/50",   dot: "bg-blue-500"   },
  { label: "Transporteurs à certifier", count: 3, color: "from-purple-500/20 to-purple-500/5",border: "border-purple-500/50", dot: "bg-purple-500" },
  { label: "Litiges en cours",          count: 2, color: "from-red-500/20 to-red-500/5",      border: "border-red-500/50",    dot: "bg-red-500"    },
];

// ─── Sales chart (30 data points) ────────────────────────────────────────────

const SALES_DATA = [
  42, 68, 55, 80, 73, 90, 85, 110, 95, 120,
  105, 130, 118, 145, 132, 160, 148, 175, 165, 190,
  178, 200, 188, 215, 205, 220, 210, 235, 225, 248,
];

// ─── Order status timeline ────────────────────────────────────────────────────

const ORDER_STEPS: { status: OrderStatus; label: string; short: string }[] = [
  { status: "paye",           label: "Payé",        short: "💳" },
  { status: "en_preparation", label: "Préparation", short: "📦" },
  { status: "expedie",        label: "Transit",     short: "✈️" },
  { status: "arrive_bangui",  label: "Bangui",      short: "🇨🇫" },
  { status: "pret_retrait",   label: "Prêt",        short: "🔔" },
  { status: "recupere",       label: "Livré",       short: "✅" },
];

const STATUS_ORDER: OrderStatus[] = [
  "en_attente","paye","en_preparation","expedie","arrive_bangui","pret_retrait","recupere",
];

function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-0 w-full mt-2">
      {ORDER_STEPS.map(({ status: s, short }, i) => {
        const stepIdx = STATUS_ORDER.indexOf(s);
        const done    = currentIdx >= stepIdx;
        const current = currentIdx === stepIdx;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-all",
              current ? "bg-orange-500 ring-2 ring-orange-500/30 scale-110" :
              done    ? "bg-emerald-500" : "bg-slate-700"
            )}>
              {short}
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5", done && currentIdx > stepIdx ? "bg-emerald-500" : "bg-slate-700")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [search, setSearch]           = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredOrders = MOCK_ORDERS.filter(o => {
    if (orderFilter === "transit")    return o.status === "expedie";
    if (orderFilter === "pret")       return o.status === "pret_retrait";
    if (orderFilter === "litige")     return o.status === "annule";
    return true;
  });

  const maxSales = Math.max(...SALES_DATA);

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className={cn(
        "flex flex-col flex-shrink-0 z-40 transition-transform duration-300",
        "fixed lg:relative inset-y-0 left-0 w-64",
        "bg-slate-900 border-r border-white/5",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>

        {/* Logo area */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-extrabold text-base leading-tight">
                <span>Sango</span><span className="text-orange-400">Market</span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-widest uppercase">Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Server status */}
        <div className="mx-4 mt-4 mb-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">Tous les services actifs</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3 py-2">Navigation</p>
          {NAV_ITEMS.map(({ tab, icon: Icon, label, badge, color }) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  active
                    ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-white border border-orange-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4 transition-colors", active ? "text-orange-400" : color, !active && "group-hover:text-white")} />
                  {label}
                </div>
                {badge ? (
                  <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    active ? "bg-orange-500/30 text-orange-300" : "bg-red-500 text-white"
                  )}>
                    {badge}
                  </span>
                ) : active ? (
                  <ChevronRight className="w-3 h-3 text-orange-400" />
                ) : null}
              </button>
            );
          })}

          <div className="pt-3">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3 py-2">Outils</p>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Globe className="w-4 h-4 text-slate-500" /> Zones de livraison
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <BarChart3 className="w-4 h-4 text-slate-500" /> Analytiques
            </button>
          </div>
        </nav>

        {/* Bottom admin card */}
        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" /> Paramètres
          </button>
          <Link href="/auth/login" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Déconnexion
          </Link>
          <div className="mt-3 mx-1 p-3 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-extrabold text-white shadow-md">A</div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold">Admin</div>
              <div className="text-slate-500 text-[11px] truncate">super.admin@sango.io</div>
            </div>
            <MoreVertical className="w-4 h-4 text-slate-600" />
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Top bar ── */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">
                {NAV_ITEMS.find(n => n.tab === activeTab)?.label ?? "Dashboard"}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                placeholder="Recherche globale…"
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:bg-white/8 transition-all w-52"
              />
            </div>

            {/* Lang */}
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/8 transition-all">
              🇫🇷 <span>FR</span> <ChevronDown className="w-3 h-3" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl hover:bg-white/5 transition-colors"
              >
                <Bell className="w-4.5 h-4.5 text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">5 nouvelles</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {RECENT_ACTIVITY.slice(0, 5).map(({ icon: Icon, color, dot, text, time }) => (
                      <div key={text} className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 cursor-pointer transition-colors">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug line-clamp-2">{text}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">Il y a {time}</p>
                        </div>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", dot)} />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-white/5">
                    <button className="text-xs text-orange-400 hover:text-orange-300 font-semibold w-full text-center">Voir toutes →</button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin avatar */}
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-extrabold text-white shadow-md">A</div>
              <div className="text-xs hidden sm:block">
                <div className="font-semibold text-white">Admin</div>
                <div className="text-slate-500 text-[10px]">Super admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 bg-slate-950">

          {/* ══════════════════════════════
              OVERVIEW
          ══════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">

              {/* KPI cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {KPI_CARDS.map(({ label, value, sub, trend, icon: Icon, gradient }) => (
                  <div key={label} className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group">
                    <div className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity", gradient)} />
                    <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg", gradient)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xl font-extrabold text-white">{value}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{label}</div>
                    <div className={cn(
                      "flex items-center gap-1 text-[10px] font-semibold mt-1.5",
                      trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500"
                    )}>
                      {trend === "up"   && <ArrowUpRight   className="w-3 h-3" />}
                      {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                      {sub}
                    </div>
                  </div>
                ))}
              </div>

              {/* Sales chart */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-orange-400" /> Ventes — 30 derniers jours
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Revenus journaliers en euros</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-white">4 820 €</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 justify-end">
                      <ArrowUpRight className="w-3 h-3" /> +18% ce mois
                    </div>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-28">
                  {SALES_DATA.map((v, i) => {
                    const isLast = i === SALES_DATA.length - 1;
                    const height = `${(v / maxSales) * 100}%`;
                    return (
                      <div
                        key={i}
                        className="flex-1 rounded-t group/bar relative cursor-pointer"
                        style={{ height }}
                      >
                        <div className={cn(
                          "w-full h-full rounded-t transition-all",
                          isLast ? "bg-orange-500" : "bg-slate-700 group-hover/bar:bg-orange-500/60"
                        )} />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap pointer-events-none z-10">
                          {v} €
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-slate-600">
                  <span>1 {new Date().toLocaleString("fr-FR", { month: "short" })}</span>
                  <span>15</span>
                  <span>Aujourd'hui</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                {/* Activity feed */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h2 className="text-sm font-bold text-white">Activité récente</h2>
                    <button className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors">
                      <RefreshCw className="w-3 h-3" /> Actualiser
                    </button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {RECENT_ACTIVITY.map(({ icon: Icon, color, dot, text, time }) => (
                      <div key={text} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/2 cursor-pointer transition-colors">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", color)}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug">{text}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">Il y a {time}</p>
                        </div>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", dot)} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                  {/* Pending actions */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" /> Actions requises
                      </h2>
                    </div>
                    <div className="p-3 space-y-2">
                      {PENDING_ACTIONS.map(({ label, count, color, border, dot }) => (
                        <button key={label} className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl",
                          "bg-gradient-to-r border text-left hover:scale-[1.01] transition-all",
                          color, border
                        )}>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", dot)} />
                            <span className="text-xs font-medium text-slate-300">{label}</span>
                          </div>
                          <span className="text-[11px] font-extrabold text-white bg-red-500 px-2 py-0.5 rounded-full">{count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Top countries */}
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" /> Top pays vendeurs
                    </h2>
                    <div className="space-y-3">
                      {[
                        { flag: "🇫🇷", name: "France",       pct: 38, orders: 524, color: "bg-blue-500"   },
                        { flag: "🇨🇲", name: "Cameroun",     pct: 26, orders: 359, color: "bg-green-500"  },
                        { flag: "🇸🇳", name: "Sénégal",      pct: 21, orders: 290, color: "bg-orange-500" },
                        { flag: "🇨🇮", name: "Côte d'Ivoire",pct: 15, orders: 209, color: "bg-purple-500" },
                      ].map(({ flag, name, pct, orders, color }) => (
                        <div key={name}>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="flex items-center gap-1.5 text-slate-300 font-medium">{flag} {name}</span>
                            <span className="text-slate-500">{orders} cmd</span>
                          </div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              USERS (Vendeurs diaspora)
          ══════════════════════════════ */}
          {activeTab === "users" && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur…"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-all">
                    <option>Tous les rôles</option>
                    <option>Client</option>
                    <option>Vendeur</option>
                    <option>Transporteur</option>
                  </select>
                  <select className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-all">
                    <option>Tous statuts</option>
                    <option>Vérifié</option>
                    <option>En attente</option>
                  </select>
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total",         value: MOCK_USERS.length, color: "text-white",         bg: "bg-white/5"             },
                  { label: "Vérifiés",      value: MOCK_USERS.filter(u => u.isVerified).length,   color: "text-emerald-400",   bg: "bg-emerald-500/10"    },
                  { label: "En attente",    value: MOCK_USERS.filter(u => !u.isVerified).length,  color: "text-amber-400",     bg: "bg-amber-500/10"      },
                  { label: "Vendeurs",      value: MOCK_USERS.filter(u => u.role === "vendeur").length, color: "text-orange-400", bg: "bg-orange-500/10" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={cn("rounded-xl p-4 border border-white/5 text-center", bg)}>
                    <div className={cn("text-2xl font-extrabold", color)}>{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        {["Utilisateur", "Rôle", "Pays", "KYC", "Inscrit le", "CA estimé", "Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/3">
                      {MOCK_USERS.filter(u =>
                        !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
                      ).map(user => (
                        <tr key={user.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm">{user.name}</div>
                                <div className="text-[11px] text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full capitalize", {
                              "bg-blue-500/15 text-blue-400":    user.role === "client",
                              "bg-orange-500/15 text-orange-400": user.role === "vendeur",
                              "bg-purple-500/15 text-purple-400": user.role === "transporteur",
                              "bg-red-500/15 text-red-400":      user.role === "admin",
                            })}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs font-medium">{user.countryCode}</td>
                          <td className="px-5 py-4">
                            {user.isVerified ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <Shield className="w-3 h-3" /> KYC Vérifié
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                <Clock className="w-3 h-3" /> En attente
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(user.createdAt)}</td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-bold text-white">
                              {(Math.random() * 5000 + 500 | 0).toLocaleString("fr-FR")} €
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Voir">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Approuver">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-colors" title="Contacter">
                                <Mail className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Suspendre">
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              PRODUCTS
          ══════════════════════════════ */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    placeholder="Rechercher un produit…"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-all">
                    <option>Tous les pays</option>
                    <option>🇫🇷 France</option>
                    <option>🇸🇳 Sénégal</option>
                    <option>🇨🇲 Cameroun</option>
                  </select>
                  <select className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-all">
                    <option>Toutes catégories</option>
                    <option>Électronique</option>
                    <option>Mode</option>
                    <option>Alimentation</option>
                  </select>
                </div>
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[720px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        {["Produit", "Origine", "Vendeur", "Prix", "Stock", "Note", "Statut", "Actions"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/3">
                      {MOCK_PRODUCTS.map(product => (
                        <tr key={product.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div className="max-w-[180px]">
                                <div className="font-medium text-white text-xs truncate">{product.title}</div>
                                <div className="text-[10px] text-slate-500 capitalize mt-0.5">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                              {product.originCountry.flag} {product.originCountry.name}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-400">{product.seller.name}</td>
                          <td className="px-4 py-3.5 text-sm font-bold text-white">
                            {formatPrice(product.price, product.currency)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("text-xs font-bold", product.stock <= 2 ? "text-red-400" : "text-emerald-400")}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {product.rating}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn(
                              "text-[11px] font-bold px-2.5 py-1 rounded-full",
                              product.isAvailable
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-700 text-slate-500"
                            )}>
                              {product.isAvailable ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              ORDERS
          ══════════════════════════════ */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Mini KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total",         value: "1 382", color: "border-slate-700"   },
                  { label: "En transit",    value: "48",    color: "border-orange-500"  },
                  { label: "Prêts retrait", value: "12",    color: "border-emerald-500" },
                  { label: "Litiges",       value: "2",     color: "border-red-500"     },
                ].map(({ label, value, color }) => (
                  <div key={label} className={cn("bg-slate-900 rounded-2xl border-l-4 border border-white/5 p-4 text-center", color)}>
                    <div className="text-2xl font-extrabold text-white">{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all",    label: "Toutes" },
                  { key: "transit",label: "En transit" },
                  { key: "pret",   label: "Prêt retrait" },
                  { key: "litige", label: "Litiges" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setOrderFilter(key)}
                    className={cn(
                      "px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                      orderFilter === key
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-slate-900 text-slate-400 border-white/10 hover:text-white hover:border-white/20"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Orders table */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        {["N° commande", "Client", "Produits", "Total", "Paiement", "Statut & Timeline", "Actions"].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/3">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-4 py-4">
                            <div className="font-mono text-xs font-bold text-white">{order.orderNumber}</div>
                            <div className="text-[10px] text-slate-600 mt-0.5">{formatDate(order.createdAt)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-slate-300 font-medium">{order.client.name}</div>
                          </td>
                          <td className="px-4 py-4 max-w-[140px]">
                            <div className="text-xs text-slate-500 truncate">{order.items.map(i => i.product.title).join(", ")}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-white text-sm">{formatPrice(order.totalAmount, order.items[0].product.currency)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full",
                              order.paymentStatus === "bloque"   ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                              order.paymentStatus === "libere"   ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                              order.paymentStatus === "rembourse"? "bg-red-500/15 text-red-400 border border-red-500/20" :
                              "bg-slate-700 text-slate-400"
                            )}>
                              {order.paymentStatus === "bloque"    ? "🔒 Escrow"    :
                               order.paymentStatus === "libere"    ? "✅ Libéré"    :
                               order.paymentStatus === "rembourse" ? "↩ Remboursé"  : "En attente"}
                            </span>
                          </td>
                          <td className="px-4 py-4 min-w-[220px]">
                            <div className="text-[11px] text-slate-400 mb-1">{ORDER_STATUS_LABELS[order.status]}</div>
                            <OrderTimeline status={order.status} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Voir">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Libérer escrow">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Rembourser">
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              TRANSPORTERS
          ══════════════════════════════ */}
          {activeTab === "transporters" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_TRANSPORTERS.map(t => (
                  <div key={t.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-cyan-500/20">
                          {t.companyName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-white">{t.companyName}</div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-amber-400 font-semibold">{t.rating}</span>
                            <span>· {t.reviewCount} avis</span>
                          </div>
                        </div>
                      </div>
                      {t.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                          <Shield className="w-2.5 h-2.5" /> Certifié
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                          <Clock className="w-2.5 h-2.5" /> En attente
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 mb-4 line-clamp-2 leading-relaxed">{t.description}</p>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      {[
                        { label: "Trajets",  value: "12" },
                        { label: "Colis",    value: "48" },
                        { label: "Note",     value: `${t.rating}⭐` },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white/3 rounded-xl py-2 px-1">
                          <div className="text-xs font-bold text-white">{value}</div>
                          <div className="text-[10px] text-slate-600">{label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all">
                        <Eye className="w-3.5 h-3.5" /> Voir
                      </button>
                      <button className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all">
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      {!t.isVerified && (
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all">
                          <CheckCircle className="w-3.5 h-3.5" /> Certifier
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════
              ESCROW
          ══════════════════════════════ */}
          {activeTab === "escrow" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total en escrow",   value: "12 400 €", icon: Shield,        gradient: "from-orange-500 to-amber-500"   },
                  { label: "Libérés ce mois",   value: "8 240 €",  icon: CheckCircle,   gradient: "from-emerald-500 to-teal-500"   },
                  { label: "Remboursés",         value: "320 €",    icon: ArrowDownRight,gradient: "from-red-500 to-rose-500"       },
                  { label: "Transactions total", value: "1 382",    icon: TrendingUp,    gradient: "from-blue-500 to-indigo-500"    },
                ].map(({ label, value, icon: Icon, gradient }) => (
                  <div key={label} className="bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all">
                    <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg", gradient)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-2xl font-extrabold text-white">{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <h2 className="text-sm font-bold text-white">Escrows actifs</h2>
                  <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">38 en attente</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        {["Commande", "Client", "Montant", "Statut escrow", "Depuis", "Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/3">
                      {MOCK_ORDERS.map(order => (
                        <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold text-white">{order.orderNumber}</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-300 font-medium">{order.client.name}</td>
                          <td className="px-5 py-4">
                            <span className="font-bold text-white">{formatPrice(order.totalAmount, order.items[0].product.currency)}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full",
                              order.paymentStatus === "bloque" ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                              order.paymentStatus === "libere" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                              "bg-slate-700 text-slate-400"
                            )}>
                              {order.paymentStatus === "bloque" ? "🔒 Bloqué" : order.paymentStatus === "libere" ? "✅ Libéré" : order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">{formatDate(order.createdAt)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="flex items-center gap-1 py-1.5 px-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all">
                                <CheckCircle className="w-3 h-3" /> Libérer
                              </button>
                              <button className="flex items-center gap-1 py-1.5 px-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold transition-all">
                                <XCircle className="w-3 h-3" /> Rembourser
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
