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

const FOREST = "#1B3A2D";
const GOLD   = "#C8850A";

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

// ─── Timer block ──────────────────────────────────────────────────────────────

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="min-w-[28px] h-7 px-1.5 rounded-lg text-white text-[11px] font-extrabold flex items-center justify-center tabular-nums leading-none"
        style={{ background: "#0A1410" }}
      >
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-[7px] text-gray-400 uppercase tracking-wide font-semibold">{label}</span>
    </div>
  );
}

function TimerRow({ timer }: { timer: { h: number; m: number; s: number; expired: boolean } }) {
  const days  = Math.floor(timer.h / 24);
  const hours = timer.h % 24;
  const sep   = <span className="text-xs font-bold text-gray-400 pb-4">:</span>;
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[9px] uppercase tracking-wide font-semibold text-gray-400 mr-0.5 whitespace-nowrap">
        Fin dans
      </span>
      {days > 0 && <><TimeBlock value={days} label="j" />{sep}</>}
      <TimeBlock value={hours} label="h" />
      {sep}
      <TimeBlock value={timer.m} label="min" />
      {sep}
      <TimeBlock value={timer.s} label="sec" />
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function FlashCardSkeleton() {
  return (
    <div
      className="flex-shrink-0 flex flex-col rounded-2xl overflow-hidden bg-[#FDFCF9] border border-[#EDE6DA]"
      style={{ width: "clamp(156px, 43vw, 196px)" }}
    >
      <div className="aspect-square shimmer-bg flex-shrink-0" />
      <div className="px-3 pt-2.5 pb-3 space-y-2">
        <div className="shimmer-bg rounded-full h-2 w-12" />
        <div className="shimmer-bg rounded-full h-3 w-full" />
        <div className="shimmer-bg rounded-full h-3 w-2/3" />
        <div className="shimmer-bg rounded-full h-4 w-16 mt-1" />
      </div>
      <div className="border-t border-[#EDE6DA] px-3 py-2.5">
        <div className="shimmer-bg rounded-xl h-8 w-full" />
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
    e.preventDefault(); e.stopPropagation();
    addItem(product);
    router.push("/panier");
  }

  const imgFallback = (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F0EBE3]">
      <Package className="w-7 h-7 text-[#C8A87A]" />
    </div>
  );

  return (
    <div
      className="group flex-shrink-0 flex flex-col rounded-2xl overflow-hidden bg-[#FDFCF9] border border-[#EDE6DA] hover:border-amber-200/80 hover:shadow-[0_8px_28px_rgba(15,10,3,.10)] hover:-translate-y-0.5 transition-all duration-300"
      style={{ width: "clamp(156px, 43vw, 196px)" }}
    >
      {/* Image */}
      <Link href={`/produits/${product.id}`} className="relative aspect-square overflow-hidden flex-shrink-0 bg-[#F5F0E8] block">
        {!imgLoaded && !imgError && imgSrc && (
          <div className="absolute inset-0 shimmer-bg" />
        )}
        {imgError || !imgSrc ? imgFallback : (
          <img
            src={imgSrc}
            alt={product.title}
            onError={() => setImgError(true)}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover product-img ${imgLoaded ? "opacity-100" : "opacity-0"}`}
            loading="lazy"
          />
        )}
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Promo badge */}
        {pct != null && (
          <span
            className="absolute top-2.5 left-2.5 z-20 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full leading-tight"
            style={{ background: "linear-gradient(135deg, #16A34A, #15803D)", boxShadow: "0 2px 6px rgba(22,163,74,.30)" }}
          >
            -{pct}%
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(l => !l); }}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center bg-white/95 shadow-[0_1px_6px_rgba(0,0,0,.12)] transition-all duration-150 active:scale-90 opacity-0 group-hover:opacity-100"
          aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
      </Link>

      {/* Content */}
      <Link href={`/produits/${product.id}`} className="flex flex-col px-3 pt-2.5 pb-2 flex-1">
        <div className="flex items-center gap-1 mb-1.5">
          <FlagImage code={product.originCountry?.code ?? ""} size="sm" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider truncate">
            {product.category}
          </span>
        </div>

        <h3
          className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#1B3A2D] transition-colors duration-150"
          style={{ minHeight: "2.8em" }}
        >
          {product.title}
        </h3>

        <div className="flex items-baseline gap-1.5 flex-wrap mt-1.5">
          <span className="text-[14px] font-extrabold leading-none whitespace-nowrap" style={{ color: GOLD }}>
            {format(display, product.currency)}
          </span>
          {original != null && (
            <span className="text-[10px] text-gray-400 line-through leading-none">
              {format(original, product.currency)}
            </span>
          )}
        </div>
      </Link>

      {/* CTA */}
      <div className="border-t border-[#EEE8DF] mt-auto">
        {product.isAvailable && product.stock > 0 ? (
          <button
            onClick={handleBuy}
            className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#EEF5F1] transition-all duration-150 active:opacity-60 group/btn"
          >
            <ShoppingCart
              className="w-3.5 h-3.5 text-[#1B3A2D] transition-transform duration-150 group-hover/btn:scale-110"
            />
            <span className="text-[11px] font-bold" style={{ color: FOREST }}>Acheter</span>
          </button>
        ) : (
          <div className="px-3 py-2.5 flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-medium">Indisponible</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Scroll arrow button ──────────────────────────────────────────────────────

function ArrowBtn({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  const Icon = dir === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      aria-label={dir === "left" ? "Défiler à gauche" : "Défiler à droite"}
      className="pointer-events-auto w-9 h-9 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-[#1B3A2D] transition-all duration-150 active:scale-90"
      style={{ boxShadow: "0 2px 12px rgba(0,0,0,.12), 0 0 0 1px rgba(0,0,0,.06)" }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export function FlashSaleSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
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
    <section className="py-8 sm:py-12" style={{ background: "#F5F2EC" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-block w-5 h-[2.5px] rounded-full flex-shrink-0"
                style={{ background: "linear-gradient(90deg, #C8850A, #E0A320)" }}
              />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.15em]" style={{ color: "#C8850A" }}>
                Offres limitées
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #C8850A, #E0A320)" }}
                >
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Offres Flash
                </h2>
              </div>
              {soonestEnd && !timer.expired && (
                <TimerRow timer={timer} />
              )}
            </div>
          </div>
          <Link
            href="/produits?section=flashsale"
            className="flex items-center gap-1 text-sm font-semibold whitespace-nowrap flex-shrink-0 mt-1 hover:opacity-75 transition-opacity"
            style={{ color: "#C8850A" }}
          >
            Voir tout <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Scroll row */}
        <div className="relative">
          {canLeft && (
            <div
              className="hidden sm:flex absolute left-0 top-0 bottom-2 z-10 items-center pr-6 pointer-events-none"
              style={{ background: "linear-gradient(to right, #F5F2EC 45%, transparent)" }}
            >
              <ArrowBtn dir="left" onClick={() => scroll("left")} />
            </div>
          )}

          <div
            ref={scrollRef}
            className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-none"
            style={{ scrollSnapType: "x mandatory" }}
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

          {canRight && (
            <div
              className="hidden sm:flex absolute right-0 top-0 bottom-2 z-10 items-center justify-end pl-6 pointer-events-none"
              style={{ background: "linear-gradient(to left, #F5F2EC 45%, transparent)" }}
            >
              <ArrowBtn dir="right" onClick={() => scroll("right")} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
