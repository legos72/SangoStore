import Link from "next/link";
import { ArrowRight, Shield, Package, Truck, MapPin, CheckCircle } from "lucide-react";

const STEPS = [
  {
    number: "01",
    emoji: "🔍",
    title: "Parcourez les produits",
    desc: "Explorez notre catalogue de produits envoyés par la diaspora depuis la France, le Sénégal, le Cameroun et d'autres pays. Filtrez par pays d'origine, catégorie ou prix.",
    color: "orange",
    details: [
      "Filtrez par pays : 🇫🇷 France, 🇸🇳 Sénégal, 🇨🇲 Cameroun…",
      "Consultez le profil du vendeur et ses avis",
      "Chaque produit affiche clairement son pays de départ",
    ],
  },
  {
    number: "02",
    emoji: "🛒",
    title: "Passez votre commande",
    desc: "Ajoutez le produit à votre panier, choisissez votre point de retrait à Bangui et passez commande en quelques clics.",
    color: "blue",
    details: [
      "Choisissez votre point de retrait parmi nos 3 adresses à Bangui",
      "Entrez vos coordonnées et confirmez la commande",
      "Vous recevez un email et SMS de confirmation",
    ],
  },
  {
    number: "03",
    emoji: "💳",
    title: "Payez en sécurité (Escrow)",
    desc: "Payez par Orange Money ou en cash. Votre argent est immédiatement bloqué dans notre système d'escrow — ni le vendeur ni nous ne pouvons y toucher avant la livraison.",
    color: "green",
    details: [
      "Orange Money : code de confirmation par SMS",
      "Cash : paiement à valider dans les 24h",
      "Votre argent est 100% sécurisé jusqu'à la livraison",
    ],
  },
  {
    number: "04",
    emoji: "📦",
    title: "Le vendeur expédie via GP",
    desc: "Le vendeur est notifié et choisit un transporteur GP certifié depuis son pays. Il emballe le colis et remet un numéro de suivi.",
    color: "purple",
    details: [
      "Le vendeur a 3 jours pour expédier le colis",
      "Vous recevez le numéro de suivi du transporteur",
      "Vous pouvez suivre l'avancement en temps réel",
    ],
  },
  {
    number: "05",
    emoji: "🚢",
    title: "Transit vers Bangui",
    desc: "Le colis voyage depuis l'étranger jusqu'à Bangui via le réseau de transporteurs (avion, bateau ou route). Délai moyen : 2 à 4 semaines selon le pays de départ.",
    color: "yellow",
    details: [
      "France → Bangui : 3–4 semaines (via GP)",
      "Sénégal → Bangui : 2–3 semaines",
      "Cameroun → Bangui : 10–15 jours",
    ],
  },
  {
    number: "06",
    emoji: "🇨🇫",
    title: "Récupérez à Bangui",
    desc: "Quand votre colis arrive au point de retrait, vous recevez une notification. Présentez-vous avec votre pièce d'identité et votre numéro de commande.",
    color: "orange",
    details: [
      "Notification SMS + WhatsApp à l'arrivée",
      "3 points de retrait à Bangui",
      "Vérifiez le colis avant de confirmer",
    ],
  },
  {
    number: "07",
    emoji: "🔓",
    title: "Escrow libéré au vendeur",
    desc: "Une fois que vous confirmez la réception, l'argent est automatiquement libéré au vendeur. Transaction terminée !",
    color: "green",
    details: [
      "Confirmation depuis votre espace client",
      "Le vendeur reçoit son argent sous 24–48h",
      "Possibilité de laisser un avis sur le produit",
    ],
  },
];

