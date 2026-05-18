"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, DollarSign, Star, Plus, Eye, Edit3,
  Trash2, ToggleLeft, ToggleRight, Search, CheckCircle,
  Clock, Truck, ArrowLeft, TrendingUp, ArrowUpRight, Bell,
  ChevronRight, AlertCircle, RefreshCw, BarChart3, Zap,
  MoreVertical, XCircle, MapPin, Home, Calendar, User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { api, getImageUrl } from "@/lib/api";
import type { VendorProduct, VendorOrder, VendorStats, RevenuePoint, AuthUser } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import type { OrderStatus } from "@/lib/types";

// ─── Demo product helpers (localStorage fallback when backend is offline) ─────

function getDemoProducts(): VendorProduct[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("sango_demo_products") ?? "[]") as VendorProduct[];
  } catch { return []; }
}

// ─── Constants ────────────────────────────────────────────────────────────────

type Section = "overview" | "products" | "orders";

const ORDER_STEPS: { status: OrderStatus; label: string; emoji: string }[] = [
  { status: "paye",           label: "Payé",       emoji: "💳" },
  { status: "en_preparation", label: "Préparé",    emoji: "📦" },
  { status: "expedie",        label: "Expédié",    emoji: "✈️" },
  { status: "arrive_bangui",  label: "Bangui",     emoji: "🇨🇫" },
  { status: "pret_retrait",   label: "Prêt",       emoji: "🔔" },
  { status: "recupere",       label: "Reçu",       emoji: "✅" },
];
const STATUS_IDX: Partial<Record<OrderStatus, number>> = {
  en_attente:0, paye:1, en_preparation:2, expedie:3, arrive_bangui:4, pret_retrait:5, recupere:6,
};

// ─── Mini timeline ────────────────────────────────────────────────────────────

