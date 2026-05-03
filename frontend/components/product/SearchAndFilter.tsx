"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ProductFilters, ProductCategory } from "@/lib/types";
import { CATEGORY_LABELS } from "@/lib/utils";
import { CountryFilter } from "./CountryFilter";
import { cn } from "@/lib/utils";

interface SearchAndFilterProps {
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  totalResults?: number;
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

const SORT_OPTIONS = [
  { value: "newest", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
];

export function SearchAndFilter({ filters, onChange, totalResults }: SearchAndFilterProps) {
  const hasActiveFilters =
    filters.countryCode || filters.category || filters.minPrice || filters.maxPrice;

  return (
    <div className="space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un produit…"
            value={filters.search || ""}
            onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
            className="input pl-10"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ ...filters, search: undefined })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={filters.sortBy || "newest"}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as ProductFilters["sortBy"] })}
          className="select w-full sm:w-48"
        >
          {SORT_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Country filter */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Filtrer par pays d'origine
          </span>
          {filters.countryCode && (
            <button
              onClick={() => onChange({ ...filters, countryCode: undefined })}
              className="text-xs text-orange-500 hover:text-orange-700 font-medium"
            >
              Effacer
            </button>
          )}
        </div>
        <CountryFilter
          selected={filters.countryCode || null}
          onChange={(code) => onChange({ ...filters, countryCode: code || undefined })}
        />
      </div>

      {/* Category + Price row */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Catégorie
          </label>
          <select
            value={filters.category || ""}
            onChange={(e) =>
              onChange({ ...filters, category: (e.target.value as ProductCategory) || undefined })
            }
            className="select"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Prix min (FCFA)
          </label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice || ""}
            onChange={(e) =>
              onChange({ ...filters, minPrice: e.target.value ? +e.target.value : undefined })
            }
            className="input w-32"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Prix max (FCFA)
          </label>
          <input
            type="number"
            placeholder="∞"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              onChange({ ...filters, maxPrice: e.target.value ? +e.target.value : undefined })
            }
            className="input w-32"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => onChange({ sortBy: filters.sortBy })}
            className="btn-ghost text-sm flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Results count */}
      {totalResults !== undefined && (
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-gray-900">{totalResults}</span> produit{totalResults > 1 ? "s" : ""} trouvé{totalResults > 1 ? "s" : ""}
          {filters.countryCode && (
            <span> depuis {filters.countryCode}</span>
          )}
        </div>
      )}
    </div>
  );
}
