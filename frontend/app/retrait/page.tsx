import { MapPin, Phone, Clock, CheckCircle } from "lucide-react";
import { MOCK_PICKUP_POINTS } from "@/lib/data";

export default function RetraitPage() {
  return (
    <div className="page-container py-8">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <div className="badge-orange mb-4">🇨🇫 Bangui, République Centrafricaine</div>
        <h1 className="text-3xl font-extrabold text-gray-900">Points de retrait à Bangui</h1>
        <p className="text-gray-500 mt-3 leading-relaxed">
          Une fois votre colis arrivé, vous recevrez une notification SMS et WhatsApp.
          Rendez-vous dans l'un de nos points de retrait munis de votre numéro de commande
          et d'une pièce d'identité.
        </p>
      </div>

      {/* Points grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {MOCK_PICKUP_POINTS.map((point, index) => (
          <div key={point.id} className="card p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                {index === 0 ? "🏢" : index === 1 ? "🏪" : "🏬"}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{point.name}</div>
                <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                  {point.isActive ? "Ouvert" : "Fermé"}
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span>{point.address}, {point.city}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <a href={`tel:${point.phone}`} className="hover:text-orange-500">{point.phone}</a>
              </div>
              <div className="flex items-start gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs">{point.openingHours}</span>
              </div>
            </div>

            <a href={`tel:${point.phone}`} className="btn-outline-orange text-sm w-full justify-center">
              <Phone className="w-4 h-4" />
              Appeler ce point
            </a>
          </div>
        ))}
      </div>

      {/* Process */}
      <div className="bg-gray-900 rounded-3xl p-8 text-white">
        <h2 className="text-xl font-bold mb-6 text-center">Comment récupérer votre colis</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: "📱", step: "1", title: "Recevez la notification", desc: "SMS et WhatsApp quand votre colis est prêt" },
            { icon: "🪪", step: "2", title: "Préparez votre pièce d'identité", desc: "CNI, passeport ou permis de conduire" },
            { icon: "📍", step: "3", title: "Rendez-vous au point", desc: "Aux horaires indiqués, avec votre n° de commande" },
            { icon: "✅", step: "4", title: "Récupérez & confirmez", desc: "L'argent est libéré au vendeur automatiquement" },
          ].map(({ icon, step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-orange-400 text-xs font-bold mb-1">ÉTAPE {step}</div>
              <div className="font-semibold text-sm mb-1">{title}</div>
              <div className="text-gray-400 text-xs">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12 max-w-2xl">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Questions fréquentes</h2>
        <div className="space-y-4">
          {[
            {
              q: "Combien de temps puis-je laisser mon colis au point de retrait ?",
              a: "Votre colis est conservé pendant 15 jours. Au-delà, il peut être renvoyé au vendeur.",
            },
            {
              q: "Quelqu'un d'autre peut-il récupérer mon colis ?",
              a: "Oui, avec une procuration écrite et la copie de votre pièce d'identité.",
            },
            {
              q: "Que faire si mon colis est endommagé ?",
              a: "Signalez-le immédiatement au responsable du point avant de confirmer la récupération. L'escrow sera maintenu et une réclamation sera ouverte.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="card p-5">
              <div className="font-semibold text-sm text-gray-900 mb-2">{q}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
