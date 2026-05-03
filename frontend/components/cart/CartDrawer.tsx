"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

// ─── Regrouper les montants par devise ────────────────────────────────────────

function useTotals(items: ReturnType<typeof useCart>["items"]) {
  const totals: Record<string, number> = {};
  for (const item of items) {
    const cur = item.product.currency;
    totals[cur] = (totals[cur] ?? 0) + item.product.price * item.quantity;
  }
  return totals;
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems } = useCart();
  const totals = useTotals(items);

  // Bloquer le scroll body quand ouvert
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panneau slide-in */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] bg-white shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-extrabold text-gray-900 text-lg">Mon panier</h2>
            {totalItems > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
              <ShoppingBag className="w-9 h-9 text-orange-300" />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Votre panier est vide</h3>
            <p className="text-sm text-gray-400 mb-5">
              Ajoutez des produits depuis le catalogue
            </p>
            <Link
              href="/produits"
              onClick={closeCart}
              className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Package className="w-4 h-4" />
              Voir les produits
            </Link>
          </div>
        ) : (
          <>
            {/* Liste produits */}
            <div className="flex-1 overflow-y-auto py-3 px-5 space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3.5 bg-gray-50 rounded-2xl p-3"
                >
                  {/* Image */}
                  <Link
                    href={`/produits/${item.product.id}`}
                    onClick={closeCart}
                    className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0"
                  >
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </Link>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produits/${item.product.id}`}
                      onClick={closeCart}
                      className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-orange-600 transition-colors"
                    >
                      {item.product.title}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-gray-500">
                        {item.product.originCountry.flag} {item.product.originCountry.name}
                      </span>
                      {item.selectedColor && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                          {item.selectedColor}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-40"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-sm font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-40"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price + delete */}
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {formatPrice(item.product.price * item.quantity, item.product.currency)}
                        </span>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-5 space-y-4 bg-white">
              {/* Totaux */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Sous-total</p>
                {Object.entries(totals).map(([currency, amount]) => (
                  <div key={currency} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{currency}</span>
                    <span className="font-extrabold text-gray-900">
                      {formatPrice(amount, currency as "XAF" | "EUR" | "USD")}
                    </span>
                  </div>
                ))}
                {Object.keys(totals).length > 1 && (
                  <p className="text-[11px] text-gray-400 pt-1">
                    * Montants dans leurs devises respectives
                  </p>
                )}
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <Link
                  href="/paiement"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Passer la commande
                </Link>
                <Link
                  href="/produits"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold py-3 rounded-xl text-sm transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Continuer mes achats
                </Link>
              </div>

              {/* Garantie escrow */}
              <p className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
                🔒 Paiement sécurisé · Escrow garanti jusqu&apos;à réception
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
