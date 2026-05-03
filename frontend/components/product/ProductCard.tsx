"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Check } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";

interface ProductCardProps {
  product: Product;
  className?: string;
  variant?: "grid" | "list";
}

const WISHLIST_KEY = "sango_wishlist";

function getWishlist(): string[] {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]"); }
  catch { return []; }
}

export function ProductCard({ product, className, variant = "grid" }: ProductCardProps) {
  const [liked, setLiked]         = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError, setImgError]   = useState(false);
  const { addItem, isInCart }     = useCart();
  const { format, formatOriginal, currency } = useCurrency();
  const inCart = isInCart(product.id);
  const showConversion = product.currency !== currency;
  const isList = variant === "list";

  // Price logic: promo → normal
  const promoActive =
    product.promoPrice != null &&
    product.promoPrice > 0 &&
    (product.promoEnd == null || new Date(product.promoEnd) > new Date());
  const displayPrice = promoActive ? product.promoPrice! : product.price;
  const discountPct  = promoActive
    ? Math.round((1 - product.promoPrice! / product.price) * 100)
    : 0;

  // Wholesale: find cheapest tier (lowest price, highest qty)
  const hasWholesale = product.wholesalePrices && product.wholesalePrices.length > 0;
  const bestWholesaleTier = hasWholesale
    ? product.wholesalePrices!.reduce((best, t) => t.price < best.price ? t : best)
    : null;

  // Smart stock badge
  const stockBadge =
    product.stock === 1 ? { label: "Plus que 1 !", color: "bg-orange-500" } :
    product.stock >= 2 && product.stock <= 5 ? { label: "Stock limité", color: "bg-amber-400" } :
    null;

  useEffect(() => {
    try {
      const wl: string[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
      setLiked(wl.includes(product.id));
    } catch {}
  }, [product.id]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const wl = getWishlist();
    const next = !liked;
    if (next) wl.push(product.id);
    else { const i = wl.indexOf(product.id); if (i > -1) wl.splice(i, 1); }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl));
    setLiked(next);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success(`${truncate(product.title, 28)} ajouté au panier`, {
      duration: 2000, icon: "🛒", style: { fontWeight: 600 },
    });
  }

  /* ── LIST VARIANT ─────────────────────────────────────────────────────── */
  if (isList) {
    return (
      <div className={cn(
        "group flex flex-row h-28 sm:h-32 rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-md hover:-translate-y-px transition-all duration-200",
        className
      )}>
        {/* Image */}
        <div className="relative w-28 sm:w-36 h-full flex-shrink-0 bg-gray-50">
          <Link href={`/produits/${product.id}`} className="absolute inset-0">
            {imgError || !product.images[0] ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl opacity-20">📦</span>
              </div>
            ) : (
              <img
                src={product.images[0]}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover object-top"
                loading="lazy"
                onError={() => setImgError(true)}
              />
            )}
          </Link>
          <span className="absolute top-1.5 left-1.5 text-sm leading-none drop-shadow">{product.originCountry.flag}</span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 p-2.5 sm:p-3 justify-between">
          <Link href={`/produits/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug hover:text-orange-600 transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="flex items-center justify-between gap-2 mt-auto">
            <div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <p className={cn("text-sm font-bold leading-none", promoActive ? "text-orange-600" : "text-gray-900")}>
                  {format(displayPrice, product.currency)}
                </p>
                {promoActive && (
                  <p className="text-[11px] text-gray-400 line-through leading-none">{format(product.price, product.currency)}</p>
                )}
              </div>
              {showConversion && (
                <p className="text-[11px] text-gray-400 mt-0.5">{formatOriginal(displayPrice, product.currency)}</p>
              )}
              {bestWholesaleTier && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-px rounded-full leading-none">GROS</span>
                  <span className="text-[11px] text-indigo-600 font-semibold leading-none">
                    {format(bestWholesaleTier.price, product.currency)} ≥{bestWholesaleTier.min_qty}&nbsp;u.
                  </span>
                </div>
              )}
            </div>
            {product.isAvailable ? (
              <button
                onClick={handleAddToCart}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 flex-shrink-0",
                  justAdded ? "bg-green-500 text-white" : inCart ? "bg-orange-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                )}
              >
                {justAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="text-[11px] text-gray-400 font-medium">Indisponible</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VARIANT (default) ───────────────────────────────────────────── */
  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
      className
    )}>

      {/* ── IMAGE ──────────────────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 flex-shrink-0">
        <Link href={`/produits/${product.id}`} className="absolute inset-0">
          {imgError || !product.images[0] ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl opacity-20">📦</span>
            </div>
          ) : (
            <img
              src={product.images[0]}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </Link>

        {/* Flag — top left (hidden when promo badge is shown) */}
        {!promoActive && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/80 backdrop-blur-sm rounded-full px-1.5 py-0.5">
            <span className="text-sm leading-none">{product.originCountry.flag}</span>
          </div>
        )}

        {/* Wishlist — top right */}
        <button
          onClick={toggleLike}
          className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("w-3.5 h-3.5 transition-colors", liked ? "fill-red-500 text-red-500" : "text-gray-500")} />
        </button>

        {/* Promo badge — top left (overlaps flag when promo active) */}
        {promoActive && (
          <span className="absolute top-2 left-2 z-20 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm leading-none">
            -{discountPct}%
          </span>
        )}

        {/* Stock badge — bottom left */}
        {stockBadge && product.stock > 0 && (
          <span className={cn("absolute bottom-2 left-2 z-10 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm", stockBadge.color)}>
            {stockBadge.label}
          </span>
        )}

        {/* Cart button — bottom right */}
        {product.isAvailable && (
          <button
            onClick={handleAddToCart}
            className={cn(
              "absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200",
              justAdded
                ? "bg-green-500 text-white scale-110"
                : inCart
                ? "bg-orange-600 text-white"
                : "bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-orange-500 hover:text-white hover:scale-110"
            )}
            aria-label="Ajouter au panier"
          >
            {justAdded
              ? <Check className="w-4 h-4" />
              : <ShoppingCart className={cn("w-4 h-4", inCart && "fill-white/30")} />
            }
          </button>
        )}

        {/* Unavailable overlay */}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-10">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* ── CONTENT STRIP ──────────────────────────────────────────────── */}
      <Link href={`/produits/${product.id}`} className="flex flex-col px-3 py-2.5 gap-0.5 min-w-0">
        <h3 className="text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
          <span className={cn("text-sm font-bold", promoActive ? "text-orange-600" : "text-gray-900")}>
            {format(displayPrice, product.currency)}
          </span>
          {promoActive && (
            <span className="text-[11px] text-gray-400 line-through font-normal">
              {format(product.price, product.currency)}
            </span>
          )}
          {showConversion && !promoActive && (
            <span className="text-[11px] text-gray-400 font-normal">
              {formatOriginal(product.price, product.currency)}
            </span>
          )}
        </div>
        {bestWholesaleTier && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-px rounded-full leading-none">GROS</span>
            <span className="text-[11px] text-indigo-600 font-semibold leading-none">
              {format(bestWholesaleTier.price, product.currency)} ≥{bestWholesaleTier.min_qty}&nbsp;u.
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}
