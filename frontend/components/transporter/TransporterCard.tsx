import Link from "next/link";
import Image from "next/image";
import { Star, CheckCircle, Phone, MessageCircle, Package, Calendar } from "lucide-react";
import type { Transporter, Trip } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TransporterCardProps {
  transporter: Transporter;
  trips?: Trip[];
  compact?: boolean;
}

export function TransporterCard({ transporter, trips = [], compact = false }: TransporterCardProps) {
  const nextTrip = trips.find(
    (t) => t.transporter.id === transporter.id && t.isActive
  );

  return (
    <div className="card-hover p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 text-xl font-bold text-orange-600">
          {transporter.companyName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {transporter.companyName}
            </h3>
            {transporter.isVerified && (
              <span className="inline-flex items-center gap-1 badge-green">
                <CheckCircle className="w-3 h-3" />
                Vérifié
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-gray-800">{transporter.rating}</span>
            <span className="text-xs text-gray-500">({transporter.reviewCount} avis)</span>
          </div>
          {!compact && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{transporter.description}</p>
          )}
        </div>
      </div>

      {/* Next trip info */}
      {nextTrip && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-700">
            <Package className="w-3.5 h-3.5" />
            Prochain départ
          </div>
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span className="flex items-center gap-1">
              {nextTrip.originCountry.flag} {nextTrip.originCountry.name}
              <span className="text-gray-400 mx-1">→</span>
              🇨🇫 {nextTrip.destinationCity}
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Calendar className="w-3 h-3" />
              {new Date(nextTrip.departureDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            <span className="font-semibold text-orange-600">
              {formatPrice(nextTrip.pricePerKg, nextTrip.currency)}/kg
            </span>
            {" · "}
            <span>{nextTrip.availableCapacity} kg disponibles</span>
          </div>
        </div>
      )}

      {/* Contact buttons */}
      <div className="flex gap-2 pt-1">
        <a
          href={`tel:${transporter.contact.phone}`}
          className="btn-secondary text-xs flex-1 py-2"
        >
          <Phone className="w-3.5 h-3.5" />
          Appeler
        </a>
        {transporter.contact.whatsapp && (
          <a
            href={`https://wa.me/${transporter.contact.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs flex-1 py-2"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
