"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const HERO_SLIDES = [
  {
    badge:   "DIASPORA & BANGUI ✦",
    line1:   "La diaspora connectée",
    line2:   "à Bangui",
    sub:     "Achetez partout dans le monde et faites livrer vos produits en Centrafrique en toute sécurité.",
    cta:     "Explorer les produits",
    href:    "/produits",
    bg:      "/BaniereHome/livrer.png",
    overlay: "linear-gradient(to right, rgba(4,30,12,0.88) 0%, rgba(4,30,12,0.72) 28%, rgba(4,30,12,0.30) 52%, rgba(4,30,12,0.05) 70%, transparent 85%)",
  },
  {
    badge:   "TRANSPORTEURS & KILOS ✦",
    line1:   "Réservez vos kilos",
    line2:   "où que vous soyez",
    sub:     "Les transporteurs publient leurs voyages et les clients réservent leurs kilos facilement depuis la plateforme.",
    cta:     "Voir les transporteurs",
    href:    "/transporteurs",
    bg:      "/baniereModeAfricain/famBan.png",
    overlay: "linear-gradient(to right, rgba(4,12,24,0.92) 0%, rgba(4,12,24,0.75) 25%, rgba(4,12,24,0.35) 48%, rgba(4,12,24,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "LIVRAISON SÉCURISÉE ✦",
    line1:   "Vos colis voyagent",
    line2:   "en toute confiance",
    sub:     "Paiement sécurisé, transporteurs vérifiés et suivi colis en temps réel.",
    cta:     "Suivre mon colis",
    href:    "/suivi",
    bg:      "/images/liv.png",
    overlay: "linear-gradient(to right, rgba(6,14,8,0.92) 0%, rgba(6,14,8,0.75) 25%, rgba(6,14,8,0.35) 48%, rgba(6,14,8,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "LIVRAISON MONDIALE ✦",
    line1:   "Achetez partout,",
    line2:   "livré à Bangui",
    sub:     "Mode, électronique, colis, équipements et bien plus encore disponibles sur SangoStore.",
    cta:     "Découvrir les catégories",
    href:    "/produits",
    bg:      "/baniereModeAfricain/bannier11.png",
    overlay: "linear-gradient(to right, rgba(18,8,4,0.92) 0%, rgba(18,8,4,0.75) 25%, rgba(18,8,4,0.35) 48%, rgba(18,8,4,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "ENVOI DE COLIS ✦",
    line1:   "Une nouvelle façon",
    line2:   "d'envoyer des colis",
    sub:     "Consultez les voyages disponibles, choisissez votre destination et réservez vos kilos directement en ligne.",
    cta:     "Réserver maintenant",
    href:    "/transporteurs",
    bg:      "/baniereModeAfricain/HomBan.png",
    overlay: "linear-gradient(to right, rgba(8,12,20,0.92) 0%, rgba(8,12,20,0.75) 25%, rgba(8,12,20,0.35) 48%, rgba(8,12,20,0.06) 65%, transparent 80%)",
  },
  {
    badge:   "PLATEFORME COMPLÈTE ✦",
    line1:   "Marketplace & transport",
    line2:   "sur une seule plateforme",
    sub:     "Acheteurs, vendeurs et voyageurs connectés dans un écosystème moderne et sécurisé.",
    cta:     "Commencer",
    href:    "/auth/register",
    bg:      "/images/Art1.png",
    overlay: "linear-gradient(to right, rgba(8,16,10,0.92) 0%, rgba(8,16,10,0.75) 25%, rgba(8,16,10,0.35) 48%, rgba(8,16,10,0.06) 65%, transparent 80%)",
  },
];

const HERO_BG_IMAGES = [
  { src: "/BaniereHome/livrer.png",    pos: "center center" },
  { src: "/BaniereHome/dirose1.png",   pos: "center 15%" },
  { src: "/BaniereHome/arti.png",      pos: "center center" },
  { src: "/BaniereHome/transport.png", pos: "center center" },
];

const BANNER_IMAGES = [
  "/baniereModeAfricain/bannier11.png",
  "/baniereModeAfricain/coupletBan.png",
  "/baniereModeAfricain/FemBan.png",
  "/baniereModeAfricain/HomBan.png",
];

export function HeroSection() {
  const [current,   setCurrent]   = useState(0);
  const [bgIdx,     setBgIdx]     = useState(0);
  const [bannerIdx, setBannerIdx] = useState(0);
  const timer       = useRef<ReturnType<typeof setInterval>>();
  const bgTimer     = useRef<ReturnType<typeof setInterval>>();
  const bannerTimer = useRef<ReturnType<typeof setInterval>>();

  function go(i: number) {
    clearInterval(timer.current);
    setCurrent(i);
    timer.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 4500);
  }

  useEffect(() => {
    timer.current = setInterval(() => setCurrent(c => (c + 1) % HERO_SLIDES.length), 4500);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    bgTimer.current = setInterval(() => setBgIdx(i => (i + 1) % HERO_BG_IMAGES.length), 6000);
    return () => clearInterval(bgTimer.current);
  }, []);

  useEffect(() => {
    bannerTimer.current = setInterval(() => setBannerIdx(i => (i + 1) % BANNER_IMAGES.length), 3200);
    return () => clearInterval(bannerTimer.current);
  }, []);

  const s = HERO_SLIDES[current];

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ height: "clamp(260px, 50vw, 460px)" }}
    >
      {/* Fonds rotatifs — Ken Burns sur l'image active */}
      {HERO_BG_IMAGES.map((bg, i) => (
        <img
          key={bg.src}
          src={bg.src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity:          i === bgIdx ? 1 : 0,
            transform:        i === bgIdx ? "scale(1.06)" : "scale(1.0)",
            transition:       "opacity 1200ms ease-in-out, transform 8000ms ease-in-out",
            objectPosition:   bg.pos,
            willChange:       "transform, opacity",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Overlay premium — profondeur + vignette bas */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to right, rgba(4,30,12,0.92) 0%, rgba(4,30,12,0.75) 25%, rgba(4,30,12,0.32) 50%, rgba(4,30,12,0.05) 68%, transparent 82%)"
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 40%)"
      }} />

      {/* Lueur or — bas gauche */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse at 15% 95%, rgba(212,150,30,0.14) 0%, transparent 45%)"
      }} />

      {/* Contenu — texte gauche + mini cadre droit */}
      <div className="relative z-10 h-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-8">

        {/* Texte slider */}
        <div className="max-w-[260px] xs:max-w-xs sm:max-w-sm lg:max-w-md py-8 sm:py-10">
          <span
            className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold tracking-widest uppercase px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4"
            style={{ background: "rgba(212,150,30,0.15)", border: "1px solid rgba(212,150,30,0.35)", color: "#D4961E" }}
          >
            {s.badge}
          </span>

          <h1 className="text-[22px] xs:text-[26px] sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-2 sm:mb-3">
            {s.line1}<br />
            <span style={{ color: "#D4961E" }}>{s.line2}</span>
          </h1>

          <p className="hidden xs:block text-white/65 text-xs sm:text-sm lg:text-base mb-5 sm:mb-7 leading-relaxed">
            {s.sub}
          </p>

          <Link
            href={s.href}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-95 hover:brightness-110 touch-manipulation"
            style={{ background: "#D4961E", boxShadow: "0 4px 18px rgba(212,150,30,0.45)" }}
          >
            {s.cta} <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

      </div>

      {/* Dots slider texte */}
      <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 lg:left-8 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-300 touch-manipulation"
            style={{
              width:      i === current ? 20 : 7,
              height:     7,
              background: i === current ? "#D4961E" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
