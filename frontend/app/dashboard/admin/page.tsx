"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Users, ShoppingBag, Package, Truck, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, XCircle, Eye, Ban, Search,
  LayoutDashboard, Settings, Bell, LogOut, ChevronDown,
  ArrowUpRight, ArrowDownRight, Shield, Star, Clock,
  MoreVertical, RefreshCw, Zap, Globe, Menu, X,
  CreditCard, UserCheck, BarChart3, Activity,
  ChevronRight, Phone, Mail, AlertCircle, Trash2,
  Power, Send, MessageSquare, ToggleLeft, ToggleRight,
} from "lucide-react";
import { api, getUser, getImageUrl } from "@/lib/api";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

type Tab = "overview" | "users" | "products" | "orders" | "transporters" | "escrow";

const NAV_ITEMS: { tab: Tab; icon: any; label: string; color: string }[] = [
  { tab: "overview",     icon: LayoutDashboard, label: "Vue d'ensemble",  color: "text-blue-400"   },
  { tab: "users",        icon: Users,           label: "Utilisateurs",    color: "text-purple-400" },
  { tab: "products",     icon: ShoppingBag,     label: "Produits",        color: "text-amber-400"  },
  { tab: "orders",       icon: Package,         label: "Commandes",       color: "text-green-400"  },
  { tab: "transporters", icon: Truck,           label: "Transporteurs",   color: "text-cyan-400"   },
  { tab: "escrow",       icon: CreditCard,      label: "Escrow",          color: "text-rose-400"   },
];

const RECENT_ACTIVITY = [
  { icon: Package,       color: "bg-blue-500/15 text-blue-400",      dot: "bg-blue-500",   text: "Nouvelle commande recue",                    time: "2 min"  },
  { icon: UserCheck,     color: "bg-purple-500/15 text-purple-400",  dot: "bg-purple-500", text: "Nouveau vendeur inscrit en attente",          time: "8 min"  },
  { icon: Shield,        color: "bg-emerald-500/15 text-emerald-400",dot: "bg-emerald-500",text: "Escrow libere automatiquement",               time: "15 min" },
  { icon: AlertTriangle, color: "bg-red-500/15 text-red-400",        dot: "bg-red-500",    text: "Signalement produit recu",                   time: "1h"     },
  { icon: Truck,         color: "bg-cyan-500/15 text-cyan-400",      dot: "bg-cyan-500",   text: "Nouveau transporteur a valider",              time: "2h"     },
  { icon: XCircle,       color: "bg-red-500/15 text-red-400",        dot: "bg-red-500",    text: "Commande annulee — remboursement en cours",   time: "3h"     },
];

const SALES_DATA = [42,68,55,80,73,90,85,110,95,120,105,130,118,145,132,160,148,175,165,190,178,200,188,215,205,220,210,235,225,248];

const ORDER_STEPS: { status: OrderStatus; short: string }[] = [
  { status: "paye",           short: "💳" },
  { status: "en_preparation", short: "📦" },
  { status: "expedie",        short: "✈️" },
  { status: "arrive_bangui",  short: "🇨🇫" },
  { status: "pret_retrait",   short: "🔔" },
  { status: "recupere",       short: "✅" },
];
const STATUS_ORDER: OrderStatus[] = ["en_attente","paye","en_preparation","expedie","arrive_bangui","pret_retrait","recupere"];

function countryFlag(code: string) {
  if (!code || code.length !== 2) return "🌍";
  const o = 127397;
  return [...code.toUpperCase()].map(c => String.fromCodePoint(c.charCodeAt(0) + o)).join("");
}

