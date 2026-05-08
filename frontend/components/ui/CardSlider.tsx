"use client";

import { useRef, useState, useCallback, useEffect, Children } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardSliderProps {
  children: React.ReactNode;
  cardWidth: string;        // Tailwind class e.g. "w-40 sm:w-52"
  gap?: string;             // Tailwind class e.g. "gap-3 sm:gap-4"
  className?: string;
  fadeColor?: string;       // CSS colour matching the section background
  paddingX?: string;        // Tailwind class for left/right padding on track
}

export function CardSlider({
  children,
  cardWidth,
  gap = "gap-3 sm:gap-4",
  className,
  fadeColor = "white",
  paddingX = "px-1",
}: CardSliderProps) {
  const trackRef  = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    requestAnimationFrame(sync);
    el.addEventListener("scroll", sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  function scroll(dir: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? el.clientWidth * 0.8 : -el.clientWidth * 0.8, behavior: "smooth" });
  }

  const items = Children.toArray(children);

  return (
    <div className={cn("relative", className)}>

      {/* ── Left fade + arrow ─────────────────────────────────────────── */}
      <div
        className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none hidden sm:block transition-opacity duration-200"
        style={{
          background: `linear-gradient(to right, ${fadeColor} 0%, transparent 100%)`,
          opacity: canLeft ? 1 : 0,
        }}
      />
      <button
        onClick={() => scroll("left")}
        aria-label="Précédent"
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 z-20",
          "w-9 h-9 rounded-full bg-white shadow-md border border-gray-200",
          "hidden sm:flex items-center justify-center",
          "hover:bg-orange-50 hover:border-orange-300 hover:shadow-lg active:scale-90 transition-all duration-150",
          !canLeft && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>

      {/* ── Scroll track ──────────────────────────────────────────────── */}
      <div
        ref={trackRef}
        className={cn("flex flex-nowrap overflow-x-auto", gap, paddingX)}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
        } as React.CSSProperties}
      >
        {items.map((item, i) => (
          <div
            key={i}
            className={cn("flex-shrink-0", cardWidth)}
            style={{ scrollSnapAlign: "start" }}
          >
            {item}
          </div>
        ))}
      </div>

      {/* ── Right fade + arrow ────────────────────────────────────────── */}
      <div
        className="absolute right-0 top-0 bottom-0 w-14 z-10 pointer-events-none hidden sm:block transition-opacity duration-200"
        style={{
          background: `linear-gradient(to left, ${fadeColor} 0%, transparent 100%)`,
          opacity: canRight ? 1 : 0,
        }}
      />
      <button
        onClick={() => scroll("right")}
        aria-label="Suivant"
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 z-20",
          "w-9 h-9 rounded-full bg-white shadow-md border border-gray-200",
          "hidden sm:flex items-center justify-center",
          "hover:bg-orange-50 hover:border-orange-300 hover:shadow-lg active:scale-90 transition-all duration-150",
          !canRight && "opacity-0 pointer-events-none"
        )}
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>

    </div>
  );
}
