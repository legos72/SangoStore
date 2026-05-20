"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Loader as Loader2, CircleCheck as CheckCircle, Lock, Smartphone, Banknote, MapPin, Package, ChevronRight } from "lucide-react";
import { MOCK_PRODUCTS, MOCK_PICKUP_POINTS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { getImageUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

const DEMO_PRODUCT = MOCK_PRODUCTS[0];

type PaymentMethod = "orange_money" | "cash";

const FOREST = "#1B3A2D";
const GOLD   = "#C8850A";

export default function PaiementPage() {
  const [method, setMethod] = useState<PaymentMethod>("orange_money");
  const [phone, setPhone]   = useState("");
  const [pickupPoint, setPickupPoint] = useState(MOCK_PICKUP_POINTS[0].id);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const total = DEMO_PRODUCT.price;
  const fee   = method === "orange_money" ? Math.round(total * 0.02) : 0;
  const imgSrc = DEMO_PRODUCT.images[0] ? getImageUrl(DEMO_PRODUCT.images[0]) : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setSuccess(true);
  }

  if (success) {
    const orderNum = `SM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const pickup = MOCK_PICKUP_POINTS.find(p => p.id === pickupPoint);

    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: "#F5F2EC" }}>
        <div className="max-w-md w-full text-center">

          {/* Success icon */}
          <div className="relative inline-flex mb-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)", boxShadow: "0 8px 32px rgba(27,58,45,.30)" }}
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #C8850A, #E0A320)", boxShadow: "0 4px 12px rgba(200,133,10,.35)" }}
            >
              <Shield className="w-4 h-4 text-white" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Commande confirmée !
          </h1>
          <p className="text-gray-500 text-sm mb-1">
            Votre paiement a été reçu et est bloqué en <strong>escrow sécurisé</strong>.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Il sera libéré au vendeur après confirmation de votre retrait à Bangui.
          </p>

          {/* Order details */}
          <div
            className="rounded-2xl p-5 text-left mb-6 space-y-3"
            style={{ background: "#FDFCF9", border: "1px solid #E5DDD0", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Numéro de commande</span>
              <span className="font-bold text-gray-900 font-mono">{orderNum}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Statut</span>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)" }}
              >
                Payé · En attente d'expédition
              </span>
            </div>
            {pickup && (
              <div className="flex items-start justify-between text-sm gap-3">
                <span className="text-gray-500 flex-shrink-0">Point de retrait</span>
                <span className="font-medium text-gray-900 text-right">{pickup.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #C8850A, #E0A320)", boxShadow: "0 4px 18px rgba(200,133,10,.35)" }}
            >
              Voir mes commandes <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/produits"
              className="w-full inline-flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm text-gray-700 transition-colors hover:text-[#1B3A2D]"
              style={{ border: "1px solid #E5DDD0", background: "white" }}
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{ background: "#F5F2EC" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page title */}
        <div className="mb-6">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
            <Link href="/" className="hover:text-[#1B3A2D] transition-colors">Accueil</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/panier" className="hover:text-[#1B3A2D] transition-colors">Panier</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-700 font-medium">Paiement</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Finaliser votre commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT: Form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Payment method */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ background: "#FDFCF9", border: "1px solid #E5DDD0", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}
            >
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #C8850A, #E0A320)" }}
                >
                  <Smartphone className="w-3.5 h-3.5 text-white" />
                </div>
                Mode de paiement
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "orange_money" as PaymentMethod,
                    Icon: Smartphone,
                    label: "Orange Money",
                    desc: "Paiement mobile instantané",
                    fee: "2% de frais",
                    color: "#EA580C",
                  },
                  {
                    value: "cash" as PaymentMethod,
                    Icon: Banknote,
                    label: "Cash",
                    desc: "Paiement en espèces au retrait",
                    fee: "Aucun frais",
                    color: FOREST,
                  },
                ].map(({ value, Icon, label, desc, fee: f, color }) => {
                  const active = method === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMethod(value)}
                      className="flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all"
                      style={active
                        ? { borderColor: GOLD, background: "rgba(200,133,10,.05)", boxShadow: "0 2px 12px rgba(200,133,10,.15)" }
                        : { borderColor: "#E5DDD0", background: "white" }
                      }
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? "linear-gradient(135deg, #C8850A, #E0A320)" : "#F5F2EC" }}
                      >
                        <Icon className="w-4 h-4" style={{ color: active ? "white" : color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-900">{label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                        <div
                          className="text-xs mt-1 font-semibold"
                          style={{ color: active ? GOLD : "#9CA3AF" }}
                        >
                          {f}
                        </div>
                      </div>
                      {active && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {method === "orange_money" && (
                <div className="mt-4 animate-fade-in">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Numéro Orange Money *
                  </label>
                  <div className="flex gap-0">
                    <span
                      className="flex items-center px-3 border rounded-l-xl text-sm text-gray-600 font-medium flex-shrink-0"
                      style={{ background: "#F5F2EC", borderColor: "#E5DDD0", borderRight: "none" }}
                    >
                      🇨🇫 +236
                    </span>
                    <input
                      type="tel"
                      required={method === "orange_money"}
                      placeholder="72 12 34 56"
                      className="flex-1 px-3 py-2.5 border rounded-r-xl text-sm focus:outline-none focus:border-[#C8850A] focus:ring-2 focus:ring-amber-100 transition-all"
                      style={{ borderColor: "#E5DDD0", background: "white" }}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Un code de confirmation vous sera envoyé par SMS
                  </p>
                </div>
              )}
            </div>

            {/* Pickup point */}
            <div
              className="rounded-2xl p-5 sm:p-6"
              style={{ background: "#FDFCF9", border: "1px solid #E5DDD0", boxShadow: "0 2px 12px rgba(0,0,0,.05)" }}
            >
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)" }}
                >
                  <MapPin className="w-3.5 h-3.5 text-white" />
                </div>
                Point de retrait à Bangui
              </h2>

              <div className="space-y-3">
                {MOCK_PICKUP_POINTS.map(point => {
                  const active = pickupPoint === point.id;
                  return (
                    <button
                      key={point.id}
                      type="button"
                      onClick={() => setPickupPoint(point.id)}
                      className="w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all"
                      style={active
                        ? { borderColor: FOREST, background: "rgba(27,58,45,.04)", boxShadow: "0 2px 12px rgba(27,58,45,.12)" }
                        : { borderColor: "#E5DDD0", background: "white" }
                      }
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: active ? "linear-gradient(135deg, #1B3A2D, #2d5e48)" : "#F5F2EC" }}
                      >
                        <MapPin className="w-4 h-4" style={{ color: active ? "white" : "#9CA3AF" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-gray-900">{point.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{point.address}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{point.openingHours}</div>
                      </div>
                      {active && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: FOREST }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Escrow info */}
            <div
              className="rounded-2xl p-4 flex gap-3"
              style={{ background: "#F0F7F3", border: "1px solid #C8E0D2" }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)" }}
              >
                <Lock className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm" style={{ color: FOREST }}>
                <strong>Protection Escrow :</strong> Votre paiement est bloqué sur un compte sécurisé.
                Il sera libéré au vendeur uniquement après confirmation de votre retrait à Bangui.
                En cas de problème, vous êtes remboursé intégralement.
              </div>
            </div>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-5 sticky top-24"
              style={{ background: "#FDFCF9", border: "1px solid #E5DDD0", boxShadow: "0 4px 24px rgba(0,0,0,.07)" }}
            >
              {/* Summary header */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 -mx-0.5"
                style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)" }}
              >
                <Package className="w-4 h-4 text-white opacity-80" />
                <h2 className="font-bold text-white text-sm">Récapitulatif</h2>
              </div>

              {/* Product */}
              <div className="flex gap-3 mb-5 pb-5" style={{ borderBottom: "1px solid #EEE8DF" }}>
                <div
                  className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                  style={{ background: "#EDE7DC" }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={DEMO_PRODUCT.title}
                      className="w-full h-full object-cover"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {DEMO_PRODUCT.title}
                  </div>
                  <div className="text-xs font-semibold mt-1" style={{ color: GOLD }}>
                    {DEMO_PRODUCT.originCountry.flag} {DEMO_PRODUCT.originCountry.name}
                  </div>
                  <div className="text-sm font-extrabold text-gray-900 mt-1">
                    {formatPrice(DEMO_PRODUCT.price, DEMO_PRODUCT.currency)}
                  </div>
                </div>
              </div>

              {/* Amounts */}
              <div className="space-y-2 text-sm mb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span className="font-semibold">{formatPrice(total, DEMO_PRODUCT.currency)}</span>
                </div>
                {fee > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Frais Orange Money (2%)</span>
                    <span className="font-semibold">{formatPrice(fee, DEMO_PRODUCT.currency)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between font-extrabold text-gray-900 pt-3 text-base"
                  style={{ borderTop: "1px solid #EEE8DF" }}
                >
                  <span>Total</span>
                  <span style={{ color: GOLD }}>{formatPrice(total + fee, DEMO_PRODUCT.currency)}</span>
                </div>
              </div>

              {/* CTA */}
              <form onSubmit={handleSubmit}>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl text-sm text-white transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #C8850A, #E0A320)",
                    boxShadow: "0 4px 18px rgba(200,133,10,.35)",
                  }}
                >
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

              <p className="text-[11px] text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Paiement chiffré et sécurisé
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
