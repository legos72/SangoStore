"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Package, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
import { truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getImageUrl } from "@/lib/api";
import { FlagImage } from "@/components/ui/FlagImage";
import { track } from "@/lib/analytics";

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

// ─── Badges dynamiques ────────────────────────────────────────────────────────

const BRAND      = "#1B3A2D";
const BRAND_SOFT = "#2d6a4f";
const GOLD       = "#B8860B";
const HOVER_BG   = "#F0F7F4";

function getExtraBadge(p: Product): { label: string } | null {
  if (p.isFlashSale)    return { label: "⚡ Flash"    };
  if (p.isTrending)     return { label: "🔥 Tendance" };
  if (p.isFastDelivery) return { label: "🚀 Rapide"   };
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  if (isNew)            return { label: "✦ Nouveau"   };
  return null;
}


export function ProductCard({ product, className, variant = "grid" }: ProductCardProps) {
  const router = useRouter();
  const [liked,     setLiked]     = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addItem }               = useCart();
  const { format, formatOriginal, currency } = useCurrency();
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
  const extraBadge     = getExtraBadge(product);

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

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!product.isAvailable || product.stock === 0) return;
    addItem(product, 1);
    track("buy_now", { product_id: product.id, product_name: product.title, category: product.category });
    router.push("/panier");
  }

  const imgSrc = product.images[0] ? getImageUrl(product.images[0]) : "";

  const imgFallback = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
      <Package className="w-8 h-8 text-gray-300" />
      <span className="text-[9px] text-gray-300 font-semibold mt-1 uppercase tracking-widest">Produit</span>
    </div>
  );

  /* ── LIST VARIANT ──────────────────────────────────────────────────────────── */
  if (isList) {
    return (
      <div className={cn(
        "group flex flex-row rounded-2xl overflow-hidden bg-white border border-gray-100",
        "hover:border-orange-200 hover:shadow-md transition-all duration-200",
        "shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
        className
      )}>
        {/* Image */}
        <Link
          href={`/produits/${product.id}`}
          className="relative w-28 h-28 sm:w-36 sm:h-36 flex-shrink-0 bg-gray-100 overflow-hidden"
        >
          {!imgLoaded && !imgError && imgSrc && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse" />
          )}
          {imgError || !imgSrc ? imgFallback : (
            <img
              src={imgSrc}
              alt={product.title}
              className={cn(
                "w-full h-full object-cover transition-all duration-300",
                imgLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
          {promoActive && (
            <span className="absolute top-2 left-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: BRAND }}>
              −{discountPct}%
            </span>
          )}
          {extraBadge && !promoActive && (
            <span className="absolute top-2 left-2 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: BRAND }}>
              {extraBadge.label}
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
        <div className="flex flex-col flex-1 min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <FlagImage code={product.originCountry?.code ?? ""} />
            <span className="text-[10px] font-semibold text-gray-400 capitalize tracking-wide truncate">
              {product.category}
            </span>
          </div>
          <Link href={`/produits/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
              {product.title}
            </h3>
          </Link>


          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[15px] font-semibold leading-none whitespace-nowrap" style={{ color: GOLD }}>
                  {format(displayPrice, product.currency)}
                </span>
                {promoActive && (
                  <span className="text-xs text-gray-400 line-through">{format(product.price, product.currency)}</span>
                )}
              </div>
              {showConversion && (
                <p className="text-[10px] text-gray-400 mt-0.5">≈&nbsp;{formatOriginal(displayPrice, product.currency)}</p>
              )}
              {bestTier && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-[9px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-px rounded-full">GROS</span>
                  <span className="text-[11px] text-indigo-600 font-semibold">
                    {format(bestTier.price, product.currency)} ≥{bestTier.min_qty} u.
                  </span>
                </div>
              )}
            </div>

            {product.isAvailable && product.stock > 0 ? (
              <button
                onClick={handleBuyNow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#D1EAE0] hover:bg-[#F0F7F4] transition-colors active:opacity-70 flex-shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5" style={{ color: BRAND }} />
                <span className="text-[11px] font-semibold" style={{ color: BRAND }}>Acheter</span>
              </button>
            ) : (
              <span className="text-[10px] font-medium text-gray-300 flex-shrink-0">Indispo.</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VARIANT ────────────────────────────────────────────────────────────── */
  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl overflow-hidden bg-white",
        "border border-gray-100/80",
        "shadow-[0_1px_8px_rgba(0,0,0,0.05)]",
        "hover:shadow-[0_4px_20px_rgba(0,0,0,0.09)] transition-shadow duration-200",
        className
      )}
    >
      {/* ── IMAGE ── */}
      <Link href={`/produits/${product.id}`} className="relative aspect-square overflow-hidden flex-shrink-0 bg-gray-50 block">
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-150 animate-pulse" />
        )}

        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 ease-out",
              imgLoaded ? "opacity-100 group-hover:scale-[1.04]" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Promo badge */}
        {promoActive && (
          <span className="absolute top-2 left-2 z-20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: BRAND }}>
            −{discountPct}%
          </span>
        )}

        {/* Extra badge */}
        {extraBadge && !promoActive && (
          <span className="absolute top-2 left-2 z-20 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: BRAND_SOFT }}>
            {extraBadge.label}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={toggleLike}
          className={cn(
            "absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center",
            "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.10)] transition-all duration-150 active:scale-90"
          )}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("w-3.5 h-3.5", liked ? "fill-red-400 text-red-400" : "text-gray-300")} />
        </button>

        {/* Unavailable overlay */}
        {(!product.isAvailable || product.stock === 0) && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
            <span className="bg-white text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full">
              Indisponible
            </span>
          </div>
        )}
      </Link>

      {/* ── CONTENT ── */}
      <div className="flex flex-col px-3 pt-2.5 pb-2.5">

        {/* Flag + catégorie */}
        <div className="flex items-center gap-1 mb-1.5">
          <FlagImage code={product.originCountry?.code ?? ""} size="sm" />
          <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {product.category}
          </span>
          {product.seller?.isVerified && (
            <span className="ml-auto text-[8px] font-semibold text-emerald-600 bg-emerald-50 px-1 py-px rounded flex-shrink-0">✓</span>
          )}
        </div>

        {/* Titre */}
        <Link href={`/produits/${product.id}`}>
          <h3
            className="text-[12px] sm:text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#1B3A2D] transition-colors mb-2"
            style={{ minHeight: "2.2em" }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Prix */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[14px] sm:text-[15px] font-semibold leading-none whitespace-nowrap" style={{ color: GOLD }}>
            {format(displayPrice, product.currency)}
          </span>
          {promoActive && (
            <span className="text-[10px] text-gray-400 line-through leading-none">
              {format(product.price, product.currency)}
            </span>
          )}
        </div>
        {showConversion && (
          <p className="text-[9px] text-gray-400 mt-0.5">≈&nbsp;{formatOriginal(displayPrice, product.currency)}</p>
        )}
        {bestTier && (
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[8px] font-bold px-1.5 py-px rounded-full leading-none" style={{ background: "#EEF5F1", color: BRAND }}>GROS</span>
            <span className="text-[10px] whitespace-nowrap font-medium" style={{ color: BRAND_SOFT }}>
              {format(bestTier.price, product.currency)}
            </span>
          </div>
        )}
      </div>

      {/* ── BOUTON — séparé par bordure en bas ── */}
      <div className="border-t border-gray-100/80 mt-auto">
        {product.isAvailable && product.stock > 0 ? (
          <button
            onClick={handleBuyNow}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#F0F7F4] transition-colors active:opacity-70"
          >
            <ShoppingCart className="w-3.5 h-3.5" style={{ color: BRAND }} />
            <span className="text-[11px] font-semibold" style={{ color: BRAND }}>Acheter</span>
          </button>
        ) : (
          <div className="px-3 py-2.5 flex items-center justify-center">
            <span className="text-[10px] text-gray-300 font-medium">Indisponible</span>
          </div>
        )}
      </div>
    </div>
  );
}
