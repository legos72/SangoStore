"use client";

import Link from "next/link";
import { ShoppingCart, Heart, Check, Package } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getImageUrl } from "@/lib/api";
import { FlagImage } from "@/components/ui/FlagImage";

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
  const isList = variant === "list";

  const promoActive =
    product.promoPrice != null &&
    product.promoPrice > 0 &&
    (product.promoEnd == null || new Date(product.promoEnd) > new Date());
  const displayPrice = promoActive ? product.promoPrice! : product.price;
  const discountPct  = promoActive
    ? Math.round((1 - product.promoPrice! / product.price) * 100)
    : 0;

  const hasWholesale = product.wholesalePrices && product.wholesalePrices.length > 0;
  const bestTier = hasWholesale
    ? product.wholesalePrices!.reduce((b, t) => t.price < b.price ? t : b)
    : null;

  const showConversion = product.currency !== currency;

  useEffect(() => {
    try {
      const wl: string[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
      setLiked(wl.includes(product.id));
    } catch {}
  }, [product.id]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const wl = getWishlist();
    const next = !liked;
    if (next) wl.push(product.id);
    else { const i = wl.indexOf(product.id); if (i > -1) wl.splice(i, 1); }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl));
    setLiked(next);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!product.isAvailable || product.stock === 0) return;
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success(`${truncate(product.title, 28)} ajouté au panier`, {
      duration: 2000, icon: "🛒", style: { fontWeight: 600 },
    });
  }

  const imgFallback = (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <Package className="w-10 h-10 text-gray-300" />
    </div>
  );

  /* ── LIST VARIANT ─────────────────────────────────────────────────────── */
  if (isList) {
    return (
      <div className={cn(
        "group flex flex-row rounded-2xl overflow-hidden bg-white border border-gray-200",
        "hover:border-orange-200 hover:shadow-md transition-all duration-200",
        className
      )}>
        {/* Image — edge-to-edge, no padding */}
        <Link href={`/produits/${product.id}`}
          className="relative w-32 sm:w-44 flex-shrink-0 bg-white overflow-hidden flex items-center justify-center">
          {imgError || !product.images[0] ? imgFallback : (
            <img src={getImageUrl(product.images[0])} alt={product.title}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              loading="lazy" onError={() => setImgError(true)} />
          )}
          {promoActive && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPct}%
            </span>
          )}
          {(!product.isAvailable || product.stock === 0) && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <span className="bg-white text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Indisponible
              </span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 px-3 py-2.5 gap-1">
          {/* Category + flag + stock */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold text-gray-400 capitalize tracking-wide">
              {product.category}
            </span>
            <FlagImage code={product.originCountry.code} />
          </div>

          {/* Title */}
          <Link href={`/produits/${product.id}`}>
            <h3 className="text-sm sm:text-[15px] font-semibold text-gray-900 line-clamp-2 leading-snug
                           group-hover:text-orange-600 transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Price + Commander inline */}
          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className={cn(
                  "text-base sm:text-lg font-normal leading-none",
                  promoActive ? "text-orange-600" : "text-gray-900"
                )}>
                  {format(displayPrice, product.currency)}
                </span>
                {promoActive && (
                  <span className="text-xs text-gray-400 line-through">
                    {format(product.price, product.currency)}
                  </span>
                )}
              </div>
              {showConversion && (
                <p className="text-[10px] text-gray-400 mt-0.5">
                  &asymp;&nbsp;{formatOriginal(displayPrice, product.currency)}
                </p>
              )}
              {bestTier && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-px rounded-full">GROS</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    {format(bestTier.price, product.currency)} &ge;{bestTier.min_qty}&nbsp;u.
                  </span>
                </div>
              )}
            </div>

            {product.isAvailable && product.stock > 0 ? (
              <button
                onClick={handleAddToCart}
                className={cn(
                  "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95",
                  justAdded
                    ? "bg-green-500 text-white"
                    : inCart
                    ? "bg-orange-600 text-white"
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                )}
              >
                {justAdded
                  ? <><Check className="w-3.5 h-3.5" />Ajouté</>
                  : inCart
                  ? "Au panier"
                  : <><ShoppingCart className="w-3.5 h-3.5" />Acheter</>
                }
              </button>
            ) : (
              <span className="text-[10px] font-medium text-gray-400">Indisponible</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VARIANT ─────────────────────────────────────────────────────── */
  return (
    <div className={cn(
      "group relative flex flex-col rounded-2xl overflow-hidden bg-white",
      "border border-gray-200 hover:border-orange-200",
      "shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
      className
    )}>

      {/* ── IMAGE — edge-to-edge, no padding ───────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-white flex-shrink-0">
        <Link href={`/produits/${product.id}`} className="absolute inset-0 flex items-center justify-center">
          {imgError || !product.images[0] ? imgFallback : (
            <img
              src={getImageUrl(product.images[0])}
              alt={product.title}
              className="w-full h-full object-contain
                         group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </Link>

        {/* Promo badge */}
        {promoActive && (
          <span className="absolute top-2 left-2 z-20 bg-red-500 text-white
                           text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={toggleLike}
          className={cn(
            "absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center",
            "bg-white/85 backdrop-blur-sm shadow-sm transition-colors",
            liked ? "bg-red-50" : "hover:bg-white"
          )}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("w-3.5 h-3.5 transition-colors", liked ? "fill-red-500 text-red-500" : "text-gray-400")} />
        </button>

        {/* Unavailable overlay */}
        {(!product.isAvailable || product.stock === 0) && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-10">
            <span className="bg-white text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* ── CONTENT ────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-3 pt-2 pb-2.5 gap-0.5">

        {/* Category + flag + stock */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-gray-400 capitalize tracking-wide">
            {product.category}
          </span>
          <FlagImage code={product.originCountry.code} />
        </div>

        {/* Title */}
        <Link href={`/produits/${product.id}`}>
          <h3 className="text-[13px] sm:text-sm font-semibold text-gray-900 leading-snug
                         line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2.5em]">
            {product.title}
          </h3>
        </Link>

        {/* Price + Commander — sur la même ligne */}
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className={cn(
                "text-sm sm:text-base font-normal leading-none",
                promoActive ? "text-orange-600" : "text-gray-900"
              )}>
                {format(displayPrice, product.currency)}
              </span>
              {promoActive && (
                <span className="text-[10px] text-gray-400 line-through leading-none">
                  {format(product.price, product.currency)}
                </span>
              )}
            </div>
            {showConversion && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                &asymp;&nbsp;{formatOriginal(displayPrice, product.currency)}
              </p>
            )}
          </div>

          {product.isAvailable && product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all active:scale-95",
                justAdded
                  ? "bg-green-500 text-white"
                  : inCart
                  ? "bg-orange-600 text-white"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              )}
            >
              {justAdded
                ? <><Check className="w-3 h-3" />Ajouté</>
                : inCart
                ? "Au panier"
                : "Acheter"
              }
            </button>
          ) : (
            <span className="text-[10px] font-medium text-gray-400 flex-shrink-0">Indisponible</span>
          )}
        </div>

        {/* Prix de gros — affiché en bas si disponible */}
        {bestTier && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full leading-none">
              GROS
            </span>
            <span className="text-[10px] text-indigo-600 font-semibold">
              {format(bestTier.price, product.currency)} &ge;{bestTier.min_qty}&nbsp;u.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
