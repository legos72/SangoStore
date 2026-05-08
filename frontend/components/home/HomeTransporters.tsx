"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
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
    <section className="py-8 sm:py-14 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-gray-900">Transporteurs certifiés</h2>
            <p className="text-gray-400 text-xs sm:text-sm mt-0.5">Nos GPs et transitaires de confiance vers Bangui</p>
          </div>
          <Link href="/transporteurs" className="btn-outline-orange text-sm hidden sm:flex">
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
            fadeColor="rgb(249 250 251)"
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
