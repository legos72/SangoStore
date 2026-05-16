/**
 * SangoMarket — typed API client
 * Wraps fetch with auth headers, JSON parsing, and error normalisation.
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const { data } = await api.vendor.stats();
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  // blob: URLs are local browser previews — not valid remote URLs
  if (path.startsWith("blob:")) return "";
  // Old images stored as http://localhost:4000/uploads/... → extract relative path
  if (path.includes("localhost") || path.includes("127.0.0.1")) {
    const match = path.match(/\/uploads\/.+/);
    if (match) return `${BASE}${match[0]}`;
  }
  // Already a full external URL → keep as-is
  if (path.startsWith("http")) return path;
  // Relative path → prefix with API base
  return `${BASE}${path}`;
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sango_token");
}

export function setToken(token: string) {
  localStorage.setItem("sango_token", token);
}

export function clearToken() {
  localStorage.removeItem("sango_token");
  localStorage.removeItem("sango_user");
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("sango_user");
  return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function setUser(user: AuthUser) {
  localStorage.setItem("sango_user", JSON.stringify(user));
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "client" | "vendeur" | "transporteur" | "admin";
  accountStatus?: "pending" | "approved" | "rejected";
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
  pagination?: { total: number; page: number; limit: number; pages: number };
}

export interface VendorStats {
  totalProducts:   number;
  activeProducts:  number;
  totalOrders:     number;
  pendingOrders:   number;
  revenueBlocked:  number;
  revenueReleased: number;
  totalRevenue:    number;
  avgRating:       number;
  reviewCount:     number;
}

export interface RevenuePoint {
  label:       string;
  month:       string;
  revenue:     string;
  orders:      string;
}

export interface VendorProduct {
  id:               string;
  title:            string;
  price:            number;
  currency:         string;
  images:           string[];
  category:         string;
  origin_country:   string;
  stock:            number;
  is_available:     boolean;
  avg_rating:       string;
  review_count:     string;
  order_count:      string;
  created_at:       string;
  promo_price?:     string | null;
  promo_end?:       string | null;
  wholesale_prices?: { min_qty: number; max_qty?: number | null; price: number }[];
}

export interface VendorOrder {
  id:              string;
  order_number:    string;
  status:          string;
  total_amount:    number;
  currency:        string;
  payment_status:  string;
  escrow_released: boolean;
  client_name:     string;
  client_phone:    string;
  pickup_name:     string;
  pickup_address:  string;
  created_at:      string;
  items: {
    product_id: string;
    title:      string;
    image:      string;
    quantity:   number;
    unit_price: number;
    currency:   string;
    category:   string;
  }[];
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  const json: any = await res.json().catch(() => ({ status: "error", message: "Réponse invalide" }));

  if (!res.ok) {
    throw new Error(json?.message ?? `Erreur ${res.status}`);
  }

  return json as ApiResponse<T>;
}

function qs(params?: Record<string, string | undefined>): string {
  if (!params) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) p.set(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ─── API surface ──────────────────────────────────────────────────────────────

export const api = {

  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ token: string; user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),

    register: (data: {
      name: string; email: string; phone?: string;
      password: string; role: string; countryCode: string;
    }) =>
      apiFetch<{ token: string; user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    me: () => apiFetch<AuthUser>("/api/auth/me"),
  },

  // ── Products ──────────────────────────────────────────────────────────────
  products: {
    list: (params?: { search?: string; country?: string; category?: string; sortBy?: string; page?: string; limit?: string }) =>
      apiFetch<any[]>(`/api/products${qs(params as any)}`),

    get: (id: string) =>
      apiFetch<any>(`/api/products/${id}`),

    create: (data: {
      title: string; description?: string; price: number; currency: string;
      images: string[]; category: string; subcategory?: string; originCountry: string;
      stock: number; weightKg?: number; dimensions?: string; tags?: string[];
      promoPrice?: number | null; promoEnd?: string | null;
      wholesalePrices?: { min_qty: number; price: number }[];
    }) =>
      apiFetch<any>("/api/products", { method: "POST", body: JSON.stringify(data) }),

    update: (id: string, data: Partial<{
      title: string; description: string; price: number; currency: string;
      images: string[]; category: string; subcategory: string; originCountry: string;
      stock: number; isAvailable: boolean; weightKg: number;
      promoPrice: number | null; promoEnd: string | null;
      wholesalePrices: { min_qty: number; price: number }[];
    }>) =>
      apiFetch<any>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

    delete: (id: string) =>
      apiFetch<void>(`/api/products/${id}`, { method: "DELETE" }),
  },

  // ── Vendor (requires vendeur role) ────────────────────────────────────────
  vendor: {
    stats: () =>
      apiFetch<VendorStats>("/api/vendor/stats"),

    revenue: () =>
      apiFetch<RevenuePoint[]>("/api/vendor/revenue"),

    products: (params?: { page?: string; limit?: string; search?: string; category?: string; available?: string }) =>
      apiFetch<VendorProduct[]>(`/api/vendor/products${qs(params as any)}`),

    orders: (params?: { status?: string; page?: string; limit?: string }) =>
      apiFetch<VendorOrder[]>(`/api/vendor/orders${qs(params as any)}`),

    updateOrderStatus: (orderId: string, status: string) =>
      apiFetch<any>(`/api/vendor/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),

    notifications: () =>
      apiFetch<any[]>("/api/vendor/notifications"),

    markNotificationsRead: () =>
      apiFetch<void>("/api/vendor/notifications/read", { method: "PATCH" }),
  },

  // ── Orders ────────────────────────────────────────────────────────────────
  orders: {
    list: (params?: { status?: string; page?: string }) =>
      apiFetch<any[]>(`/api/orders${qs(params as any)}`),

    get: (id: string) =>
      apiFetch<any>(`/api/orders/${id}`),

    create: (data: { items: { productId: string; quantity: number }[]; paymentMethod: string; pickupPointId: string }) =>
      apiFetch<any>("/api/orders", { method: "POST", body: JSON.stringify(data) }),

    updateStatus: (id: string, status: string) =>
      apiFetch<any>(`/api/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  },

  // ── Payments ──────────────────────────────────────────────────────────────
  payments: {
    initiate: (orderId: string, paymentMethod: string, phoneNumber?: string) =>
      apiFetch<any>("/api/payments/initiate", {
        method: "POST",
        body: JSON.stringify({ orderId, paymentMethod, phoneNumber }),
      }),

    release: (orderId: string) =>
      apiFetch<any>(`/api/payments/release/${orderId}`, { method: "POST" }),

    refund: (orderId: string) =>
      apiFetch<any>(`/api/payments/refund/${orderId}`, { method: "POST" }),
  },

  // ── Transporters ──────────────────────────────────────────────────────────
  transporters: {
    list: (params?: { country?: string }) =>
      apiFetch<any[]>(`/api/transporters${qs(params as any)}`),

    get: (id: string) =>
      apiFetch<any>(`/api/transporters/${id}`),
  },

  // ── Trips ─────────────────────────────────────────────────────────────────
  trips: {
    list: (params?: { country?: string; departureDate?: string }) =>
      apiFetch<any[]>(`/api/trips${qs(params as any)}`),

    create: (data: {
      originCountry: string; destinationCity?: string;
      departureDate: string; arrivalDate?: string;
      pricePerKg: number; currency: string;
      availableCapacity: number; description?: string;
      depositDeadline?: string;
    }) =>
      apiFetch<any>("/api/trips", { method: "POST", body: JSON.stringify(data) }),

    patch: (id: string, data: any) =>
      apiFetch<any>(`/api/trips/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },

  // ── Transport bookings ────────────────────────────────────────────────────
  transport: {
    createBooking: (data: any) =>
      apiFetch<any>("/api/transport/bookings", { method: "POST", body: JSON.stringify(data) }),

    myBookings: () =>
      apiFetch<any[]>("/api/transport/bookings"),

    getBooking: (id: string) =>
      apiFetch<any>(`/api/transport/bookings/${id}`),

    track: (trackingNumber: string) =>
      apiFetch<any>(`/api/transport/track/${trackingNumber}`),

    // Transporter
    transporterBookings: (params?: { status?: string }) =>
      apiFetch<any[]>(`/api/transport/transporter/bookings${qs(params as any)}`),

    transporterTrips: () =>
      apiFetch<any[]>("/api/transport/transporter/trips"),

    acceptBooking: (id: string) =>
      apiFetch<any>(`/api/transport/bookings/${id}/status`, {
        method: "PATCH", body: JSON.stringify({ status: "accepted" }),
      }),

    refuseBooking: (id: string) =>
      apiFetch<any>(`/api/transport/bookings/${id}/status`, {
        method: "PATCH", body: JSON.stringify({ status: "refused" }),
      }),

    updateTracking: (id: string, trackingStatus: string, description?: string, location?: string) =>
      apiFetch<any>(`/api/transport/bookings/${id}/tracking`, {
        method: "PATCH", body: JSON.stringify({ trackingStatus, description, location }),
      }),
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    listUsers: (params?: { status?: string; role?: string; search?: string }) =>
      apiFetch<any[]>(`/api/admin/users${qs(params as any)}`),

    pendingCount: () =>
      apiFetch<{ count: number }>("/api/admin/users/pending-count"),

    stats: () =>
      apiFetch<any>("/api/admin/stats"),

    listProducts: (params?: { search?: string; category?: string; available?: string }) =>
      apiFetch<any[]>(`/api/admin/products${qs(params as any)}`),

    listOrders: (params?: { status?: string }) =>
      apiFetch<any[]>(`/api/admin/orders${qs(params as any)}`),

    suspendUser: (id: string, isActive: boolean) =>
      apiFetch<any>(`/api/admin/users/${id}/active`, {
        method: "PATCH", body: JSON.stringify({ isActive }),
      }),

    messageUser: (id: string, subject: string, message: string) =>
      apiFetch<any>(`/api/admin/users/${id}/message`, {
        method: "POST", body: JSON.stringify({ subject, message }),
      }),

    toggleProduct: (id: string, isAvailable: boolean) =>
      apiFetch<any>(`/api/admin/products/${id}/availability`, {
        method: "PATCH", body: JSON.stringify({ isAvailable }),
      }),

    deleteProduct: (id: string) =>
      apiFetch<void>(`/api/admin/products/${id}`, { method: "DELETE" }),

    updateProductFlags: (id: string, flags: {
      isTrending?: boolean; isFlashSale?: boolean; isFeatured?: boolean;
      isFastDelivery?: boolean; flashSaleEnd?: string | null; sectionPriority?: number;
    }) =>
      apiFetch<any>(`/api/admin/products/${id}/flags`, {
        method: "PATCH", body: JSON.stringify(flags),
      }),

    updateUserStatus: (id: string, status: "approved" | "rejected", reason?: string) =>
      apiFetch<any>(`/api/admin/users/${id}/status`, {
        method: "PATCH", body: JSON.stringify({ status, reason }),
      }),
  },
};
