"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package, Truck, Users, Star, Plus, CheckCircle, XCircle,
  Clock, Eye, Loader2, AlertCircle, RefreshCw, MapPin,
  ChevronDown, Calendar, Weight, ArrowRight,
} from "lucide-react";
import { api, getUser } from "@/lib/api";
import { FlagImage } from "@/components/ui/FlagImage";
import { cn } from "@/lib/utils";

type Tab = "reservations" | "trajets";
type BookingFilter = "all" | "pending" | "accepted" | "in_transit" | "delivered" | "refused";

const TRACKING_STEPS = [
  { key: "colis_recu",         label: "Colis reçu",             icon: "📦" },
  { key: "depart_confirme",    label: "Départ confirmé",        icon: "✈️" },
  { key: "arrive_aeroport",    label: "Arrivé aéroport",        icon: "🛬" },
  { key: "arrive_destination", label: "Arrivé à destination",   icon: "📍" },
  { key: "disponible_relais",  label: "Disponible au relais",   icon: "🏪" },
  { key: "livre",              label: "Livré",                   icon: "🎉" },
];

const BOOKING_STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: "En attente",  cls: "bg-yellow-50 text-yellow-700 border border-yellow-200" },
  accepted:   { label: "Accepté",    cls: "bg-blue-50 text-blue-700 border border-blue-200" },
  in_transit: { label: "En transit", cls: "bg-orange-50 text-orange-700 border border-orange-200" },
  delivered:  { label: "Livré",      cls: "bg-green-50 text-green-700 border border-green-200" },
  refused:    { label: "Refusé",     cls: "bg-red-50 text-red-700 border border-red-200" },
};

// ─── Tracking update modal ────────────────────────────────────────────────────

