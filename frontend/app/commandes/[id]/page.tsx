import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Clock, Package, Truck, MapPin, Phone } from "lucide-react";
import { MOCK_ORDERS } from "@/lib/data";
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

interface Params { params: { id: string } }

const TRACKING_STEPS: { status: OrderStatus; icon: string; label: string; desc: string }[] = [
  { status: "paye",          icon: "💳", label: "Commande payée",       desc: "Paiement reçu et bloqué en escrow" },
  { status: "en_preparation",icon: "📦", label: "En préparation",       desc: "Le vendeur prépare votre colis" },
  { status: "expedie",       icon: "✈️", label: "En transit vers Bangui", desc: "Colis en route via transporteur GP" },
  { status: "arrive_bangui", icon: "🇨🇫", label: "Arrivé à Bangui",     desc: "Colis au point de retrait" },
  { status: "pret_retrait",  icon: "🔔", label: "Prêt au retrait",      desc: "Venez récupérer votre colis !" },
  { status: "recupere",      icon: "✅", label: "Récupéré",             desc: "Livraison terminée – Escrow libéré" },
];

const STATUS_ORDER: OrderStatus[] = [
  "en_attente", "paye", "en_preparation", "expedie", "arrive_bangui", "pret_retrait", "recupere",
];

function getStatusIndex(status: OrderStatus) {
  return STATUS_ORDER.indexOf(status);
}

export async function generateStaticParams() {
  return MOCK_ORDERS.map((o) => ({ id: o.id }));
}

export default function CommandeDetailPage({ params }: Params) {
  const order = MOCK_ORDERS.find((o) => o.id === params.id);
  if (!order) notFound();

  const currentIndex = getStatusIndex(order.status);

  return (
    <div className="page-container py-8">
      <Link href="/dashboard" className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Mes commandes
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Commande #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-0.5">Passée le {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge py-1.5 px-3 ${
            order.status === "recupere" ? "bg-green-100 text-green-700" :
            order.status === "annule" ? "bg-red-100 text-red-700" :
            "bg-orange-100 text-orange-700"
          }`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tracking timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-6">Suivi de votre commande</h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />

              <div className="space-y-6">
                {TRACKING_STEPS.map(({ status, icon, label, desc }, index) => {
                  const stepIndex = getStatusIndex(status);
                  const isDone = currentIndex >= stepIndex;
                  const isCurrent = currentIndex === stepIndex;

                  return (
                    <div key={status} className="flex items-start gap-4 relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-base z-10 flex-shrink-0 transition-all ${
                          isDone
                            ? isCurrent
                              ? "bg-orange-500 ring-4 ring-orange-100"
                              : "bg-green-500"
                            : "bg-gray-100"
                        }`}
                      >
                        {isDone && !isCurrent ? (
                          <CheckCircle className="w-4 h-4 text-white" />
                        ) : (
                          <span className={isCurrent ? "text-white" : "grayscale"}>{icon}</span>
                        )}
                      </div>
                      <div className={`pb-1 ${isDone ? "" : "opacity-40"}`}>
                        <div className={`font-semibold text-sm ${isCurrent ? "text-orange-600" : "text-gray-900"}`}>
                          {label}
                          {isCurrent && (
                            <span className="ml-2 badge-orange text-[10px]">En cours</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Transporter info */}
          {order.transporter && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-4 h-4 text-gray-400" />
                Transporteur assigné
              </h2>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-gray-900">{order.transporter.companyName}</div>
                  {order.trackingNumber && (
                    <div className="text-sm text-gray-500 mt-0.5">
                      N° de suivi : <span className="font-mono font-semibold text-gray-700">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>
                <a
                  href={`tel:${order.transporter.contact.phone}`}
                  className="btn-secondary text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Contacter
                </a>
              </div>
            </div>
          )}

          {/* Pickup point */}
          {order.pickupPoint && (
            <div className="card p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                Point de retrait
              </h2>
              <div className="font-semibold text-gray-900">{order.pickupPoint.name}</div>
              <div className="text-sm text-gray-500 mt-1">{order.pickupPoint.address}</div>
              <div className="text-sm text-gray-500">{order.pickupPoint.city}</div>
              <div className="text-xs text-gray-400 mt-1">{order.pickupPoint.openingHours}</div>
              <a href={`tel:${order.pickupPoint.phone}`} className="btn-secondary text-sm mt-3">
                <Phone className="w-4 h-4" />
                {order.pickupPoint.phone}
              </a>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Résumé de commande</h2>
            <div className="space-y-3 mb-4">
              {order.items.map(({ product, quantity, unitPrice }) => (
                <div key={product.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{product.title}</div>
                    <div className="text-[11px] text-orange-500 mt-0.5">
                      📦 {product.originCountry.flag} {product.originCountry.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {quantity} × {formatPrice(unitPrice, product.currency)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, order.items[0].product.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Paiement</span>
                <span className="capitalize">
                  {order.paymentMethod === "orange_money" ? "🟠 Orange Money" : "💵 Cash"}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Escrow</span>
                <span className={order.escrowReleased ? "text-green-600 font-medium" : "text-orange-500 font-medium"}>
                  {order.escrowReleased ? "✅ Libéré" : "🔒 Bloqué"}
                </span>
              </div>
            </div>
          </div>

          {/* Escrow explanation */}
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-700">
            <div className="font-semibold mb-1">🔒 Escrow actif</div>
            <p className="text-xs leading-relaxed">
              Votre paiement est sécurisé. Il sera libéré au vendeur uniquement après
              votre confirmation de retrait au point de collecte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
