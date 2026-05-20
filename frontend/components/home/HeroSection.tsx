"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight, ArrowRight } from "lucide-react";

const HERO_SLIDES = [
  {
    badge:    "DIASPORA & BANGUI ✦",
    line1:    "La diaspora connectée",
    line2:    "à Bangui",
    sub:      "Achetez partout dans le monde et faites livrer vos produits en Centrafrique en toute sécurité.",
    cta:      "Explorer les produits",
    ctaAlt:   "Voir les transporteurs",
    href:     "/produits",
    hrefAlt:  "/transporteurs",
    bg:       "/BaniereHome/livrer.png",
  },
  {
    badge:    "TRANSPORTEURS & KILOS ✦",
    line1:    "Réservez vos kilos",
    line2:    "où que vous soyez",
    sub:      "Les transporteurs publient leurs voyages et les clients réservent leurs kilos facilement.",
    cta:      "Voir les transporteurs",
    ctaAlt:   "Suivre mon colis",
    href:     "/transporteurs",
    hrefAlt:  "/suivi",
    bg:       "/baniereModeAfricain/famBan.png",
  },
  {
    badge:    "LIVRAISON SÉCURISÉE ✦",
    line1:    "Vos colis voyagent",
    line2:    "en toute confiance",
    sub:      "Paiement sécurisé, transporteurs vérifiés et suivi colis en temps réel.",
    cta:      "Suivre mon colis",
    ctaAlt:   "Découvrir la plateforme",
    href:     "/suivi",
    hrefAlt:  "/comment-ca-marche",
    bg:       "/images/liv.png",
  },
  {
    badge:    "MARKETPLACE AFRICAINE ✦",
    line1:    "Achetez partout,",
    line2:    "livré à Bangui",
    sub:      "Mode, électronique, colis, équipements et bien plus encore disponibles sur SangoStore.",
    cta:      "Découvrir les catégories",
    ctaAlt:   "Créer un compte",
    href:     "/produits",
    hrefAlt:  "/auth/register",
    bg:       "/baniereModeAfricain/bannier11.png",
  },
  {
    badge:    "ENVOI DE COLIS ✦",
    line1:    "Une nouvelle façon",
    line2:    "d'envoyer des colis",
    sub:      "Consultez les voyages disponibles, choisissez votre destination et réservez vos kilos.",
    cta:      "Réserver maintenant",
    ctaAlt:   "Voir les produits",
    href:     "/transporteurs",
    hrefAlt:  "/produits",
    bg:       "/baniereModeAfricain/HomBan.png",
  },
];

const BG_IMAGES = [
  { src: "/BaniereHome/livrer.png",    pos: "center center" },
  { src: "/BaniereHome/dirose1.png",   pos: "center 15%"    },
  { src: "/BaniereHome/arti.png",      pos: "center center" },
  { src: "/BaniereHome/transport.png", pos: "center center" },
];

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [bgIdx,   setBgIdx]   = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timer   = useRef<ReturnType<typeof setInterval>>();
  const bgTimer = useRef<ReturnType<typeof setInterval>>();

  function go(i: number) {
    clearInterval(timer.current);
    setCurrent(i);
    setAnimKey(k => k + 1);
    timer.current = setInterval(() => {
      setCurrent(c => (c + 1) % HERO_SLIDES.length);
      setAnimKey(k => k + 1);
    }, 5200);
  }

  useEffect(() => {
    timer.current = setInterval(() => {
      setCurrent(c => (c + 1) % HERO_SLIDES.length);
      setAnimKey(k => k + 1);
    }, 5200);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    bgTimer.current = setInterval(() => setBgIdx(i => (i + 1) % BG_IMAGES.length), 6500);
    return () => clearInterval(bgTimer.current);
  }, []);

  const s = HERO_SLIDES[current];

  return (
    <div
      className="relative overflow-hidden w-full rounded-xl"
      style={{ height: "clamp(280px, 50vw, 480px)" }}
    >
      {/* ── Background images (Ken Burns) ── */}
      {BG_IMAGES.map((bg, i) => (
        <img
          key={bg.src}
          src={bg.src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity:        i === bgIdx ? 1 : 0,
            transform:      i === bgIdx ? "scale(1.06)" : "scale(1.0)",
            transition:     "opacity 1600ms cubic-bezier(0.4,0,0.2,1), transform 9000ms ease-out",
            objectPosition: bg.pos,
            willChange:     "transform, opacity",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* ── Overlays ── */}
      {/* Main dark gradient left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to right, rgba(5,20,12,0.95) 0%, rgba(5,20,12,0.82) 25%, rgba(5,20,12,0.45) 50%, rgba(5,20,12,0.12) 70%, transparent 85%)",
        }}
      />
      {/* Bottom vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,.50) 0%, transparent 40%)" }}
      />
      {/* Gold glow bottom-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 8% 105%, rgba(200,133,10,.20) 0%, transparent 48%)" }}
      />
      {/* Top-left corner accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 0% 0%, rgba(27,58,45,.25) 0%, transparent 35%)" }}
      />

      {/* ── Text content ── */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div
          key={animKey}
          className="max-w-[280px] xs:max-w-sm sm:max-w-md lg:max-w-xl py-8 animate-fade-up"
        >
          {/* Badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold tracking-[0.16em] uppercase px-3.5 py-1.5 rounded-full mb-4"
            style={{
              background: "rgba(200,133,10,.13)",
              border: "1px solid rgba(200,133,10,.38)",
              color: "#E8AE38",
              backdropFilter: "blur(8px)",
            }}
          >
            {s.badge}
          </span>

          {/* Headline */}
          <h1 className="text-[22px] xs:text-[28px] sm:text-[36px] lg:text-[46px] font-black text-white leading-[1.1] tracking-tight mb-3">
            {s.line1}
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #F0C04A 0%, #D4961E 55%, #B87814 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {s.line2}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hidden xs:block text-white/60 text-xs sm:text-sm lg:text-[15px] mb-7 leading-relaxed max-w-xs sm:max-w-sm">
            {s.sub}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={s.href}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 touch-manipulation"
              style={{
                background: "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
                color: "#fff",
                boxShadow: "0 4px 24px rgba(200,133,10,.50), 0 1px 4px rgba(0,0,0,.2)",
              }}
            >
              {s.cta}
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
            <Link
              href={s.hrefAlt}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all text-white/80 hover:text-white active:scale-95 touch-manipulation"
              style={{ border: "1.5px solid rgba(255,255,255,.20)", backdropFilter: "blur(8px)" }}
            >
              {s.ctaAlt}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Slide indicators ── */}
      <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 lg:left-7 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-400 touch-manipulation"
            style={{
              width:      i === current ? 28 : 7,
              height:     7,
              background: i === current
                ? "linear-gradient(90deg, #D4961E, #F0C04A)"
                : "rgba(255,255,255,.28)",
              boxShadow:  i === current ? "0 1px 8px rgba(200,133,10,.55)" : "none",
            }}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10">
        <div
          key={`progress-${animKey}`}
          className="h-full"
          style={{
            background: "linear-gradient(90deg, #D4961E, #F0C04A)",
            animation: "heroProgress 5.2s linear forwards",
          }}
        />
      </div>

      <style>{`
        @keyframes heroProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
