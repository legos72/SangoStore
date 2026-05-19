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

function getExtraBadge(p: Product): { label: string; cls: string } | null {
  if (p.isFlashSale)    return { label: "⚡ Flash",    cls: "bg-red-500" };
  if (p.isTrending)     return { label: "🔥 Tendance", cls: "bg-amber-500" };
  if (p.isFastDelivery) return { label: "🚀 GP Rapide",cls: "bg-emerald-500" };
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  if (isNew)            return { label: "✨ Nouveau",  cls: "bg-sky-500" };
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
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
              -{discountPct}%
            </span>
          )}
          {extraBadge && !promoActive && (
            <span className={cn("absolute top-2 left-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm", extraBadge.cls)}>
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
                <span className={cn("text-base font-extrabold leading-none whitespace-nowrap",
                  promoActive ? "text-orange-600" : "text-gray-900")}>
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
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-[0.97] flex-shrink-0"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-[11px] font-bold" style={{ color: "#C2440A" }}>Acheter</span>
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
        "group flex flex-col rounded-2xl overflow-hidden bg-white",
        "border border-gray-100",
        "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_8px_32px_rgba(0,0,0,0.10)]",
        "hover:-translate-y-0.5 transition-all duration-200",
        className
      )}
    >
      {/* ── IMAGE ── */}
      <Link href={`/produits/${product.id}`} className="relative aspect-square overflow-hidden flex-shrink-0 bg-gray-50 block">
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}

        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 ease-out",
              imgLoaded ? "opacity-100 group-hover:scale-[1.05]" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Promo badge — top left */}
        {promoActive && (
          <span className="absolute top-2.5 left-2.5 z-20 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
            -{discountPct}%
          </span>
        )}

        {/* Extra badge — top left (si pas de promo) */}
        {extraBadge && !promoActive && (
          <span className={cn(
            "absolute top-2.5 left-2.5 z-20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm",
            extraBadge.cls
          )}>
            {extraBadge.label}
          </span>
        )}

        {/* Wishlist — always visible on mobile, hover on desktop */}
        <button
          onClick={toggleLike}
          className={cn(
            "absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white shadow-[0_1px_6px_rgba(0,0,0,0.12)] transition-all duration-150 active:scale-90",
            "sm:opacity-0 sm:group-hover:opacity-100 opacity-100"
          )}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("w-4 h-4", liked ? "fill-red-500 text-red-500" : "text-gray-400")} />
        </button>

        {/* Unavailable overlay */}
        {(!product.isAvailable || product.stock === 0) && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
            <span className="bg-white text-gray-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Indisponible
            </span>
          </div>
        )}
      </Link>

      {/* ── CONTENT ── */}
      <div className="flex flex-col px-4 pt-3 pb-3">

        {/* Flag + catégorie */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <FlagImage code={product.originCountry?.code ?? ""} size="sm" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
            {product.category}
          </span>
          {product.seller?.isVerified && (
            <span className="ml-auto text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-px rounded flex-shrink-0">✓</span>
          )}
        </div>

        {/* Titre */}
        <Link href={`/produits/${product.id}`}>
          <h3 className="text-[14px] sm:text-[15px] font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-700 transition-colors mb-2.5" style={{ minHeight: "2.6em" }}>
            {product.title}
          </h3>
        </Link>

        {/* Prix */}
        <div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[17px] font-extrabold leading-none whitespace-nowrap" style={{ color: "#C2850A" }}>
              {format(displayPrice, product.currency)}
            </span>
            {promoActive && (
              <span className="text-xs text-gray-400 line-through leading-none">
                {format(product.price, product.currency)}
              </span>
            )}
          </div>
          {showConversion && (
            <p className="text-[10px] text-gray-400 mt-0.5">≈&nbsp;{formatOriginal(displayPrice, product.currency)}</p>
          )}
          {bestTier && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-500 px-1.5 py-px rounded-full leading-none">GROS</span>
              <span className="text-[10px] text-indigo-500 whitespace-nowrap font-semibold">
                {format(bestTier.price, product.currency)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── BOUTON — séparé par bordure en bas ── */}
      <div className="border-t border-gray-100">
        {product.isAvailable && product.stock > 0 ? (
          <button
            onClick={handleBuyNow}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-orange-50 transition-colors active:scale-[0.98]"
          >
            <ShoppingCart className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-semibold" style={{ color: "#C2440A" }}>Acheter</span>
          </button>
        ) : (
          <div className="px-4 py-3 flex items-center justify-center">
            <span className="text-[11px] text-gray-300 font-medium">Indisponible</span>
          </div>
        )}
      </div>
    </div>
  );
}
