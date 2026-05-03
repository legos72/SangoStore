"use client";

import { useState, useRef } from "react";
import {
  CheckCircle, Truck, Package, MapPin, Home, Globe, User,
  ChevronRight, Phone, MessageCircle, Star, ChevronDown, ChevronUp,
  Calendar, Plane, X, Info,
} from "lucide-react";
import type { Trip, Transporter, Country } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useDelivery } from "@/contexts/DeliveryContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export interface TransportInfo {
  mode: string; emoji: string; delay: string; color: string;
}

export function getTransportInfo(countryCode: string): TransportInfo {
  const map: Record<string, TransportInfo> = {
    FR: { mode: "Aérien",         emoji: "✈️", delay: "3–4 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"       },
    DE: { mode: "Aérien",         emoji: "✈️", delay: "4–6 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"       },
    BE: { mode: "Aérien",         emoji: "✈️", delay: "4–5 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"       },
    GB: { mode: "Aérien",         emoji: "✈️", delay: "4–5 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"       },
    SN: { mode: "Aérien / Route", emoji: "✈️", delay: "3–5 semaines", color: "bg-violet-50 border-violet-200 text-violet-700" },
    CM: { mode: "Terrestre",      emoji: "🚛", delay: "10–15 jours",  color: "bg-amber-50 border-amber-200 text-amber-700"  },
    CI: { mode: "Terrestre",      emoji: "🚛", delay: "2–3 semaines", color: "bg-amber-50 border-amber-200 text-amber-700"  },
    MA: { mode: "Aérien",         emoji: "✈️", delay: "3–5 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"       },
  };
  return map[countryCode] ?? { mode: "Aérien", emoji: "✈️", delay: "3–6 semaines", color: "bg-sky-50 border-sky-200 text-sky-700" };
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function daysBetween(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24));
}

// ─── TransporterGroupCard ─────────────────────────────────────────────────────

