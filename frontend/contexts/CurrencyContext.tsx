"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Taux indicatifs (1 EUR = 655,96 XAF fixe CFA) ────────────────────────────

export type AppCurrency = "EUR" | "XAF" | "USD";

const TO_XAF: Record<AppCurrency, number> = {
  XAF: 1,
  EUR: 655.96,
  USD: 606,    // ≈ indicatif
};

const CURRENCY_SYMBOLS: Record<AppCurrency, string> = {
  EUR: "€",
  XAF: "FCFA",
  USD: "$",
};

// ─── Formatage ────────────────────────────────────────────────────────────────

function fmt(amount: number, currency: AppCurrency): string {
  const rounded = Math.round(amount);
  if (currency === "XAF") {
    return new Intl.NumberFormat("fr-FR").format(rounded) + " FCFA";
  }
  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(rounded);
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(rounded);
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CurrencyContextValue {
  currency: AppCurrency;
  setCurrency: (c: AppCurrency) => void;
  /** Convertit amount (dans `from`) vers la devise sélectionnée */
  convert: (amount: number, from: AppCurrency | string) => number;
  /** Formate après conversion */
  format: (amount: number, from: AppCurrency | string) => string;
  /** Formate dans la devise d'origine (sans conversion) */
  formatOriginal: (amount: number, from: AppCurrency | string) => string;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "sangomarket_currency";

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<AppCurrency>("XAF");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AppCurrency | null;
      if (stored && stored in TO_XAF) setCurrencyState(stored);
    } catch { /* SSR */ }
  }, []);

  const setCurrency = useCallback((c: AppCurrency) => {
    setCurrencyState(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch { /* ignore */ }
  }, []);

  const convert = useCallback((amount: number, from: AppCurrency | string): number => {
    const fromRate = TO_XAF[from as AppCurrency] ?? 1;
    const toRate   = TO_XAF[currency];
    return (amount * fromRate) / toRate;
  }, [currency]);

  const format = useCallback((amount: number, from: AppCurrency | string): string => {
    return fmt(convert(amount, from), currency);
  }, [convert, currency]);

  const formatOriginal = useCallback((amount: number, from: AppCurrency | string): string => {
    return fmt(amount, from as AppCurrency);
  }, []);

  return (
    <CurrencyContext.Provider value={{
      currency, setCurrency, convert, format, formatOriginal, symbol: CURRENCY_SYMBOLS[currency],
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside CurrencyProvider");
  return ctx;
}
