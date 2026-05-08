"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Package, Loader2, AlertCircle, CheckCircle, Clock, MapPin, Search } from "lucide-react";
import { api } from "@/lib/api";
import { FlagImage } from "@/components/ui/FlagImage";
import { cn } from "@/lib/utils";

const TRACKING_STEPS = [
  { key: "accepted",           label: "Réservation acceptée",   icon: "✅" },
  { key: "colis_recu",         label: "Colis reçu",             icon: "📦" },
  { key: "depart_confirme",    label: "Départ confirmé",        icon: "✈️" },
  { key: "arrive_aeroport",    label: "Arrivé à l'aéroport",    icon: "🛬" },
  { key: "arrive_destination", label: "Arrivé à destination",   icon: "🇨🇫" },
  { key: "disponible_relais",  label: "Disponible au relais",   icon: "🏪" },
  { key: "livre",              label: "Livré",                   icon: "🎉" },
];

export default function TrackingPage() {
  const { trackingId } = useParams<{ trackingId: string }>();
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!trackingId) return;
    api.transport.track(trackingId as string)
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [trackingId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );

  if (error || !data) return (
    <div className="page-container py-16 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
      <h2 className="font-bold text-gray-900 text-xl mb-2">Numéro introuvable</h2>
      <p className="text-gray-500 text-sm mb-6">Vérifiez votre numéro de suivi et réessayez.</p>
      <Link href="/suivi" className="btn-primary inline-flex">Réessayer</Link>
    </div>
  );

  const doneSteps = (data.tracking_steps ?? []).map((s: any) => s.status);
  const lastStep  = doneSteps[doneSteps.length - 1];
  const lastStepData = (data.tracking_steps ?? []).slice(-1)[0];

  return (
    <div className="page-container py-8 sm:py-12 max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5 mb-4">
          <Package className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-700 font-mono">{data.tracking_number}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Suivi de colis</h1>
        <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FlagImage code={data.origin_country} size="sm" />
            {data.origin_country}
          </span>
          <span className="text-gray-300">→</span>
          <span className="flex items-center gap-1">
            <FlagImage code="CF" size="sm" />
            {data.destination_city}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <div className={cn(
        "rounded-2xl p-4 mb-6 flex items-center gap-3",
        data.status === "delivered" ? "bg-green-50 border border-green-200" :
        data.status === "refused"   ? "bg-red-50 border border-red-200" :
        "bg-orange-50 border border-orange-200"
      )}>
        <div className="text-2xl">{TRACKING_STEPS.find(s => s.key === lastStep)?.icon ?? "📦"}</div>
        <div>
          <p className={cn("font-bold text-sm",
            data.status === "delivered" ? "text-green-700" :
            data.status === "refused"   ? "text-red-700" : "text-orange-700"
          )}>
            {TRACKING_STEPS.find(s => s.key === lastStep)?.label ?? "En attente"}
          </p>
          {lastStepData?.description && (
            <p className="text-xs text-gray-500 mt-0.5">{lastStepData.description}</p>
          )}
          {lastStepData?.created_at && (
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(lastStepData.created_at).toLocaleDateString("fr-FR", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
              })}
            </p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-5 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Historique du trajet</h2>
        <div className="space-y-0">
          {TRACKING_STEPS.map((step, i) => {
            const done    = doneSteps.includes(step.key);
            const current = doneSteps[doneSteps.length - 1] === step.key;
            const stepData = (data.tracking_steps ?? []).find((s: any) => s.status === step.key);
            return (
              <div key={step.key} className="flex gap-4">
                {/* Indicator */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all flex-shrink-0",
                    current ? "border-orange-500 bg-orange-500 text-white scale-110" :
                    done    ? "border-green-500 bg-green-500 text-white" :
                              "border-gray-200 bg-white text-gray-300"
                  )}>
                    {done ? "✓" : <span className="text-xs">{i + 1}</span>}
                  </div>
                  {i < TRACKING_STEPS.length - 1 && (
                    <div className={cn("w-0.5 h-8 my-1", done ? "bg-green-300" : "bg-gray-100")} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-5 flex-1">
                  <p className={cn("text-sm font-semibold",
                    current ? "text-orange-600" : done ? "text-gray-900" : "text-gray-400")}>
                    {step.icon} {step.label}
                  </p>
                  {stepData && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(stepData.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                      {stepData.location && ` — ${stepData.location}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Package info */}
      <div className="card p-4 space-y-3">
        <h2 className="font-bold text-gray-900 text-sm">Informations colis</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-400">Expéditeur</p>
            <p className="font-semibold text-gray-800">{data.sender_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Destinataire</p>
            <p className="font-semibold text-gray-800">{data.recipient_name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Description</p>
            <p className="font-medium text-gray-700">{data.package_description}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Transporteur</p>
            <p className="font-medium text-gray-700">{data.company_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