function TransporterGroupCard({
  transporter, trips, selectedTripId, onSelect,
}: {
  transporter: Transporter;
  trips: Trip[];
  selectedTripId: string | null;
  onSelect: (trip: Trip) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isAnySelected = trips.some((t) => t.id === selectedTripId);

  return (
    <div className={cn("rounded-2xl border-2 transition-all", isAnySelected ? "border-orange-400 shadow-md" : "border-gray-100")}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 sm:p-5 text-left">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-extrabold text-orange-600 text-lg flex-shrink-0">
            {transporter.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-gray-900">{transporter.companyName}</span>
              {transporter.isVerified && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-2.5 h-2.5" /> Vérifié
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{transporter.rating}</span>
              <span className="text-xs text-gray-400">({transporter.reviewCount} avis)</span>
              <span className="text-gray-300 mx-1">·</span>
              <span className="text-xs text-gray-500">{trips.length} trajet{trips.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {transporter.contact.whatsapp && (
              <a href={`https://wa.me/${transporter.contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            <a href={`tel:${transporter.contact.phone}`} onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Phone className="w-3.5 h-3.5" /> Appel
            </a>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2.5 border-t border-gray-50 pt-3">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-3">Sélectionner un voyage</p>
          {trips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            const duration = trip.arrivalDate ? daysBetween(trip.departureDate, trip.arrivalDate) : null;
            return (
              <button key={trip.id} onClick={() => onSelect(trip)}
                className={cn("w-full text-left rounded-xl border-2 p-3 sm:p-4 transition-all",
                  isSelected ? "border-orange-400 bg-orange-50" : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/40")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{trip.originCountry.flag}</span>
                      <div className="flex-1 h-px bg-orange-300 relative max-w-[40px]">
                        <Truck className="w-3.5 h-3.5 text-orange-400 absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white" />
                      </div>
                      <span className="text-base">🇨🇫</span>
                      <span className="text-xs text-gray-500 font-medium">Bangui</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-5 text-xs">
                      <div>
                        <p className="text-gray-400 font-medium">Départ</p>
                        <p className="font-bold text-gray-800">{fmtShort(trip.departureDate)}</p>
                      </div>
                      {trip.arrivalDate && (
                        <>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                          <div>
                            <p className="text-gray-400 font-medium">Arrivée estimée</p>
                            <p className="font-bold text-orange-600">{fmtShort(trip.arrivalDate)}</p>
                          </div>
                          {duration && <div className="hidden sm:block"><p className="text-gray-400 font-medium">Durée</p><p className="font-semibold text-gray-700">{duration} jours</p></div>}
                        </>
                      )}
                    </div>
                    {trip.description && <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1">{trip.description}</p>}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-sm text-gray-900">
                      {formatPrice(trip.pricePerKg, trip.currency)}<span className="font-normal text-gray-400">/kg</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{trip.availableCapacity} kg dispo</div>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Choisi
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          <div className="flex sm:hidden items-center gap-2 pt-1">
            {transporter.contact.whatsapp && (
              <a href={`https://wa.me/${transporter.contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-lg">
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            <a href={`tel:${transporter.contact.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg">
              <Phone className="w-3.5 h-3.5" /> Appeler
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DeliverySection ──────────────────────────────────────────────────────────

export interface DeliverySectionProps {
  /** Trajets disponibles pour la sélection de transporteur */
  availableTrips: Trip[];
  transporterGroups: { transporter: Transporter; trips: Trip[] }[];
  /** Le trajet le moins cher (mode Standard auto) */
  standardTrip: Trip | null;
  /** Pour le label "Livraison locale en …" */
  originCountry?: Country;
  /** Coût livraison domicile Bangui */
  localDeliveryCostXAF?: number;
  /** Afficher la modal de validation (destination non choisie) */
  showValidation: boolean;
  onValidationClose: () => void;
}

export function DeliverySection({
  availableTrips,
  transporterGroups,
  standardTrip,
  originCountry,
  localDeliveryCostXAF = 2500,
  showValidation,
  onValidationClose,
}: DeliverySectionProps) {
  const {
    deliveryDestination, setDeliveryDestination,
    banguiMode, setBanguiMode,
    receptionMode, setReceptionMode,
    selectedTrip, setSelectedTrip,
    localAddress, setLocalAddress,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    customerBanguiAddress, setCustomerBanguiAddress,
  } = useDelivery();

  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  const [showTripConfirm, setShowTripConfirm] = useState(false);
  const [highlighted, setHighlighted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const transport = getTransportInfo(originCountry?.code ?? selectedTrip?.originCountry.code ?? "");

  function handleSelectDestination(dest: "local" | "bangui") {
    setDeliveryDestination(dest);
    if (dest === "local") {
      setSelectedTrip(null);
      setReceptionMode(null);
      setBanguiMode(null);
    }
  }

  function handleTripSelect(trip: Trip) {
    setPendingTrip(trip);
    setShowTripConfirm(true);
  }

  function handleTripConfirm() {
    if (pendingTrip) setSelectedTrip(pendingTrip);
    setPendingTrip(null);
    setShowTripConfirm(false);
  }

  function handleValidationClose() {
    onValidationClose();
    setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlighted(true);
      setTimeout(() => setHighlighted(false), 2000);
    }, 100);
  }

  return (
    <>
      <div
        ref={sectionRef}
        className={cn(
          "space-y-3 rounded-2xl p-1 transition-all duration-700",
          highlighted && "ring-2 ring-orange-400 ring-offset-4 bg-orange-50/40"
        )}
      >
        {/* Titre */}
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
          <Globe className="w-3.5 h-3.5" /> Choisissez votre destination
        </p>

        {/* ── Cartes destination ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSelectDestination("local")}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2",
              deliveryDestination === "local"
                ? "border-green-400 bg-green-50 shadow-sm"
                : "border-gray-200 hover:border-green-300 hover:bg-green-50/40"
            )}
          >
            <span className="text-2xl">{originCountry?.flag ?? "🌍"}</span>
            <div>
              <p className="font-bold text-sm text-gray-900">Livraison locale</p>
              <p className="text-xs text-gray-500 mt-0.5">{originCountry?.name ?? "Pays d'origine"}</p>
            </div>
            {deliveryDestination === "local" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                <CheckCircle className="w-2.5 h-2.5" /> Sélectionné
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Tap pour choisir</span>
            )}
          </button>

          <button
            onClick={() => handleSelectDestination("bangui")}
            className={cn(
              "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2",
              deliveryDestination === "bangui"
                ? "border-orange-400 bg-orange-50 shadow-sm"
                : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
            )}
          >
            <span className="text-2xl">🇨🇫</span>
            <div>
              <p className="font-bold text-sm text-gray-900">Bangui, RCA</p>
              <p className="text-xs text-gray-500 mt-0.5">Via réseau GP</p>
            </div>
            {deliveryDestination === "bangui" ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                <CheckCircle className="w-2.5 h-2.5" /> Sélectionné
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-medium">Tap pour choisir</span>
            )}
          </button>
        </div>

        {/* ── MODE LOCAL ── */}
        {deliveryDestination === "local" && (
          <div className="animate-fade-in">
            <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="font-bold text-sm text-green-800">
                  Livraison en {originCountry?.name ?? "pays d'origine"}
                </span>
              </div>
              <p className="text-xs text-green-700 mb-3 leading-relaxed">
                Ce produit est disponible localement. Le vendeur vous livrera directement sans transporteur GP.
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Votre adresse de livraison</label>
                <input
                  type="text"
                  value={localAddress}
                  onChange={(e) => setLocalAddress(e.target.value)}
                  placeholder={`Votre adresse en ${originCountry?.name ?? "pays d'origine"}...`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── MODE BANGUI ── */}
        {deliveryDestination === "bangui" && (
          <div className="space-y-3 animate-fade-in">

            {/* Sous-options Standard vs GP */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-0.5">Mode d&apos;expédition</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setBanguiMode("standard"); setSelectedTrip(null); }}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-1.5",
                  banguiMode === "standard" ? "border-orange-400 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <Package className="w-5 h-5 text-orange-500" />
                  <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Recommandé</span>
                </div>
                <p className="font-bold text-sm text-gray-900">Standard</p>
                <p className="text-xs text-gray-500">Géré par le vendeur</p>
                {banguiMode === "standard" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle className="w-2.5 h-2.5" /> Actif
                  </span>
                )}
              </button>
              <button
                onClick={() => setBanguiMode("advanced")}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-1.5",
                  banguiMode === "advanced" ? "border-orange-400 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                )}
              >
                <Truck className="w-5 h-5 text-orange-500" />
                <p className="font-bold text-sm text-gray-900">Transporteur GP</p>
                <p className="text-xs text-gray-500">Choisir un GP</p>
                {banguiMode === "advanced" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle className="w-2.5 h-2.5" /> Actif
                  </span>
                )}
              </button>
            </div>

            {/* Standard : info auto */}
            {banguiMode === "standard" && (
              <div className="animate-fade-in">
                {standardTrip ? (
                  <div className={cn("rounded-2xl border p-4", transport.color)}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{transport.emoji}</span>
                      <span className="font-bold text-sm">Expédition vers Bangui</span>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide opacity-70">{transport.mode}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex flex-col items-center">
                        <span className="text-xl">{standardTrip.originCountry.flag}</span>
                        <span className="text-[10px] font-semibold mt-0.5">{standardTrip.originCountry.name}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center">
                        <div className="w-full h-px border-t-2 border-dashed border-current opacity-40 relative">
                          <Plane className="w-3.5 h-3.5 absolute left-1/2 -top-2 -translate-x-1/2 opacity-70" />
                        </div>
                        <span className="text-[10px] mt-1 opacity-60 font-medium">→ Bangui</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-xl">🇨🇫</span>
                        <span className="text-[10px] font-semibold mt-0.5">Bangui</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/60 rounded-xl px-3 py-2">
                        <p className="opacity-60 font-medium mb-0.5">Délai</p>
                        <p className="font-bold">{transport.delay}</p>
                      </div>
                      <div className="bg-white/60 rounded-xl px-3 py-2">
                        <p className="opacity-60 font-medium mb-0.5">Prix/kg</p>
                        <p className="font-bold">{formatPrice(standardTrip.pricePerKg, standardTrip.currency)}</p>
                      </div>
                    </div>
                    {standardTrip.arrivalDate && (
                      <div className="mt-3 flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-semibold">
                          Arrivée estimée : <strong>{fmtDate(standardTrip.arrivalDate)}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-sm text-amber-700 font-semibold mb-1">Livraison standard indisponible</p>
                    <p className="text-xs text-amber-600 mb-2">Aucun transporteur actif pour le moment.</p>
                    <button onClick={() => setBanguiMode("advanced")} className="text-xs text-orange-600 font-bold underline">
                      Voir les transporteurs disponibles →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Advanced : sélection GP */}
            {banguiMode === "advanced" && (
              <div className="animate-fade-in space-y-3">
                {!selectedTrip ? (
                  <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-5 text-center">
                    <Truck className="w-8 h-8 text-orange-300 mx-auto mb-2.5" />
                    <p className="text-sm font-bold text-gray-800">Choisissez votre transporteur</p>
                    <p className="text-xs text-gray-400 mt-1 mb-3">Sélectionnez un trajet dans la liste ci-dessous</p>
                  </div>
                ) : (
                  <div className={cn("rounded-2xl border p-4", transport.color)}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base">{transport.emoji}</span>
                      <span className="font-bold text-sm">GP sélectionné</span>
                      <button onClick={() => setSelectedTrip(null)} className="ml-auto text-[11px] opacity-70 hover:opacity-100 underline">
                        Changer
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                      <div className="bg-white/60 rounded-xl px-3 py-2 col-span-2">
                        <p className="opacity-60 font-medium mb-0.5">Transporteur</p>
                        <p className="font-bold">{selectedTrip.transporter.companyName}</p>
                      </div>
                      <div className="bg-white/60 rounded-xl px-3 py-2">
                        <p className="opacity-60 font-medium mb-0.5">Départ</p>
                        <p className="font-bold">{fmtShort(selectedTrip.departureDate)}</p>
                      </div>
                      <div className="bg-white/60 rounded-xl px-3 py-2">
                        <p className="opacity-60 font-medium mb-0.5">Prix/kg</p>
                        <p className="font-bold">{formatPrice(selectedTrip.pricePerKg, selectedTrip.currency)}</p>
                      </div>
                    </div>
                    {selectedTrip.arrivalDate && (
                      <div className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-xs font-semibold">Arrivée estimée : <strong>{fmtDate(selectedTrip.arrivalDate)}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Liste transporteurs */}
                {transporterGroups.length > 0 && (
                  <div className="space-y-3" id="transporters-section">
                    <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-widest">Transporteurs disponibles</p>
                    {transporterGroups.map(({ transporter, trips }) => (
                      <TransporterGroupCard
                        key={transporter.id}
                        transporter={transporter}
                        trips={trips}
                        selectedTripId={selectedTrip?.id ?? null}
                        onSelect={handleTripSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Infos client + Mode réception — commun Standard + Advanced */}
            {banguiMode !== null && (banguiMode === "advanced" || standardTrip !== null) && (
              <>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Vos informations
                  </p>
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom complet</label>
                      <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Votre nom et prénom"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Téléphone</label>
                      <input type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+236 75 00 00 00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-300" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse à Bangui</label>
                      <input type="text" value={customerBanguiAddress} onChange={(e) => setCustomerBanguiAddress(e.target.value)}
                        placeholder="Quartier, rue, repère..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-300" />
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                    <MapPin className="w-3.5 h-3.5" /> Mode de réception à Bangui
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setReceptionMode("pickup")}
                      className={cn("rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2",
                        receptionMode === "pickup" ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40")}>
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">Point relais</p>
                        <p className="text-xs text-green-600 font-semibold mt-0.5">Gratuit</p>
                      </div>
                      {receptionMode === "pickup" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle className="w-2.5 h-2.5" /> Choisi
                        </span>
                      )}
                    </button>
                    <button onClick={() => setReceptionMode("home")}
                      className={cn("rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2",
                        receptionMode === "home" ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40")}>
                      <Home className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-bold text-sm text-gray-900">Domicile</p>
                        <p className="text-xs text-orange-600 font-semibold mt-0.5">+{formatPrice(localDeliveryCostXAF, "XAF")}</p>
                      </div>
                      {receptionMode === "home" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
                          <CheckCircle className="w-2.5 h-2.5" /> Choisi
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Modal confirmation voyage GP ── */}
      {showTripConfirm && pendingTrip && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setPendingTrip(null); setShowTripConfirm(false); }} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-fade-in">
            <button onClick={() => { setPendingTrip(null); setShowTripConfirm(false); }}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-extrabold text-orange-600 text-lg flex-shrink-0">
                {pendingTrip.transporter.companyName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Confirmer le transporteur</p>
                <p className="font-extrabold text-gray-900">{pendingTrip.transporter.companyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-xl">{pendingTrip.originCountry.flag}</span>
              <div className="flex-1 h-px border-t-2 border-dashed border-gray-300 relative">
                <Plane className="w-3.5 h-3.5 text-gray-400 absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-50" />
              </div>
              <span className="text-xl">🇨🇫</span>
              <div className="text-xs text-gray-500">
                <p className="font-semibold text-gray-700">{fmtShort(pendingTrip.departureDate)}</p>
                {pendingTrip.arrivalDate && <p className="text-orange-600 font-semibold">→ {fmtShort(pendingTrip.arrivalDate)}</p>}
              </div>
            </div>
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-orange-400" /> Tarif GP
                </span>
                <span className="font-bold text-gray-900">{formatPrice(pendingTrip.pricePerKg, pendingTrip.currency)}/kg</span>
              </div>
              <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-2">
                <span className="font-bold text-gray-900">Disponibilité</span>
                <span className="font-extrabold text-orange-600">{pendingTrip.availableCapacity} kg disponibles</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setPendingTrip(null); setShowTripConfirm(false); }}
                className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button onClick={handleTripConfirm}
                className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors">
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de validation ── */}
      {showValidation && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleValidationClose} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-fade-in">
            <button onClick={handleValidationClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">Veuillez choisir votre mode de livraison</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Complétez les options de livraison avant de finaliser votre commande.
              </p>
              {!deliveryDestination && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Choisissez votre destination
                </p>
              )}
              {deliveryDestination === "bangui" && !banguiMode && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Choisissez Standard ou Transporteur GP
                </p>
              )}
              {deliveryDestination === "bangui" && banguiMode === "advanced" && !selectedTrip && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Sélectionnez un transporteur GP
                </p>
              )}
              {deliveryDestination === "bangui" && banguiMode !== null && !receptionMode && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Choisissez point relais ou domicile
                </p>
              )}
            </div>
            <button onClick={handleValidationClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm">
              Choisir la livraison
            </button>
          </div>
        </div>
      )}
    </>
  );
}
