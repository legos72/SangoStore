import { Lock, Truck, ShieldCheck, Headphones, BadgeCheck } from "lucide-react";

const ITEMS = [
  { icon: Lock,        label: "Paiement sécurisé",  desc: "Orange Money & Cash"      },
  { icon: Truck,       label: "Livraison suivie",    desc: "Vers Bangui"              },
  { icon: ShieldCheck, label: "Escrow garanti",      desc: "Remboursement assuré"     },
  { icon: Headphones,  label: "Support 24/7",        desc: "7j/7 par WhatsApp"        },
  { icon: BadgeCheck,  label: "Vendeurs certifiés",  desc: "Vérifiés par SangoStore"  },
];

export function TrustBar() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="flex items-center justify-between gap-3 sm:gap-6 py-3 sm:py-4 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {ITEMS.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-semibold text-gray-800 leading-none">{label}</div>
                <div className="text-[10px] text-gray-400 leading-none mt-0.5">{desc}</div>
              </div>
              <div className="sm:hidden text-[10px] font-semibold text-gray-700 leading-none whitespace-nowrap">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
