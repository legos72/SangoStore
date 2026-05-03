"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Smartphone, Banknote, ArrowRight, Loader2, CheckCircle, Lock } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_PICKUP_POINTS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const DEMO_PRODUCT = MOCK_PRODUCTS[0];

type PaymentMethod = "orange_money" | "cash";

export default function PaiementPage() {
  const [method, setMethod] = useState<PaymentMethod>("orange_money");
  const [phone, setPhone] = useState("");
  const [pickupPoint, setPickupPoint] = useState(MOCK_PICKUP_POINTS[0].id);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = DEMO_PRODUCT.price;
  const fee = method === "orange_money" ? Math.round(total * 0.02) : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="page-container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">
            Commande confirmée ! 🎉
          </h1>
          <p className="text-gray-500 mb-2">
            Votre paiement a été reçu et est bloqué en <strong>escrow</strong>.
          </p>
          <p className="text-gray-500 mb-8 text-sm">
            Il sera libéré au vendeur uniquement après que vous ayez récupéré votre colis à Bangui.
          </p>
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-left mb-8 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Numéro de commande</span>
              <span className="font-bold text-gray-900">DM-2024-00{Math.floor(Math.random() * 900) + 100}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span className="badge-orange">Payé – En attente d'expédition</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Point de retrait</span>
              <span className="font-medium text-gray-900 text-right max-w-[200px]">
                {MOCK_PICKUP_POINTS.find(p => p.id === pickupPoint)?.name}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard" className="btn-primary w-full justify-center">
              Voir mes commandes
            </Link>
            <Link href="/produits" className="btn-secondary w-full justify-center">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Finaliser votre commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment method */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Mode de paiement</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  value: "orange_money" as PaymentMethod,
                  icon: "🟠",
                  label: "Orange Money",
                  desc: "Paiement mobile instantané",
                  fee: "2% de frais",
                },
                {
                  value: "cash" as PaymentMethod,
                  icon: "💵",
                  label: "Cash",
                  desc: "Paiement en espèces au point de retrait",
                  fee: "Aucun frais",
                },
              ].map(({ value, icon, label, desc, fee: f }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMethod(value)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    method === value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <div>
                    <div className={`font-semibold text-sm ${method === value ? "text-orange-700" : "text-gray-900"}`}>
                      {label}
                    </div>
                    <div className="text-xs text-gray-500">{desc}</div>
                    <div className={`text-xs mt-0.5 ${method === value ? "text-orange-600" : "text-gray-400"}`}>
                      {f}
                    </div>
                  </div>
                  {method === value && <CheckCircle className="w-5 h-5 text-orange-500 ml-auto" />}
                </button>
              ))}
            </div>

            {method === "orange_money" && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro Orange Money *
                </label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 bg-orange-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-500 font-medium">
                    🇨🇫 +236
                  </span>
                  <input
                    type="tel"
                    required={method === "orange_money"}
                    placeholder="72 12 34 56"
                    className="input rounded-l-none flex-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  Un code de confirmation vous sera envoyé par SMS
                </p>
              </div>
            )}
          </div>

          {/* Pickup point */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Point de retrait à Bangui</h2>
            <div className="space-y-3">
              {MOCK_PICKUP_POINTS.map((point) => (
                <button
                  key={point.id}
                  type="button"
                  onClick={() => setPickupPoint(point.id)}
                  className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    pickupPoint === point.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-2xl mt-0.5">📍</span>
                  <div className="flex-1">
                    <div className={`font-semibold text-sm ${pickupPoint === point.id ? "text-orange-700" : "text-gray-900"}`}>
                      {point.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{point.address}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{point.openingHours}</div>
                  </div>
                  {pickupPoint === point.id && <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Escrow info */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
            <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <strong>Protection Escrow :</strong> Votre paiement est bloqué sur un compte sécurisé.
              Il sera libéré au vendeur uniquement après confirmation de votre retrait à Bangui.
              En cas de problème, vous êtes remboursé intégralement.
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Récapitulatif</h2>

            {/* Product */}
            <div className="flex gap-3 mb-5 pb-5 border-b border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                <img
                  src={DEMO_PRODUCT.images[0]}
                  alt={DEMO_PRODUCT.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 line-clamp-2">{DEMO_PRODUCT.title}</div>
                <div className="text-xs text-orange-600 font-semibold mt-1">
                  📦 {DEMO_PRODUCT.originCountry.flag} {DEMO_PRODUCT.originCountry.name}
                </div>
                <div className="text-sm font-bold text-gray-900 mt-1">
                  {formatPrice(DEMO_PRODUCT.price, DEMO_PRODUCT.currency)}
                </div>
              </div>
            </div>

            {/* Amounts */}
            <div className="space-y-2 text-sm mb-5">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{formatPrice(total, DEMO_PRODUCT.currency)}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Frais Orange Money (2%)</span>
                  <span>{formatPrice(fee, DEMO_PRODUCT.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100 text-base">
                <span>Total</span>
                <span>{formatPrice(total + fee, DEMO_PRODUCT.currency)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Payer {formatPrice(total + fee, DEMO_PRODUCT.currency)}
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              🔒 Paiement sécurisé — vos données sont protégées
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
