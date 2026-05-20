"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Package, ShoppingCart, Star } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import type { Product } from "@/lib/types";
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

const BRAND      = "#1B3A2D";
const BRAND_SOFT = "#2d6a4f";
const GOLD       = "#B8860B";

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

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!product.isAvailable || product.stock === 0) return;
    addItem(product, 1);
    toast.success("Ajouté au panier !");
    track("add_to_cart", { product_id: product.id, product_name: product.title, category: product.category });
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
            <span className="absolute top-2 left-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#16A34A" }}>
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

        <div className="flex flex-col flex-1 min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-1.5 mb-0.5">
            <FlagImage code={product.originCountry?.code ?? ""} />
            <span className="text-[10px] font-semibold text-gray-400 capitalize tracking-wide truncate">
              {product.category}
            </span>
          </div>
          <Link href={`/produits/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#1B3A2D] transition-colors">
              {product.title}
            </h3>
          </Link>
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-[15px] font-bold leading-none whitespace-nowrap" style={{ color: GOLD }}>
                  {format(displayPrice, product.currency)}
                </span>
                {promoActive && (
                  <span className="text-xs text-gray-400 line-through">{format(product.price, product.currency)}</span>
                )}
              </div>
            </div>
            {product.isAvailable && product.stock > 0 ? (
              <button
                onClick={handleBuyNow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-[#D1EAE0] hover:bg-[#F0F7F4] transition-colors active:opacity-70 flex-shrink-0"
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

  /* ── GRID VARIANT — compact premium ──────────────────────────────────────── */
  return (
    <div
      className={cn(
        "group flex flex-col rounded-xl overflow-hidden bg-white",
        "border border-gray-100/80",
        "shadow-[0_1px_6px_rgba(0,0,0,0.06)]",
        "hover:shadow-[0_6px_20px_rgba(0,0,0,0.10)] hover:-translate-y-0.5",
        "transition-all duration-200",
        className
      )}
    >
      {/* ── IMAGE ── */}
      <Link
        href={`/produits/${product.id}`}
        className="relative aspect-square overflow-hidden flex-shrink-0 bg-gray-50 block"
      >
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            className={cn(
              "w-full h-full object-cover transition-transform duration-500 ease-out",
              imgLoaded ? "opacity-100 group-hover:scale-[1.05]" : "opacity-0"
            )}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Badge réduction */}
        {promoActive && (
          <span
            className="absolute top-2 left-2 z-20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full leading-tight"
            style={{ background: "#16A34A" }}
          >
            -{discountPct}%
          </span>
        )}

        {/* Badge extra */}
        {extraBadge && !promoActive && (
          <span
            className="absolute top-2 left-2 z-20 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-tight"
            style={{ background: BRAND_SOFT }}
          >
            {extraBadge.label}
          </span>
        )}

        {/* Cœur */}
        <button
          onClick={toggleLike}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-white shadow-[0_1px_6px_rgba(0,0,0,0.18)] flex items-center justify-center transition-transform duration-150 active:scale-90"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("w-3.5 h-3.5", liked ? "fill-red-400 text-red-400" : "text-gray-400")} />
        </button>

        {/* Indisponible overlay */}
        {(!product.isAvailable || product.stock === 0) && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
            <span className="bg-white text-gray-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">
              Indisponible
            </span>
          </div>
        )}
      </Link>

      {/* ── CONTENU ── */}
      <div className="flex flex-col px-2.5 pt-2 pb-2.5 flex-1 gap-1">

        {/* Catégorie • Pays  |  ★ note (avis) */}
        <div className="flex items-center justify-between gap-1 min-w-0">
          <div className="flex items-center gap-1 min-w-0 overflow-hidden">
            <FlagImage code={product.originCountry?.code ?? ""} size="sm" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide truncate leading-none">
              {product.category}
              {product.originCountry?.name ? ` • ${product.originCountry.name}` : ""}
            </span>
          </div>
          {(product.rating ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px] font-semibold text-gray-600 leading-none tabular-nums">
                {(product.rating ?? 0).toFixed(1)}
              </span>
              {(product.reviewCount ?? 0) > 0 && (
                <span className="text-[9px] text-gray-400 leading-none">({product.reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Titre */}
        <Link href={`/produits/${product.id}`} className="flex-1">
          <h3
            className="text-[12px] sm:text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1B3A2D] transition-colors duration-150"
            style={{ minHeight: "2.4em" }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Prix */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className="text-[14px] sm:text-[15px] font-bold leading-none whitespace-nowrap"
            style={{ color: GOLD }}
          >
            {format(displayPrice, product.currency)}
          </span>
          {promoActive && (
            <span className="text-[10px] text-gray-400 line-through leading-none">
              {format(product.price, product.currency)}
            </span>
          )}
        </div>

        {showConversion && (
          <p className="text-[9px] text-gray-400 -mt-0.5">≈&nbsp;{formatOriginal(displayPrice, product.currency)}</p>
        )}
        {bestTier && (
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-bold px-1.5 py-px rounded-full leading-none" style={{ background: "#EEF5F1", color: BRAND }}>GROS</span>
            <span className="text-[9px] font-medium whitespace-nowrap" style={{ color: BRAND_SOFT }}>
              {format(bestTier.price, product.currency)}
            </span>
          </div>
        )}

        {/* ── BOUTONS ── */}
        <div className="mt-auto pt-1">
          {product.isAvailable && product.stock > 0 ? (
            <div className="flex items-center gap-1.5">
              {/* Panier — ajoute sans quitter la page */}
              <button
                onClick={handleAddToCart}
                className="w-8 h-8 rounded-lg border-2 border-gray-200 flex items-center justify-center flex-shrink-0 hover:border-[#1B3A2D] hover:bg-[#F0F7F4] transition-all duration-150 active:scale-90"
                aria-label="Ajouter au panier"
              >
                <ShoppingCart className="w-3.5 h-3.5" style={{ color: BRAND }} />
              </button>
              {/* Ajouter — acheter maintenant */}
              <button
                onClick={handleBuyNow}
                className="flex-1 h-8 rounded-lg text-white text-[12px] font-semibold flex items-center justify-center hover:opacity-90 active:scale-[0.98] transition-all duration-150"
                style={{ background: BRAND }}
              >
                Ajouter
              </button>
            </div>
          ) : (
            <div className="w-full h-8 rounded-lg border border-gray-100 flex items-center justify-center">
              <span className="text-[10px] text-gray-300 font-medium">Indisponible</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