function OrderTimeline({ status }: { status: OrderStatus }) {
  const idx = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-0 w-full mt-2">
      {ORDER_STEPS.map(({ status: s, short }, i) => {
        const si = STATUS_ORDER.indexOf(s);
        const done = idx >= si;
        return (
          <div key={s} className="flex items-center flex-1">
            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] flex-shrink-0",
              idx === si ? "bg-orange-500 ring-2 ring-orange-500/30 scale-110" : done ? "bg-emerald-500" : "bg-slate-700"
            )}>{short}</div>
            {i < ORDER_STEPS.length - 1 && <div className={cn("flex-1 h-0.5", done && idx > si ? "bg-emerald-500" : "bg-slate-700")} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab]       = useState<Tab>("overview");
  const [search, setSearch]             = useState("");
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [orderFilter, setOrderFilter]   = useState("all");

  // Data state
  const [adminUser]                             = useState(() => getUser());
  const [stats, setStats]                       = useState<any>(null);
  const [statsLoading, setStatsLoading]         = useState(false);
  const [users, setUsers]                       = useState<any[]>([]);
  const [usersLoading, setUsersLoading]         = useState(false);
  const [roleFilter, setRoleFilter]             = useState("");
  const [statusFilter, setStatusFilter]         = useState("");
  const [products, setProducts]                 = useState<any[]>([]);
  const [productsLoading, setProductsLoading]   = useState(false);
  const [productSearch, setProductSearch]       = useState("");
  const [orders, setOrders]                     = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading]       = useState(false);
  const [transporters, setTransporters]         = useState<any[]>([]);
  const [transportersLoading, setTransportersLoading] = useState(false);

  // Modal state
  const [emailModal, setEmailModal]   = useState<{ user: any } | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody]     = useState("");
  const [rejectModal, setRejectModal] = useState<{ user: any } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [productModal, setProductModal] = useState<{ product: any } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [toast, setToast]             = useState<{ msg: string; ok: boolean } | null>(null);

  const notifRef = useRef<HTMLDivElement>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  // Close notif on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Load stats on mount
  useEffect(() => {
    setStatsLoading(true);
    api.admin.stats()
      .then((r: any) => setStats(r.data ?? null))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  // Users
  useEffect(() => {
    if (activeTab !== "users") return;
    setUsersLoading(true);
    api.admin.listUsers({ role: roleFilter || undefined, status: statusFilter || undefined })
      .then((r: any) => setUsers(r.data ?? []))
      .catch(() => setUsers([]))
      .finally(() => setUsersLoading(false));
  }, [activeTab, roleFilter, statusFilter]);

  // Products
  useEffect(() => {
    if (activeTab !== "products") return;
    setProductsLoading(true);
    api.admin.listProducts()
      .then((r: any) => setProducts(r.data ?? []))
      .catch(() => setProducts([]))
      .finally(() => setProductsLoading(false));
  }, [activeTab]);

  // Orders (shared by orders + escrow tabs)
  useEffect(() => {
    if (activeTab !== "orders" && activeTab !== "escrow") return;
    setOrdersLoading(true);
    api.admin.listOrders()
      .then((r: any) => setOrders(r.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [activeTab]);

  // Transporters
  useEffect(() => {
    if (activeTab !== "transporters") return;
    setTransportersLoading(true);
    api.admin.listUsers({ role: "transporteur" })
      .then((r: any) => setTransporters(r.data ?? []))
      .catch(() => setTransporters([]))
      .finally(() => setTransportersLoading(false));
  }, [activeTab]);

  // ── Actions ────────────────────────────────────────────────────────────────

  function goUsersTab(role?: string, status?: string) {
    setRoleFilter(role ?? "");
    setStatusFilter(status ?? "");
    setActiveTab("users");
  }

  async function handleApprove(user: any) {
    await api.admin.updateUserStatus(user.id, "approved");
    setUsers(p => p.map(u => u.id === user.id ? { ...u, status: "approved" } : u));
    setStats((s: any) => s ? { ...s, pending_users: Math.max(0, s.pending_users - 1), approved_users: s.approved_users + 1 } : s);
    showToast(`${user.name} approuvé`);
  }

  async function handleRejectConfirm() {
    if (!rejectModal) return;
    setModalLoading(true);
    try {
      await api.admin.updateUserStatus(rejectModal.user.id, "rejected", rejectReason);
      setUsers(p => p.map(u => u.id === rejectModal.user.id ? { ...u, status: "rejected" } : u));
      setStats((s: any) => s ? { ...s, pending_users: Math.max(0, s.pending_users - 1) } : s);
      showToast(`${rejectModal.user.name} rejeté`);
      setRejectModal(null);
      setRejectReason("");
    } catch { showToast("Erreur", false); }
    finally { setModalLoading(false); }
  }

  async function handleSuspend(user: any) {
    const newActive = !user.is_active;
    await api.admin.suspendUser(user.id, newActive);
    setUsers(p => p.map(u => u.id === user.id ? { ...u, is_active: newActive } : u));
    showToast(newActive ? `${user.name} réactivé` : `${user.name} suspendu`);
  }

  async function handleSendEmail() {
    if (!emailModal || !emailSubject.trim() || !emailBody.trim()) return;
    setModalLoading(true);
    try {
      await api.admin.messageUser(emailModal.user.id, emailSubject, emailBody);
      showToast("Message envoyé");
      setEmailModal(null);
      setEmailSubject("");
      setEmailBody("");
    } catch { showToast("Erreur d'envoi", false); }
    finally { setModalLoading(false); }
  }

  async function handleToggleProduct(product: any) {
    const newVal = !product.is_available;
    await api.admin.toggleProduct(product.id, newVal);
    setProducts(p => p.map(x => x.id === product.id ? { ...x, is_available: newVal } : x));
    showToast(newVal ? "Produit activé" : "Produit désactivé");
  }

  async function handleDeleteProduct(product: any) {
    if (!confirm(`Supprimer "${product.title}" ? Cette action est irréversible.`)) return;
    await api.admin.deleteProduct(product.id);
    setProducts(p => p.filter(x => x.id !== product.id));
    showToast("Produit supprimé");
    if (stats) setStats((s: any) => ({ ...s, total_products: s.total_products - 1, active_products: product.is_available ? s.active_products - 1 : s.active_products }));
  }

  async function handleApproveTransporter(t: any) {
    await api.admin.updateUserStatus(t.id, "approved");
    setTransporters(p => p.map(x => x.id === t.id ? { ...x, status: "approved" } : x));
    setStats((s: any) => s ? { ...s, pending_users: Math.max(0, s.pending_users - 1) } : s);
    showToast(`${t.name} approuvé`);
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredOrders = orders.filter(o => {
    if (orderFilter === "transit") return o.status === "expedie";
    if (orderFilter === "pret")    return o.status === "pret_retrait";
    if (orderFilter === "annule")  return o.status === "annule";
    return true;
  });

  const filteredProducts = products.filter(p =>
    !productSearch ||
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.seller_name ?? "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    !search ||
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const maxSales = Math.max(...SALES_DATA);

  const kpiCards: { label: string; value: string; sub: string; trend: "up" | "down" | "neutral"; icon: any; gradient: string; onClick?: () => void }[] = [
    { label: "Commandes totales",   value: stats ? stats.total_orders.toLocaleString("fr") : "—",   sub: stats ? `${stats.orders_in_transit} en transit` : "…",  trend: "up",      icon: Package,    gradient: "from-blue-500 to-indigo-600",   onClick: () => setActiveTab("orders")        },
    { label: "Utilisateurs actifs", value: stats ? stats.approved_users.toLocaleString("fr") : "—", sub: stats ? `${stats.pending_users} en attente` : "…",      trend: "up",      icon: Users,      gradient: "from-violet-500 to-purple-600", onClick: () => goUsersTab("", "approved")   },
    { label: "Escrow en attente",   value: stats ? `${Math.round(Number(stats.escrow_total)).toLocaleString("fr")} €` : "—", sub: stats ? `${stats.escrow_count} commandes` : "…", trend: "neutral", icon: Shield,     gradient: "from-orange-500 to-amber-600",  onClick: () => setActiveTab("escrow")        },
    { label: "Produits actifs",     value: stats ? stats.active_products.toLocaleString("fr") : "—",sub: stats ? `${stats.total_products} au total` : "…",       trend: "neutral", icon: ShoppingBag,gradient: "from-pink-500 to-rose-600",     onClick: () => setActiveTab("products")      },
    { label: "Vendeurs",            value: stats ? stats.total_vendeurs.toLocaleString("fr") : "—", sub: stats ? `${stats.pending_users} en attente` : "…",      trend: "neutral", icon: UserCheck,  gradient: "from-emerald-500 to-teal-600",  onClick: () => goUsersTab("vendeur")         },
    { label: "Transporteurs",       value: stats ? stats.total_transporteurs.toLocaleString("fr") : "—", sub: "inscrits", trend: "neutral", icon: Truck, gradient: "from-cyan-500 to-sky-600", onClick: () => setActiveTab("transporters") },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl transition-all",
          toast.ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {toast.ok ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <XCircle className="w-4 h-4 inline mr-2" />}
          {toast.msg}
        </div>
      )}

      {/* ── Email Modal ── */}
      {emailModal && (
        <Modal title={`Message à ${emailModal.user.name}`} onClose={() => { setEmailModal(null); setEmailSubject(""); setEmailBody(""); }}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Destinataire</label>
              <div className="text-sm text-slate-300 bg-white/5 px-3 py-2 rounded-xl">{emailModal.user.email}</div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Sujet *</label>
              <input
                value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                placeholder="Sujet du message"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Message *</label>
              <textarea
                value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={4}
                placeholder="Votre message..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all resize-none"
              />
            </div>
            <button
              onClick={handleSendEmail}
              disabled={modalLoading || !emailSubject.trim() || !emailBody.trim()}
              className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> {modalLoading ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Reject with reason Modal ── */}
      {rejectModal && (
        <Modal title={`Rejeter ${rejectModal.user.name}`} onClose={() => { setRejectModal(null); setRejectReason(""); }}>
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Un email sera envoyé à <strong className="text-slate-300">{rejectModal.user.email}</strong> avec le motif.</p>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Motif du rejet (optionnel)</label>
              <textarea
                value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                placeholder="Ex: Documents manquants, informations incorrectes..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-red-500/50 transition-all resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-semibold">
                Annuler
              </button>
              <button
                onClick={handleRejectConfirm} disabled={modalLoading}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" /> {modalLoading ? "…" : "Rejeter"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Product detail Modal ── */}
      {productModal && (
        <Modal title="Détail produit" onClose={() => setProductModal(null)}>
          <div className="space-y-4">
            {productModal.product.images?.[0] && (
              <div className="w-full h-40 bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center">
                <img src={getImageUrl(productModal.product.images[0])} alt="" className="max-h-full object-contain" />
              </div>
            )}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Titre</span>
                <span className="text-white font-semibold">{productModal.product.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Catégorie</span>
                <span className="text-slate-300 capitalize">{productModal.product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Prix</span>
                <span className="text-white font-bold">{formatPrice(productModal.product.price, productModal.product.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Stock</span>
                <span className={cn("font-bold", productModal.product.stock <= 2 ? "text-red-400" : "text-emerald-400")}>{productModal.product.stock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vendeur</span>
                <span className="text-slate-300">{productModal.product.seller_name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Origine</span>
                <span className="text-slate-300">{countryFlag(productModal.product.origin_country)} {productModal.product.origin_country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Note</span>
                <span className="text-amber-400">★ {Number(productModal.product.avg_rating).toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statut</span>
                <span className={cn("font-semibold", productModal.product.is_available ? "text-emerald-400" : "text-red-400")}>
                  {productModal.product.is_available ? "Actif" : "Désactivé"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Créé le</span>
                <span className="text-slate-400 text-xs">{formatDate(productModal.product.created_at)}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => { handleToggleProduct(productModal.product); setProductModal(null); }}
                className={cn("flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all", productModal.product.is_available
                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
                )}>
                <Power className="w-3.5 h-3.5" />
                {productModal.product.is_available ? "Désactiver" : "Activer"}
              </button>
              <button
                onClick={() => { handleDeleteProduct(productModal.product); setProductModal(null); }}
                className="flex-1 py-2 rounded-xl text-xs font-bold bg-red-500 text-white flex items-center justify-center gap-1.5 hover:bg-red-600 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Mobile overlay ── */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ═══ SIDEBAR ═══ */}
      <aside className={cn(
        "flex flex-col flex-shrink-0 z-40 transition-transform duration-300 fixed lg:relative inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/5",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
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

        <div className="mx-4 mt-4 mb-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] text-emerald-400 font-semibold">Tous les services actifs</span>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3 py-2">Navigation</p>
          {NAV_ITEMS.map(({ tab, icon: Icon, label, color }) => {
            const active = activeTab === tab;
            const badge = tab === "users" ? (stats?.pending_users ?? 0) : tab === "orders" ? (stats?.orders_in_transit ?? 0) : 0;
            return (
              <button key={tab} onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
                className={cn("w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  active ? "bg-gradient-to-r from-orange-500/20 to-amber-500/10 text-white border border-orange-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}>
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-4 h-4", active ? "text-orange-400" : color)} />
                  {label}
                </div>
                {badge > 0 ? (
                  <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center",
                    active ? "bg-orange-500/30 text-orange-300" : "bg-red-500 text-white"
                  )}>{badge}</span>
                ) : active ? <ChevronRight className="w-3 h-3 text-orange-400" /> : null}
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

        <div className="px-3 py-4 border-t border-white/5 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Settings className="w-4 h-4" /> Parametres
          </button>
          <Link href="/auth/login" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Deconnexion
          </Link>
          <div className="mt-3 mx-1 p-3 bg-white/5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-extrabold text-white shadow-md">
              {adminUser?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">{adminUser?.name ?? "Admin"}</div>
              <div className="text-slate-500 text-[11px] truncate">{adminUser?.email ?? ""}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white">{NAV_ITEMS.find(n => n.tab === activeTab)?.label ?? "Dashboard"}</h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input placeholder="Recherche globale…" className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all w-52" />
            </div>
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-white/5 transition-colors">
                <Bell className="w-4.5 h-4.5 text-slate-400" />
                {(stats?.pending_users ?? 0) > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-slate-900" />}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    {(stats?.pending_users ?? 0) > 0 && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">{stats.pending_users} en attente</span>}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                    {RECENT_ACTIVITY.slice(0, 5).map(({ icon: Icon, color, dot, text, time }) => (
                      <div key={text} className="flex items-start gap-3 px-4 py-3 hover:bg-white/3 cursor-pointer transition-colors">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", color)}><Icon className="w-3.5 h-3.5" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300 leading-snug line-clamp-2">{text}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">Il y a {time}</p>
                        </div>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", dot)} />
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t border-white/5">
                    <button onClick={() => { goUsersTab("", "pending"); setNotifOpen(false); }} className="text-xs text-orange-400 hover:text-orange-300 font-semibold w-full text-center">
                      Voir les comptes en attente →
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 pl-3 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-xs font-extrabold text-white shadow-md">
                {adminUser?.name?.charAt(0)?.toUpperCase() ?? "A"}
              </div>
              <div className="text-xs hidden sm:block">
                <div className="font-semibold text-white truncate max-w-[100px]">{adminUser?.name ?? "Admin"}</div>
                <div className="text-slate-500 text-[10px]">Super admin</div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 bg-slate-950">

          {/* ══ OVERVIEW ══ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
                {kpiCards.map(({ label, value, sub, trend, icon: Icon, gradient, onClick }) => (
                  <button key={label} onClick={onClick}
                    className="relative overflow-hidden bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-white/20 hover:scale-[1.02] transition-all group text-left cursor-pointer">
                    <div className={cn("absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity", gradient)} />
                    <div className={cn("w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg", gradient)}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className={cn("text-xl font-extrabold text-white", statsLoading && "text-slate-600")}>{value}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{label}</div>
                    <div className={cn("flex items-center gap-1 text-[10px] font-semibold mt-1.5",
                      trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-slate-500"
                    )}>
                      {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                      {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                      {sub}
                    </div>
                  </button>
                ))}
              </div>

              {/* Chart */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2"><Activity className="w-4 h-4 text-orange-400" /> Activite — 30 derniers jours</h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">Illustration des tendances</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-white">{stats ? `${stats.total_orders} cmd` : "—"}</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1 justify-end"><ArrowUpRight className="w-3 h-3" /> total commandes</div>
                  </div>
                </div>
                <div className="flex items-end gap-1 h-28">
                  {SALES_DATA.map((v, i) => (
                    <div key={i} className="flex-1 rounded-t group/bar relative cursor-pointer" style={{ height: `${(v / maxSales) * 100}%` }}>
                      <div className={cn("w-full h-full rounded-t transition-all", i === SALES_DATA.length - 1 ? "bg-orange-500" : "bg-slate-700 group-hover/bar:bg-orange-500/60")} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                    <h2 className="text-sm font-bold text-white">Activite recente</h2>
                    <button onClick={() => { setStatsLoading(true); api.admin.stats().then((r: any) => setStats(r.data)).catch(() => {}).finally(() => setStatsLoading(false)); }}
                      className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" /> Actualiser
                    </button>
                  </div>
                  <div className="divide-y divide-white/5">
                    {RECENT_ACTIVITY.map(({ icon: Icon, color, dot, text, time }) => (
                      <div key={text} className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/2 cursor-pointer transition-colors">
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5", color)}><Icon className="w-3.5 h-3.5" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-300">{text}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5">Il y a {time}</p>
                        </div>
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5", dot)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/5">
                      <h2 className="text-sm font-bold text-white flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-400" /> Actions requises</h2>
                    </div>
                    <div className="p-3 space-y-2">
                      {[
                        { label: "Comptes en attente",      count: stats?.pending_users ?? 0,         color: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/50", dot: "bg-orange-500", onClick: () => goUsersTab("", "pending") },
                        { label: "Vendeurs a verifier",     count: stats?.total_vendeurs ?? 0,         color: "from-blue-500/20 to-blue-500/5",    border: "border-blue-500/50",   dot: "bg-blue-500",   onClick: () => goUsersTab("vendeur", "pending") },
                        { label: "Transporteurs",           count: stats?.total_transporteurs ?? 0,   color: "from-purple-500/20 to-purple-500/5",border: "border-purple-500/50", dot: "bg-purple-500", onClick: () => setActiveTab("transporters") },
                        { label: "Escrow a liberer",        count: stats?.escrow_count ?? 0,          color: "from-red-500/20 to-red-500/5",      border: "border-red-500/50",    dot: "bg-red-500",    onClick: () => setActiveTab("escrow") },
                      ].map(({ label, count, color, border, dot, onClick }) => (
                        <button key={label} onClick={onClick} className={cn("w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r border text-left hover:scale-[1.01] transition-all", color, border)}>
                          <div className="flex items-center gap-2">
                            <span className={cn("w-2 h-2 rounded-full", dot)} />
                            <span className="text-xs font-medium text-slate-300">{label}</span>
                          </div>
                          <span className={cn("text-[11px] font-extrabold px-2 py-0.5 rounded-full", count > 0 ? "text-white bg-red-500" : "text-slate-500 bg-slate-700")}>{count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-cyan-400" /> Resume base de donnees</h2>
                    <div className="space-y-3">
                      {[
                        { label: "Utilisateurs",  value: stats?.total_users ?? "—",      color: "bg-purple-500" },
                        { label: "Produits",       value: stats?.total_products ?? "—",  color: "bg-amber-500"  },
                        { label: "Commandes",      value: stats?.total_orders ?? "—",    color: "bg-blue-500"   },
                        { label: "Escrow bloque",  value: stats?.escrow_count ?? "—",    color: "bg-orange-500" },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-300 font-medium"><span className={cn("w-2 h-2 rounded-full", color)} />{label}</span>
                          <span className="text-white font-bold">{statsLoading ? "…" : value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ USERS ══ */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Rechercher un utilisateur…" value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all" />
                </div>
                <div className="flex items-center gap-2">
                  <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-all">
                    <option value="">Tous les roles</option>
                    <option value="client">Client</option>
                    <option value="vendeur">Vendeur</option>
                    <option value="transporteur">Transporteur</option>
                  </select>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-all">
                    <option value="">Tous statuts</option>
                    <option value="approved">Approuve</option>
                    <option value="pending">En attente</option>
                    <option value="rejected">Rejete</option>
                  </select>
                </div>
              </div>

              {/* Clickable stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total",       value: users.length,                                         color: "text-white",       bg: "bg-white/5",         onClick: () => { setRoleFilter(""); setStatusFilter(""); } },
                  { label: "Approuves",   value: users.filter(u => u.status === "approved").length,    color: "text-emerald-400", bg: "bg-emerald-500/10",  onClick: () => setStatusFilter("approved") },
                  { label: "En attente",  value: users.filter(u => u.status === "pending").length,     color: "text-amber-400",   bg: "bg-amber-500/10",    onClick: () => setStatusFilter("pending")  },
                  { label: "Vendeurs",    value: users.filter(u => u.role === "vendeur").length,       color: "text-orange-400",  bg: "bg-orange-500/10",   onClick: () => setRoleFilter("vendeur")    },
                ].map(({ label, value, color, bg, onClick }) => (
                  <button key={label} onClick={onClick}
                    className={cn("rounded-xl p-4 border border-white/5 text-center hover:border-white/20 hover:scale-[1.02] transition-all cursor-pointer", bg)}>
                    <div className={cn("text-2xl font-extrabold", color)}>{usersLoading ? "…" : value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </button>
                ))}
              </div>

              <div className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/2">
                        {["Utilisateur", "Role", "Pays", "Statut", "Inscrit le", "Actions"].map(h => (
                          <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/3">
                      {usersLoading ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">Chargement…</td></tr>
                      ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-600 text-sm">Aucun utilisateur</td></tr>
                      ) : filteredUsers.map((user: any) => (
                        <tr key={user.id} className={cn("hover:bg-white/2 transition-colors group", !user.is_active && "opacity-50")}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0">
                                {user.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-white text-sm flex items-center gap-1.5">
                                  {user.name}
                                  {!user.is_active && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">SUSPENDU</span>}
                                </div>
                                <div className="text-[11px] text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full capitalize", {
                              "bg-blue-500/15 text-blue-400":     user.role === "client",
                              "bg-orange-500/15 text-orange-400": user.role === "vendeur",
                              "bg-purple-500/15 text-purple-400": user.role === "transporteur",
                              "bg-red-500/15 text-red-400":       user.role === "admin",
                            })}>{user.role}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs font-medium">
                            {user.country_code ? `${countryFlag(user.country_code)} ${user.country_code}` : "—"}
                          </td>
                          <td className="px-5 py-4">
                            {user.status === "approved" ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                                <CheckCircle className="w-3 h-3" /> Approuve
                              </span>
                            ) : user.status === "rejected" ? (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                                <XCircle className="w-3 h-3" /> Rejete
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                <Clock className="w-3 h-3" /> En attente
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(user.created_at)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {user.status === "pending" && (
                                <>
                                  <button onClick={() => handleApprove(user)}
                                    className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Approuver">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => setRejectModal({ user })}
                                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Rejeter">
                                    <XCircle className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              <button onClick={() => setEmailModal({ user })}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Envoyer un message">
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleSuspend(user)}
                                className={cn("p-1.5 rounded-lg transition-colors", user.is_active
                                  ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                )} title={user.is_active ? "Suspendre" : "Reactivier"}>
                                <Power className="w-3.5 h-3.5" />
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

          {/* ══ PRODUCTS ══ */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input placeholder="Rechercher un produit…" value={productSearch} onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 transition-all" />
                </div>
                <span className="text-xs text-slate-500 self-center">{filteredProducts.length} produit{filteredProducts.length !== 1 ? "s" : ""}</span>
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
                      {productsLoading ? (
                        <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-500 text-sm">Chargement…</td></tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-600 text-sm">Aucun produit</td></tr>
                      ) : filteredProducts.map((product: any) => (
                        <tr key={product.id} className={cn("hover:bg-white/2 transition-colors group", !product.is_available && "opacity-60")}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                                {product.images?.[0] && <img src={getImageUrl(product.images[0])} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="max-w-[180px]">
                                <div className="font-medium text-white text-xs truncate">{product.title}</div>
                                <div className="text-[10px] text-slate-500 capitalize mt-0.5">{product.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-1 rounded-full">
                              {countryFlag(product.origin_country)} {product.origin_country}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-400">{product.seller_name ?? "—"}</td>
                          <td className="px-4 py-3.5 text-sm font-bold text-white">{formatPrice(product.price, product.currency)}</td>
                          <td className="px-4 py-3.5">
                            <span className={cn("text-xs font-bold", product.stock <= 2 ? "text-red-400" : "text-emerald-400")}>{product.stock}</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 text-xs text-slate-400">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {Number(product.avg_rating).toFixed(1)}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full",
                              product.is_available ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-slate-700 text-slate-500"
                            )}>
                              {product.is_available ? "Actif" : "Inactif"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setProductModal({ product })}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Voir details">
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleToggleProduct(product)}
                                className={cn("p-1.5 rounded-lg transition-colors", product.is_available
                                  ? "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                )} title={product.is_available ? "Desactiver" : "Activer"}>
                                {product.is_available ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => handleDeleteProduct(product)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Supprimer">
                                <Trash2 className="w-3.5 h-3.5" />
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

          {/* ══ ORDERS ══ */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Total",         value: ordersLoading ? "…" : orders.length.toLocaleString("fr"),                                    color: "border-slate-700"   },
                  { label: "En transit",    value: ordersLoading ? "…" : orders.filter(o => o.status === "expedie").length.toString(),           color: "border-orange-500"  },
                  { label: "Prets retrait", value: ordersLoading ? "…" : orders.filter(o => o.status === "pret_retrait").length.toString(),      color: "border-emerald-500" },
                  { label: "Annules",       value: ordersLoading ? "…" : orders.filter(o => o.status === "annule").length.toString(),            color: "border-red-500"     },
                ].map(({ label, value, color }) => (
                  <div key={label} className={cn("bg-slate-900 rounded-2xl border-l-4 border border-white/5 p-4 text-center", color)}>
                    <div className="text-2xl font-extrabold text-white">{value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {[{ key: "all", label: "Toutes" }, { key: "transit", label: "En transit" }, { key: "pret", label: "Pret retrait" }, { key: "annule", label: "Annulees" }].map(({ key, label }) => (
                  <button key={key} onClick={() => setOrderFilter(key)}
                    className={cn("px-4 py-1.5 rounded-full text-xs font-semibold transition-all border",
                      orderFilter === key ? "bg-orange-500 text-white border-orange-500" : "bg-slate-900 text-slate-400 border-white/10 hover:text-white hover:border-white/20"
                    )}>{label}</button>
                ))}
              </div>

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
                      {ordersLoading ? (
                        <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-500 text-sm">Chargement…</td></tr>
                      ) : filteredOrders.length === 0 ? (
                        <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-600 text-sm">Aucune commande</td></tr>
                      ) : filteredOrders.map((order: any) => (
                        <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-4 py-4">
                            <div className="font-mono text-xs font-bold text-white">{order.order_number}</div>
                            <div className="text-[10px] text-slate-600 mt-0.5">{formatDate(order.created_at)}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-xs text-slate-300 font-medium">{order.client_name}</div>
                            <div className="text-[10px] text-slate-600">{order.client_email}</div>
                          </td>
                          <td className="px-4 py-4 max-w-[140px]">
                            <div className="text-xs text-slate-500 truncate">{(order.items ?? []).map((i: any) => i.title).join(", ") || "—"}</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-white text-sm">{formatPrice(order.total_amount, order.currency ?? "EUR")}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full",
                              order.payment_status === "bloque"    ? "bg-orange-500/15 text-orange-400 border border-orange-500/20" :
                              order.payment_status === "libere"    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" :
                              order.payment_status === "rembourse" ? "bg-red-500/15 text-red-400 border border-red-500/20" : "bg-slate-700 text-slate-400"
                            )}>
                              {order.payment_status === "bloque" ? "🔒 Escrow" : order.payment_status === "libere" ? "✅ Libere" : order.payment_status === "rembourse" ? "↩ Rembourse" : "En attente"}
                            </span>
                          </td>
                          <td className="px-4 py-4 min-w-[220px]">
                            <div className="text-[11px] text-slate-400 mb-1">{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</div>
                            <OrderTimeline status={order.status as OrderStatus} />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Voir"><Eye className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors" title="Liberer escrow"><CheckCircle className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Rembourser"><XCircle className="w-3.5 h-3.5" /></button>
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

          {/* ══ TRANSPORTERS ══ */}
          {activeTab === "transporters" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Total",      value: transporters.length,                                    color: "text-white",       bg: "bg-white/5"        },
                  { label: "Approuves",  value: transporters.filter(t => t.status === "approved").length, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "En attente", value: transporters.filter(t => t.status === "pending").length,  color: "text-amber-400",   bg: "bg-amber-500/10"   },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={cn("rounded-xl p-4 border border-white/5 text-center", bg)}>
                    <div className={cn("text-2xl font-extrabold", color)}>{transportersLoading ? "…" : value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              {transportersLoading ? (
                <div className="text-center text-slate-500 py-12 text-sm">Chargement…</div>
              ) : transporters.length === 0 ? (
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-12 text-center">
                  <Truck className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Aucun transporteur inscrit</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {transporters.map((t: any) => (
                    <div key={t.id} className={cn("bg-slate-900 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-all group", !t.is_active && "opacity-50")}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-cyan-500/20">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white flex items-center gap-1.5">
                              {t.name}
                              {!t.is_active && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full font-bold">SUSPENDU</span>}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{t.country_code ? `${countryFlag(t.country_code)} ${t.country_code}` : "—"}</div>
                          </div>
                        </div>
                        {t.status === "approved" ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                            <Shield className="w-2.5 h-2.5" /> Approuve
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                            <Clock className="w-2.5 h-2.5" /> En attente
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 mb-4 space-y-1">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" />{t.email}</span>
                        {t.phone && <span className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{t.phone}</span>}
                        <span className="text-slate-600">Inscrit le {formatDate(t.created_at)}</span>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => setEmailModal({ user: t })}
                          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all" title="Envoyer un message">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleSuspend(t)}
                          className={cn("p-2 rounded-xl border transition-all", t.is_active
                            ? "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20 text-orange-400"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400"
                          )} title={t.is_active ? "Suspendre" : "Reactiver"}>
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        {t.status === "pending" && (
                          <button onClick={() => handleApproveTransporter(t)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 transition-all">
                            <CheckCircle className="w-3.5 h-3.5" /> Approuver
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ ESCROW ══ */}
          {activeTab === "escrow" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total en escrow",    value: `${Math.round(Number(stats?.escrow_total ?? 0)).toLocaleString("fr")} €`, icon: Shield,      gradient: "from-orange-500 to-amber-500"  },
                  { label: "Commandes bloquees", value: ordersLoading ? "…" : orders.filter(o => o.payment_status === "bloque").length.toString(),    icon: CreditCard,  gradient: "from-blue-500 to-indigo-500"   },
                  { label: "Deja liberees",      value: ordersLoading ? "…" : orders.filter(o => o.payment_status === "libere").length.toString(),    icon: CheckCircle, gradient: "from-emerald-500 to-teal-500"  },
                  { label: "Commandes total",    value: ordersLoading ? "…" : orders.length.toLocaleString("fr"),                                     icon: TrendingUp,  gradient: "from-violet-500 to-purple-500" },
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
                  <span className="text-[11px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
                    {ordersLoading ? "…" : `${orders.filter(o => o.payment_status === "bloque").length} en attente`}
                  </span>
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
                      {ordersLoading ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500 text-sm">Chargement…</td></tr>
                      ) : orders.filter(o => o.payment_status === "bloque").length === 0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-600 text-sm">Aucun escrow actif</td></tr>
                      ) : orders.filter(o => o.payment_status === "bloque").map((order: any) => (
                        <tr key={order.id} className="hover:bg-white/2 transition-colors group">
                          <td className="px-5 py-4"><span className="font-mono text-xs font-bold text-white">{order.order_number}</span></td>
                          <td className="px-5 py-4 text-xs text-slate-300 font-medium">{order.client_name}</td>
                          <td className="px-5 py-4"><span className="font-bold text-white">{formatPrice(order.total_amount, order.currency ?? "EUR")}</span></td>
                          <td className="px-5 py-4">
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">🔒 Bloque</span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500">{formatDate(order.created_at)}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="flex items-center gap-1 py-1.5 px-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold transition-all">
                                <CheckCircle className="w-3 h-3" /> Liberer
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
