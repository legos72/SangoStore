import Link from "next/link";
import { Star, Package, Calendar, ArrowRight, Clock, Plane, ShieldCheck } from "lucide-react";
import { FlagImage } from "@/components/ui/FlagImage";
import { getCountry } from "@/lib/countries";

interface TransporterCardProps {
  transporter: any;
}

export function TransporterCard({ transporter: t }: TransporterCardProps) {
  const initial = (t.company_name ?? "?").charAt(0).toUpperCase();
  const href = `/transporteurs/${t.id}`;
  const originName = t.next_trip ? (getCountry(t.next_trip.origin_country)?.name ?? t.next_trip.origin_country) : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_28px_rgba(249,115,22,0.13)] hover:border-orange-200 transition-all duration-200 flex flex-col">

      {/* Top accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-300" />

      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-xl font-extrabold text-white shadow-md shadow-orange-200/60">
              {initial}
            </div>
            {t.is_verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-[2.5px] border-white shadow-sm">
                <ShieldCheck className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-extrabold text-gray-900 text-sm leading-tight">{t.company_name}</h3>
              {t.is_verified && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-px rounded-full flex-shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5" strokeWidth={2.5} /> Certifié GP
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-bold text-gray-700">
                {parseFloat(t.avg_rating ?? "0").toFixed(1)}
              </span>
              <span className="text-[11px] text-gray-400">({t.review_count ?? 0} avis)</span>
            </div>
            {t.description && (
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 leading-relaxed">{t.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Next trip */}
      {t.next_trip ? (
        <div className="mx-3 mb-3 rounded-xl overflow-hidden border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50/40 flex-1">
          {/* Trip header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-orange-100/70">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-orange-600">
              <Plane className="w-3 h-3" />
              Prochain départ
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-white/80 px-2 py-0.5 rounded-full border border-orange-100">
              <Calendar className="w-2.5 h-2.5 text-orange-400" />
              {new Date(t.next_trip.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
            </span>
          </div>

          {/* Route + price */}
          <div className="px-3 py-2.5 space-y-2">
            {/* Route */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <FlagImage code={t.next_trip.origin_country} size="sm" />
                <span className="text-xs font-semibold text-gray-800">{originName}</span>
              </div>
              <div className="flex-1 flex items-center gap-1">
                <div className="flex-1 h-px bg-orange-200" />
                <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                <div className="flex-1 h-px bg-orange-200" />
              </div>
              <div className="flex items-center gap-1.5">
                <FlagImage code="CF" size="sm" />
                <span className="text-xs font-semibold text-gray-800">Bangui</span>
              </div>
            </div>

            {/* Price + capacity */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-extrabold text-orange-600 leading-none">
                  {parseFloat(t.next_trip.price_per_kg).toLocaleString("fr-FR")}
                </span>
                <span className="text-xs font-semibold text-gray-500 ml-0.5">
                  {t.next_trip.currency}/kg
                </span>
              </div>
              <span className="text-[11px] text-gray-600 font-medium bg-white border border-gray-100 px-2 py-0.5 rounded-full">
                {t.next_trip.available_capacity} kg libres
              </span>
            </div>
          </div>

          {/* Deposit deadline */}
          {t.next_trip.deposit_deadline && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/80 border-t border-amber-100 px-3 py-1.5">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>
                Dépôt jusqu'au{" "}
                <span className="font-bold">
                  {new Date(t.next_trip.deposit_deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                </span>
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="mx-3 mb-3 flex-1 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-3 py-4 flex items-center justify-center">
          <p className="text-[11px] text-gray-400 text-center">Aucun trajet programmé prochainement</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-3">
        <Link
          href={href}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          Profil
        </Link>
        <Link
          href={`${href}?action=reserve`}
          className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 bg-[#6B3D0E] hover:bg-[#4E2C08] text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-[#6B3D0E]/30"
        >
          <Package className="w-3.5 h-3.5" />
          Réserver des kg
        </Link>
      </div>
    </div>
  );
}