const ROLES = [
  {
    icon: "🛒",
    title: "Client à Bangui",
    desc: "Créez votre compte, parcourez les produits, payez et récupérez.",
    action: { label: "Créer mon compte client", href: "/auth/register" },
  },
  {
    icon: "🏪",
    title: "Vendeur diaspora",
    desc: "Publiez vos produits depuis l'étranger, gérez vos commandes et recevez votre argent.",
    action: { label: "Devenir vendeur", href: "/auth/register" },
  },
  {
    icon: "🚚",
    title: "Transporteur GP",
    desc: "Publiez vos trajets et connectez-vous avec des expéditeurs de la diaspora.",
    action: { label: "S'inscrire comme GP", href: "/auth/register" },
  },
];

export default function CommentCaMarchePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-900 text-white py-16">
        <div className="page-container text-center">
          <div className="badge bg-orange-500/20 border-orange-500/30 text-orange-300 mb-6 mx-auto">
            Guide complet
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Comment ça marche ?
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            DiasporaMarket connecte la diaspora centrafricaine au pays.
            Un système simple, sécurisé et adapté à l'Afrique.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <div className="page-container">
          <div className="max-w-4xl mx-auto space-y-8">
            {STEPS.map(({ number, emoji, title, desc, details }, index) => (
              <div key={number} className="flex flex-col sm:flex-row gap-6">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-orange">
                    {emoji}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="w-0.5 h-8 bg-orange-200 mt-3" />
                  )}
                </div>
                <div className="card p-5 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                      Étape {number}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{desc}</p>
                  <ul className="space-y-1.5">
                    {details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Escrow explainer */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="page-container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-extrabold mb-4">Le système Escrow expliqué</h2>
            <p className="text-gray-300 leading-relaxed mb-10">
              L'escrow est un système de séquestre — votre argent est mis de côté par une tierce
              partie de confiance (DiasporaMarket), et libéré uniquement quand les deux parties
              sont satisfaites. C'est le standard mondial de l'e-commerce sécurisé.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              {[
                { icon: "💳", title: "Vous payez", desc: "L'argent est bloqué sur notre compte sécurisé, pas chez le vendeur" },
                { icon: "📦", title: "Livraison vérifiée", desc: "Vous récupérez votre colis et confirmez que tout est conforme" },
                { icon: "✅", title: "Paiement libéré", desc: "Le vendeur reçoit son argent seulement après votre confirmation" },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="bg-white/10 border border-white/10 rounded-2xl p-5">
                  <div className="text-3xl mb-3">{icon}</div>
                  <div className="font-semibold text-white mb-2">{title}</div>
                  <div className="text-sm text-gray-400 leading-relaxed">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-10">
            <h2 className="section-title">Quel est votre rôle ?</h2>
            <p className="section-subtitle">Rejoignez DiasporaMarket selon votre profil</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {ROLES.map(({ icon, title, desc, action }) => (
              <div key={title} className="card p-6 text-center">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>
                <Link href={action.href} className="btn-primary w-full justify-center">
                  {action.label} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="page-container">
          <div className="max-w-2xl mx-auto">
            <h2 className="section-title text-center mb-8">Questions fréquentes</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Que se passe-t-il si mon colis n'arrive jamais ?",
                  a: "Si le colis ne parvient pas à Bangui dans les délais (ou si la livraison échoue), l'escrow est automatiquement remboursé à l'acheteur dans son intégralité.",
                },
                {
                  q: "Les vendeurs sont-ils vérifiés ?",
                  a: "Oui. Chaque vendeur doit fournir une pièce d'identité et un justificatif de domicile. Un badge 'Vérifié' est affiché sur les profils contrôlés.",
                },
                {
                  q: "Quels sont les frais de la plateforme ?",
                  a: "DiasporaMarket prend une commission de 5% sur chaque transaction réussie. Les paiements Orange Money incluent 2% de frais supplémentaires. Le paiement en cash est sans frais.",
                },
                {
                  q: "Puis-je vendre si je suis en dehors des pays listés ?",
                  a: "Oui ! Contactez-nous par email ou WhatsApp pour ajouter votre pays de résidence à notre liste.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="card p-5">
                  <div className="font-semibold text-gray-900 mb-2">{q}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">{a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
