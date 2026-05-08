import Link from "next/link";
import { Star, CheckCircle, Package, Calendar, ArrowRight } from "lucide-react";
import { FlagImage } from "@/components/ui/FlagImage";
import { cn } from "@/lib/utils";

interface TransporterCardProps {
  transporter: any;
}

export function TransporterCard({ transporter: t }: TransporterCardProps) {
  const initial = (t.company_name ?? "?").charAt(0).toUpperCase();
  const href = `/transporteurs/${t.id}`;

  return (
    <Link href={href} className="card-hover p-5 flex flex-col gap-4 block">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-xl font-bold text-orange-600">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{t.company_name}</h3>
            {t.is_verified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                <CheckCircle className="w-3 h-3" /> Vérifié
              </span>
            )}
          </div>
          {(t.avg_rating || t.review_count) && (
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold text-gray-800">
                {parseFloat(t.avg_rating ?? "0").toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">({t.review_count ?? 0} avis)</span>
            </div>
          )}
          {t.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
          )}
        </div>
      </div>

      {/* Next trip info */}
      {t.next_trip && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
            <Package className="w-3.5 h-3.5" />
            Prochain départ
          </div>
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span className="flex items-center gap-1.5">
              <FlagImage code={t.next_trip.origin_country} size="sm" />
              {t.next_trip.origin_country}
              <span className="text-gray-400 mx-0.5">→</span>
              🇨🇫 {t.next_trip.destination_city}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(t.next_trip.departure_date).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-orange-600">
              {parseFloat(t.next_trip.price_per_kg).toLocaleString("fr-FR")} {t.next_trip.currency}/kg
            </span>
            {" · "}
            <span>{t.next_trip.available_capacity} kg disponibles</span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <span className="btn-secondary text-xs flex-1 py-2 pointer-events-none">
          <ArrowRight className="w-3.5 h-3.5" />
          Détail
        </span>
        <span className="btn-primary text-xs flex-1 py-2 pointer-events-none">
          <Package className="w-3.5 h-3.5" />
          Réserver kg
        </span>
      </div>
    </Link>
  );
}
