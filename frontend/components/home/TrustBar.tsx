import { Lock, Truck, ShieldCheck, Headphones, BadgeCheck } from "lucide-react";

const ITEMS = [
  { icon: Lock,        label: "Paiement sécurisé",  desc: "Transactions 100% protégées"    },
  { icon: Truck,       label: "Livraison suivie",    desc: "Dans tous les pays d'Afrique"   },
  { icon: ShieldCheck, label: "Escrow garanti",      desc: "Votre argent est protégé"       },
  { icon: Headphones,  label: "Support 24/7",        desc: "WhatsApp & Email"               },
  { icon: BadgeCheck,  label: "Vendeurs certifiés",  desc: "Vérifiés et approuvés"          },
];

export function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between gap-3 sm:gap-6 py-3.5 sm:py-5 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {ITEMS.map(({ icon: Icon, label, desc }, idx) => (
            <div key={label} className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
              {/* Separator */}
              {idx > 0 && (
                <div className="hidden sm:block w-px h-8 bg-gray-100 flex-shrink-0" />
              )}
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
              </div>
              <div>
                <div className="text-[11px] sm:text-xs font-bold text-gray-800 leading-none whitespace-nowrap">{label}</div>
                <div className="text-[9px] sm:text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block whitespace-nowrap">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
