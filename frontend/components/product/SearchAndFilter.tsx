"use client";

import { Search, X } from "lucide-react";
import type { ProductFilters, ProductCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/utils";
import { CountryFilter } from "./CountryFilter";
import { COUNTRIES } from "@/lib/countries";
import { cn } from "@/lib/utils";

interface SearchAndFilterProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  totalResults?: number;
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

const SORT_OPTIONS = [
  { value: "newest",     label: "Plus récents" },
  { value: "price_asc",  label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating",     label: "Mieux notés" },
];

const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
    {children}
  </span>
);

export function SearchAndFilter({ filters, onChange, totalResults }: SearchAndFilterProps) {
  const activeChips: { label: string; onRemove: () => void }[] = [];

  if (filters.countryCode) {
    const country = COUNTRIES.find(c => c.code === filters.countryCode);
    activeChips.push({
      label: country ? `${country.flag} ${country.name}` : filters.countryCode,
      onRemove: () => onChange({ ...filters, countryCode: undefined }),
    });
  }
  if (filters.category) activeChips.push({
    label: CATEGORY_LABELS[filters.category] ?? filters.category,
    onRemove: () => onChange({ ...filters, category: undefined }),
  });
  if (filters.minPrice) activeChips.push({
    label: `≥ ${filters.minPrice.toLocaleString()} FCFA`,
    onRemove: () => onChange({ ...filters, minPrice: undefined }),
  });
  if (filters.maxPrice) activeChips.push({
    label: `≤ ${filters.maxPrice.toLocaleString()} FCFA`,
    onRemove: () => onChange({ ...filters, maxPrice: undefined }),
  });

  return (
    <div className="space-y-4">

      {/* Row 1 — Search + Sort */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher un produit, une marque…"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            className="input pl-10 pr-10"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: undefined })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-shrink-0">
          <select
            value={filters.sortBy || "newest"}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as ProductFilters["sortBy"] })}
            className="select w-40 sm:w-48"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2 — Filters grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">

        <div>
          <Label>Pays d'origine</Label>
          <CountryFilter
            selected={filters.countryCode || null}
            onChange={(code) => onChange({ ...filters, countryCode: code || undefined })}
          />
        </div>

        <div>
          <Label>Catégorie</Label>
          <select
            value={filters.category || ""}
            onChange={(e) =>
              onChange({ ...filters, category: (e.target.value as ProductCategory) || undefined })
            }
            className="select w-full"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label>Prix min (FCFA)</Label>
          <input
            type="number"
            placeholder="0"
            min={0}
            value={filters.minPrice || ""}
            onChange={(e) =>
              onChange({ ...filters, minPrice: e.target.value ? +e.target.value : undefined })
            }
            className="input w-full"
          />
        </div>

        <div>
          <Label>Prix max (FCFA)</Label>
          <input
            type="number"
            placeholder="Sans limite"
            min={0}
            value={filters.maxPrice || ""}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: e.target.value ? +e.target.value : undefined })
            }
            className="input w-full"
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
            Filtres actifs :
          </span>
          {activeChips.map((chip) => (
            <button
              key={chip.label}
              onClick={chip.onRemove}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1",
                "bg-orange-50 text-orange-700 border border-orange-200 rounded-full",
                "text-xs font-semibold hover:bg-orange-100 transition-colors"
              )}
            >
              {chip.label}
              <X className="w-3 h-3 opacity-60" />
            </button>
          ))}
          <button
            onClick={() => onChange({ sortBy: filters.sortBy })}
            className="text-xs text-gray-400 hover:text-gray-700 font-medium transition-colors underline underline-offset-2 ml-1"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}
