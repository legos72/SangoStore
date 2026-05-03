import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { TransporterCard } from "@/components/transporter/TransporterCard";
import { MOCK_TRANSPORTERS, MOCK_TRIPS } from "@/lib/data";
import { COUNTRIES } from "@/lib/countries";

const HOW_IT_WORKS = [
  { step: "01", icon: "📱", title: "Choisissez votre produit",   desc: "Parcourez nos produits envoyés par la diaspora depuis la France, le Sénégal, le Cameroun…" },
  { step: "02", icon: "💳", title: "Payez en toute sécurité",    desc: "Orange Money ou cash. Votre argent est bloqué en escrow jusqu'à la livraison."            },
  { step: "03", icon: "🚚", title: "Le vendeur expédie via GP",  desc: "Le vendeur choisit un transporteur certifié. Le colis part vers Bangui."                   },
  { step: "04", icon: "🇨🇫", title: "Récupérez à Bangui",       desc: "Le colis arrive au point de retrait. Vous récupérez, l'argent est libéré au vendeur."       },
];

export default function HomePage() {
  const featuredTransporters = MOCK_TRANSPORTERS.slice(0, 3);

  return (
    <>
      <HeroSection />

      {/* Produits avec filtres catégorie + pays */}
      <FeaturedProducts />

      {/* Browse by country */}
      <section className="py-14 text-white" style={{ background: "linear-gradient(160deg, #0F1928 0%, #0A1120 60%, #1a1206 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">Origine</p>
            <h2 className="text-2xl font-bold text-white tracking-tight">Acheter par pays d'origine</h2>
            <p className="text-gray-400 mt-1 text-sm">Découvrez les produits envoyés depuis chaque pays</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {COUNTRIES.filter(c => c.code !== "CF").map((country) => (
              <Link
                key={country.code}
                href={`/produits?country=${country.code}`}
                className="group bg-white/5 border border-white/8 hover:bg-orange-500/12 hover:border-orange-500/35 rounded-2xl p-4 flex items-center gap-3 transition-all"
              >
                <span className="text-3xl">{country.flag}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{country.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 group-hover:text-orange-400 transition-colors flex items-center gap-1">
                    Voir les produits <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14" style={{ backgroundColor: "#F7F4EE" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900">Comment ça marche ?</h2>
            <p className="text-gray-400 text-sm mt-1">Simple, sécurisé, pensé pour l'Afrique</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon, title, desc }, index) => (
              <div key={step} className="relative text-center p-5">
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-orange-200 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 mx-auto bg-orange-50 border-2 border-orange-100 rounded-2xl flex items-center justify-center text-2xl mb-3">
                    {icon}
                  </div>
                  <div className="text-orange-500 text-xs font-bold mb-1">ÉTAPE {step}</div>
                  <h3 className="font-bold text-gray-900 mb-1.5 text-sm">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/comment-ca-marche" className="btn-outline-orange text-sm">
              En savoir plus <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Transporters */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Transporteurs certifiés</h2>
              <p className="text-gray-400 text-sm mt-0.5">Nos GPs et transitaires de confiance vers Bangui</p>
            </div>
            <Link href="/transporteurs" className="btn-outline-orange text-sm hidden sm:flex">
              Tous les transporteurs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredTransporters.map((t) => (
              <TransporterCard key={t.id} transporter={t} trips={MOCK_TRIPS} />
            ))}
          </div>
        </div>
      </section>

      {/* Escrow trust */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-5xl flex-shrink-0">🔒</div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Votre argent est toujours protégé</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Notre système d'<strong>escrow</strong> bloque votre paiement jusqu'à ce que vous récupériez votre colis.
                    Si la livraison échoue, vous êtes remboursé automatiquement.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge-green py-1 px-3 text-xs">✓ Paiement bloqué en escrow</span>
                    <span className="badge-green py-1 px-3 text-xs">✓ Libération à la récupération</span>
                    <span className="badge-green py-1 px-3 text-xs">✓ Remboursement garanti</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* CTA banner */}
      <section className="py-14 bg-orange-500">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Prêt à recevoir vos produits à Bangui ?
          </h2>
          <p className="text-orange-100 mb-7 max-w-lg mx-auto text-sm">
            Créez votre compte gratuitement et commandez dès aujourd'hui.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/auth/register" className="bg-white text-orange-600 hover:bg-orange-50 font-semibold px-7 py-3 rounded-xl transition-colors text-sm">
              Créer mon compte
            </Link>
            <Link href="/produits" className="border-2 border-white/40 text-white hover:bg-white/10 font-semibold px-7 py-3 rounded-xl transition-colors text-sm">
              Parcourir les produits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
