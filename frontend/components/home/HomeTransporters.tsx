"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader as Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { TransporterCard } from "@/components/transporter/TransporterCard";
import { CardSlider } from "@/components/ui/CardSlider";

export function HomeTransporters() {
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.transporters.list()
      .then(res => setTransporters(res.data ?? []))
      .catch(() => setTransporters([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-8 sm:py-12" style={{ background: "#FAF7F1" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-block w-4 h-[3px] rounded-full flex-shrink-0" style={{ background: "#1B3A2D" }} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: "#1B3A2D" }}>
                Confiance & sécurité
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Transporteurs certifiés
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Nos GPs et transitaires de confiance vers Bangui</p>
          </div>
          <Link href="/transporteurs" className="btn-outline-orange text-sm hidden sm:flex mt-1">
            Tous les transporteurs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
          </div>
        ) : transporters.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            Aucun transporteur disponible pour le moment.
          </div>
        ) : (
          <CardSlider
            cardWidth="w-[280px] sm:w-[300px] lg:w-[320px]"
            fadeColor="rgb(250 247 241)"
            gap="gap-3 sm:gap-4"
          >
            {transporters.map(t => (
              <TransporterCard key={t.id} transporter={t} />
            ))}
          </CardSlider>
        )}

        <div className="sm:hidden mt-4 text-center">
          <Link href="/transporteurs" className="btn-outline-orange text-sm inline-flex">
            Tous les transporteurs <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
