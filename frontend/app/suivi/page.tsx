"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Search, ArrowRight } from "lucide-react";

export default function SuiviPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const num = trackingNumber.trim().toUpperCase();
    if (!num) return;
    router.push(`/suivi/${num}`);
  }

  return (
    <div className="page-container py-16 max-w-lg mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-100 mb-4">
          <Package className="w-8 h-8 text-orange-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Suivi de colis</h1>
        <p className="text-gray-500">Entrez votre numéro de suivi pour voir l'état de votre colis en temps réel.</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Numéro de suivi
          </label>
          <input
            type="text"
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="Ex : SG-2026-001234"
            className="input w-full font-mono text-base tracking-wider"
            autoFocus
            autoCapitalize="characters"
          />
          <p className="text-xs text-gray-400 mt-1.5">Format : SG-ANNÉE-NUMÉRO (ex : SG-2026-001234)</p>
        </div>

        <button
          type="submit"
          disabled={!trackingNumber.trim()}
          className="btn-primary w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="w-4 h-4" />
          Suivre mon colis
          <ArrowRight className="w-4 h-4 ml-auto" />
        </button>
      </form>

      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        {[
          { icon: "📦", label: "Colis reçu", desc: "Confirmation à l'envoi" },
          { icon: "✈️", label: "En transit", desc: "Suivi en temps réel" },
          { icon: "🏪", label: "Au relais",  desc: "Notification à l'arrivée" },
        ].map(({ icon, label, desc }) => (
          <div key={label} className="bg-gray-50 rounded-2xl p-4">
            <div className="text-2xl mb-1.5">{icon}</div>
            <div className="text-xs font-semibold text-gray-700">{label}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
