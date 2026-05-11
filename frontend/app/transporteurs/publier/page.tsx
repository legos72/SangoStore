"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, CheckCircle, Truck } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { api } from "@/lib/api";

export default function PublierTrajetPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    description: "",
    originCountry: "",
    departureDate: "",
    arrivalDate: "",
    depositDeadline: "",
    pricePerKg: "",
    currency: "EUR",
    availableCapacity: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.trips.create({
        originCountry:     form.originCountry,
        departureDate:     form.departureDate,
        arrivalDate:       form.arrivalDate || undefined,
        pricePerKg:        parseFloat(form.pricePerKg),
        currency:          form.currency as "XAF" | "EUR" | "USD",
        availableCapacity: parseFloat(form.availableCapacity),
        description:       form.description || undefined,
        depositDeadline:   form.depositDeadline || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? "Erreur lors de la publication");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="page-container py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-3">Trajet publié !</h1>
          <p className="text-gray-500 mb-8">
            Votre trajet est maintenant visible par la communauté.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/transporteurs" className="btn-primary w-full justify-center">
              Voir tous les trajets
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ description: "", originCountry: "", departureDate: "", arrivalDate: "", depositDeadline: "", pricePerKg: "", currency: "EUR", availableCapacity: "" }); }}
              className="btn-secondary w-full"
            >
              Publier un autre trajet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-8">
      <Link href="/transporteurs" className="btn-ghost mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4" /> Retour aux transporteurs
      </Link>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Publier un trajet</h1>
            <p className="text-gray-500 text-sm">Proposez votre trajet vers Bangui à la communauté</p>
          </div>
        </div>

        <div className="card p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Trip details */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                Détails du trajet
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pays de départ *
                  </label>
                  <select
                    required
                    className="select"
                    value={form.originCountry}
                    onChange={(e) => setForm({ ...form, originCountry: e.target.value })}
                  >
                    <option value="">Choisir le pays de départ…</option>
                    {COUNTRIES.filter(c => c.code !== "CF").map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date de départ *
                  </label>
                  <input
                    required
                    type="date"
                    className="input"
                    min={new Date().toISOString().split("T")[0]}
                    value={form.departureDate}
                    onChange={(e) => setForm({ ...form, departureDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date d'arrivée estimée
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.arrivalDate}
                    onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    📦 Dernier délai de dépôt des colis
                  </label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.depositDeadline}
                    onChange={(e) => setForm({ ...form, depositDeadline: e.target.value })}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Date limite à laquelle les clients peuvent déposer leurs colis.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Prix par kg *
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      className="input flex-1"
                      placeholder="8"
                      value={form.pricePerKg}
                      onChange={(e) => setForm({ ...form, pricePerKg: e.target.value })}
                    />
                    <select
                      className="select w-28"
                      value={form.currency}
                      onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    >
                      <option value="EUR">EUR €</option>
                      <option value="XAF">FCFA</option>
                      <option value="USD">USD $</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Capacité disponible (kg) *
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    className="input"
                    placeholder="100"
                    value={form.availableCapacity}
                    onChange={(e) => setForm({ ...form, availableCapacity: e.target.value })}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    className="input resize-none"
                    placeholder="Décrivez votre service, vos spécialités, garanties…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#6B3D0E] hover:bg-[#4E2C08] text-white font-bold text-base transition-all duration-200 shadow-sm shadow-[#6B3D0E]/30 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publication en cours…</>
              ) : (
                <>🚚 Publier mon trajet</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
