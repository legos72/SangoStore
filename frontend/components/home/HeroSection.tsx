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
  },
  {
    badge:   "TRANSPORTEURS & KILOS ✦",
    line1:   "Réservez vos kilos",
    line2:   "où que vous soyez",
    sub:     "Les transporteurs publient leurs voyages et les clients réservent leurs kilos facilement.",
    cta:     "Voir les transporteurs",
    href:    "/transporteurs",
    bg:      "/baniereModeAfricain/famBan.png",
  },
  {
    badge:   "LIVRAISON SÉCURISÉE ✦",
    line1:   "Vos colis voyagent",
    line2:   "en toute confiance",
    sub:     "Paiement sécurisé, transporteurs vérifiés et suivi colis en temps réel.",
    cta:     "Suivre mon colis",
    href:    "/suivi",
    bg:      "/images/liv.png",
  },
  {
    badge:   "LIVRAISON MONDIALE ✦",
    line1:   "Achetez partout,",
    line2:   "livré à Bangui",
    sub:     "Mode, électronique, colis, équipements et bien plus encore disponibles sur SangoStore.",
    cta:     "Découvrir les catégories",
    href:    "/produits",
    bg:      "/baniereModeAfricain/bannier11.png",
  },
  {
    badge:   "ENVOI DE COLIS ✦",
    line1:   "Une nouvelle façon",
    line2:   "d'envoyer des colis",
    sub:     "Consultez les voyages disponibles, choisissez votre destination et réservez vos kilos.",
    cta:     "Réserver maintenant",
    href:    "/transporteurs",
    bg:      "/baniereModeAfricain/HomBan.png",
  },
  {
    badge:   "PLATEFORME COMPLÈTE ✦",
    line1:   "Marketplace & transport",
    line2:   "sur une seule plateforme",
    sub:     "Acheteurs, vendeurs et voyageurs connectés dans un écosystème moderne et sécurisé.",
    cta:     "Commencer",
    href:    "/auth/register",
    bg:      "/images/Art1.png",
  },
];

const HERO_BG_IMAGES = [
  { src: "/BaniereHome/livrer.png",    pos: "center center" },
  { src: "/BaniereHome/dirose1.png",   pos: "center 15%" },
  { src: "/BaniereHome/arti.png",      pos: "center center" },
  { src: "/BaniereHome/transport.png", pos: "center center" },
];

export function HeroSection() {
  const [current,  setCurrent]  = useState(0);
  const [bgIdx,    setBgIdx]    = useState(0);
  const [animKey,  setAnimKey]  = useState(0);
  const timer    = useRef<ReturnType<typeof setInterval>>();
  const bgTimer  = useRef<ReturnType<typeof setInterval>>();

  function go(i: number) {
    clearInterval(timer.current);
    setCurrent(i);
    setAnimKey(k => k + 1);
    timer.current = setInterval(() => {
      setCurrent(c => (c + 1) % HERO_SLIDES.length);
      setAnimKey(k => k + 1);
    }, 4800);
  }

  useEffect(() => {
    timer.current = setInterval(() => {
      setCurrent(c => (c + 1) % HERO_SLIDES.length);
      setAnimKey(k => k + 1);
    }, 4800);
    return () => clearInterval(timer.current);
  }, []);

  useEffect(() => {
    bgTimer.current = setInterval(() => setBgIdx(i => (i + 1) % HERO_BG_IMAGES.length), 6000);
    return () => clearInterval(bgTimer.current);
  }, []);

  const s = HERO_SLIDES[current];

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ height: "clamp(300px, 52vw, 500px)" }}
    >
      {/* Fonds rotatifs Ken Burns */}
      {HERO_BG_IMAGES.map((bg, i) => (
        <img
          key={bg.src}
          src={bg.src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity:        i === bgIdx ? 1 : 0,
            transform:      i === bgIdx ? "scale(1.07)" : "scale(1.0)",
            transition:     "opacity 1400ms ease-in-out, transform 9000ms ease-in-out",
            objectPosition: bg.pos,
            willChange:     "transform, opacity",
          }}
          loading={i === 0 ? "eager" : "lazy"}
        />
      ))}

      {/* Overlay principal — gradient profond a gauche */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to right, rgba(4,24,10,0.94) 0%, rgba(4,24,10,0.78) 28%, rgba(4,24,10,0.38) 52%, rgba(4,24,10,0.08) 70%, transparent 85%)",
        }}
      />
      {/* Vignette bas */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.40) 0%, transparent 45%)" }}
      />
      {/* Lueur ambre bas-gauche */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 12% 100%, rgba(212,150,30,0.18) 0%, transparent 50%)" }}
      />

      {/* Contenu texte */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div
          key={animKey}
          className="max-w-[280px] xs:max-w-sm sm:max-w-md lg:max-w-xl py-8 animate-fade-up"
        >
          {/* Badge */}
          <span
            className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold tracking-[0.15em] uppercase px-3 py-1.5 rounded-full mb-4"
            style={{
              background: "rgba(212,150,30,0.15)",
              border: "1px solid rgba(212,150,30,0.4)",
              color: "#E8AE38",
            }}
          >
            {s.badge}
          </span>

          {/* Titre */}
          <h1 className="text-[24px] xs:text-[30px] sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-3">
            {s.line1}
            <br />
            <span style={{
              background: "linear-gradient(135deg, #E8AE38 0%, #D4961E 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {s.line2}
            </span>
          </h1>

          {/* Sous-titre */}
          <p className="hidden xs:block text-white/65 text-xs sm:text-sm lg:text-base mb-6 leading-relaxed max-w-sm">
            {s.sub}
          </p>

          {/* CTA */}
          <Link
            href={s.href}
            className="inline-flex items-center gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm text-white transition-all active:scale-95 hover:brightness-110 touch-manipulation"
            style={{
              background: "linear-gradient(135deg, #D4961E 0%, #B87814 100%)",
              boxShadow: "0 4px 22px rgba(212,150,30,0.50)",
            }}
          >
            {s.cta}
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>

      {/* Dots de navigation */}
      <div className="absolute bottom-4 sm:bottom-5 left-4 sm:left-6 lg:left-8 flex items-center gap-2 z-10">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-400 touch-manipulation"
            style={{
              width:      i === current ? 24 : 7,
              height:     7,
              background: i === current
                ? "linear-gradient(90deg, #D4961E, #E8AE38)"
                : "rgba(255,255,255,0.30)",
              boxShadow:  i === current ? "0 1px 6px rgba(212,150,30,0.5)" : "none",
            }}
          />
        ))}
      </div>
    </div>
  );
}