function MiniTimeline({ status }: { status: string }) {
  const cur = STATUS_IDX[status as OrderStatus] ?? 0;
  return (
    <div className="flex items-center w-full gap-0">
      {ORDER_STEPS.map(({ status: s, emoji }, i) => {
        const idx  = STATUS_IDX[s] ?? 0;
        const done = cur >= idx;
        const curr = cur === idx;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 transition-all",
              curr ? "bg-orange-500 ring-2 ring-orange-200 scale-110" :
              done ? "bg-green-500" : "bg-gray-100"
            )}>
              {emoji}
            </div>
            {i < ORDER_STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5", done && cur > idx ? "bg-green-400" : "bg-gray-100")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Partial<Record<OrderStatus, string>> = {
    pret_retrait:   "bg-green-100 text-green-700 border-green-200",
    expedie:        "bg-blue-100 text-blue-700 border-blue-200",
    en_preparation: "bg-amber-100 text-amber-700 border-amber-200",
    arrive_bangui:  "bg-orange-100 text-orange-700 border-orange-200",
    recupere:       "bg-gray-100 text-gray-600 border-gray-100",
    annule:         "bg-red-100 text-red-600 border-red-200",
    paye:           "bg-purple-100 text-purple-700 border-purple-100",
    en_attente:     "bg-gray-100 text-gray-500 border-gray-100",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border", map[status as OrderStatus] ?? "bg-gray-100 text-gray-600 border-gray-100")}>
      {ORDER_STATUS_LABELS[status as OrderStatus] ?? status}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VendeurDashboard() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const [section, setSection]             = useState<Section>("overview");
  const [productSearch, setProductSearch] = useState("");
  const [orderFilter, setOrderFilter]     = useState<string>("all");
  const [products, setProducts]           = useState<VendorProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [orders, setOrders]               = useState<VendorOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [vendorStats, setVendorStats]     = useState<VendorStats | null>(null);
  const [revenueData, setRevenueData]     = useState<RevenuePoint[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [toast, setToast]                 = useState<{ msg: string; ok: boolean } | null>(null);

  // Guard: redirect only after auth context has finished loading from localStorage
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/auth/login");
    }
  }, [authLoading, currentUser, router]);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await api.vendor.products({ limit: "100" });
      const apiProducts: VendorProduct[] = res.data ?? [];
      const demo = getDemoProducts();
      const apiIds = new Set(apiProducts.map(p => p.id));
      setProducts([...apiProducts, ...demo.filter(d => !apiIds.has(d.id))]);
    } catch {
      setProducts(getDemoProducts());
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await api.vendor.orders({ limit: "100" });
      setOrders(res.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [statsRes, revenueRes] = await Promise.all([
        api.vendor.stats(),
        api.vendor.revenue(),
      ]);
      if (statsRes.data)   setVendorStats(statsRes.data);
      if (revenueRes.data) setRevenueData(revenueRes.data);
    } catch {
      // stats unavailable — keep null, dashboard shows zeros
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadOrders();
    loadStats();
  }, [loadProducts, loadOrders, loadStats]);

  const filteredProducts = products.filter(p =>
    !productSearch || p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilter === "pending") return !["recupere", "annule"].includes(o.status);
    if (orderFilter === "done")    return o.status === "recupere";
    if (orderFilter === "escrow")  return o.payment_status === "bloque";
    return true;
  });

  const totalRevenue   = vendorStats?.totalRevenue   ?? 0;
  const escrowBlocked  = vendorStats?.revenueBlocked ?? 0;
  const avgRating      = vendorStats?.avgRating      ?? 0;
  const reviewCount    = vendorStats?.reviewCount    ?? 0;

  const revenueChartData = revenueData.map(r => ({
    label: r.label,
    value: parseFloat(r.revenue) || 0,
  }));
  const maxRevenue = revenueChartData.length > 0
    ? Math.max(...revenueChartData.map(r => r.value), 1)
    : 1;

  async function handleToggle(id: string) {
    const p = products.find(pr => pr.id === id);
    if (!p) return;
    const next = !p.is_available;
    setProducts(prev => prev.map(pr => pr.id === id ? { ...pr, is_available: next } : pr));
    try {
      await api.products.update(id, { isAvailable: next });
      showToast(`${p.title} — ${next ? "réactivé" : "désactivé"}`);
    } catch {
      setProducts(prev => prev.map(pr => pr.id === id ? { ...pr, is_available: !next } : pr));
      showToast("Erreur lors de la mise à jour", false);
    }
  }

  async function handleDelete(id: string) {
    setConfirmDelete(null);
    setProducts(prev => prev.filter(p => p.id !== id));
    if (id.startsWith("demo_")) {
      try {
        const updated = getDemoProducts().filter(p => p.id !== id);
        localStorage.setItem("sango_demo_products", JSON.stringify(updated));
      } catch { /* ignore */ }
      showToast("Produit supprimé");
      return;
    }
    try {
      await api.products.delete(id);
      showToast("Produit supprimé");
    } catch {
      showToast("Erreur lors de la suppression", false);
      loadProducts();
    }
  }

  async function handleOrderStatus(orderId: string, status: string) {
    setUpdatingOrder(orderId);
    try {
      await api.vendor.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      showToast(`Statut mis à jour : ${ORDER_STATUS_LABELS[status as OrderStatus] ?? status}`);
    } catch {
      showToast("Erreur lors de la mise à jour du statut", false);
    } finally {
      setUpdatingOrder(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold transition-all",
          toast.ok ? "bg-green-500 text-white" : "bg-red-500 text-white"
        )}>
          {toast.ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-gray-900">Espace Vendeur</h1>
              <p className="text-[11px] text-gray-400">{currentUser?.name} · {currentUser?.role}</p>
            </div>
          </div>

          <nav className="hidden sm:flex gap-1 bg-gray-100 rounded-xl p-1">
            {(["overview", "products", "orders"] as Section[]).map(s => (
              <button key={s} onClick={() => setSection(s)} className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                section === s ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}>
                {s === "overview" ? "Tableau de bord" : s === "products" ? "Produits" : "Commandes"}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/dashboard/vendeur/nouveau-produit"
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-sm shadow-orange-200">
              <Plus className="w-3.5 h-3.5" /> Nouveau produit
            </Link>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden flex gap-1 px-4 pb-2">
          {(["overview", "products", "orders"] as Section[]).map(s => (
            <button key={s} onClick={() => setSection(s)} className={cn(
              "flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
              section === s ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600"
            )}>
              {s === "overview" ? "Dashboard" : s === "products" ? "Produits" : "Commandes"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════
            OVERVIEW
        ══════════════════════════════════════════════════════════════════ */}
        {section === "overview" && (
          <div className="space-y-6">

            {/* Profile hero */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-5 text-white shadow-lg shadow-orange-200">
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "radial-gradient(circle at 80% 10%, white 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }} />
              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center text-2xl font-extrabold">
                    {currentUser?.name?.charAt(0) ?? "V"}
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">{currentUser?.name}</h2>
                    <p className="text-orange-100 text-sm">Vendeur · {currentUser?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                        <CheckCircle className="w-3 h-3" /> Compte actif
                      </span>
                      {avgRating > 0 && (
                        <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                          <Star className="w-3 h-3 fill-white" /> {avgRating.toFixed(1)} / 5
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center sm:text-left">
                  {[
                    { label: "Produits",   value: products.length },
                    { label: "Commandes",  value: orders.length   },
                    { label: "Avis",       value: reviewCount     },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="text-2xl font-extrabold">{value}</div>
                      <div className="text-[11px] text-orange-100">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  icon: ShoppingBag,
                  label: "Produits actifs",
                  value: products.filter(p => p.is_available).length.toString(),
                  sub: `${products.length} total`,
                  color: "bg-blue-50", iconColor: "bg-blue-100 text-blue-600", trend: null,
                },
                {
                  icon: Package,
                  label: "Commandes reçues",
                  value: (vendorStats?.totalOrders ?? orders.length).toString(),
                  sub: `${vendorStats?.pendingOrders ?? orders.filter(o => !["recupere","annule"].includes(o.status)).length} en cours`,
                  color: "bg-orange-50", iconColor: "bg-orange-100 text-orange-600", trend: null,
                },
                {
                  icon: DollarSign,
                  label: "Revenus totaux",
                  value: totalRevenue > 0 ? `${totalRevenue.toLocaleString("fr-FR")} XAF` : "—",
                  sub: escrowBlocked > 0 ? `${escrowBlocked.toLocaleString("fr-FR")} bloqué` : "Aucun fonds bloqué",
                  color: "bg-green-50", iconColor: "bg-green-100 text-green-600", trend: null,
                },
                {
                  icon: Star,
                  label: "Note moyenne",
                  value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5` : "—",
                  sub: reviewCount > 0 ? `${reviewCount} avis clients` : "Aucun avis pour le moment",
                  color: "bg-purple-50", iconColor: "bg-purple-100 text-purple-600", trend: null,
                },
              ].map(({ icon: Icon, label, value, sub, color, iconColor, trend }) => (
                <div key={label} className={cn("rounded-2xl p-4 flex flex-col gap-3", color)}>
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconColor)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-xl font-extrabold text-gray-900">{value}</div>
                    <div className="text-xs font-semibold text-gray-700 mt-0.5">{label}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-gray-400">{sub}</span>
                      {trend && (
                        <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                          <ArrowUpRight className="w-2.5 h-2.5" /> {trend}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Revenue chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-400" /> Revenus — 6 derniers mois
                </h2>
                <span className="text-xs text-gray-400">en XAF</span>
              </div>
              {revenueChartData.length === 0 || revenueChartData.every(r => r.value === 0) ? (
                <div className="h-28 flex flex-col items-center justify-center text-center">
                  <BarChart3 className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400">Aucune donnée de revenus pour le moment</p>
                </div>
              ) : (
                <div className="flex items-end gap-2 h-28">
                  {revenueChartData.map(({ label, value }, i) => {
                    const isLast = i === revenueChartData.length - 1;
                    return (
                      <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="relative w-full group/bar cursor-pointer" style={{ height: "100px" }}>
                          <div
                            className={cn(
                              "absolute bottom-0 w-full rounded-t-lg transition-all",
                              isLast ? "bg-orange-500" : "bg-gray-200 group-hover/bar:bg-orange-400"
                            )}
                            style={{ height: `${(value / maxRevenue) * 100}%` }}
                          />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 whitespace-nowrap pointer-events-none z-10">
                            {value.toLocaleString("fr-FR")} XAF
                          </div>
                        </div>
                        <span className="text-[10px] text-gray-400 font-medium">{label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending orders + recent products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Recent orders */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-orange-400" /> Commandes récentes
                  </h2>
                  <button onClick={() => setSection("orders")} className="text-[11px] text-orange-500 font-semibold flex items-center gap-1 hover:text-orange-700">
                    Toutes <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Aucune commande pour le moment</p>
                    <p className="text-xs text-gray-300 mt-1">Vos commandes apparaîtront ici</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-900">#{order.order_number}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">{order.client_name} · {formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-sm font-bold text-gray-900">{formatPrice(order.total_amount, order.currency)}</div>
                            <div className="text-[10px] text-gray-400">{order.payment_status === "bloque" ? "🔒 Escrow" : "✅ Libéré"}</div>
                          </div>
                        </div>
                        <MiniTimeline status={order.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent products */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                  <h2 className="text-sm font-bold text-gray-900">Mes produits</h2>
                  <button onClick={() => setSection("products")} className="text-[11px] text-orange-500 font-semibold flex items-center gap-1 hover:text-orange-700">
                    Gérer <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {products.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-400">Ajoutez votre premier produit</p>
                    <Link href="/dashboard/vendeur/nouveau-produit"
                      className="inline-flex items-center gap-1.5 mt-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Nouveau produit
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {products.slice(0, 4).map(product => (
                      <div key={product.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                          {product.images[0] && <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{product.title}</p>
                          <p className="text-[10px] text-gray-400">{formatPrice(product.price, product.currency)} · {product.stock} en stock</p>
                        </div>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0",
                          product.is_available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {product.is_available ? "Actif" : "Inactif"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            PRODUCTS
        ══════════════════════════════════════════════════════════════════ */}
        {section === "products" && (
          <div className="space-y-5">

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un produit…"
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 transition-all"
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-orange-300 transition-all">
                  <option>Toutes catégories</option>
                  <option>Électronique</option>
                  <option>Mode</option>
                  <option>Alimentation</option>
                </select>
                <Link href="/dashboard/vendeur/nouveau-produit"
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap">
                  <Plus className="w-4 h-4" /> Ajouter
                </Link>
              </div>
            </div>

            {/* Summary mini-cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total",    value: products.length,                               color: "bg-white border-gray-100" },
                { label: "Actifs",   value: products.filter(p => p.is_available).length,   color: "bg-green-50 border-green-100" },
                { label: "Inactifs", value: products.filter(p => !p.is_available).length,  color: "bg-gray-50 border-gray-100" },
              ].map(({ label, value, color }) => (
                <div key={label} className={cn("rounded-xl border p-3 text-center", color)}>
                  <div className="text-xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-[11px] text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Products table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Produit", "Catégorie", "Prix", "Stock", "Note", "Statut", "Actions"].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredProducts.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              {product.images[0] && <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />}
                            </div>
                            <div className="max-w-[200px]">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.title}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{product.origin_country}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs bg-orange-50 text-orange-700 font-semibold px-2 py-1 rounded-full capitalize">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-bold text-gray-900">
                              {formatPrice(product.price, product.currency)}
                            </span>
                            {product.promo_price && (
                              <span className="ml-1.5 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                                PROMO
                              </span>
                            )}
                            {(product.wholesale_prices?.length ?? 0) > 0 && (
                              <span className="ml-1.5 text-[10px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                                GROS
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-gray-900">{product.stock}</span>
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                              product.stock === 0 ? "bg-red-100 text-red-600" :
                              product.stock <= 5  ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                            )}>
                              {product.stock === 0 ? "Rupture" : product.stock <= 5 ? "Limité" : "Dispo"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {parseFloat(product.avg_rating || "0").toFixed(1)} ({product.review_count})
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggle(product.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          >
                            {product.is_available ? (
                              <><ToggleRight className="w-5 h-5 text-green-500" /> <span className="text-green-600">Actif</span></>
                            ) : (
                              <><ToggleLeft className="w-5 h-5 text-gray-400" /> <span className="text-gray-500">Inactif</span></>
                            )}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/produits/${product.id}`}
                              className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-300 hover:text-blue-600 transition-colors group/btn" title="Voir">
                              <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </Link>
                            <Link href={`/dashboard/vendeur/modifier/${product.id}`}
                              className="p-1.5 rounded-lg hover:bg-amber-50 text-gray-300 hover:text-amber-600 transition-colors group/btn" title="Modifier">
                              <Edit3 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(product.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors group/btn" title="Supprimer">
                              <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {loadingProducts && (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">Chargement…</td></tr>
                    )}
                    {!loadingProducts && filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center">
                          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-400">Ajoutez votre premier produit</p>
                          <Link href="/dashboard/vendeur/nouveau-produit"
                            className="inline-flex items-center gap-1.5 mt-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Nouveau produit
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            ORDERS
        ══════════════════════════════════════════════════════════════════ */}
        {section === "orders" && (
          <div className="space-y-5">

            {/* Filter tabs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all",     label: "Toutes" },
                  { key: "pending", label: "En cours" },
                  { key: "done",    label: "Terminées" },
                  { key: "escrow",  label: "Escrow bloqué" },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setOrderFilter(key)} className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                    orderFilter === key
                      ? "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
                  )}>
                    {label}
                    {key === "escrow" && orders.filter(o => o.payment_status === "bloque").length > 0 && (
                      <span className="ml-1.5 bg-orange-200 text-orange-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {orders.filter(o => o.payment_status === "bloque").length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <span className="text-xs text-gray-400">{filteredOrders.length} commande(s)</span>
            </div>

            {/* Order cards */}
            <div className="space-y-4">
              {loadingOrders && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-3 animate-spin" />
                  <p className="text-sm text-gray-400">Chargement des commandes…</p>
                </div>
              )}

              {!loadingOrders && filteredOrders.map(order => {
                const myTotal    = order.items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
                const isEscrow   = order.payment_status === "bloque";
                const isUpdating = updatingOrder === order.id;

                return (
                  <div key={order.id} className={cn(
                    "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md",
                    isEscrow ? "border-orange-200 ring-1 ring-orange-100" : "border-gray-100"
                  )}>
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-50">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0",
                          isEscrow ? "bg-orange-50" : "bg-gray-50"
                        )}>
                          {order.status === "recupere" ? "✅" : order.status === "pret_retrait" ? "🔔" : order.status === "expedie" ? "✈️" : "📦"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-gray-900">#{order.order_number}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.client_name}</span>
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">{formatPrice(myTotal, order.currency)}</div>
                          <div className={cn("text-[10px] font-semibold mt-0.5",
                            isEscrow ? "text-orange-500" : "text-green-600")}>
                            {isEscrow ? "🔒 En escrow" : "✅ Libéré"}
                          </div>
                        </div>
                        <Link href={`/commandes/${order.id}`}
                          className="flex items-center gap-1 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 text-gray-500 hover:text-orange-600 text-xs font-semibold px-3 py-2 rounded-xl transition-all">
                          <Eye className="w-3.5 h-3.5" /> Suivi
                        </Link>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="px-5 py-3 border-b border-gray-50 space-y-2">
                      {order.items.map(item => (
                        <div key={item.product_id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {item.image && <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-800 truncate">{item.title}</p>
                            <p className="text-[10px] text-gray-400">× {item.quantity} · {formatPrice(item.unit_price, item.currency)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Timeline */}
                    <div className="px-5 py-3 bg-gray-50 border-b border-gray-50">
                      <MiniTimeline status={order.status} />
                    </div>

                    {/* Logistics + actions */}
                    <div className="px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
                        {order.pickup_name && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-blue-400" /> {order.pickup_name}</span>
                        )}
                      </div>

                      {/* Status actions for vendor */}
                      {!["recupere","annule"].includes(order.status) && (
                        <div className="flex items-center gap-2">
                          {order.status === "paye" && (
                            <button
                              onClick={() => handleOrderStatus(order.id, "en_preparation")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                              {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Package className="w-3 h-3" />}
                              Préparer
                            </button>
                          )}
                          {order.status === "en_preparation" && (
                            <button
                              onClick={() => handleOrderStatus(order.id, "expedie")}
                              disabled={isUpdating}
                              className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                              {isUpdating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                              Marquer expédié
                            </button>
                          )}
                          {isEscrow && (order.status === "pret_retrait" || order.status === "recupere") && (
                            <button
                              onClick={() => showToast("Escrow libéré — paiement en cours")}
                              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all">
                              <CheckCircle className="w-3 h-3" /> Libérer escrow
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {!loadingOrders && filteredOrders.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400">
                    {orders.length === 0 ? "Aucune commande pour le moment" : "Aucune commande dans cette catégorie"}
                  </p>
                  {orders.length === 0 && (
                    <p className="text-xs text-gray-300 mt-1">Vos commandes apparaîtront ici dès qu&apos;un client achète un de vos produits</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Confirm delete modal ───────────────────────────────────────────────── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center">Supprimer ce produit ?</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              Cette action est irréversible. Le produit sera retiré de la marketplace.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