function TrackingModal({
  booking,
  onClose,
  onUpdated,
}: {
  booking: any;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [description, setDescription]       = useState("");
  const [location, setLocation]             = useState("");
  const [loading, setLoading]               = useState(false);
  const [error, setError]                   = useState("");

  async function handleUpdate() {
    if (!selectedStatus) return;
    setLoading(true);
    setError("");
    try {
      await api.transport.updateTracking(booking.id, selectedStatus, description || undefined, location || undefined);
      onUpdated();
      onClose();
    } catch (e: any) {
      setError(e.message ?? "Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  }

  const doneStatuses = (booking.tracking_steps ?? []).map((s: any) => s.status);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Mettre à jour le suivi</h3>
          <p className="text-xs text-gray-500 mt-0.5 font-mono">{booking.tracking_number}</p>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nouveau statut</label>
            <div className="space-y-2">
              {TRACKING_STEPS.map(step => {
                const done = doneStatuses.includes(step.key);
                return (
                  <button
                    key={step.key}
                    onClick={() => !done && setSelectedStatus(step.key)}
                    disabled={done}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all text-sm",
                      done
                        ? "bg-gray-50 border-gray-100 text-gray-400 cursor-default"
                        : selectedStatus === step.key
                        ? "bg-orange-50 border-orange-300 text-orange-700"
                        : "bg-white border-gray-200 hover:border-orange-200 hover:bg-orange-50/50"
                    )}
                  >
                    <span className="text-base">{step.icon}</span>
                    <span className="font-medium">{step.label}</span>
                    {done && <CheckCircle className="w-4 h-4 ml-auto text-green-500" />}
                    {!done && selectedStatus === step.key && (
                      <div className="ml-auto w-4 h-4 rounded-full bg-orange-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex : Colis récupéré à l'aéroport CDG"
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Localisation <span className="font-normal text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="Ex : Paris CDG, France"
              className="input w-full"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Annuler</button>
          <button
            onClick={handleUpdate}
            disabled={!selectedStatus || loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mettre à jour"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Booking card ─────────────────────────────────────────────────────────────

function BookingCard({
  booking,
  onAccept,
  onRefuse,
  onTrack,
  accepting,
  refusing,
}: {
  booking: any;
  onAccept: (id: string) => void;
  onRefuse: (id: string) => void;
  onTrack: (b: any) => void;
  accepting: string | null;
  refusing: string | null;
}) {
  const cfg = BOOKING_STATUS_CONFIG[booking.status] ?? { label: booking.status, cls: "bg-gray-50 text-gray-600 border border-gray-100" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className={cn("text-[11px] font-semibold px-2.5 py-1 rounded-full", cfg.cls)}>
                {cfg.label}
              </span>
              {booking.tracking_number && (
                <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                  {booking.tracking_number}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(booking.created_at).toLocaleDateString("fr-FR", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </div>
          </div>
          <div className="text-right">
            <div className="font-extrabold text-lg text-gray-900">
              {parseFloat(booking.total_price).toLocaleString("fr-FR")} {booking.currency}
            </div>
            <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
              <Weight className="w-3 h-3" /> {booking.weight_kg} kg
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
          <FlagImage code={booking.origin_country} size="sm" />
          <span className="text-xs text-gray-600">{booking.origin_country}</span>
          <ArrowRight className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-600">🇨🇫 {booking.destination_city}</span>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(booking.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Sender / Recipient */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div>
            <p className="text-gray-400 mb-0.5">Expéditeur</p>
            <p className="font-semibold text-gray-800">{booking.sender_name}</p>
            <p className="text-gray-500">{booking.sender_phone}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">Destinataire</p>
            <p className="font-semibold text-gray-800">{booking.recipient_name}</p>
            <p className="text-gray-500">{booking.recipient_phone}</p>
          </div>
        </div>

        {booking.package_description && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5 mb-4">
            📦 {booking.package_description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {booking.status === "pending" && (
            <>
              <button
                onClick={() => onAccept(booking.id)}
                disabled={accepting === booking.id || refusing === booking.id}
                className="btn-primary text-xs py-2 flex-1 gap-1.5 disabled:opacity-50"
              >
                {accepting === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Accepter
              </button>
              <button
                onClick={() => onRefuse(booking.id)}
                disabled={accepting === booking.id || refusing === booking.id}
                className="btn-secondary text-xs py-2 flex-1 gap-1.5 text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
              >
                {refusing === booking.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Refuser
              </button>
            </>
          )}
          {(booking.status === "accepted" || booking.status === "in_transit") && (
            <button
              onClick={() => onTrack(booking)}
              className="btn-primary text-xs py-2 flex-1 gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" /> Mettre à jour le suivi
            </button>
          )}
          {booking.tracking_number && (
            <Link
              href={`/suivi/${booking.tracking_number}`}
              className="btn-secondary text-xs py-2 gap-1.5"
              target="_blank"
            >
              <Eye className="w-3.5 h-3.5" /> Voir suivi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TransporteurDashboard() {
  const router = useRouter();
  const [tab, setTab]                   = useState<Tab>("reservations");
  const [filter, setFilter]             = useState<BookingFilter>("pending");
  const [bookings, setBookings]         = useState<any[]>([]);
  const [trips, setTrips]               = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingTrips, setLoadingTrips]       = useState(true);
  const [accepting, setAccepting]       = useState<string | null>(null);
  const [refusing, setRefusing]         = useState<string | null>(null);
  const [trackingModal, setTrackingModal] = useState<any | null>(null);

  const user = getUser();

  useEffect(() => {
    if (!user) { router.push("/auth/login"); return; }
    if (user.role !== "transporteur" && user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadBookings();
    loadTrips();
  }, []);

  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await api.transport.transporterBookings();
      setBookings(res.data ?? []);
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  const loadTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const res = await api.transport.transporterTrips();
      setTrips(res.data ?? []);
    } catch {
      setTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  async function handleAccept(id: string) {
    setAccepting(id);
    try {
      await api.transport.acceptBooking(id);
      await loadBookings();
    } catch (e: any) {
      alert(e.message ?? "Erreur");
    } finally {
      setAccepting(null);
    }
  }

  async function handleRefuse(id: string) {
    if (!confirm("Refuser cette réservation ?")) return;
    setRefusing(id);
    try {
      await api.transport.refuseBooking(id);
      await loadBookings();
    } catch (e: any) {
      alert(e.message ?? "Erreur");
    } finally {
      setRefusing(null);
    }
  }

  const filteredBookings = filter === "all"
    ? bookings
    : bookings.filter(b => b.status === filter);

  const stats = {
    pending:    bookings.filter(b => b.status === "pending").length,
    active:     bookings.filter(b => b.status === "accepted" || b.status === "in_transit").length,
    delivered:  bookings.filter(b => b.status === "delivered").length,
    activeTrips: trips.filter(t => t.is_active).length,
  };

  if (!user) return null;
  const initials = user.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="page-container py-8 space-y-6">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-extrabold border border-white/30">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-extrabold">{user.name}</h1>
              <p className="text-blue-100 text-sm mt-0.5">Dashboard transporteur</p>
            </div>
          </div>
          <Link
            href="/transporteurs/publier"
            className="flex items-center gap-1.5 bg-white text-blue-600 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nouveau trajet
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/20">
          {[
            { label: "En attente", value: stats.pending },
            { label: "En transit", value: stats.active },
            { label: "Livrés",     value: stats.delivered },
            { label: "Trajets",    value: stats.activeTrips },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xl font-extrabold">{value}</div>
              <div className="text-[11px] text-blue-100">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-full sm:w-fit">
        {([
          { key: "reservations", label: "📦 Réservations" },
          { key: "trajets",      label: "✈️ Mes trajets" },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              tab === key ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {label}
            {key === "reservations" && stats.pending > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full inline-flex items-center justify-center">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reservations tab */}
      {tab === "reservations" && (
        <div className="space-y-4">
          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {([
              { key: "pending",    label: "En attente" },
              { key: "accepted",   label: "Acceptées" },
              { key: "in_transit", label: "En transit" },
              { key: "delivered",  label: "Livrées" },
              { key: "refused",    label: "Refusées" },
              { key: "all",        label: "Toutes" },
            ] as { key: BookingFilter; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                  filter === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                )}
              >
                {label}
                {key === "pending" && stats.pending > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold w-3.5 h-3.5 rounded-full inline-flex items-center justify-center">
                    {stats.pending}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={loadBookings}
              className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Actualiser
            </button>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
              <Package className="w-10 h-10 text-gray-200" />
              <p className="font-semibold text-gray-400 text-sm">
                {filter === "pending" ? "Aucune réservation en attente" : "Aucune réservation"}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Voir toutes les réservations
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onAccept={handleAccept}
                  onRefuse={handleRefuse}
                  onTrack={b => setTrackingModal(b)}
                  accepting={accepting}
                  refusing={refusing}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trips tab */}
      {tab === "trajets" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Mes trajets publiés</h2>
            <Link href="/transporteurs/publier" className="btn-primary text-xs gap-1.5 py-2">
              <Plus className="w-3.5 h-3.5" /> Nouveau trajet
            </Link>
          </div>

          {loadingTrips ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-16 flex flex-col items-center gap-3 text-center">
              <Truck className="w-10 h-10 text-gray-200" />
              <p className="font-semibold text-gray-400 text-sm">Aucun trajet publié</p>
              <Link href="/transporteurs/publier" className="btn-primary text-sm mt-1">
                Publier un trajet
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map(trip => (
                <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                  {/* Route header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FlagImage code={trip.origin_country} size="sm" />
                        <span className="text-sm font-semibold text-gray-700">{trip.origin_country}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <FlagImage code="CF" size="sm" />
                        <span className="text-sm font-semibold text-gray-700">{trip.destination_city}</span>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[11px] font-semibold px-2.5 py-1 rounded-full self-start",
                      trip.is_active
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-500 border border-gray-200"
                    )}>
                      {trip.is_active ? "✓ Actif" : "Inactif"}
                    </span>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Départ",         value: new Date(trip.departure_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) },
                      { label: "Prix/kg",         value: `${parseFloat(trip.price_per_kg).toLocaleString("fr-FR")} ${trip.currency}` },
                      { label: "Capacité libre",  value: `${trip.available_capacity} kg` },
                      { label: "Réservations",    value: `${trip.pending_bookings ?? 0} att. / ${trip.accepted_bookings ?? 0} acc.` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
                        <div className="text-sm font-bold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>

                  {trip.deposit_deadline && (
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 mb-3">
                      <span>📦</span>
                      <span>Dépôt des colis jusqu'au{" "}
                        <span className="font-bold">
                          {new Date(trip.deposit_deadline).toLocaleDateString("fr-FR", {
                            day: "numeric", month: "long",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                      </span>
                    </div>
                  )}

                  {trip.booked_kg > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-2 bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (trip.booked_kg / (trip.available_capacity + trip.booked_kg)) * 100)}%` }}
                        />
                      </div>
                      <span>{trip.booked_kg} kg réservés</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tracking modal */}
      {trackingModal && (
        <TrackingModal
          booking={trackingModal}
          onClose={() => setTrackingModal(null)}
          onUpdated={loadBookings}
        />
      )}
    </div>
  );
}
