import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { OrderStatus, ProductCategory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency: string): string {
  if (currency === "XAF") {
    return new Intl.NumberFormat("fr-FR").format(amount) + " FCFA";
  }
  if (currency === "EUR") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  }
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  return `${amount} ${currency}`;
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "En attente",
  paye: "Payé",
  en_preparation: "En préparation",
  expedie: "En transit",
  arrive_bangui: "Arrivé à Bangui",
  pret_retrait: "Prêt au retrait",
  recupere: "Récupéré",
  annule: "Annulé",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: "bg-gray-100 text-gray-700",
  paye: "bg-blue-100 text-blue-700",
  en_preparation: "bg-yellow-100 text-yellow-700",
  expedie: "bg-orange-100 text-orange-700",
  arrive_bangui: "bg-purple-100 text-purple-700",
  pret_retrait: "bg-green-100 text-green-700",
  recupere: "bg-gray-200 text-gray-600",
  annule: "bg-red-100 text-red-700",
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  electronique: "Électronique",
  mode: "Mode & Vêtements",
  alimentation: "Alimentation",
  maison: "Maison & Décoration",
  beaute: "Beauté & Soins",
  jouets: "Jouets & Enfants",
  sante: "Santé & Bien-être",
  sport: "Sport & Loisirs",
  auto: "Auto & Moto",
  autre: "Autre",
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  electronique: "📱",
  mode: "👗",
  alimentation: "🥘",
  maison: "🏠",
  beaute: "💄",
  jouets: "🧸",
  sante: "💊",
  sport: "⚽",
  auto: "🚗",
  autre: "📦",
};

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "…";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
