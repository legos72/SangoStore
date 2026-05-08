"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package, ShoppingBag, Truck, Star, ArrowRight, Clock,
  CheckCircle, Eye, Plus, Calendar, Home, MapPin,
  Bell, Heart, ShoppingCart, Settings, ChevronRight,
  AlertCircle, Zap, BarChart2, Users, Loader2,
} from "lucide-react";
import { formatPrice, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getUser, api } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";

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
        const done    = currentIdx >= stepIdx;
        const current = currentIdx === stepIdx;
        return (
          <div key={s} className="flex items-center flex-1 gap-0.5">
            <div className="flex flex-col items-center flex-1">
              <div className={cn(
                "w-2.5 h-2.5 rounded-full border-2 transition-all",
                current ? "border-orange-500 bg-orange-500 scale-125" :
                done    ? "border-green-500 bg-green-500" :
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

function StatusBadge({ status }: { status: OrderStatus }) {
  const configs: Partial<Record<OrderStatus, { label: string; cls: string; dot: string }>> = {
    pret_retrait:   { label: "🔔 Prêt au retrait !",  cls: "bg-green-50 text-green-700 border border-green-200",   dot: "bg-green-500" },
    expedie:        { label: "✈️ En transit",          cls: "bg-blue-50 text-blue-700 border border-blue-200",     dot: "bg-blue-500" },
    arrive_bangui:  { label: "🇨🇫 Arrivé Bangui",     cls: "bg-orange-50 text-orange-700 border border-orange-200", dot: "bg-orange-500" },
    en_preparation: { label: "📦 En préparation",      cls: "bg-yellow-50 text-yellow-700 border border-yellow-200", dot: "bg-yellow-500" },
    recupere:       { label: "✅ Récupéré",             cls: "bg-gray-50 text-gray-600 border border-gray-100",      dot: "bg-gray-400" },
    paye:           { label: "💳 Paiement reçu",       cls: "bg-purple-50 text-purple-700 border border-purple-100", dot: "bg-purple-500" },
    en_attente:     { label: "⏳ En attente",           cls: "bg-gray-50 text-gray-500 border border-gray-100",      dot: "bg-gray-300" },
  };
  const cfg = configs[status] ?? { label: ORDER_STATUS_LABELS[status], cls: "bg-gray-50 text-gray-600 border border-gray-100", dot: "bg-gray-300" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full", cfg.cls)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<ReturnType<typeof getUser>>(null);
  const [orders, setOrders]           = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [colis, setColis]             = useState<any[]>([]);
  const [loadingColis, setLoadingColis]   = useState(false);
  const [clientTab, setClientTab]     = useState<"commandes" | "colis">("commandes");

  useEffect(() => {
    const user = getUser();
    if (!user) { router.push("/auth/login"); return; }
    setCurrentUser(user);

    // Admin → dashboard admin
    if (user.role === "admin") { router.push("/dashboard/admin"); return; }
    // Vendeur → dashboard vendeur
    if (user.role === "vendeur") { router.push("/dashboard/vendeur"); return; }
    // Transporteur → dashboard transporteur
    if (user.role === "transporteur") { router.push("/dashboard/transporteur"); return; }

    // Charger les commandes marketplace
    api.orders.list()
      .then((res: any) => setOrders(res.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));

    // Charger les colis transport
    setLoadingColis(true);
    api.transport.myBookings()
      .then((res: any) => setColis(res.data ?? []))
      .catch(() => setColis([]))
      .finally(() => setLoadingColis(false));
  }, [router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  const initials    = currentUser.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const pendingOrders = orders.filter(o => o.status !== "recupere" && o.status !== "annule");
  const doneOrders    = orders.filter(o => o.status === "recupere");
  const urgentOrders  = orders.filter(o => o.status === "pret_retrait");

  // ── CLIENT ───────────────────────────────────────────────────────────────────
  return (
    <div className="page-container py-8 space-y-6">

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-500 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 70% 20%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-extrabold border border-white/30">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{currentUser.name}</h1>
              <p className="text-orange-100 text-sm mt-0.5">Espace client · SangoStore</p>
              {urgentOrders.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                    <Bell className="w-3 h-3" /> {urgentOrders.length} retrait à faire !
                  </span>
                </div>
              )}
            </div>
          </div>

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

        <div className="relative grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
          {[
            { label: "Commandes", value: orders.length },
            { label: "En cours",  value: pendingOrders.length },
            { label: "Terminées", value: doneOrders.length },
            { label: "Favoris",   value: 0 },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-extrabold">{value}</div>
              <div className="text-[11px] text-orange-100">{label}</div>
            </div>
          ))}
        </div>
      </div>

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
              {urgentOrders.map((o: any) => `#${o.order_number}`).join(", ")} — prêt(s) au retrait
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
          { icon: Package,     label: "Total commandes", value: orders.length.toString(),         sub: "depuis le début",        color: "bg-blue-50",   ic: "text-blue-500",   bg: "bg-blue-100" },
          { icon: Clock,       label: "En cours",         value: pendingOrders.length.toString(),  sub: "trajets en cours",       color: "bg-orange-50", ic: "text-orange-500", bg: "bg-orange-100" },
          { icon: CheckCircle, label: "Récupérées",       value: doneOrders.length.toString(),     sub: "livraisons réussies",    color: "bg-green-50",  ic: "text-green-500",  bg: "bg-green-100" },
          { icon: Heart,       label: "Favoris",           value: "0",                              sub: "produits sauvegardés",   color: "bg-purple-50", ic: "text-purple-500", bg: "bg-purple-100" },
        ].map(({ icon: Icon, label, value, sub, color, ic, bg }) => (
          <div key={label} className={cn("rounded-2xl p-4 flex flex-col gap-3", color)}>
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center self-start", bg)}>
              <Icon className={cn("w-4 h-4", ic)} />
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
          { icon: ShoppingCart, label: "Nouveau panier", href: "/produits",   color: "text-orange-500 bg-orange-50 border-orange-100" },
          { icon: Heart,        label: "Mes favoris",    href: "/favoris",    color: "text-red-500 bg-red-50 border-red-100" },
          { icon: Truck,        label: "Points relais",  href: "/retrait",    color: "text-blue-500 bg-blue-50 border-blue-100" },
          { icon: Settings,     label: "Mon profil",     href: "/profil",     color: "text-gray-500 bg-gray-50 border-gray-100" },
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

      {/* Tabs: Commandes / Colis transport */}
      <div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit mb-4">
          {([
            { key: "commandes", label: "🛍️ Mes commandes" },
            { key: "colis",     label: "✈️ Mes colis transport" },
          ] as { key: typeof clientTab; label: string }[]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setClientTab(key)}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all",
                clientTab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Commandes marketplace */}
        {clientTab === "commandes" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Mes commandes récentes</h2>
              <Link href="/commandes" className="text-sm text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1">
                Toutes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center gap-3 text-center">
                <ShoppingBag className="w-10 h-10 text-gray-200" />
                <p className="font-semibold text-gray-400 text-sm">Aucune commande pour l'instant</p>
                <Link href="/produits" className="btn-primary text-sm mt-1">
                  Découvrir les produits
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order: any) => {
                  const isUrgent = order.status === "pret_retrait";
                  return (
                    <div key={order.id} className={cn(
                      "bg-white rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md",
                      isUrgent ? "border-green-300 ring-1 ring-green-200" : "border-gray-100"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 pb-3">
                        <div className="flex items-start gap-3">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-base", isUrgent ? "bg-green-100" : "bg-gray-50")}>
                            {order.status === "recupere" ? "✅" : order.status === "pret_retrait" ? "🔔" : order.status === "expedie" ? "✈️" : "📦"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-gray-900">#{order.order_number}</span>
                              <StatusBadge status={order.status} />
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="font-bold text-gray-900">
                              {formatPrice(order.total_amount, order.currency)}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">
                              {order.payment_status === "bloque" ? "🔒 Escrow" : "✅ Libéré"}
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

                      {order.status !== "en_attente" && order.status !== "annule" && (
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <MiniTimeline status={order.status} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Colis transport */}
        {clientTab === "colis" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Mes colis transport</h2>
              <Link href="/transporteurs" className="text-sm text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1">
                Envoyer un colis <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingColis ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
              </div>
            ) : colis.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 py-14 flex flex-col items-center gap-3 text-center">
                <Truck className="w-10 h-10 text-gray-200" />
                <p className="font-semibold text-gray-400 text-sm">Aucun colis transport</p>
                <p className="text-xs text-gray-400">Envoyez vos colis via nos transporteurs GP</p>
                <Link href="/transporteurs" className="btn-primary text-sm mt-1">
                  Voir les transporteurs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {colis.map((b: any) => {
                  const statusCfg: Record<string, { label: string; cls: string }> = {
                    pending:    { label: "En attente",  cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
                    accepted:   { label: "Accepté",    cls: "bg-blue-50 text-blue-700 border border-blue-200" },
                    in_transit: { label: "En transit", cls: "bg-orange-50 text-orange-700 border border-orange-200" },
                    delivered:  { label: "Livré",      cls: "bg-green-50 text-green-700 border border-green-200" },
                    refused:    { label: "Refusé",     cls: "bg-red-50 text-red-700 border border-red-200" },
                  };
                  const cfg = statusCfg[b.status] ?? { label: b.status, cls: "bg-gray-50 text-gray-600 border border-gray-100" };
                  return (
                    <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", cfg.cls)}>
                              {cfg.label}
                            </span>
                            {b.tracking_number && (
                              <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                {b.tracking_number}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span>{b.origin_country} → 🇨🇫 {b.destination_city}</span>
                            <span>·</span>
                            <span>{b.weight_kg} kg</span>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-1">{b.package_description}</p>
                          {b.transporter_company && (
                            <p className="text-xs text-gray-400 mt-1">Transporteur : {b.transporter_company}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">
                              {parseFloat(b.total_price).toLocaleString("fr-FR")} {b.currency}
                            </div>
                          </div>
                          {b.tracking_number && (
                            <Link
                              href={`/suivi/${b.tracking_number}`}
                              className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-orange-100 transition-colors whitespace-nowrap"
                            >
                              <Eye className="w-3.5 h-3.5" /> Suivre
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Produits recommandés */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" /> Découvrir des produits
          </h2>
          <Link href="/produits" className="text-sm text-orange-500 hover:text-orange-700 font-semibold flex items-center gap-1">
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <Link href="/produits"
          className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-colors p-8 text-orange-500 font-semibold text-sm"
        >
          <ShoppingCart className="w-5 h-5" />
          Parcourir le catalogue
        </Link>
      </div>
    </div>
  );
}
