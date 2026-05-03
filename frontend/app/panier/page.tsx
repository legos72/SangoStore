"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package, ArrowLeft, Tag, Truck, Shield, Clock, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState } from "react";

function useTotals(items: ReturnType<typeof useCart>["items"]) {
  const totals: Record<string, number> = {};
  for (const item of items) {
    const cur = item.product.currency;
    totals[cur] = (totals[cur] ?? 0) + item.product.price * item.quantity;
  }
  return totals;
}

// ─── Étapes de commande ───────────────────────────────────────────────────────

const STEPS = [
  { label: "Panier",    active: true  },
  { label: "Livraison", active: false },
  { label: "Paiement",  active: false },
  { label: "Confirmation", active: false },
];

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, totalItems } = useCart();
  const { format, convert } = useCurrency();
  const totals = useTotals(items);

  // Total général converti en FCFA (XAF)
  const grandTotalXAF = items.reduce(
    (sum, item) => sum + convert(item.product.price * item.quantity, item.product.currency),
    0
  );
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [promoCode, setPromoCode] = useState("");

  // ── Panier vide ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb steps */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
            <StepBar />
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-24">
          <div className="text-center max-w-sm">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-14 h-14 text-orange-300" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Votre panier est vide</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Ajoutez des produits depuis le catalogue pour commencer votre commande vers Bangui.
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-md"
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
    <div className="min-h-screen bg-gray-50">

      {/* ── Barre d'étapes ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <StepBar />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Mon panier</h1>
            <span className="bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full leading-none">
              {totalItems} article{totalItems > 1 ? "s" : ""}
            </span>
          </div>
          <Link
            href="/produits"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuer mes achats
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── Articles ── */}
          <div className="lg:col-span-3 space-y-3">

            {/* En-tête colonnes */}
            <div className="hidden sm:grid grid-cols-[1fr_auto_auto] gap-4 px-4 pb-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Produit</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-24 text-center">Quantité</span>
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest w-28 text-right">Prix total</span>
            </div>

            {items.map((item, idx) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:border-orange-200 transition-colors"
              >
                <div className="p-4 sm:p-5 flex gap-4">

                  {/* Image */}
                  <Link
                    href={`/produits/${item.product.id}`}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0 ring-1 ring-gray-100"
                  >
                    {imgErrors[item.product.id] ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl">📦</span>
                      </div>
                    ) : (
                      <Image
                        src={item.product.images[0]}
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
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full mb-1">
                          📦 {item.product.originCountry.flag} {item.product.originCountry.name}
                        </span>
                        <Link
                          href={`/produits/${item.product.id}`}
                          className="block text-sm font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 leading-snug"
                        >
                          {item.product.title}
                        </Link>
                        {item.selectedColor && (
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
                            {item.selectedColor}
                          </span>
                        )}
                      </div>

                      {/* Supprimer */}
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
                      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-extrabold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors disabled:opacity-30"
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
                  <div className="px-4 sm:px-5 py-2 bg-amber-50 border-t border-amber-100 flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                    <span className="text-[11px] text-amber-700 font-medium">
                      Plus que {item.product.stock} en stock — commandez vite !
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* Actions bas de liste */}
            <div className="flex items-center justify-between pt-1">
              <Link
                href="/produits"
                className="sm:hidden flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Continuer mes achats
              </Link>
              <button
                onClick={clearCart}
                className="ml-auto text-xs text-gray-300 hover:text-red-400 font-medium transition-colors"
              >
                Vider le panier
              </button>
            </div>

            {/* Encart "Comment ça marche" */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: Shield, label: "Paiement sécurisé", sub: "Escrow garanti" },
                { icon: Truck,  label: "Livraison GP",      sub: "Vers Bangui" },
                { icon: Clock,  label: "Délai 7–21 jours",  sub: "Selon l'origine" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-3 flex flex-col items-center text-center gap-1">
                  <Icon className="w-4 h-4 text-orange-400" />
                  <span className="text-[11px] font-bold text-gray-700">{label}</span>
                  <span className="text-[10px] text-gray-400">{sub}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Récapitulatif ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">

              {/* Header récap */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                <h2 className="text-white font-extrabold text-base">Récapitulatif de commande</h2>
                <p className="text-orange-100 text-xs mt-0.5">
                  {items.length} produit{items.length > 1 ? "s" : ""} · livraison vers Bangui 🇨🇫
                </p>
              </div>

              <div className="p-5 space-y-4">

                {/* Mini-liste articles */}
                <div className="space-y-2.5">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-2.5">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {imgErrors[item.product.id] ? (
                          <span className="absolute inset-0 flex items-center justify-center text-sm">📦</span>
                        ) : (
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="36px"
                          />
                        )}
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
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

                <div className="border-t border-dashed border-gray-200" />

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
                    <span className="text-sm font-semibold text-orange-500">Calculée au checkout</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Escrow</span>
                    <span className="text-sm font-semibold text-green-600">Gratuit ✓</span>
                  </div>
                </div>

                {/* Total général en FCFA */}
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
                      <span className="block text-[10px] text-orange-500 font-semibold mt-0.5">≈ en FCFA</span>
                    </div>
                  </div>
                </div>

                {/* Code promo */}
                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <Tag className="w-3 h-3" /> Code promo
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Ex : BANGUI10"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 bg-white"
                    />
                    <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors">
                      Appliquer
                    </button>
                  </div>
                </div>

                {/* CTA Commander */}
                <Link
                  href="/paiement"
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-extrabold py-4 rounded-xl text-sm transition-all shadow-lg shadow-orange-200"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Passer la commande
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 pt-1">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Shield className="w-3 h-3 text-green-500" /> Escrow garanti
                  </span>
                  <span className="text-gray-200">·</span>
                  <span className="flex items-center gap-1 text-[10px] text-gray-400">
                    🔒 SSL sécurisé
                  </span>
                  <span className="text-gray-200">·</span>
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

// ─── Composant barre d'étapes ─────────────────────────────────────────────────

function StepBar() {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-colors ${
              step.active
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-400"
            }`}>
              {i + 1}
            </div>
            <span className={`text-sm font-semibold hidden sm:block ${step.active ? "text-orange-600" : "text-gray-400"}`}>
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
