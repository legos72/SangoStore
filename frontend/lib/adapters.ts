import { COUNTRIES } from "@/lib/countries";
import type { Product, ProductCategory } from "@/lib/types";

function parseImages(raw: any): string[] {
  let arr: any[] = [];

  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === "string" && raw.startsWith("[")) {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  } else if (typeof raw === "string" && raw.startsWith("{")) {
    // PostgreSQL literal: {url1,url2}
    arr = raw.slice(1, -1).split(",").map(s => s.replace(/^"|"$/g, ""));
  }

  return arr
    .map((u: any) => (typeof u === "string" ? u.trim() : ""))
    .filter(Boolean);
}

function parseWholesalePrices(raw: any): { min_qty: number; price: number }[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

export function apiToProduct(p: any): Product {
  const country = COUNTRIES.find(c => c.code === p.origin_country) ?? {
    code: p.origin_country ?? "CF",
    name: p.origin_country ?? "",
    flag: (() => {
      const c = (p.origin_country ?? "").toUpperCase();
      return c.length === 2
        ? String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65, 0x1F1E6 + c.charCodeAt(1) - 65)
        : "🌍";
    })(),
    phonePrefix: "",
  };
  return {
    id: p.id,
    title: p.title ?? "",
    description: p.description ?? "",
    price: parseFloat(p.price ?? "0"),
    currency: (p.currency as "XAF" | "EUR" | "USD") ?? "XAF",
    images: parseImages(p.images),
    category: (p.category as ProductCategory) ?? "autre",
    subcategory: p.subcategory ?? undefined,
    originCountry: country,
    seller: {
      id: p.seller_id ?? "",
      name: p.seller_name ?? "Vendeur",
      email: "",
      role: "vendeur" as const,
      countryCode: p.origin_country ?? "CF",
      createdAt: "",
      isVerified: false,
    },
    stock: p.stock ?? 10,
    weight: p.weight ? parseFloat(p.weight) : 0.5,
    dimensions: p.dimensions,
    colors: p.colors ?? [],
    localDeliveryCostXAF: p.local_delivery_cost_xaf ?? 2500,
    tags: p.tags ?? [],
    rating: parseFloat(p.rating ?? "4.0"),
    reviewCount: p.review_count ?? 0,
    isAvailable: p.is_available ?? true,
    createdAt: p.created_at ?? "",
    promoPrice: p.promo_price != null ? parseFloat(p.promo_price) : null,
    promoEnd: p.promo_end ?? null,
    wholesalePrices: parseWholesalePrices(p.wholesale_prices),
    isTrending:      p.is_trending      ?? false,
    isFlashSale:     p.is_flash_sale    ?? false,
    isFeatured:      p.is_featured      ?? false,
    isFastDelivery:  p.is_fast_delivery ?? false,
    flashSaleEnd:    p.flash_sale_end   ?? null,
    sectionPriority: p.section_priority ?? 0,
  };
}
