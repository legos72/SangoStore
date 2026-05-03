"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountryFilterProps {
  selected: string | null;
  onChange: (code: string | null) => void;
}

export function CountryFilter({ selected, onChange }: CountryFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find(c => c.code === selected) ?? null;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function select(code: string | null) {
    onChange(code);
    setOpen(false);
  }

  return (
    <div className="relative w-full sm:w-64" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
          open
            ? "border-orange-400 ring-2 ring-orange-100 bg-white"
            : selected
            ? "border-orange-400 bg-orange-50 text-orange-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50"
        )}
      >
        <span className="flex items-center gap-2 truncate">
          <span className="text-base leading-none">
            {selectedCountry ? selectedCountry.flag : "🌍"}
          </span>
          <span className="truncate">
            {selectedCountry ? selectedCountry.name : "Tous les pays"}
          </span>
        </span>
        <ChevronDown className={cn("w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-1.5 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
          <div className="max-h-64 overflow-y-auto py-1.5">
            {/* Tous les pays */}
            <button
              type="button"
              onClick={() => select(null)}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-orange-50",
                selected === null ? "text-orange-600 bg-orange-50/60" : "text-gray-700"
              )}
            >
              <span className="flex items-center gap-2">
                <span className="text-base leading-none">🌍</span>
                <span>Tous les pays</span>
              </span>
              {selected === null && <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />}
            </button>

            <div className="mx-3 my-1 border-t border-gray-100" />

            {COUNTRIES.map(country => (
              <button
                key={country.code}
                type="button"
                onClick={() => select(country.code)}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-orange-50",
                  selected === country.code ? "text-orange-600 bg-orange-50/60" : "text-gray-700"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base leading-none">{country.flag}</span>
                  <span>{country.name}</span>
                </span>
                {selected === country.code && <Check className="w-4 h-4 text-orange-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
