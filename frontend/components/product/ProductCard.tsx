"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export function ProductCard({ product, className, variant = "grid" }: ProductCardProps) {
  const router = useRouter();
  const [liked,     setLiked]     = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
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
    track("add_to_cart", { product_id: product.id, product_name: product.title, category: product.category });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1800);
    toast.success(`${truncate(product.title, 28)} ajouté au panier`, {
      duration: 2000, icon: "🛒", style: { fontWeight: 600 },
    });
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
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={handleAddToCart}
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 border",
                    justAdded
                      ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200/50"
                      : inCart
                      ? "bg-orange-100 border-orange-200 text-orange-600"
                      : "bg-white border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50"
                  )}
                >
                  {justAdded ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="h-7 px-3.5 rounded-full flex items-center justify-center text-[11px] font-bold bg-orange-500 hover:bg-orange-600 text-white transition-all duration-150 active:scale-[0.97] shadow-sm shadow-orange-200/50 tracking-wide"
                >
                  Acheter
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-medium text-gray-300 flex-shrink-0">Indispo.</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VARIANT — Design 3 ───────────────────────────────────────────────── */
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl overflow-hidden bg-white",
        "border border-gray-100 shadow-[0_1px_8px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)] hover:border-orange-200/60",
        "hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200",
        className
      )}
    >
      {/* ── IMAGE ── */}
      <Link href={`/produits/${product.id}`} className="relative aspect-square overflow-hidden flex-shrink-0 bg-gray-100 block">
        {/* Skeleton pulse while loading */}
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
        )}

        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-500 ease-out",
              imgLoaded
                ? "opacity-100 group-hover:scale-[1.04]"
                : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Promo badge */}
        {promoActive && (
          <span className="absolute top-2 left-2 z-20 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-sm">
            -{discountPct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={toggleLike}
          className={cn(
            "absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center",
            "bg-white/90 backdrop-blur-sm shadow-sm transition-all duration-150 active:scale-90",
            liked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("w-3.5 h-3.5", liked ? "fill-red-500 text-red-500" : "text-gray-400")} />
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
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3">

        {/* Flag + catégorie */}
        <div className="flex items-center gap-1 mb-1">
          <FlagImage code={product.originCountry?.code ?? ""} size="sm" />
          <span className="text-[10px] text-gray-400 capitalize tracking-wide truncate font-medium">
            {product.category}
          </span>
        </div>

        {/* Titre */}
        <Link href={`/produits/${product.id}`}>
          <h3 className="text-[12px] sm:text-[13px] font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-orange-600 transition-colors mb-2">
            {product.title}
          </h3>
        </Link>

        {/* Prix */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1 flex-wrap mb-0.5">
            <span className={cn(
              "text-sm font-extrabold leading-none whitespace-nowrap",
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
            <p className="text-[10px] text-gray-400 mb-1">≈&nbsp;{formatOriginal(displayPrice, product.currency)}</p>
          )}
          {bestTier && (
            <div className="flex items-center gap-1 mb-1.5">
              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-500 px-1.5 py-px rounded-full leading-none">GROS</span>
              <span className="text-[10px] text-indigo-500 leading-none whitespace-nowrap font-semibold">
                {format(bestTier.price, product.currency)}
              </span>
            </div>
          )}

          {/* ── Boutons ── */}
          {product.isAvailable && product.stock > 0 ? (
            <div className="flex gap-1.5 mt-1.5">
              <button
                onClick={handleAddToCart}
                title={justAdded ? "Ajouté !" : inCart ? "Dans le panier" : "Ajouter au panier"}
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 border",
                  justAdded
                    ? "bg-green-500 border-green-500 text-white shadow-sm shadow-green-200/50"
                    : inCart
                    ? "bg-orange-100 border-orange-200 text-orange-600"
                    : "bg-white border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50"
                )}
              >
                {justAdded ? <Check className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 h-7 rounded-full flex items-center justify-center text-[11px] font-bold bg-orange-500 hover:bg-orange-600 active:scale-[0.97] text-white transition-all duration-150 shadow-sm shadow-orange-200/50 tracking-wide"
              >
                Acheter
              </button>
            </div>
          ) : (
            <div className="mt-1.5 flex items-center justify-center">
              <span className="text-[10px] text-gray-300 font-medium">Indisponible</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
