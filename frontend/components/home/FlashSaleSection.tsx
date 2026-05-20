"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Heart, ShoppingCart, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { api, getImageUrl } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { FlagImage } from "@/components/ui/FlagImage";
import type { Product } from "@/lib/types";

const BRAND = "#1B3A2D";
const GOLD  = "#B8860B";

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(end: string | null | undefined) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0, expired: false });
  useEffect(() => {
    if (!end) return;
    const endMs = new Date(end).getTime();
    function tick() {
      const diff = endMs - Date.now();
      if (diff <= 0) { setTime({ h: 0, m: 0, s: 0, expired: true }); return; }
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [end]);
  return time;
}

// ─── Timer block (compact dark box) ──────────────────────────────────────────

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-px">
      <span className="min-w-[26px] h-7 px-1 rounded-md bg-gray-900 text-white text-[11px] font-extrabold flex items-center justify-center tabular-nums leading-none">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[7px] text-gray-400 uppercase tracking-wide font-medium">{label}</span>
    </div>
  );
}

function TimerRow({ timer }: { timer: { h: number; m: number; s: number; expired: boolean } }) {
  const days = Math.floor(timer.h / 24);
  const hours = timer.h % 24;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wide font-semibold text-gray-400 mr-0.5 whitespace-nowrap">
        Fin dans
      </span>
      {days > 0 && (
        <>
          <TimeBlock value={days} label="j" />
          <span className="text-xs font-bold text-gray-400 pb-3.5">:</span>
        </>
      )}
      <TimeBlock value={hours} label="h" />
      <span className="text-xs font-bold text-gray-400 pb-3.5">:</span>
      <TimeBlock value={timer.m} label="min" />
      <span className="text-xs font-bold text-gray-400 pb-3.5">:</span>
      <TimeBlock value={timer.s} label="sec" />
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function FlashCardSkeleton() {
  return (
    <div
      className="flex-shrink-0 flex flex-col rounded-xl overflow-hidden bg-white border border-gray-100/80"
      style={{ width: "clamp(160px, 44vw, 200px)" }}
    >
      <div className="aspect-square shimmer-bg flex-shrink-0" />
      <div className="px-3 pt-2 pb-2 space-y-1.5">
        <div className="flex items-center gap-1">
          <div className="shimmer-bg rounded-full h-2.5 w-2.5" />
          <div className="shimmer-bg rounded-full h-2 w-12" />
        </div>
        <div className="space-y-1">
          <div className="shimmer-bg rounded-full h-3 w-full" />
          <div className="shimmer-bg rounded-full h-3 w-2/3" />
        </div>
        <div className="shimmer-bg rounded-full h-3.5 w-16" />
      </div>
      <div className="border-t border-gray-100/80 px-3 py-2 flex items-center justify-between">
        <div className="shimmer-bg rounded-full h-3 w-3" />
        <div className="shimmer-bg rounded-full h-3 w-10" />
      </div>
    </div>
  );
}

// ─── Flash Deal Card ──────────────────────────────────────────────────────────

function FlashDealCard({ product }: { product: Product }) {
  const [imgError,  setImgError]  = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [liked,     setLiked]     = useState(false);
  const router    = useRouter();
  const { addItem } = useCart();
  const { format }  = useCurrency();

  const imgSrc   = !imgError && product.images[0] ? getImageUrl(product.images[0]) : null;
  const hasPromo = product.promoPrice != null && product.promoPrice > 0 && product.promoPrice < product.price;
  const display  = hasPromo ? product.promoPrice! : product.price;
  const original = hasPromo ? product.price : null;
  const pct      = hasPromo ? Math.round((1 - product.promoPrice! / product.price) * 100) : null;

  function handleBuy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    router.push("/panier");
  }

  const imgFallback = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
      <Package className="w-8 h-8 text-gray-300" />
    </div>
  );

  return (
    <div
      className="group flex-shrink-0 flex flex-col rounded-xl overflow-hidden bg-white border border-[#EAE2D2] shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
      style={{ width: "clamp(160px, 44vw, 200px)" }}
    >
      {/* Image */}
      <Link href={`/produits/${product.id}`} className="relative aspect-square overflow-hidden flex-shrink-0 bg-gray-50 block">
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ease-out ${imgLoaded ? "opacity-100 group-hover:scale-[1.04]" : "opacity-0"}`}
            loading="lazy"
          />
        )}

        {/* Promo badge */}
        {pct != null && (
          <span className="absolute top-2 left-2 z-20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: BRAND }}>
            −{pct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-[0_1px_4px_rgba(0,0,0,0.10)] transition-all duration-150 active:scale-90"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-400 text-red-400" : "text-gray-300"}`} />
        </button>
      </Link>

      {/* Content */}
      <Link href={`/produits/${product.id}`} className="flex flex-col px-3 pt-2 pb-2">
        {/* Drapeau + catégorie */}
        <div className="flex items-center gap-1 mb-1">
          <FlagImage code={product.originCountry?.code ?? ""} size="sm" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {product.category}
          </span>
        </div>

        {/* Titre */}
        <h3
          className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1B3A2D] transition-colors duration-150 mb-1.5"
          style={{ minHeight: "2.8em" }}
        >
          {product.title}
        </h3>

        {/* Prix */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[14px] font-semibold leading-none whitespace-nowrap" style={{ color: GOLD }}>
            {format(display, product.currency)}
          </span>
          {original != null && (
            <span className="text-[10px] text-gray-400 line-through leading-none">
              {format(original, product.currency)}
            </span>
          )}
        </div>
      </Link>

      {/* Bouton — séparé par bordure */}
      <div className="border-t border-gray-100/80 mt-auto">
        {product.isAvailable && product.stock > 0 ? (
          <button
            onClick={handleBuy}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#F0F7F4] transition-all duration-150 active:opacity-60 group/btn"
          >
            <ShoppingCart
              className="w-3.5 h-3.5 transition-transform duration-150 group-hover/btn:scale-110"
              style={{ color: BRAND }}
            />
            <span className="text-[11px] font-semibold" style={{ color: BRAND }}>Acheter</span>
          </button>
        ) : (
          <div className="px-3 py-2 flex items-center justify-center">
            <span className="text-[10px] text-gray-300 font-medium">Indisponible</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft,  setCanScrollLeft]  = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const soonestEnd = products
    .filter(p => p.flashSaleEnd)
    .map(p => p.flashSaleEnd as string)
    .sort()[0] ?? null;

  const timer = useCountdown(soonestEnd);

  useEffect(() => {
    api.products.list({ section: "flashsale", limit: "12" } as any)
      .then((res: any) => setProducts((res.data ?? []).map(apiToProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, loading]);

  if (!loading && products.length === 0) return null;

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -210 : 210, behavior: "smooth" });
  }

  return (
    <section className="py-8 sm:py-12" style={{ background: "#FAF7F1" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-4 h-[3px] rounded-full flex-shrink-0" style={{ background: "#D4961E" }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "#D4961E" }}>
                Offres limitées
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                Offres Flash
              </h2>
              {soonestEnd && !timer.expired && (
                <TimerRow timer={timer} />
              )}
            </div>
          </div>
          <Link
            href="/produits?section=flashsale"
            className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap flex-shrink-0 mt-1 transition-colors"
            style={{ color: "#D4961E" }}
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── Scroll row ──────────────────────────────────────────────────── */}
        <div className="relative">

          {canScrollLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-6 pointer-events-none"
              style={{ background: "linear-gradient(to right, #FAF7F1 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("left")}
                aria-label="Défiler à gauche"
                className="pointer-events-auto w-9 h-9 rounded-full bg-white border-[1.5px] border-[#EAE2D2] shadow-card-lg flex items-center justify-center text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-all active:scale-90"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2.5 overflow-x-auto pb-1.5"
            style={{ scrollbarWidth: "none", scrollSnapType: "x mandatory" }}
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ scrollSnapAlign: "start" }}>
                    <FlashCardSkeleton />
                  </div>
                ))
              : products.map(product => (
                  <div key={product.id} style={{ scrollSnapAlign: "start" }}>
                    <FlashDealCard product={product} />
                  </div>
                ))
            }
          </div>

          {canScrollRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-6 pointer-events-none"
              style={{ background: "linear-gradient(to left, #FAF7F1 50%, transparent)" }}
            >
              <button
                onClick={() => scroll("right")}
                aria-label="Défiler à droite"
                className="pointer-events-auto w-9 h-9 rounded-full bg-white border-[1.5px] border-[#EAE2D2] shadow-card-lg flex items-center justify-center text-gray-500 hover:border-orange-300 hover:text-orange-500 transition-all active:scale-90"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
