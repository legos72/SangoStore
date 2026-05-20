"use client";

import Link from "next/link";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Package, Lock, Truck } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getImageUrl } from "@/lib/api";

function useTotals(items: ReturnType<typeof useCart>["items"]) {
  const totals: Record<string, number> = {};
  for (const item of items) {
    const cur = item.product.currency;
    totals[cur] = (totals[cur] ?? 0) + item.product.price * item.quantity;
  }
  return totals;
}

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalItems } = useCart();
  const totals = useTotals(items);

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

      {/* Slide-in panel */}
      <div
        className={cn(
          "fixed top-0 right-0 z-[70] h-full w-full sm:w-[420px] flex flex-col",
          "transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ background: "#FDFCF9" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #EEE8DF" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)" }}
            >
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-extrabold text-gray-900 text-base">Mon panier</h2>
            {totalItems > 0 && (
              <span
                className="text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center"
                style={{ background: "linear-gradient(135deg, #C8850A, #E0A320)" }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-gray-400 hover:bg-[#F5F2EC] hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
              style={{ background: "#F5F2EC" }}
            >
              <ShoppingBag className="w-9 h-9 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-800 text-base mb-1">Votre panier est vide</h3>
            <p className="text-sm text-gray-400 mb-6">
              Ajoutez des produits depuis le catalogue
            </p>
            <Link
              href="/produits"
              onClick={closeCart}
              className="inline-flex items-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-[0.97]"
              style={{ background: "linear-gradient(135deg, #1B3A2D, #2d5e48)", boxShadow: "0 4px 14px rgba(27,58,45,.25)" }}
            >
              <Package className="w-4 h-4" />
              Voir les produits
            </Link>
          </div>
        ) : (
          <>
            {/* Product list */}
            <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2.5">
              {items.map((item) => {
                const imgSrc = item.product.images[0] ? getImageUrl(item.product.images[0]) : null;
                const hasPromo = item.product.promoPrice != null && item.product.promoPrice > 0 && item.product.promoPrice < item.product.price;
                const displayPrice = hasPromo ? item.product.promoPrice! : item.product.price;

                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3 rounded-2xl p-3 transition-all"
                    style={{ background: "#F5F2EC", border: "1px solid #EEE8DF" }}
                  >
                    {/* Image */}
                    <Link
                      href={`/produits/${item.product.id}`}
                      onClick={closeCart}
                      className="relative w-[72px] h-[72px] rounded-xl overflow-hidden flex-shrink-0"
                      style={{ background: "#EDE7DC" }}
                    >
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={item.product.title}
                          className="w-full h-full object-cover"
                          onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/produits/${item.product.id}`}
                        onClick={closeCart}
                        className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-[#1B3A2D] transition-colors"
                      >
                        {item.product.title}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[11px] text-gray-500">
                          {item.product.originCountry.flag} {item.product.originCountry.name}
                        </span>
                        {item.selectedColor && (
                          <span className="text-[10px] bg-white border border-[#E5DDD0] text-gray-600 px-1.5 py-0.5 rounded-full">
                            {item.selectedColor}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Qty controls */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-lg border border-[#E5DDD0] bg-white flex items-center justify-center hover:border-[#1B3A2D] transition-colors text-gray-600 disabled:opacity-40"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQty(item.product.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-lg border border-[#E5DDD0] bg-white flex items-center justify-center hover:border-[#1B3A2D] transition-colors text-gray-600 disabled:opacity-40"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Price + delete */}
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="font-extrabold text-sm" style={{ color: "#C8850A" }}>
                              {formatPrice(displayPrice * item.quantity, item.product.currency)}
                            </span>
                            {hasPromo && (
                              <span className="block text-[10px] text-gray-400 line-through leading-none">
                                {formatPrice(item.product.price * item.quantity, item.product.currency)}
                              </span>
                            )}
                          </div>
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
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-5 space-y-4" style={{ borderTop: "1px solid #EEE8DF", background: "#FDFCF9" }}>
              {/* Totals */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Sous-total</p>
                {Object.entries(totals).map(([currency, amount]) => (
                  <div key={currency} className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{currency}</span>
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

              {/* Trust strip */}
              <div
                className="flex items-center justify-center gap-3 py-2.5 px-3 rounded-xl"
                style={{ background: "#F0F7F3", border: "1px solid #C8E0D2" }}
              >
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#1B3A2D]" />
                  <span className="text-[11px] font-semibold text-[#1B3A2D]">Escrow sécurisé</span>
                </div>
                <span className="text-gray-300">·</span>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#1B3A2D]" />
                  <span className="text-[11px] font-semibold text-[#1B3A2D]">Livraison Bangui</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5">
                <Link
                  href="/paiement"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                  style={{
                    background: "linear-gradient(135deg, #C8850A, #E0A320)",
                    boxShadow: "0 4px 18px rgba(200,133,10,.35)",
                  }}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Passer la commande
                </Link>
                <Link
                  href="/produits"
                  onClick={closeCart}
                  className="w-full inline-flex items-center justify-center gap-2 font-semibold py-3 rounded-xl text-sm transition-colors text-gray-700 hover:text-[#1B3A2D]"
                  style={{ border: "1px solid #E5DDD0", background: "white" }}
                >
                  <ArrowRight className="w-4 h-4" />
                  Continuer mes achats
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
