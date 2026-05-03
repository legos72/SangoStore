"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingBag, Truck, Star, ArrowRight, Clock,
  CheckCircle, DollarSign, Eye, Plus, Calendar, Home, MapPin,
  Bell, Heart, ShoppingCart, Settings, ChevronRight,
  AlertCircle, Gift, Zap, BarChart2, Users,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_TRIPS } from "@/lib/data";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

type Tab = "client" | "vendeur" | "transporteur";

// ─── Mini-timeline ────────────────────────────────────────────────────────────

const TRACKING_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "paye",           label: "Payé" },
  { status: "en_preparation", label: "Préparé" },
  { status: "expedie",        label: "En transit" },
  { status: "arrive_bangui",  label: "Bangui" },
  { status: "pret_retrait",   label: "Prêt" },
  { status: "recupere",       label: "Reçu" },
];

const STATUS_ORDER: OrderStatus[] = [
  "en_attente", "paye", "en_preparation", "expedie", "arrive_bangui", "pret_retrait", "recupere",
];

function MiniTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-0.5 w-full">
      {TRACKING_STEPS.map(({ status: s, label }, i) => {
        const stepIdx = STATUS_ORDER.indexOf(s);
        const done = currentIdx >= stepIdx;
        const current = currentIdx === stepIdx;
        return (
          <div key={s} className="flex items-center flex-1 gap-0.5">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full border-2 transition-all",
                current ? "border-orange-500 bg-orange-500 scale-125" :
                done ? "border-green-500 bg-green-500" :
                "border-gray-200 bg-white"
              )} />
              <span className={cn(
                "text-[8px] mt-0.5 whitespace-nowrap font-medium",
                current ? "text-orange-600" : done ? "text-green-600" : "text-gray-300"
              )}>
                {label}
              </span>
            </div>
            {i < TRACKING_STEPS.length - 1 && (
              <div className={cn("flex-1 h-0.5 mb-3 -mx-0.5", done && currentIdx > stepIdx ? "bg-green-400" : "bg-gray-100")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Status alert badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const configs: Partial<Record<OrderStatus, { label: string; cls: string; dot: string }>> = {
    pret_retrait:   { label: "🔔 Prêt au retrait !", cls: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
    expedie:        { label: "✈️ En transit",       cls: "bg-blue-50 text-blue-700 border border-blue-200",   dot: "bg-blue-500" },
    arrive_bangui:  { label: "🇨🇫 Arrivé Bangui",   cls: "bg-orange-50 text-orange-700 border border-orange-200", dot: "bg-orange-500" },
    en_preparation: { label: "📦 En préparation",   cls: "bg-yellow-50 text-yellow-700 border border-yellow-200", dot: "bg-yellow-500" },
    recupere:       { label: "✅ Récupéré",          cls: "bg-gray-50 text-gray-600 border border-gray-100",   dot: "bg-gray-400" },
    paye:           { label: "💳 Paiement reçu",    cls: "bg-purple-50 text-purple-700 border border-purple-100", dot: "bg-purple-500" },
  };
  const cfg = configs[status] ?? { label: ORDER_STATUS_LABELS[status], cls: "bg-gray-50 text-gray-600 border border-gray-100", dot: "bg-gray-300" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full", cfg.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Vendor stats ─────────────────────────────────────────────────────────────

const VENDOR_STATS = [
  { icon: ShoppingBag, label: "Produits actifs", value: "12", trend: "+2 ce mois", color: "bg-blue-100 text-blue-600" },
  { icon: Package,     label: "Commandes reçues", value: "48", trend: "+8 cette semaine", color: "bg-purple-100 text-purple-600" },
  { icon: DollarSign,  label: "Revenus (escrow)", value: "2 450 €", trend: "En attente livraison", color: "bg-orange-100 text-orange-600" },
  { icon: Star,        label: "Note moyenne", value: "4.8 / 5", trend: "28 avis", color: "bg-green-100 text-green-600" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("client");

  const pendingOrders = MOCK_ORDERS.filter(o => o.status !== "recupere" && o.status !== "annule");
  const doneOrders    = MOCK_ORDERS.filter(o => o.status === "recupere");
  const urgentOrders  = MOCK_ORDERS.filter(o => o.status === "pret_retrait");

  return (
    <div className="page-container py-8 space-y-6">

      {/* ── Profile hero ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-6 text-white shadow-lg">
        {/* BG pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 70% 20%, white 1px, transparent 1px), radial-gradient(circle at 30% 80%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold border border-white/30">
              M
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Marie-Claire Ngamba</h1>
              <p className="text-orange-100 text-sm mt-0.5">Membre depuis janvier 2024 · Paris, France 🇫🇷</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/20">
                  <Star className="w-3 h-3 fill-white" /> Client Fidèle
                </span>
                {urgentOrders.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                    <Bell className="w-3 h-3" /> {urgentOrders.length} retrait à faire !
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 flex-wrap">
            <Link href="/produits" className="flex items-center gap-1.5 bg-white text-orange-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors shadow-sm">
              <ShoppingCart className="w-3.5 h-3.5" /> Parcourir
            </Link>
            <Link href="/commandes" className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/30 transition-colors border border-white/20">
              <Package className="w-3.5 h-3.5" /> Commandes
            </Link>
            <button className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-white/30 transition-colors border border-white/20">
              <Settings className="w-3.5 h-3.5" /> Profil
            </button>
          </div>
        </div>

        {/* Mini stats strip */}
        <div className="relative grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
          {[
            { label: "Commandes", value: MOCK_ORDERS.length },
            { label: "En cours", value: pendingOrders.length },
            { label: "Terminées", value: doneOrders.length },
            { label: "Favoris", value: 8 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-extrabold">{value}</div>
              <div className="text-[11px] text-orange-100">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab switcher ──────────────────────────────────────────── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["client", "vendeur", "transporteur"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all",
              activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {tab === "client" ? "🛒 Client" : tab === "vendeur" ? "🏪 Vendeur" : "🚚 Transporteur"}
          </button>
        ))}
      </div>

      {/* ── CLIENT TAB ────────────────────────────────────────────── */}
      {activeTab === "client" && (
        <div className="space-y-8">

          {/* Urgent alert */}
          {urgentOrders.length > 0 && (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl p-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-green-800 text-sm">
                  {urgentOrders.length === 1 ? "Un colis vous attend !" : `${urgentOrders.length} colis vous attendent !`}
                </div>
                <p className="text-xs text-green-600 mt-0.5">
                  {urgentOrders.map(o => `#${o.orderNumber}`).join(", ")} — prêt(s) au retrait
                </p>
              </div>
              <Link href="/commandes" className="flex items-center gap-1 text-xs font-bold text-green-700 hover:text-green-800">
                Voir <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Package,      label: "Total commandes", value: MOCK_ORDERS.length.toString(), sub: "depuis le début",       color: "bg-blue-50",   iconColor: "text-blue-500", bg: "bg-blue-100" },
              { icon: Clock,        label: "En cours",         value: pendingOrders.length.toString(), sub: "trajets en cours",    color: "bg-orange-50", iconColor: "text-orange-500", bg: "bg-orange-100" },
              { icon: CheckCircle,  label: "Récupérées",       value: doneOrders.length.toString(),    sub: "livraisons réussies", color: "bg-green-50",  iconColor: "text-green-500", bg: "bg-green-100" },
              { icon: Star,         label: "Avis laissés",     value: "3",                             sub: "sur 5 commandes",     color: "bg-purple-50", iconColor: "text-purple-500", bg: "bg-purple-100" },
            ].map(({ icon: Icon, label, value, sub, color, iconColor, bg }) => (
              <div key={label} className={cn("rounded-2xl p-4 flex flex-col gap-3", color)}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center self-start", bg)}>
                  <Icon className={cn("w-4.5 h-4.5", iconColor)} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                  <div className="text-xs font-semibold text-gray-700 mt-0.5">{label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick shortcuts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: ShoppingCart, label: "Nouveau panier", href: "/produits",    color: "text-orange-500 bg-orange-50 border-orange-100" },
              { icon: Heart,        label: "Mes favoris",    href: "/favoris",     color: "text-red-500 bg-red-50 border-red-100" },
              { icon: Gift,         label: "Parrainer",      href: "/parrainage",  color: "text-purple-500 bg-purple-50 border-purple-100" },
              { icon: Truck,        label: "Points relais",  href: "/retrait",     color: "text-blue-500 bg-blue-50 border-blue-100" },
            ].map(({ icon: Icon, label, href, color }) => (
              <Link key={label} href={href} className={cn(
                "flex items-center gap-2.5 p-3.5 rounded-xl border font-semibold text-sm hover:shadow-sm transition-all",
                color
              )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          {/* Orders list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Mes commandes récentes</h2>
              <Link href="/commandes" className="text-sm text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1">
                Toutes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {MOCK_ORDERS.map((order) => {
                const demoTrip = order.selectedTrip ??
                  MOCK_TRIPS.find(t => order.transporter && t.transporter.id === order.transporter!.id) ?? null;
                const isUrgent = order.status === "pret_retrait";

                return (
                  <div key={order.id} className={cn(
                    "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md",
                    isUrgent ? "border-green-300 ring-1 ring-green-200" : "border-gray-100"
                  )}>
                    {/* Order header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 pb-3">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base",
                          isUrgent ? "bg-green-100" : "bg-gray-50"
                        )}>
                          {order.status === "recupere" ? "✅" : order.status === "pret_retrait" ? "🔔" : order.status === "expedie" ? "✈️" : "📦"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                            <StatusBadge status={order.status} />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">{order.items.map(i => i.product.title).join(", ")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {formatPrice(order.totalAmount, order.items[0].product.currency)}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {order.paymentStatus === "bloque" ? "🔒 Escrow" : "✅ Libéré"}
                          </div>
                        </div>
                        <Link
                          href={`/commandes/${order.id}`}
                          className="flex items-center gap-1.5 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 text-gray-600 hover:text-orange-600 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" /> Suivi
                        </Link>
                      </div>
                    </div>

                    {/* Mini timeline */}
                    {order.status !== "en_attente" && order.status !== "annule" && (
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-50">
                        <MiniTimeline status={order.status} />
                      </div>
                    )}

                    {/* Logistics strip */}
                    {(demoTrip || order.transporter || order.pickupPoint) && (
                      <div className="px-4 py-2.5 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500">
                        {order.transporter && (
                          <span className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-orange-400" />
                            <span className="font-medium">{order.transporter.companyName}</span>
                          </span>
                        )}
                        {demoTrip?.arrivalDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-green-500" />
                            Arrivée <strong className="text-gray-700 ml-1">{new Date(demoTrip.arrivalDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</strong>
                          </span>
                        )}
                        {order.pickupPoint ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-blue-400" />
                            {order.pickupPoint.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Home className="w-3 h-3" /> Livraison domicile
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" /> Recommandés pour vous
              </h2>
              <Link href="/produits" className="text-sm text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1">
                Voir tout <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MOCK_PRODUCTS.slice(0, 4).map(product => (
                <Link key={product.id} href={`/produits/${product.id}`} className="group rounded-xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all bg-white">
                  <div className="aspect-square overflow-hidden bg-gray-50">
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">{product.title}</p>
                    <p className="text-xs font-bold text-orange-600 mt-1">{formatPrice(product.price, product.currency)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── VENDOR TAB ────────────────────────────────────────────── */}
      {activeTab === "vendeur" && (
        <div className="space-y-8">
          {/* Redirect card to dedicated vendor dashboard */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 p-6 text-white">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold">Espace Vendeur</h2>
                <p className="text-orange-100 text-sm mt-1">Gérez vos produits, commandes et revenus depuis votre tableau de bord dédié.</p>
                <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-orange-100">
                  <span>✅ Gestion produits</span>
                  <span>✅ Suivi commandes</span>
                  <span>✅ Escrow & revenus</span>
                  <span>✅ Analytics</span>
                </div>
              </div>
              <Link href="/dashboard/vendeur"
                className="flex-shrink-0 flex items-center gap-2 bg-white text-orange-600 font-bold px-5 py-2.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg shadow-orange-400/20 text-sm">
                <ShoppingBag className="w-4 h-4" /> Ouvrir l'espace vendeur
              </Link>
            </div>
          </div>

          {/* Quick KPI preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VENDOR_STATS.map(({ icon: Icon, label, value, trend, color }) => (
              <div key={label} className="card p-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-xl font-extrabold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                <div className="mt-1.5">
                  <span className="text-[11px] text-orange-500 font-medium">{trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue bar (simplified visual) */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-gray-400" /> Revenus — 6 derniers mois
              </h2>
              <span className="text-xs text-gray-400">en €</span>
            </div>
            <div className="flex items-end gap-2 h-24">
              {[320, 580, 440, 720, 680, 490].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-orange-400 hover:bg-orange-500 transition-colors cursor-pointer"
                    style={{ height: `${(v / 720) * 100}%` }}
                    title={`${v} €`}
                  />
                  <span className="text-[9px] text-gray-400">
                    {["Nov","Déc","Jan","Fév","Mar","Avr"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900">Mes produits</h2>
              <Link href="/dashboard/vendeur/nouveau-produit" className="btn-primary text-sm">
                <Plus className="w-4 h-4" /> Ajouter
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_PRODUCTS.slice(0, 4).map((product) => (
                <div key={product.id} className="card p-4 flex gap-3 hover:border-orange-200 hover:shadow-sm transition-all">
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{product.title}</div>
                    <div className="text-xs text-orange-600 mt-0.5">
                      {product.originCountry.flag} {product.originCountry.name}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(product.price, product.currency)}
                      </span>
                      <span className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                        product.stock <= 2 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                      )}>
                        {product.stock} en stock
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor orders */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">Commandes reçues</h2>
            <div className="space-y-4">
              {MOCK_ORDERS.map((order) => {
                const demoTrip = order.selectedTrip ??
                  MOCK_TRIPS.find(t => order.transporter && t.transporter.id === order.transporter!.id) ?? null;
                return (
                  <div key={order.id} className="card overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-gray-900">#{order.orderNumber}</span>
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-gray-400">· {formatDate(order.createdAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Client : <strong>{order.client.name}</strong>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-gray-900">
                          {formatPrice(order.totalAmount, order.items[0].product.currency)}
                        </div>
                        <div className="text-xs mt-0.5">
                          {order.paymentStatus === "bloque"
                            ? <span className="text-orange-500 font-medium">🔒 Escrow</span>
                            : <span className="text-green-600 font-medium">✅ Libéré</span>}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-b border-gray-50">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3 py-1">
                          <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-800 truncate">{item.product.title}</p>
                            <p className="text-[11px] text-gray-400">× {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0 divide-gray-50">
                      <div className="px-5 py-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Transporteur</p>
                        {order.transporter ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                            <Truck className="w-3.5 h-3.5 text-orange-400" />
                            {order.transporter.companyName}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Non assigné</span>
                        )}
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Dates voyage</p>
                        {demoTrip ? (
                          <div className="text-xs text-gray-700">
                            <span className="font-semibold">{new Date(demoTrip.departureDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                            <span className="text-gray-400 mx-1">→</span>
                            {demoTrip.arrivalDate && (
                              <span className="font-semibold text-orange-600">{new Date(demoTrip.arrivalDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                            )}
                          </div>
                        ) : <span className="text-xs text-gray-400 italic">—</span>}
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Livraison</p>
                        {order.pickupPoint ? (
                          <div className="flex items-center gap-1 text-xs text-gray-700">
                            <MapPin className="w-3 h-3 text-gray-400" /> Point retrait
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                            <Home className="w-3 h-3" /> Domicile
                          </div>
                        )}
                      </div>
                      <div className="px-5 py-3">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">Escrow</p>
                        {order.paymentStatus === "bloque" ? (
                          <button className="text-xs bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-2.5 py-1 rounded-lg transition-colors">
                            Libérer →
                          </button>
                        ) : (
                          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Libéré
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSPORTER TAB ───────────────────────────────────────── */}
      {activeTab === "transporteur" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Trajets actifs",   value: "3",  icon: Truck,      color: "bg-blue-100 text-blue-600" },
              { label: "Colis en transit", value: "12", icon: Package,    color: "bg-orange-100 text-orange-600" },
              { label: "Clients servis",   value: "34", icon: Users,      color: "bg-purple-100 text-purple-600" },
              { label: "Note moyenne",     value: "4.8",icon: Star,       color: "bg-green-100 text-green-600" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={cn("rounded-2xl p-4", color.includes("blue") ? "bg-blue-50" : color.includes("orange") ? "bg-orange-50" : color.includes("purple") ? "bg-purple-50" : "bg-green-50")}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", color)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Mes trajets</h2>
            <Link href="/transporteurs/publier" className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Nouveau trajet
            </Link>
          </div>

          {/* Trip cards from mock data */}
          <div className="space-y-3">
            {MOCK_TRIPS.slice(0, 3).map(trip => (
              <div key={trip.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{trip.transporter.companyName}</div>
                    <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      Départ {new Date(trip.departureDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      {trip.arrivalDate && (
                        <> · Arrivée <strong className="text-orange-600">{new Date(trip.arrivalDate).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</strong></>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-gray-900">{trip.availableCapacity} kg</div>
                    <div className="text-gray-400">disponible</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-orange-600">{trip.pricePerKg} {trip.currency}/kg</div>
                    <div className="text-gray-400">tarif</div>
                  </div>
                  <button className="btn-secondary text-xs px-3 py-1.5">Gérer</button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-blue-800 text-sm">Compte non vérifié</div>
              <p className="text-xs text-blue-600 mt-1">Pour publier des trajets et recevoir des colis, votre compte transporteur doit être vérifié par l'équipe SangoMarket.</p>
              <Link href="/auth/login" className="inline-flex items-center gap-1.5 mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                Vérifier mon compte <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
