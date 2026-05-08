"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Star, Plus, Package, Loader2, ArrowRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { FlagImage } from "@/components/ui/FlagImage";
import { TransporterCard } from "@/components/transporter/TransporterCard";
import { cn } from "@/lib/utils";

type ViewMode = "transporteurs" | "trajets";

export default function TransporteursPage() {
  const [view, setView]                   = useState<ViewMode>("transporteurs");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [transporters, setTransporters]   = useState<any[]>([]);
  const [trips, setTrips]                 = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [tRes, trRes] = await Promise.all([
          api.transporters.list(selectedCountry ? { country: selectedCountry } : undefined),
          api.trips.list(selectedCountry ? { country: selectedCountry } : undefined),
        ]);
        setTransporters(tRes.data ?? []);
        setTrips((trRes.data ?? []).filter((t: any) => t.is_active));
      } catch {
        setTransporters([]);
        setTrips([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedCountry]);

  // Extract unique origin countries from trips
  const countries = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const t of trips) {
      if (t.origin_country && !seen.has(t.origin_country)) {
        seen.add(t.origin_country);
        list.push(t.origin_country);
      }
    }
    return list;
  }, [trips]);

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
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCountry(null)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
              !selectedCountry
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
            )}
          >
            🌍 Tous les pays
          </button>
          {["FR", "BE", "CH", "CM", "SN", "CI", "GA", "CG"].map(code => (
            <button
              key={code}
              onClick={() => setSelectedCountry(code === selectedCountry ? null : code)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                selectedCountry === code
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-gray-600 border-gray-200 hover:border-orange-300"
              )}
            >
              <FlagImage code={code} size="sm" />
              {code}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
        </div>
      ) : view === "transporteurs" ? (
        <>
          {transporters.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center text-gray-500">
              Aucun transporteur disponible depuis ce pays.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {transporters.map((t: any) => (
                <TransporterCard key={t.id} transporter={t} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {trips.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center text-gray-500">
              Aucun trajet disponible depuis ce pays.
            </div>
          ) : (
            trips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))
          )}
        </div>
      )}
    </div>
  );
}


function TripCard({ trip: t }: { trip: any }) {
  return (
    <div className="card-hover p-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Route */}
        <div className="flex items-center gap-3 flex-1">
          <div className="text-center">
            <FlagImage code={t.origin_country} size="md" />
            <div className="text-xs text-gray-500 mt-0.5">{t.origin_country}</div>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full h-0.5 bg-orange-200 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-400 rounded-full w-2 h-2" />
            </div>
            <span className="text-xs text-orange-500 font-medium mt-1">GP / Transit</span>
          </div>
          <div className="text-center">
            <FlagImage code="CF" size="md" />
            <div className="text-xs text-gray-500 mt-0.5">{t.destination_city}</div>
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
          <div className="text-center">
            <div className="text-xs text-gray-400 font-medium">Départ</div>
            <div className="font-semibold text-gray-900">
              {new Date(t.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </div>
          </div>
          {t.arrival_date && (
            <div className="text-center">
              <div className="text-xs text-gray-400 font-medium">Arrivée</div>
              <div className="font-semibold text-gray-900">
                {new Date(t.arrival_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </div>
            </div>
          )}
          <div className="text-center">
            <div className="text-xs text-gray-400 font-medium">Prix/kg</div>
            <div className="font-bold text-orange-600">
              {parseFloat(t.price_per_kg).toLocaleString("fr-FR")} {t.currency}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 font-medium">Capacité</div>
            <div className="font-semibold text-gray-900">{t.available_capacity} kg</div>
          </div>
        </div>

        {/* Transporter + CTA */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            <div className="font-semibold text-gray-800">{t.company_name}</div>
            {t.avg_rating && (
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {parseFloat(t.avg_rating).toFixed(1)}
              </div>
            )}
          </div>
          <Link
            href={`/transporteurs/${t.transporter_id}`}
            className="btn-primary text-xs py-2 px-4 whitespace-nowrap gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            Réserver
          </Link>
        </div>
      </div>

      {t.description && (
        <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">{t.description}</p>
      )}
    </div>
  );
}
