"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Star, Plus, Package, Loader2, Plane, Calendar, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { FlagImage } from "@/components/ui/FlagImage";
import { TransporterCard } from "@/components/transporter/TransporterCard";
import { getCountry } from "@/lib/countries";
import { cn } from "@/lib/utils";

type ViewMode = "transporteurs" | "trajets";

const FALLBACK_COUNTRIES = ["FR", "BE", "CH", "CM", "SN", "CI", "GA", "CG"];

export default function TransporteursPage() {
  const [view, setView]                       = useState<ViewMode>("transporteurs");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [transporters, setTransporters]       = useState<any[]>([]);
  const [trips, setTrips]                     = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [userRole, setUserRole]               = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("sango_user");
      if (raw) setUserRole(JSON.parse(raw).role ?? null);
    } catch {}
  }, []);

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

  const filterCountries = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const t of trips) {
      if (t.origin_country && !seen.has(t.origin_country)) {
        seen.add(t.origin_country); list.push(t.origin_country);
      }
    }
    for (const t of transporters) {
      const c = t.next_trip?.origin_country;
      if (c && !seen.has(c)) { seen.add(c); list.push(c); }
    }
    return list.length > 0 ? list : FALLBACK_COUNTRIES;
  }, [trips, transporters]);

  const canPublish = userRole === "transporteur" || userRole === "admin";

  return (
    <div className="page-container py-6 sm:py-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Transporteurs GP</h1>
          <p className="text-gray-500 text-sm mt-0.5">Nos transitaires certifiés pour livrer à Bangui</p>
        </div>
        {canPublish && (
          <Link href="/transporteurs/publier" className="btn-primary gap-2 text-sm self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            Publier un trajet
          </Link>
        )}
      </div>

      {/* ── Tab toggle ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit mb-5">
        {([
          { id: "transporteurs", label: "🚚 Transporteurs" },
          { id: "trajets",       label: "✈️ Trajets disponibles" },
        ] as { id: ViewMode; label: string }[]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              "flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-lg text-sm font-semibold transition-all text-center",
              view === id ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Country filter ── */}
      <div className="mb-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
          Filtrer par pays de départ
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          <button
            onClick={() => setSelectedCountry(null)}
            className={cn(
              "flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3.5 py-2 rounded-full border transition-all flex-shrink-0",
              !selectedCountry
                ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
            )}
          >
            🌍 Tous les pays
          </button>
          {filterCountries.map(code => {
            const country = getCountry(code);
            const active = selectedCountry === code;
            return (
              <button
                key={code}
                onClick={() => setSelectedCountry(active ? null : code)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap text-xs font-bold px-3.5 py-2 rounded-full border transition-all flex-shrink-0",
                  active
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-200"
                    : "bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600"
                )}
              >
                <FlagImage code={code} size="sm" />
                {country?.name ?? code}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
        </div>
      ) : view === "transporteurs" ? (
        transporters.length === 0 ? (
          <EmptyState message="Aucun transporteur disponible depuis ce pays." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {transporters.map((t: any) => (
              <TransporterCard key={t.id} transporter={t} />
            ))}
          </div>
        )
      ) : (
        trips.length === 0 ? (
          <EmptyState message="Aucun trajet disponible depuis ce pays." />
        ) : (
          <div className="space-y-3">
            {trips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
      <Plane className="w-10 h-10 text-gray-200" />
      <p className="text-gray-400 text-sm font-medium">{message}</p>
    </div>
  );
}

function TripCard({ trip: t }: { trip: any }) {
  const originName = getCountry(t.origin_country)?.name ?? t.origin_country;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(249,115,22,0.1)] hover:border-orange-200 transition-all duration-200 overflow-hidden">

      {/* Top accent */}
      <div className="h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300" />

      <div className="p-4">
        {/* Route + date */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <FlagImage code={t.origin_country} size="md" />
            <span className="text-sm font-bold text-gray-900 truncate">{originName}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="w-6 h-px bg-orange-300" />
              <Plane className="w-3.5 h-3.5 text-orange-400 rotate-90 sm:rotate-0" />
              <div className="w-6 h-px bg-orange-300" />
            </div>
            <FlagImage code="CF" size="md" />
            <span className="text-sm font-bold text-gray-900">Bangui</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
            <Calendar className="w-3 h-3 text-orange-400" />
            {new Date(t.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            {t.arrival_date && (
              <span className="text-gray-400">
                → {new Date(t.arrival_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-orange-600">
              {parseFloat(t.price_per_kg).toLocaleString("fr-FR")}
            </span>
            <span className="text-xs font-semibold text-gray-500">{t.currency}/kg</span>
          </div>
          <span className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
            {t.available_capacity} kg disponibles
          </span>
          {t.company_name && (
            <div className="flex items-center gap-1 ml-auto">
              {t.avg_rating && (
                <span className="flex items-center gap-0.5 text-[11px] font-semibold text-gray-600">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {parseFloat(t.avg_rating).toFixed(1)}
                </span>
              )}
              <span className="text-[11px] font-bold text-gray-700 ml-1">{t.company_name}</span>
            </div>
          )}
        </div>

        {/* Deposit deadline */}
        {t.deposit_deadline && (
          <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
            <Clock className="w-3 h-3 flex-shrink-0" />
            Dépôt des colis jusqu'au{" "}
            <span className="font-bold">
              {new Date(t.deposit_deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </span>
          </div>
        )}

        {t.description && (
          <p className="text-xs text-gray-500 mt-2.5 pt-2.5 border-t border-gray-100 line-clamp-2 leading-relaxed">
            {t.description}
          </p>
        )}

        {/* CTA */}
        <div className="mt-3">
          <Link
            href={`/transporteurs/${t.transporter_id}?action=reserve`}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-200"
          >
            <Package className="w-3.5 h-3.5" />
            Réserver sur ce trajet
          </Link>
        </div>
      </div>
    </div>
  );
}
