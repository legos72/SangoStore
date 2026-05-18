"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Star, CheckCircle, Phone, MessageCircle, MapPin,
  Calendar, Package, Weight, Loader2, AlertCircle, ChevronRight,
  Clock, Users, TrendingUp, X, Check,
} from "lucide-react";
import { api, getImageUrl } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FlagImage } from "@/components/ui/FlagImage";
import { ImageUploader } from "@/components/ui/ImageUploader";

const TRACKING_STATUS_LABELS: Record<string, string> = {
  pending:      "En attente",
  accepted:     "Acceptée",
  refused:      "Refusée",
  in_transit:   "En transit",
  delivered:    "Livrée",
};

// ─── Booking form ─────────────────────────────────────────────────────────────

interface BookingFormProps {
  trip: any;
  onClose: () => void;
  onSuccess: (booking: any) => void;
}

function BookingForm({ trip, onClose, onSuccess }: BookingFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    senderName:         user?.name ?? "",
    senderPhone:        "",
    senderAddress:      "",
    recipientName:      "",
    recipientPhone:     "",
    recipientAddress:   "Bangui, République Centrafricaine",
    packageDescription: "",
    weightKg:           "",
    dimensions:         "",
    notes:              "",
  });
  const [photos, setPhotos]   = useState<string[]>([]);
  const [files,  setFiles]    = useState<(File | null)[]>([]);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm(p => ({ ...p, [k]: v }));
  }

  const estimatedPrice = form.weightKg
    ? (parseFloat(form.weightKg) * trip.price_per_kg).toFixed(2)
    : null;

  async function uploadPhotos(): Promise<string[]> {
    const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const token = localStorage.getItem("sango_token");
    const urls: string[] = [];
    for (const file of files) {
      if (!file) continue;
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${BASE}/api/uploads/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const json = await res.json();
      if (json.url) urls.push(json.url);
    }
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push(`/auth/login?redirect=/transporteurs/${trip.transporter_id}`); return; }
    setSubmitting(true);
    setError(null);
    try {
      const photoUrls = await uploadPhotos();
      const res = await api.transport.createBooking({
        tripId:             trip.id,
        senderName:         form.senderName,
        senderPhone:        form.senderPhone,
        senderAddress:      form.senderAddress,
        recipientName:      form.recipientName,
        recipientPhone:     form.recipientPhone,
        recipientAddress:   form.recipientAddress,
        packageDescription: form.packageDescription,
        weightKg:           parseFloat(form.weightKg),
        dimensions:         form.dimensions || undefined,
        packagePhotos:      photoUrls,
        notes:              form.notes || undefined,
      });
      onSuccess(res.data);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la réservation");
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="p-6 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-orange-400 mx-auto" />
        <h3 className="font-bold text-gray-900">Connexion requise</h3>
        <p className="text-sm text-gray-500">Vous devez être connecté pour réserver un trajet.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login" className="btn-primary text-sm">Se connecter</Link>
          <Link href="/auth/register" className="btn-secondary text-sm">Créer un compte</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Réserver des kilos</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {trip.origin_country} → {trip.destination_city} — {formatPrice(trip.price_per_kg, trip.currency)}/kg
          </p>
        </div>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Step tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {[1, 2].map(s => (
          <button
            key={s} type="button" onClick={() => setStep(s as 1 | 2)}
            className={cn("flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all",
              step === s ? "bg-white shadow text-gray-900" : "text-gray-500")}
          >
            {s === 1 ? "1. Expéditeur & Destinataire" : "2. Colis & Détails"}
          </button>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Expéditeur</p>
              <input className="input w-full" placeholder="Nom complet *" required
                value={form.senderName} onChange={e => set("senderName", e.target.value)} />
              <input className="input w-full" placeholder="Téléphone *" required type="tel"
                value={form.senderPhone} onChange={e => set("senderPhone", e.target.value)} />
              <input className="input w-full" placeholder="Adresse de départ *" required
                value={form.senderAddress} onChange={e => set("senderAddress", e.target.value)} />
            </div>
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Destinataire</p>
              <input className="input w-full" placeholder="Nom complet *" required
                value={form.recipientName} onChange={e => set("recipientName", e.target.value)} />
              <input className="input w-full" placeholder="Téléphone *" required type="tel"
                value={form.recipientPhone} onChange={e => set("recipientPhone", e.target.value)} />
              <input className="input w-full" placeholder="Adresse de destination *" required
                value={form.recipientAddress} onChange={e => set("recipientAddress", e.target.value)} />
            </div>
          </div>
          <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
            Continuer →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <textarea className="input w-full h-20 resize-none" placeholder="Description du colis *" required
            value={form.packageDescription} onChange={e => set("packageDescription", e.target.value)} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Poids (kg) *</label>
              <input className="input w-full" type="number" step="0.1" min="0.1"
                max={trip.available_capacity} placeholder="ex: 5" required
                value={form.weightKg} onChange={e => set("weightKg", e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Dimensions (optionnel)</label>
              <input className="input w-full" placeholder="ex: 40x30x20 cm"
                value={form.dimensions} onChange={e => set("dimensions", e.target.value)} />
            </div>
          </div>

          {estimatedPrice && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-gray-700">Prix estimé</span>
              <span className="text-lg font-extrabold text-orange-600">
                {estimatedPrice} {trip.currency}
              </span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              Photos du colis <span className="text-gray-400 font-normal">(recommandé)</span>
            </label>
            <ImageUploader images={photos} files={files}
              onFilesChange={(f, p) => { setFiles(f); setPhotos(p); }} />
          </div>

          <textarea className="input w-full h-16 resize-none" placeholder="Remarques / instructions particulières"
            value={form.notes} onChange={e => set("notes", e.target.value)} />

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
              ← Retour
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Envoi...</> : "Confirmer la réservation"}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function BookingSuccess({ booking }: { booking: any }) {
  return (
    <div className="p-6 text-center space-y-4">
      <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-7 h-7 text-green-600" />
      </div>
      <h3 className="font-bold text-gray-900 text-lg">Réservation envoyée !</h3>
      <p className="text-sm text-gray-500">
        Le transporteur va examiner votre demande et vous contacter pour finaliser les détails.
      </p>
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm">
        <p className="text-gray-500 text-xs mb-1">Référence de réservation</p>
        <p className="font-mono font-bold text-gray-900">{booking.id.slice(0, 8).toUpperCase()}</p>
      </div>
      <Link href="/dashboard" className="btn-primary w-full block text-center">
        Voir mes réservations
      </Link>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TransporterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData]           = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [booking, setBooking]     = useState<any>(null);

  useEffect(() => {
    api.transporters.get(id as string)
      .then(r => setData(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
    </div>
  );

  if (error || !data) return (
    <div className="page-container py-12 text-center">
      <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
      <p className="text-gray-600 font-semibold">Transporteur introuvable</p>
      <Link href="/transporteurs" className="btn-primary mt-4 inline-flex">← Retour</Link>
    </div>
  );

  const trips   = data.trips   ?? [];
  const reviews = data.reviews ?? [];

  return (
    <div className="page-container py-6 sm:py-10">
      <Link href="/transporteurs" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-orange-500 transition-colors mb-5">
        <ArrowLeft className="w-4 h-4" /> Tous les transporteurs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Profile ───────────────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">

          {/* Profile card */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-2xl font-extrabold text-orange-600 flex-shrink-0">
                {data.company_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-extrabold text-gray-900 text-lg leading-tight">{data.company_name}</h1>
                  {data.is_verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Vérifié
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm">{parseFloat(data.avg_rating || 0).toFixed(1)}</span>
                  <span className="text-xs text-gray-400">({data.review_count} avis)</span>
                </div>
                {data.country_code && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <FlagImage code={data.country_code} size="sm" />
                    <span className="text-xs text-gray-500">{data.country_code}</span>
                  </div>
                )}
              </div>
            </div>

            {data.description && (
              <p className="text-sm text-gray-600 mt-4 leading-relaxed">{data.description}</p>
            )}
          </div>

          {/* Contact */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Contact</h3>
            {data.contact_phone && (
              <a href={`tel:${data.contact_phone}`}
                className="flex items-center gap-3 text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-gray-500" />
                </div>
                {data.contact_phone}
              </a>
            )}
            {data.contact_wa && (
              <a href={`https://wa.me/${data.contact_wa.replace(/\D/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm font-medium text-green-700 hover:text-green-600 transition-colors">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-500" />
                </div>
                WhatsApp
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-3 text-center">
              <p className="text-xl font-extrabold text-orange-600">{trips.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Trajets</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xl font-extrabold text-orange-600">{reviews.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Avis</p>
            </div>
          </div>
        </div>

        {/* ── Right: Trips + Booking + Reviews ────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Trips */}
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg mb-3">Trajets disponibles</h2>
            {trips.length === 0 ? (
              <div className="card p-8 text-center text-gray-400 text-sm">
                Aucun trajet actif pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {trips.map((trip: any) => (
                  <div key={trip.id} className={cn(
                    "card p-4 transition-all",
                    selectedTrip?.id === trip.id ? "ring-2 ring-orange-400 bg-orange-50/30" : "hover:border-orange-200"
                  )}>
                    {/* Route */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <FlagImage code={trip.origin_country} size="sm" />
                        <span className="text-sm font-semibold text-gray-700">{trip.origin_country}</span>
                      </div>
                      <div className="flex-1 h-px bg-orange-200 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full" />
                      </div>
                      <div className="flex items-center gap-2">
                        <FlagImage code="CF" size="sm" />
                        <span className="text-sm font-semibold text-gray-700">{trip.destination_city}</span>
                      </div>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Départ</p>
                        <p className="text-sm font-bold text-gray-900">
                          {new Date(trip.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                        </p>
                      </div>
                      {trip.arrival_date && (
                        <div>
                          <p className="text-[10px] text-gray-400 font-medium uppercase">Arrivée est.</p>
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(trip.arrival_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Prix/kg</p>
                        <p className="text-sm font-extrabold text-orange-600">
                          {formatPrice(trip.price_per_kg, trip.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase">Disponible</p>
                        <p className={cn("text-sm font-bold",
                          parseFloat(trip.available_capacity) < 20 ? "text-red-600" : "text-green-600")}>
                          {trip.available_capacity} kg
                        </p>
                      </div>
                    </div>

                    {trip.description && (
                      <p className="text-xs text-gray-500 mb-3">{trip.description}</p>
                    )}

                    <button
                      onClick={() => setSelectedTrip(selectedTrip?.id === trip.id ? null : trip)}
                      className={cn(
                        "w-full py-2 rounded-xl text-sm font-bold transition-all",
                        selectedTrip?.id === trip.id
                          ? "bg-gray-200 text-gray-700"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      )}
                    >
                      {selectedTrip?.id === trip.id ? "Annuler" : "Réserver ce trajet →"}
                    </button>

                    {/* Inline booking form */}
                    {selectedTrip?.id === trip.id && !booking && (
                      <div className="mt-4 border-t border-orange-100 pt-4">
                        <BookingForm
                          trip={trip}
                          onClose={() => setSelectedTrip(null)}
                          onSuccess={b => { setBooking(b); setSelectedTrip(null); }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking success */}
          {booking && (
            <div className="card overflow-hidden">
              <BookingSuccess booking={booking} />
            </div>
          )}

          {/* Reviews */}
          <div>
            <h2 className="font-extrabold text-gray-900 text-lg mb-3">
              Avis clients
              <span className="ml-2 text-sm font-normal text-gray-400">({reviews.length})</span>
            </h2>
            {reviews.length === 0 ? (
              <div className="card p-6 text-center text-gray-400 text-sm">
                Aucun avis pour l'instant.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r: any) => (
                  <div key={r.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-600">
                          {r.author_name?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-800">{r.author_name}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={cn("w-3.5 h-3.5",
                            i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>}
                    <p className="text-[11px] text-gray-400 mt-2">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
