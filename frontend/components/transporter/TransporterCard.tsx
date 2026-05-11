import Link from "next/link";
import { Star, CheckCircle, Package, Calendar, ArrowRight, Clock } from "lucide-react";
import { FlagImage } from "@/components/ui/FlagImage";
import { cn } from "@/lib/utils";

interface TransporterCardProps {
  transporter: any;
}

export function TransporterCard({ transporter: t }: TransporterCardProps) {
  const initial = (t.company_name ?? "?").charAt(0).toUpperCase();
  const href = `/transporteurs/${t.id}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-orange-200 transition-all duration-200">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center flex-shrink-0 text-lg font-extrabold text-orange-600 border border-orange-100">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-gray-900 text-sm leading-tight">{t.company_name}</h3>
              {t.is_verified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-1.5 py-px rounded-full flex-shrink-0">
                  <CheckCircle className="w-2.5 h-2.5" /> Vérifié
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
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Next trip info */}
      {t.next_trip && (
        <div className="mx-4 mb-3 bg-orange-50 border border-orange-100 rounded-xl p-3">
          <div className="flex items-center gap-1 text-[11px] font-bold text-orange-600 mb-2">
            <Package className="w-3 h-3 flex-shrink-0" />
            Prochain départ
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <FlagImage code={t.next_trip.origin_country} size="sm" />
              <span className="text-xs text-gray-600 font-medium">{t.next_trip.origin_country}</span>
              <span className="text-gray-300">→</span>
              <span className="text-xs text-gray-600">🇨🇫 Bangui</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-gray-500 flex-shrink-0">
              <Calendar className="w-3 h-3" />
              {new Date(t.next_trip.departure_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-extrabold text-orange-600">
              {parseFloat(t.next_trip.price_per_kg).toLocaleString("fr-FR")} {t.next_trip.currency}/kg
            </span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-[11px] text-gray-500">{t.next_trip.available_capacity} kg disponibles</span>
          </div>
          {t.next_trip.deposit_deadline && (
            <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1">
              <Clock className="w-3 h-3 flex-shrink-0" />
              <span>Dépôt des colis jusqu'au{" "}
                <span className="font-bold">
                  {new Date(t.next_trip.deposit_deadline).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 px-4 pb-4">
        <Link
          href={href}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap"
        >
          <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          Détail
        </Link>
        <Link
          href={`${href}?action=reserve`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-orange-200 whitespace-nowrap"
        >
          <Package className="w-3.5 h-3.5 flex-shrink-0" />
          Réserver kg
        </Link>
      </div>
    </div>
  );
}
