"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Package, ShoppingCart, Star, Zap, Flame, Rocket } from "lucide-react";
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

const FOREST = "#1B3A2D";
const GOLD   = "#C8850A";

function getBadge(p: Product): { label: string; icon: React.ElementType; bg: string; text: string } | null {
  if (p.isFlashSale)    return { label: "Flash",    icon: Zap,    bg: "#1B3A2D", text: "#fff" };
  if (p.isTrending)     return { label: "Tendance", icon: Flame,  bg: "#DC2626", text: "#fff" };
  if (p.isFastDelivery) return { label: "Express",  icon: Rocket, bg: "#0369A1", text: "#fff" };
  const isNew = Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  if (isNew)            return { label: "Nouveau",  icon: Zap,    bg: "#065F46", text: "#fff" };
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
  const bestTier     = hasWholesale
    ? product.wholesalePrices!.reduce((b, t) => t.price < b.price ? t : b)
    : null;

  const showConversion = product.currency !== currency;
  const badge          = getBadge(product);
  const isAvailable    = product.isAvailable && product.stock > 0;

  useEffect(() => {
    try {
      const wl: string[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) ?? "[]");
      setLiked(wl.includes(product.id));
    } catch {}
  }, [product.id]);

  function toggleLike(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    const wl   = getWishlist();
    const next = !liked;
    if (next) wl.push(product.id);
    else { const i = wl.indexOf(product.id); if (i > -1) wl.splice(i, 1); }
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wl));
    setLiked(next);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!isAvailable) return;
    addItem(product, 1);
    toast.success("Ajouté au panier !", { duration: 2000 });
    track("add_to_cart", { product_id: product.id, product_name: product.title, category: product.category });
  }

  function handleBuyNow(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!isAvailable) return;
    addItem(product, 1);
    track("buy_now", { product_id: product.id, product_name: product.title, category: product.category });
    router.push("/panier");
  }

  const imgSrc = product.images[0] ? getImageUrl(product.images[0]) : "";

  const imgFallback = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EBE3]">
      <Package className="w-7 h-7 text-[#C8A87A]" />
      <span className="text-[9px] text-[#C8A87A] font-semibold mt-1 uppercase tracking-widest">Photo</span>
    </div>
  );

  /* ── LIST VARIANT ──────────────────────────────────────────────────────────── */
  if (isList) {
    return (
      <div className={cn(
        "group flex flex-row rounded-2xl overflow-hidden bg-[#FDFCF9]",
        "border border-[#EDE6DA]",
        "hover:border-amber-200/80 hover:shadow-[0_6px_24px_rgba(15,10,3,.10)] hover:-translate-y-0.5",
        "shadow-[0_1px_3px_rgba(15,10,3,.05)]",
        "transition-all duration-300",
        className
      )}>
        <Link
          href={`/produits/${product.id}`}
          className="relative flex-shrink-0 bg-[#F5F0E8] overflow-hidden"
          style={{ width: 112, height: 112 }}
        >
          {!imgLoaded && !imgError && imgSrc && <div className="absolute inset-0 shimmer-bg" />}
          {imgError || !imgSrc ? imgFallback : (
            <img
              src={imgSrc}
              alt={product.title}
              className={cn(
                "w-full h-full object-cover product-img",
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}
          {promoActive && (
            <span
              className="absolute top-2 left-2 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none"
              style={{ background: "linear-gradient(135deg, #16A34A, #15803D)" }}
            >
              -{discountPct}%
            </span>
          )}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-white text-gray-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                Indisponible
              </span>
            </div>
          )}
        </Link>

        <div className="flex flex-col flex-1 min-w-0 px-3.5 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FlagImage code={product.originCountry?.code ?? ""} />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide truncate">
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
                <span className="text-[15px] font-extrabold leading-none whitespace-nowrap" style={{ color: GOLD }}>
                  {format(displayPrice, product.currency)}
                </span>
                {promoActive && (
                  <span className="text-[10px] text-gray-400 line-through">{format(product.price, product.currency)}</span>
                )}
              </div>
            </div>
            {isAvailable ? (
              <button
                onClick={handleBuyNow}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all duration-150 active:opacity-70 flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1B3A2D 0%, #0D2318 100%)",
                  color: "#fff",
                  boxShadow: "0 2px 8px rgba(27,58,45,.22)",
                }}
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Acheter</span>
              </button>
            ) : (
              <span className="text-[10px] font-medium text-gray-300 flex-shrink-0">Indispo.</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* ── GRID VARIANT ─────────────────────────────────────────────────────────── */
  return (
    <div
      className={cn(
        "group flex flex-col rounded-2xl overflow-hidden bg-[#FDFCF9]",
        "border border-[#EDE6DA]",
        "shadow-[0_1px_4px_rgba(15,10,3,.05),0_0_0_0.5px_rgba(15,10,3,.03)]",
        "hover:shadow-[0_8px_32px_rgba(15,10,3,.10),0_2px_8px_rgba(15,10,3,.06)]",
        "hover:-translate-y-1 hover:border-amber-200/80",
        "transition-all duration-300 ease-out",
        className
      )}
    >
      {/* ── IMAGE ── */}
      <Link
        href={`/produits/${product.id}`}
        className="relative overflow-hidden flex-shrink-0 bg-[#F5F0E8] block"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Shimmer */}
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 shimmer-bg" />
        )}

        {/* Image */}
        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            className={cn(
              "w-full h-full object-cover product-img",
              imgLoaded ? "opacity-100" : "opacity-0"
            )}
            style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge promo */}
        {promoActive && (
          <span
            className="absolute top-2.5 left-2.5 z-20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full leading-tight"
            style={{
              background: "linear-gradient(135deg, #16A34A, #15803D)",
              boxShadow: "0 2px 8px rgba(22,163,74,.35)",
            }}
          >
            -{discountPct}%
          </span>
        )}

        {/* Status badge (if no promo) */}
        {badge && !promoActive && (
          <span
            className="absolute top-2.5 left-2.5 z-20 text-white text-[9px] font-bold px-2 py-0.5 rounded-full leading-tight flex items-center gap-1"
            style={{ background: badge.bg }}
          >
            <badge.icon className="w-2.5 h-2.5" />
            {badge.label}
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={toggleLike}
          className={cn(
            "absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center",
            "bg-white/95 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,.14)]",
            "transition-all duration-200 active:scale-90",
            "opacity-0 group-hover:opacity-100",
          )}
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn(
            "w-3.5 h-3.5 transition-all duration-200",
            liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
          )} />
        </button>

        {/* Indisponible overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
            <span
              className="bg-white text-gray-700 text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm"
            >
              Indisponible
            </span>
          </div>
        )}
      </Link>

      {/* ── CONTENU ── */}
      <div className="flex flex-col px-3 pt-3 pb-3.5 flex-1 gap-1.5">

        {/* Catégorie + pays | Note */}
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
              <span className="text-[10px] font-bold text-gray-600 leading-none tabular-nums">
                {(product.rating ?? 0).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Titre */}
        <Link href={`/produits/${product.id}`} className="flex-1">
          <h3
            className="text-[12px] sm:text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1B3A2D] transition-colors duration-200"
            style={{ minHeight: "2.4em" }}
          >
            {product.title}
          </h3>
        </Link>

        {/* Prix */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span
            className="text-[15px] font-extrabold leading-none whitespace-nowrap"
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
          <p className="text-[9px] text-gray-400 -mt-0.5">
            ≈&nbsp;{formatOriginal(displayPrice, product.currency)}
          </p>
        )}

        {bestTier && (
          <div className="flex items-center gap-1.5">
            <span
              className="text-[8px] font-extrabold px-1.5 py-px rounded-full leading-none uppercase tracking-wide"
              style={{ background: "#EEF5F1", color: FOREST }}
            >
              GROS
            </span>
            <span className="text-[9px] font-semibold whitespace-nowrap" style={{ color: "#2D6A4F" }}>
              dès {format(bestTier.price, product.currency)}
            </span>
          </div>
        )}

        {/* ── BOUTONS ── */}
        <div className="mt-auto pt-1">
          {isAvailable ? (
            <div className="flex items-center gap-1.5">
              {/* Bouton panier */}
              <button
                onClick={handleAddToCart}
                className="w-9 h-9 rounded-xl border-[1.5px] border-[#D1EAE0] flex items-center justify-center flex-shrink-0 hover:border-[#1B3A2D] hover:bg-[#EEF5F1] transition-all duration-150 active:scale-90"
                aria-label="Ajouter au panier"
              >
                <ShoppingCart className="w-3.5 h-3.5" style={{ color: FOREST }} />
              </button>
              {/* Bouton acheter */}
              <button
                onClick={handleBuyNow}
                className="flex-1 h-9 rounded-xl text-white text-[12px] font-bold flex items-center justify-center transition-all duration-200 hover:brightness-110 active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #1B3A2D 0%, #0D2318 100%)",
                  boxShadow: "0 2px 10px rgba(27,58,45,.22)",
                }}
              >
                Ajouter
              </button>
            </div>
          ) : (
            <div className="w-full h-9 rounded-xl border border-[#EDE6DA] flex items-center justify-center bg-[#F5F0E8]">
              <span className="text-[10px] text-gray-400 font-medium">Indisponible</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
