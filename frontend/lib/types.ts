// ─── PAYS ─────────────────────────────────────────────────────────────────────

export interface Country {
  code: string;       // "FR"
  name: string;       // "France"
  flag: string;       // "🇫🇷"
  phonePrefix: string; // "+33"
}

// ─── UTILISATEURS ─────────────────────────────────────────────────────────────

export type UserRole = "client" | "vendeur" | "transporteur" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  countryCode: string; // pays de résidence
  avatar?: string;
  createdAt: string;
  isVerified: boolean;
}

// ─── PRODUITS ─────────────────────────────────────────────────────────────────

export type ProductCategory =
  | "electronique"
  | "mode"
  | "alimentation"
  | "maison"
  | "beaute"
  | "jouets"
  | "sante"
  | "sport"
  | "auto"
  | "autre";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: "XAF" | "EUR" | "USD";
  images: string[];
  category: ProductCategory;
  originCountry: Country;    // PAYS D'ORIGINE — OBLIGATOIRE
  seller: User;
  stock: number;
  weight?: number;           // kg
  dimensions?: string;       // "30x20x10 cm"
  tags: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  createdAt: string;
  // Promotion
  promoPrice?: number | null;
  promoEnd?: string | null;
  // Wholesale tiers
  wholesalePrices?: { min_qty: number; max_qty?: number | null; price: number }[];
  // Options produit
  colors?: string[];
  localDeliveryCostXAF?: number;
  // Section flags (admin-managed)
  isTrending?:      boolean;
  isFlashSale?:     boolean;
  isFeatured?:      boolean;
  isFastDelivery?:  boolean;
  flashSaleEnd?:    string | null;
  sectionPriority?: number;
}

// ─── COMMANDES ────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "en_attente"
  | "paye"
  | "en_preparation"
  | "expedie"
  | "arrive_bangui"
  | "pret_retrait"
  | "recupere"
  | "annule";

export interface OrderItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  client: User;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: "orange_money" | "cash";
  paymentStatus: "en_attente" | "bloque" | "libere" | "rembourse";
  escrowReleased: boolean;
  pickupPoint?: PickupPoint;
  trackingNumber?: string;
  transporter?: Transporter;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Logistique
  selectedTrip?: Trip;
  deliveryType?: "pickup" | "home";
  localDeliveryCost?: number;     // XAF
  transportCost?: number;
  transportCurrency?: "XAF" | "EUR" | "USD";
  estimatedDeliveryDate?: string;
  selectedColor?: string;
}

// ─── TRANSPORTEURS ────────────────────────────────────────────────────────────

export interface Transporter {
  id: string;
  user: User;
  companyName: string;
  description: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  contact: {
    phone: string;
    whatsapp?: string;
    email?: string;
  };
}

export interface Trip {
  id: string;
  transporter: Transporter;
  originCountry: Country;
  destinationCity: string;   // "Bangui"
  departureDate: string;
  arrivalDate?: string;
  pricePerKg: number;
  currency: "XAF" | "EUR" | "USD";
  availableCapacity: number; // kg
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── POINTS DE RETRAIT ────────────────────────────────────────────────────────

export interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  openingHours: string;
  coordinates?: { lat: number; lng: number };
  isActive: boolean;
}

// ─── AVIS ─────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  author: User;
  rating: number;       // 1-5
  comment: string;
  targetId: string;     // product id or transporter id
  targetType: "product" | "transporter";
  createdAt: string;
}

// ─── FILTRES ──────────────────────────────────────────────────────────────────

export interface ProductFilters {
  search?: string;
  countryCode?: string;
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  sortBy?: "newest" | "price_asc" | "price_desc" | "rating";
}

export interface TripFilters {
  countryCode?: string;
  departureDate?: string;
}
