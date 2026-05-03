"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useCurrency, type AppCurrency } from "@/contexts/CurrencyContext";
import { cn } from "@/lib/utils";

const CURRENCIES: { code: AppCurrency; label: string; symbol: string }[] = [
  { code: "XAF", label: "Franc CFA", symbol: "FCFA" },
  { code: "EUR", label: "Euro",      symbol: "€"    },
  { code: "USD", label: "Dollar",    symbol: "$"    },
];

export function CurrencySwitcher() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = CURRENCIES.find(c => c.code === currency)!;

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all"
        aria-label="Changer de devise"
      >
        <span className="text-xs font-bold text-orange-600">{current.symbol}</span>
        <span className="hidden sm:block text-xs font-semibold">{current.code}</span>
        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          {CURRENCIES.map(c => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors",
                currency === c.code
                  ? "bg-orange-50 text-orange-700 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className="w-10 text-xs font-bold text-orange-500">{c.symbol}</span>
              <span className="flex-1 text-left">{c.label}</span>
              {currency === c.code && <Check className="w-3.5 h-3.5 text-orange-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
