"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package,
  ArrowLeft, Tag, Truck, Shield, Clock, ChevronRight, Lock,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState } from "react";
import { getImageUrl } from "@/lib/api";

function useTotals(items: ReturnType<typeof useCart>["items"]) {
  const totals: Record<string, number> = {};
  for (const item of items) {
    const cur = item.product.currency;
    totals[cur] = (totals[cur] ?? 0) + item.product.price * item.quantity;
  }
  return totals;
}

const STEPS = [
  { label: "Panier",       active: true  },
  { label: "Livraison",    active: false },
  { label: "Paiement",     active: false },
  { label: "Confirmation", active: false },
];

function StepBar() {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all"
              style={step.active ? {
                background: "linear-gradient(135deg, #D4961E, #B87814)",
                color: "#fff",
                boxShadow: "0 2px 10px rgba(200,133,10,.35)",
              } : {
                background: "#F0EBE3",
                color: "#A09080",
              }}
            >
              {i + 1}
            </div>
            <span
              className="text-sm font-semibold hidden sm:block"
              style={{ color: step.active ? "#C8850A" : "#A09080" }}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <ChevronRight className="w-4 h-4 text-gray-300 mx-2 sm:mx-3" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems } = useCart();
  const { format, convert } = useCurrency();
  const totals = useTotals(items);

  const grandTotalXAF = items.reduce(
    (sum, item) => sum + convert(item.product.price * item.quantity, item.product.currency),
    0
  );
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [promoCode, setPromoCode] = useState("");

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ background: "#F5F2EC" }}>
        <div className="bg-white border-b border-[#EEE8DF] shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <StepBar />
          </div>
        </div>
        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-sm">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "linear-gradient(135deg, rgba(200,133,10,.08), rgba(200,133,10,.16))", border: "2px solid rgba(200,133,10,.20)" }}
            >
              <ShoppingBag className="w-12 h-12 text-amber-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Votre panier est vide</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Ajoutez des produits depuis le catalogue pour commencer votre commande vers Bangui.
            </p>
            <Link
              href="/produits"
              className="btn-forest inline-flex text-sm"
            >
              <Package className="w-4 h-4" />
              Découvrir les produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F5F2EC" }}>

      {/* Step bar */}
      <div className="bg-white border-b border-[#EEE8DF] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <StepBar />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Mon panier</h1>
            <span
              className="text-white text-xs font-extrabold px-2.5 py-1 rounded-full leading-none"
              style={{ background: "linear-gradient(135deg, #D4961E, #B87814)", boxShadow: "0 2px 8px rgba(200,133,10,.30)" }}
            >
              {totalItems} article{totalItems > 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href="/produits"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A2D] transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuer mes achats
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start">

          {/* ── Articles ── */}
          <div className="lg:col-span-3 space-y-3">

            {/* Header colonnes */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-4 pb-1">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Produit</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-24 text-center">Quantité</span>
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-28 text-right">Prix total</span>
            </div>

            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-[#EDE6DA] overflow-hidden hover:border-amber-200/80 transition-all"
                style={{ boxShadow: "0 1px 4px rgba(15,10,3,.05)" }}
              >
                <div className="p-4 sm:p-5 flex gap-4">

                  {/* Image */}
                  <Link
                    href={`/produits/${item.product.id}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0"
                    style={{ background: "#F5F0E8" }}
                  >
                    {imgErrors[item.product.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    ) : (
                      <Image
                        src={getImageUrl(item.product.images[0])}
                        alt={item.product.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        sizes="96px"
                        onError={() => setImgErrors(prev => ({ ...prev, [item.product.id]: true }))}
                      />
                    )}
                  </Link>

                  {/* Infos */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mb-1.5"
                          style={{ background: "rgba(200,133,10,.08)", color: "#A06808" }}
                        >
                          📦 {item.product.originCountry.flag} {item.product.originCountry.name}
                        </span>
                        <Link
                          href={`/produits/${item.product.id}`}
                          className="block text-sm font-bold text-gray-900 hover:text-[#1B3A2D] transition-colors line-clamp-2 leading-snug"
                        >
                          {item.product.title}
                        </Link>
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-[#F0EBE3] text-gray-600 px-2 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                            {item.selectedColor}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="flex-shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        aria-label="Supprimer cet article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Qty + Prix */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 bg-[#F5F0E8] rounded-xl p-1 border border-[#EDE6DA]">
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-lg bg-white border border-[#EDE6DA] flex items-center justify-center hover:border-[#1B3A2D] hover:bg-[#EEF5F1] hover:text-[#1B3A2D] transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-extrabold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 rounded-lg bg-white border border-[#EDE6DA] flex items-center justify-center hover:border-[#1B3A2D] hover:bg-[#EEF5F1] hover:text-[#1B3A2D] transition-colors disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-gray-900">
                          {format(item.product.price * item.quantity, item.product.currency)}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[11px] text-gray-400">
                            {format(item.product.price, item.product.currency)} × {item.quantity}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stock warning */}
                {item.product.stock <= 3 && (
                  <div
                    className="px-4 sm:px-5 py-2 flex items-center gap-1.5 border-t border-amber-100"
                    style={{ background: "rgba(251,191,36,.06)" }}
                  >
                    <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span className="text-[11px] text-amber-700 font-medium">
                      Plus que {item.product.stock} en stock — commandez vite !
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href="/produits"
                className="sm:hidden flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A2D] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
              <button
                onClick={clearCart}
                className="ml-auto text-xs text-gray-400 hover:text-red-500 font-medium transition-colors"
              >
                Vider le panier
              </button>
            </div>

            {/* Trust cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              {[
                { icon: Shield, label: "Paiement sécurisé", sub: "Escrow garanti",    color: "#1B3A2D" },
                { icon: Truck,  label: "Livraison GP",       sub: "Vers Bangui",       color: "#2563EB" },
                { icon: Clock,  label: "Délai 7–21 jours",   sub: "Selon l'origine",   color: "#C8850A" },
              ].map(({ icon: Icon, label, sub, color }) => (
                <div
                  key={label}
                  className="bg-white rounded-xl border border-[#EDE6DA] p-3 flex flex-col items-center text-center gap-1.5"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}12` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">{label}</span>
                  <span className="text-[10px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Récapitulatif ── */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-2xl border border-[#EDE6DA] overflow-hidden sticky top-24"
              style={{ boxShadow: "0 2px 16px rgba(15,10,3,.07)" }}
            >
              {/* Header */}
              <div
                className="px-5 py-4"
                style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #0D2318 100%)" }}
              >
                <h2 className="text-white font-extrabold text-base">Récapitulatif</h2>
                <p className="text-emerald-300/70 text-xs mt-0.5">
                  {items.length} produit{items.length > 1 ? "s" : ""} · livraison vers Bangui 🇨🇫
                </p>
              </div>

              <div className="p-5 space-y-4">

                {/* Mini-liste */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-[#F0EBE3]">
                        {imgErrors[item.product.id] ? (
                          <span className="absolute inset-0 flex items-center justify-center text-sm">📦</span>
                        ) : (
                          <Image
                            src={getImageUrl(item.product.images[0])}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        )}
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 text-white rounded-full text-[9px] font-bold flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #D4961E, #B87814)" }}
                        >
                          {item.quantity}
                        </span>
                      </div>
                      <span className="flex-1 text-xs text-gray-700 line-clamp-1">{item.product.title}</span>
                      <span className="text-xs font-bold text-gray-900 flex-shrink-0">
                        {format(item.product.price * item.quantity, item.product.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-dashed border-[#EDE6DA]" />

                {/* Sous-totaux */}
                <div className="space-y-1.5">
                  {Object.entries(totals).map(([currency, amount]) => (
                    <div key={currency} className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Sous-total {currency}</span>
                      <span className="text-sm font-bold text-gray-900">
                        {format(amount, currency as "XAF" | "EUR" | "USD")}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Livraison GP</span>
                    <span className="text-sm font-semibold" style={{ color: "#C8850A" }}>Calculée au checkout</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Escrow</span>
                    <span className="text-sm font-semibold text-emerald-600">Gratuit ✓</span>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-900 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-extrabold text-gray-900">Total général</span>
                      <span className="block text-[10px] text-gray-400 mt-0.5">Hors frais de livraison GP</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-gray-900">
                        {format(grandTotalXAF, "XAF")}
                      </span>
                      <span className="block text-[10px] font-semibold mt-0.5" style={{ color: "#C8850A" }}>≈ en FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Code promo */}
                <div className="bg-[#F5F0E8] rounded-xl p-3 space-y-2 border border-[#EDE6DA]">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Code promo
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Ex : BANGUI10"
                      className="flex-1 px-3 py-2 text-sm border border-[#EDE6DA] rounded-lg focus:outline-none bg-white"
                      style={{ fontSize: 13 }}
                    />
                    <button
                      className="px-4 py-2 text-white text-sm font-bold rounded-lg transition-all hover:brightness-110"
                      style={{ background: "linear-gradient(135deg, #1B3A2D, #0D2318)" }}
                    >
                      OK
                    </button>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href="/paiement"
                  className="w-full flex items-center justify-center gap-2 font-extrabold py-4 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(200,133,10,.38)",
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Passer la commande
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Shield className="w-3 h-3 text-emerald-500" /> Escrow garanti
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Lock className="w-3 h-3 text-gray-400" /> SSL sécurisé
                  </span>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    📱 Orange Money
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
