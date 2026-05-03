"use client";

import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface CountryFilterProps {
  selected: string | null;
  onChange: (code: string | null) => void;
}

export function CountryFilter({ selected, onChange }: CountryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* "Tous" pill */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all duration-150",
          selected === null
            ? "border-orange-500 bg-orange-500 text-white shadow-orange"
            : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
        )}
      >
        🌍 Tous les pays
      </button>

      {COUNTRIES.map((country) => (
        <button
          key={country.code}
          onClick={() => onChange(selected === country.code ? null : country.code)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-sm font-medium transition-all duration-150",
            selected === country.code
              ? "border-orange-500 bg-orange-500 text-white shadow-orange"
              : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
          )}
        >
          <span>{country.flag}</span>
          <span>{country.name}</span>
        </button>
      ))}
    </div>
  );
}
