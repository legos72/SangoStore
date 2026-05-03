"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Star, CheckCircle, Filter, Plus, Phone, MessageCircle, Calendar, Package } from "lucide-react";
import { CountryFilter } from "@/components/product/CountryFilter";
import { MOCK_TRANSPORTERS, MOCK_TRIPS } from "@/lib/data";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Trip } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "transporteurs" | "trajets";

export default function TransporteursPage() {
  const [view, setView] = useState<ViewMode>("transporteurs");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const filteredTransporters = useMemo(
    () =>
      selectedCountry
        ? MOCK_TRANSPORTERS.filter((t) => t.user.countryCode === selectedCountry)
        : MOCK_TRANSPORTERS,
    [selectedCountry]
  );

  const filteredTrips = useMemo(
    () =>
      selectedCountry
        ? MOCK_TRIPS.filter((t) => t.originCountry.code === selectedCountry && t.isActive)
        : MOCK_TRIPS.filter((t) => t.isActive),
    [selectedCountry]
  );

  return (
    <div className="page-container py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Transporteurs GP</h1>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Nos transitaires et GP certifiés pour livrer à Bangui
          </p>
        </div>
        <Link href="/transporteurs/publier" className="btn-primary gap-2 text-sm self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Publier un trajet
        </Link>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit mb-5 sm:mb-6">
        {(["transporteurs", "trajets"] as ViewMode[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              "flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize text-center",
              view === v ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {v === "transporteurs" ? "🚚 Transporteurs" : "✈️ Trajets disponibles"}
          </button>
        ))}
      </div>

      {/* Country filter */}
      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Filtrer par pays de départ
        </p>
        <CountryFilter selected={selectedCountry} onChange={setSelectedCountry} />
      </div>

      {/* Content */}
      {view === "transporteurs" ? (
        <>
          {filteredTransporters.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center text-gray-500">
              Aucun transporteur disponible depuis ce pays.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTransporters.map((transporter) => {
                const trips = MOCK_TRIPS.filter(
                  (t) => t.transporter.id === transporter.id && t.isActive
                );
                return (
                  <div key={transporter.id} className="card-hover p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 flex-shrink-0">
                        {transporter.companyName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-gray-900">
                            {transporter.companyName}
                          </span>
                          {transporter.isVerified && (
                            <span className="badge-green text-[11px]">
                              <CheckCircle className="w-3 h-3" /> Vérifié
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-semibold">{transporter.rating}</span>
                          <span className="text-xs text-gray-500">({transporter.reviewCount} avis)</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {transporter.user.countryCode === "FR" ? "🇫🇷" :
                           transporter.user.countryCode === "SN" ? "🇸🇳" :
                           transporter.user.countryCode === "CM" ? "🇨🇲" : "🌍"}{" "}
                          {transporter.user.countryCode}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">{transporter.description}</p>

                    {/* Trips summary */}
                    {trips.length > 0 && (
                      <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-1.5">
                        <span className="text-xs font-semibold text-orange-700 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {trips.length} trajet{trips.length > 1 ? "s" : ""} disponible{trips.length > 1 ? "s" : ""}
                        </span>
                        {trips.slice(0, 2).map((trip) => (
                          <div key={trip.id} className="text-xs text-gray-600 flex justify-between">
                            <span>
                              {trip.originCountry.flag} → 🇨🇫 Bangui — Départ{" "}
                              {new Date(trip.departureDate).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                            <span className="font-semibold text-orange-600">
                              {formatPrice(trip.pricePerKg, trip.currency)}/kg
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Contacts */}
                    <div className="flex gap-2">
                      <a
                        href={`tel:${transporter.contact.phone}`}
                        className="btn-secondary text-xs flex-1 py-2"
                      >
                        <Phone className="w-3.5 h-3.5" /> Appeler
                      </a>
                      {transporter.contact.whatsapp && (
                        <a
                          href={`https://wa.me/${transporter.contact.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary text-xs flex-1 py-2"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {filteredTrips.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center text-gray-500">
              Aucun trajet disponible depuis ce pays.
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  return (
    <div className="card-hover p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Route */}
        <div className="flex items-center gap-3 flex-1">
          <div className="text-center">
            <div className="text-2xl">{trip.originCountry.flag}</div>
            <div className="text-xs text-gray-500 mt-0.5">{trip.originCountry.name}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-0.5 bg-orange-200 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-400 rounded-full w-2 h-2" />
            </div>
            <span className="text-xs text-orange-500 font-medium mt-1">GP / Transit</span>
          </div>
          <div className="text-center">
            <div className="text-2xl">🇨🇫</div>
            <div className="text-xs text-gray-500 mt-0.5">{trip.destinationCity}</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
          <div className="text-center">
            <div className="text-xs text-gray-400 font-medium">Départ</div>
            <div className="font-semibold text-gray-900">
              {new Date(trip.departureDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>
          {trip.arrivalDate && (
            <div className="text-center">
              <div className="text-xs text-gray-400 font-medium">Arrivée</div>
              <div className="font-semibold text-gray-900">
                {new Date(trip.arrivalDate).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                })}
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-gray-400 font-medium">Prix/kg</div>
            <div className="font-bold text-orange-600">
              {formatPrice(trip.pricePerKg, trip.currency)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 font-medium">Capacité</div>
            <div className="font-semibold text-gray-900">{trip.availableCapacity} kg</div>
          </div>
        </div>

        {/* Transporter + CTA */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            <div className="font-semibold text-gray-800">{trip.transporter.companyName}</div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {trip.transporter.rating}
            </div>
          </div>
          <a
            href={`https://wa.me/${trip.transporter.contact.whatsapp?.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-2 px-4 whitespace-nowrap"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Contacter
          </a>
        </div>
      </div>

      {trip.description && (
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">{trip.description}</p>
      )}
    </div>
  );
}
