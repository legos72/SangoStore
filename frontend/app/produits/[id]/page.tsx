"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star, ShoppingCart, Package, Shield, Phone,
  MessageCircle, CheckCircle, Truck, Weight, Minus, Plus,
  Calendar, MapPin, Home, ChevronRight, ChevronDown, ChevronUp,
  Info, Plane, Globe, X, User, Loader2,
} from "lucide-react";
import { MOCK_PRODUCTS, MOCK_TRIPS } from "@/lib/data";
import { formatPrice, CATEGORY_LABELS, CATEGORY_ICONS } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { api, getImageUrl } from "@/lib/api";
import { apiToProduct } from "@/lib/adapters";
import type { Trip, Transporter, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

// ─── Transport mode helper ────────────────────────────────────────────────────

interface TransportInfo {
  mode: string;
  icon: string;
  emoji: string;
  delay: string;
  color: string;
}

function getTransportInfo(countryCode: string): TransportInfo {
  const map: Record<string, TransportInfo> = {
    FR: { mode: "Aérien",          icon: "✈️", emoji: "✈️", delay: "3–4 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"    },
    DE: { mode: "Aérien",          icon: "✈️", emoji: "✈️", delay: "4–6 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"    },
    ES: { mode: "Aérien",          icon: "✈️", emoji: "✈️", delay: "4–5 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"    },
    PT: { mode: "Aérien",          icon: "✈️", emoji: "✈️", delay: "4–5 semaines", color: "bg-sky-50 border-sky-200 text-sky-700"    },
    SN: { mode: "Aérien / Route",  icon: "✈️", emoji: "✈️", delay: "3–5 semaines", color: "bg-violet-50 border-violet-200 text-violet-700" },
    CM: { mode: "Terrestre",       icon: "🚛", emoji: "🚛", delay: "10–15 jours",  color: "bg-amber-50 border-amber-200 text-amber-700"   },
    CI: { mode: "Terrestre",       icon: "🚛", emoji: "🚛", delay: "2–3 semaines", color: "bg-amber-50 border-amber-200 text-amber-700"   },
  };
  return map[countryCode] ?? { mode: "Aérien", icon: "✈️", emoji: "✈️", delay: "3–6 semaines", color: "bg-sky-50 border-sky-200 text-sky-700" };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtShort(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TransporterGroupCard({
  transporter,
  trips,
  selectedTripId,
  onSelect,
}: {
  transporter: Transporter;
  trips: Trip[];
  selectedTripId: string | null;
  onSelect: (trip: Trip) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isAnySelected = trips.some((t) => t.id === selectedTripId);

  return (
    <div className={cn(
      "rounded-2xl border-2 transition-all",
      isAnySelected ? "border-orange-400 shadow-md" : "border-gray-100"
    )}>
      {/* Transporter header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-extrabold text-orange-600 text-lg flex-shrink-0">
            {transporter.companyName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-gray-900">{transporter.companyName}</span>
              {transporter.isVerified && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-2.5 h-2.5" /> Vérifié
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{transporter.rating}</span>
              <span className="text-xs text-gray-400">({transporter.reviewCount} avis)</span>
              <span className="text-gray-300 mx-1">·</span>
              <span className="text-xs text-gray-500">{trips.length} trajet{trips.length > 1 ? "s" : ""} disponible{trips.length > 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Contact buttons */}
          <div className="hidden sm:flex items-center gap-2">
            {transporter.contact.whatsapp && (
              <a
                href={`https://wa.me/${transporter.contact.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            <a
              href={`tel:${transporter.contact.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Appel
            </a>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Trips list */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2.5 border-t border-gray-50 pt-3">
          <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-3">
            Sélectionner un voyage
          </p>
          {trips.map((trip) => {
            const isSelected = trip.id === selectedTripId;
            const duration = trip.arrivalDate ? daysBetween(trip.departureDate, trip.arrivalDate) : null;

            return (
              <button
                key={trip.id}
                onClick={() => onSelect(trip)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-3 sm:p-4 transition-all",
                  isSelected
                    ? "border-orange-400 bg-orange-50"
                    : "border-gray-100 hover:border-orange-200 hover:bg-orange-50/40"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: route + dates */}
                  <div className="flex-1 min-w-0">
                    {/* Route indicator */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">{trip.originCountry.flag}</span>
                      <div className="flex-1 h-px bg-orange-300 relative max-w-[40px]">
                        <Truck className="w-3.5 h-3.5 text-orange-400 absolute -top-1.5 left-1/2 -translate-x-1/2 bg-white" />
                      </div>
                      <span className="text-base">🇨🇫</span>
                      <span className="text-xs text-gray-500 font-medium">Bangui</span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-3 sm:gap-5 text-xs">
                      <div>
                        <p className="text-gray-400 font-medium">Départ</p>
                        <p className="font-bold text-gray-800">{fmtShort(trip.departureDate)}</p>
                      </div>
                      {trip.arrivalDate && (
                        <>
                          <ChevronRight className="w-3 h-3 text-gray-300" />
                          <div>
                            <p className="text-gray-400 font-medium">Arrivée estimée</p>
                            <p className="font-bold text-orange-600">{fmtShort(trip.arrivalDate)}</p>
                          </div>
                          {duration && (
                            <div className="hidden sm:block">
                              <p className="text-gray-400 font-medium">Durée</p>
                              <p className="font-semibold text-gray-700">{duration} jours</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {trip.description && (
                      <p className="text-[11px] text-gray-400 mt-1.5 line-clamp-1">{trip.description}</p>
                    )}
                  </div>

                  {/* Right: price + capacity */}
                  <div className="text-right flex-shrink-0">
                    <div className="font-extrabold text-sm text-gray-900">
                      {formatPrice(trip.pricePerKg, trip.currency)}<span className="font-normal text-gray-400">/kg</span>
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      {trip.availableCapacity} kg dispo
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5">
                        <CheckCircle className="w-2.5 h-2.5" /> Choisi
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Mobile contacts */}
          <div className="flex sm:hidden items-center gap-2 pt-1">
            {transporter.contact.whatsapp && (
              <a
                href={`https://wa.me/${transporter.contact.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-3 py-2 rounded-lg"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
            <a
              href={`tel:${transporter.contact.phone}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg"
            >
              <Phone className="w-3.5 h-3.5" /> Appeler
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Price Summary ────────────────────────────────────────────────────────────

function PriceSummary({
  productPrice,
  productCurrency,
  qty,
  weight,
  selectedTrip,
  localDelivery,
  localDeliveryCostXAF,
}: {
  productPrice: number;
  productCurrency: "XAF" | "EUR" | "USD";
  qty: number;
  weight: number;
  selectedTrip: Trip | null;
  localDelivery: boolean;
  localDeliveryCostXAF: number;
}) {
  const subtotal = productPrice * qty;
  const transportCost = selectedTrip ? weight * qty * selectedTrip.pricePerKg : null;
  const localCost = localDelivery ? localDeliveryCostXAF : 0;
  const sameCurrency = selectedTrip && selectedTrip.currency === productCurrency;

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 sm:p-5 space-y-3">
      <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
        <Shield className="w-4 h-4 text-orange-500" /> Récapitulatif des coûts
      </h3>

      <div className="space-y-2 text-sm">
        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Produit × {qty}</span>
          <span className="font-semibold text-gray-900">{formatPrice(subtotal, productCurrency)}</span>
        </div>

        {/* Transport */}
        {transportCost !== null ? (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-orange-400" />
              Transport GP (~{weight * qty} kg)
            </span>
            <span className="font-semibold text-gray-900">
              {formatPrice(transportCost, selectedTrip!.currency)}
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between opacity-50">
            <span className="text-gray-500 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5" /> Transport GP
            </span>
            <span className="text-xs text-gray-400 italic">choisir un transporteur</span>
          </div>
        )}

        {/* Local delivery */}
        {localDelivery && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-blue-400" /> Livraison domicile Bangui
            </span>
            <span className="font-semibold text-gray-900">{formatPrice(localCost, "XAF")}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-orange-200 pt-2">
        {sameCurrency ? (
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">Total estimé</span>
            <span className="font-extrabold text-lg text-orange-600">
              {formatPrice(subtotal + (transportCost ?? 0) + localCost, productCurrency)}
            </span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">Produit</span>
              <span className="font-bold text-gray-900">{formatPrice(subtotal, productCurrency)}</span>
            </div>
            {transportCost !== null && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Transport</span>
                <span className="font-bold text-gray-900">{formatPrice(transportCost, selectedTrip!.currency)}</span>
              </div>
            )}
            {localDelivery && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">Livraison locale</span>
                <span className="font-bold text-gray-900">{formatPrice(localCost, "XAF")}</span>
              </div>
            )}
            <p className="text-[11px] text-gray-400 pt-1">* Montants dans leurs devises respectives, conversion à la commande.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  // useParams() est la méthode correcte pour les composants client
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";

  // Cherche d'abord dans les mocks (IDs courts), puis fallback API pour les vrais UUIDs
  const mockProduct = MOCK_PRODUCTS.find((p) => p.id === id) ?? null;

  // ── ALL hooks unconditionally at the top ──
  const [apiProduct, setApiProduct]   = useState<Product | null>(null);
  const [apiLoading, setApiLoading]   = useState(!mockProduct);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    mockProduct?.colors?.[0] ?? null
  );

  // Fallback API — uniquement si le produit n'existe pas dans les mocks
  useEffect(() => {
    if (mockProduct || !id) { setApiLoading(false); return; }
    (api.products as any).get(id)
      .then((res: any) => {
        const raw = res?.data ?? res;   // handle both { data: {...} } and bare object
        const p = apiToProduct(raw);
        setApiProduct(p);
        setSelectedColor(p.colors?.[0] ?? null);
      })
      .catch(() => setApiProduct(null))
      .finally(() => setApiLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const product = mockProduct ?? apiProduct;
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);
  // ── Delivery system ──
  const [deliveryDestination, setDeliveryDestination] = useState<"local" | "bangui" | null>(null);
  const [localAddress, setLocalAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerBanguiAddress, setCustomerBanguiAddress] = useState("");
  const [receptionMode, setReceptionMode] = useState<"pickup" | "home" | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [deliveryHighlighted, setDeliveryHighlighted] = useState(false);
  const deliverySectionRef = useRef<HTMLDivElement>(null);
  const [banguiMode, setBanguiMode] = useState<"standard" | "advanced" | null>(null);
  const [pendingTrip, setPendingTrip] = useState<Trip | null>(null);
  const [showTripConfirmModal, setShowTripConfirmModal] = useState(false);

  const availableTrips = useMemo(
    () =>
      MOCK_TRIPS
        .filter((t) => t.originCountry.code === (product?.originCountry.code ?? "") && t.isActive)
        .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime()),
    [product?.originCountry.code]
  );

  const transporterGroups = useMemo(() => {
    const groups: Record<string, { transporter: Transporter; trips: Trip[] }> = {};
    for (const trip of availableTrips) {
      const key = trip.transporter.id;
      if (!groups[key]) groups[key] = { transporter: trip.transporter, trips: [] };
      groups[key].trips.push(trip);
    }
    return Object.values(groups);
  }, [availableTrips]);

  // ── Guard after all hooks ──
  if (apiLoading) {
    return (
      <div className="page-container py-20 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-xl font-bold text-gray-900">Produit introuvable</h1>
        <Link href="/produits" className="btn-primary mt-6 inline-flex">Retour aux produits</Link>
      </div>
    );
  }

  const related = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && p.originCountry.code === product.originCountry.code
  ).slice(0, 4);

  const weight = product.weight ?? 0.5;
  const localDeliveryCostXAF = product.localDeliveryCostXAF ?? 2500;
  const transport = getTransportInfo(product.originCountry.code);
  const isLongDesc = product.description.length > 200;

  // Meilleur trip dispo pour le mode Standard (moins cher)
  const standardTrip = availableTrips.length > 0
    ? [...availableTrips].sort((a, b) => a.pricePerKg - b.pricePerKg)[0]
    : null;

  // ── Confirmation voyage GP (mode avancé) ──
  function handleTripConfirm() {
    if (pendingTrip) setSelectedTrip(pendingTrip);
    setPendingTrip(null);
    setShowTripConfirmModal(false);
    setTimeout(() => {
      deliverySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  function handleTripCancel() {
    setPendingTrip(null);
    setShowTripConfirmModal(false);
  }

  // ── Validation commande ──
  function handleOrder() {
    const isValid =
      deliveryDestination !== null &&
      (deliveryDestination === "local" || (
        deliveryDestination === "bangui" &&
        banguiMode !== null &&
        receptionMode !== null &&
        (banguiMode === "standard" ? standardTrip !== null : selectedTrip !== null)
      ));
    if (!isValid) {
      setShowValidationModal(true);
      return;
    }
    window.location.href = "/paiement";
  }

  function handleModalClose() {
    setShowValidationModal(false);
    setTimeout(() => {
      deliverySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setDeliveryHighlighted(true);
      setTimeout(() => setDeliveryHighlighted(false), 2000);
    }, 100);
  }

  return (
    <div className="page-container py-6 sm:py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
        <Link href="/" className="hover:text-orange-500 transition-colors">Accueil</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/produits" className="hover:text-orange-500 transition-colors">Produits</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-medium truncate max-w-[160px] sm:max-w-xs">{product.title}</span>
      </nav>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-12">

        {/* ── LEFT: Gallery + Description ── */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            {product.images?.[0] ? (
              <img
                src={getImageUrl(product.images[activeImage] || product.images[0])}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-contain p-2"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-orange-50 gap-2">
                <span className="text-5xl">📦</span>
                <span className="text-sm font-medium text-orange-400 px-4 text-center">{product.title}</span>
              </div>
            )}
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg">
              <Package className="w-3.5 h-3.5" />
              {product.originCountry.flag} {product.originCountry.name}
            </div>
          </div>

          {product.images.filter(Boolean).length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {product.images.filter(Boolean).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all",
                    activeImage === i ? "border-orange-500" : "border-gray-200 hover:border-gray-400"
                  )}
                >
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* ── Description (sous l'image) ── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 text-sm mb-2.5">Description</h3>
            <p className={cn(
              "text-gray-600 leading-relaxed text-sm",
              !descExpanded && isLongDesc ? "line-clamp-4" : ""
            )}>
              {product.description}
            </p>
            {isLongDesc && (
              <button
                onClick={() => setDescExpanded(!descExpanded)}
                className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                {descExpanded
                  ? <><ChevronUp className="w-3.5 h-3.5" /> Voir moins</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> Voir plus</>}
              </button>
            )}

            {/* Pills caractéristiques */}
            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-50">
              {product.weight && (
                <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  <Weight className="w-3 h-3 text-gray-400" /> {product.weight} kg
                </span>
              )}
              {product.dimensions && (
                <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-100 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full">
                  📐 {product.dimensions}
                </span>
              )}
              {product.tags.slice(0, 4).map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Product info ── */}
        <div className="space-y-4">

          {/* Title + rating */}
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400 font-medium mb-1.5">
              <span>{CATEGORY_ICONS[product.category]}</span>
              <span>{CATEGORY_LABELS[product.category]}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">{product.title}</h1>
            <div className="flex items-center gap-2 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn("w-3.5 h-3.5", i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200")} />
              ))}
              <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
              <span className="text-xs text-gray-400">({product.reviewCount} avis)</span>
            </div>
          </div>

          {/* Price + stock */}
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  {formatPrice(product.price, product.currency)}
                </div>
                <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-green-500" />
                  Paiement bloqué en escrow · libéré à la réception
                </div>
              </div>
              <span className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0",
                product.stock > 5 ? "bg-green-100 text-green-700" :
                product.stock > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
              )}>
                {product.stock > 0 ? `${product.stock} en stock` : "Rupture"}
              </span>
            </div>
          </div>

          {/* Color selector */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Couleur / Variante :
                <span className="text-orange-500 ml-1.5 font-bold">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-sm font-medium border-2 transition-all",
                      selectedColor === color
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">Quantité</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-gray-900 text-lg">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                disabled={qty >= product.stock}
                className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs text-gray-400 ml-1">{product.stock} disponibles</span>
            </div>
          </div>

          {/* ── LIVRAISON ── */}
          <div
            ref={deliverySectionRef}
            className={cn(
              "space-y-3 rounded-2xl p-1 transition-all duration-700",
              deliveryHighlighted && "ring-2 ring-orange-400 ring-offset-4 bg-orange-50/40"
            )}
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 px-1">
              <Globe className="w-3.5 h-3.5" /> Choisissez votre destination
            </p>

            {/* ── Sélecteur destination ── */}
            <div className="grid grid-cols-2 gap-3">
              {/* Carte LOCAL */}
              <button
                onClick={() => {
                  setDeliveryDestination("local");
                  setSelectedTrip(null);
                  setReceptionMode(null);
                  setBanguiMode(null);
                }}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2 group",
                  deliveryDestination === "local"
                    ? "border-green-400 bg-green-50 shadow-sm"
                    : "border-gray-200 hover:border-green-300 hover:bg-green-50/40"
                )}
              >
                <span className="text-2xl">{product.originCountry.flag}</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">Livraison locale</p>
                  <p className="text-xs text-gray-500 mt-0.5">{product.originCountry.name}</p>
                </div>
                {deliveryDestination === "local" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle className="w-2.5 h-2.5" /> Sélectionné
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">Tap pour choisir</span>
                )}
              </button>

              {/* Carte BANGUI */}
              <button
                onClick={() => setDeliveryDestination("bangui")}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2 group",
                  deliveryDestination === "bangui"
                    ? "border-orange-400 bg-orange-50 shadow-sm"
                    : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                )}
              >
                <span className="text-2xl">🇨🇫</span>
                <div>
                  <p className="font-bold text-sm text-gray-900">Bangui, RCA</p>
                  <p className="text-xs text-gray-500 mt-0.5">Via réseau GP</p>
                </div>
                {deliveryDestination === "bangui" ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle className="w-2.5 h-2.5" /> Sélectionné
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400 font-medium">Tap pour choisir</span>
                )}
              </button>
            </div>

            {/* ── MODE LOCAL ── */}
            {deliveryDestination === "local" && (
              <div className="space-y-3 animate-fade-in">
                <div className="rounded-2xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="font-bold text-sm text-green-800">
                      Livraison en {product.originCountry.name}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mb-3 leading-relaxed">
                    Ce produit est disponible localement. Le vendeur vous livrera directement dans votre pays, sans transporteur GP.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Votre adresse de livraison
                    </label>
                    <input
                      type="text"
                      value={localAddress}
                      onChange={(e) => setLocalAddress(e.target.value)}
                      placeholder={`Votre adresse en ${product.originCountry.name}...`}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all placeholder:text-gray-300"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── MODE BANGUI ── */}
            {deliveryDestination === "bangui" && (
              <div className="space-y-3 animate-fade-in">

                {/* Sous-options : Standard vs Transporteur GP */}
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-0.5">
                  Mode d&apos;expédition
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setBanguiMode("standard"); setSelectedTrip(null); }}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-1.5",
                      banguiMode === "standard"
                        ? "border-orange-400 bg-orange-50 shadow-sm"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Package className="w-5 h-5 text-orange-500" />
                      <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                        Recommandé
                      </span>
                    </div>
                    <p className="font-bold text-sm text-gray-900">Standard</p>
                    <p className="text-xs text-gray-500">Géré par le vendeur</p>
                    {banguiMode === "standard" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                        <CheckCircle className="w-2.5 h-2.5" /> Actif
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setBanguiMode("advanced")}
                    className={cn(
                      "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-1.5",
                      banguiMode === "advanced"
                        ? "border-orange-400 bg-orange-50 shadow-sm"
                        : "border-gray-200 hover:border-orange-300 hover:bg-orange-50/40"
                    )}
                  >
                    <Truck className="w-5 h-5 text-orange-500" />
                    <p className="font-bold text-sm text-gray-900">Transporteur</p>
                    <p className="text-xs text-gray-500">Choisir un GP</p>
                    {banguiMode === "advanced" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full w-fit">
                        <CheckCircle className="w-2.5 h-2.5" /> Actif
                      </span>
                    )}
                  </button>
                </div>

                {/* ── Standard : info livraison auto ── */}
                {banguiMode === "standard" && (
                  <div className="animate-fade-in">
                    {standardTrip ? (
                      <div className={cn("rounded-2xl border p-4", transport.color)}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{transport.emoji}</span>
                          <span className="font-bold text-sm">Expédition vers Bangui</span>
                          <span className="ml-auto text-[10px] font-bold uppercase tracking-wide opacity-70">
                            {transport.mode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex flex-col items-center">
                            <span className="text-xl">{product.originCountry.flag}</span>
                            <span className="text-[10px] font-semibold mt-0.5">{product.originCountry.name}</span>
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="w-full h-px border-t-2 border-dashed border-current opacity-40 relative">
                              <Plane className="w-3.5 h-3.5 absolute left-1/2 -top-2 -translate-x-1/2 opacity-70" />
                            </div>
                            <span className="text-[10px] mt-1 opacity-60 font-medium">Vendeur → Bangui</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xl">🇨🇫</span>
                            <span className="text-[10px] font-semibold mt-0.5">Bangui</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-white/60 rounded-xl px-3 py-2">
                            <p className="opacity-60 font-medium mb-0.5">Délai</p>
                            <p className="font-bold">{transport.delay}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl px-3 py-2">
                            <p className="opacity-60 font-medium mb-0.5">Prix/kg</p>
                            <p className="font-bold">{formatPrice(standardTrip.pricePerKg, standardTrip.currency)}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl px-3 py-2">
                            <p className="opacity-60 font-medium mb-0.5">Poids</p>
                            <p className="font-bold">{weight * qty} kg</p>
                          </div>
                        </div>
                        {standardTrip.arrivalDate && (
                          <div className="mt-3 flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs font-semibold">
                              Arrivée estimée : <strong>{fmtDate(standardTrip.arrivalDate)}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                        <p className="text-sm text-amber-700 font-semibold mb-1">
                          Livraison standard indisponible
                        </p>
                        <p className="text-xs text-amber-600 mb-2">
                          Aucun transporteur actif depuis {product.originCountry.name}.
                        </p>
                        <button
                          onClick={() => setBanguiMode("advanced")}
                          className="text-xs text-orange-600 font-bold underline"
                        >
                          Voir les transporteurs disponibles →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Avancé : sélection GP manuelle ── */}
                {banguiMode === "advanced" && (
                  <div className="animate-fade-in">
                    {!selectedTrip ? (
                      <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-5 text-center">
                        <Truck className="w-8 h-8 text-orange-300 mx-auto mb-2.5" />
                        <p className="text-sm font-bold text-gray-800">Choisissez votre transporteur</p>
                        <p className="text-xs text-gray-400 mt-1 mb-3">
                          Les GP disponibles depuis {product.originCountry.name} sont listés ci-dessous
                        </p>
                        <button
                          onClick={() => document.getElementById("transporters-section")?.scrollIntoView({ behavior: "smooth", block: "start" })}
                          className="inline-flex items-center gap-1.5 text-xs text-white font-bold bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-xl transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" /> Voir les transporteurs ↓
                        </button>
                      </div>
                    ) : (
                      <div className={cn("rounded-2xl border p-4", transport.color)}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-base">{transport.emoji}</span>
                          <span className="font-bold text-sm">GP sélectionné</span>
                          <button
                            onClick={() => setSelectedTrip(null)}
                            className="ml-auto text-[11px] opacity-70 hover:opacity-100 underline"
                          >
                            Changer
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-2.5">
                          <div className="bg-white/60 rounded-xl px-3 py-2 col-span-2">
                            <p className="opacity-60 font-medium mb-0.5">Transporteur</p>
                            <p className="font-bold">{selectedTrip.transporter.companyName}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl px-3 py-2">
                            <p className="opacity-60 font-medium mb-0.5">Départ</p>
                            <p className="font-bold">{fmtShort(selectedTrip.departureDate)}</p>
                          </div>
                          <div className="bg-white/60 rounded-xl px-3 py-2">
                            <p className="opacity-60 font-medium mb-0.5">Coût GP</p>
                            <p className="font-bold">
                              {formatPrice(Math.round(weight * qty * selectedTrip.pricePerKg), selectedTrip.currency)}
                            </p>
                          </div>
                        </div>
                        {selectedTrip.arrivalDate && (
                          <div className="flex items-center gap-2 bg-white/70 rounded-xl px-3 py-2">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="text-xs font-semibold">
                              Arrivée estimée : <strong>{fmtDate(selectedTrip.arrivalDate)}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── Commun : Infos client + Mode réception ── */}
                {banguiMode !== null && (banguiMode === "advanced" || standardTrip !== null) && (
                  <>
                    {/* Infos client */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Vos informations
                      </p>
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Nom complet</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Votre nom et prénom"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Téléphone</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+236 75 00 00 00"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Adresse à Bangui</label>
                          <input
                            type="text"
                            value={customerBanguiAddress}
                            onChange={(e) => setCustomerBanguiAddress(e.target.value)}
                            placeholder="Quartier, rue, repère..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white transition-all placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mode de réception */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                        <MapPin className="w-3.5 h-3.5" /> Mode de réception à Bangui
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setReceptionMode("pickup")}
                          className={cn(
                            "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2",
                            receptionMode === "pickup"
                              ? "border-blue-400 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                          )}
                        >
                          <MapPin className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-bold text-sm text-gray-900">Point relais</p>
                            <p className="text-xs text-green-600 font-semibold mt-0.5">Gratuit</p>
                          </div>
                          {receptionMode === "pickup" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
                              <CheckCircle className="w-2.5 h-2.5" /> Choisi
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => setReceptionMode("home")}
                          className={cn(
                            "rounded-2xl border-2 p-4 text-left transition-all flex flex-col gap-2",
                            receptionMode === "home"
                              ? "border-blue-400 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/40"
                          )}
                        >
                          <Home className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-bold text-sm text-gray-900">Domicile</p>
                            <p className="text-xs text-orange-600 font-semibold mt-0.5">
                              +{formatPrice(localDeliveryCostXAF, "XAF")}
                            </p>
                          </div>
                          {receptionMode === "home" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full w-fit">
                              <CheckCircle className="w-2.5 h-2.5" /> Choisi
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Price summary */}
          {deliveryDestination && (
            <PriceSummary
              productPrice={product.price}
              productCurrency={product.currency}
              qty={qty}
              weight={weight}
              selectedTrip={
                deliveryDestination === "bangui"
                  ? banguiMode === "standard" ? standardTrip : selectedTrip
                  : null
              }
              localDelivery={receptionMode === "home"}
              localDeliveryCostXAF={localDeliveryCostXAF}
            />
          )}

          {/* CTA — toujours actif, validation au clic */}
          <button
            onClick={handleOrder}
            className="w-full inline-flex items-center justify-center gap-2 font-bold px-6 py-4 rounded-xl shadow-md transition-all text-sm bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white"
          >
            <ShoppingCart className="w-5 h-5" />
            Acheter maintenant
          </button>

          {/* Seller info */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Vendeur</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 flex-shrink-0 text-lg">
                {product.seller.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900">{product.seller.name}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap mt-0.5">
                  {product.originCountry.flag} {product.originCountry.name}
                  {product.seller.isVerified && (
                    <span className="inline-flex items-center gap-0.5 text-green-600 font-medium">
                      <CheckCircle className="w-3 h-3" /> Vérifié
                    </span>
                  )}
                </div>
              </div>
              {product.seller.phone && (
                <a href={`tel:${product.seller.phone}`} className="btn-secondary text-xs py-1.5 flex-shrink-0">
                  <Phone className="w-3.5 h-3.5" /> Appeler
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── TRANSPORTERS SECTION — visible uniquement en mode avancé ── */}
      {deliveryDestination === "bangui" && banguiMode === "advanced" && (
        <section className="mb-10 sm:mb-14 animate-fade-in">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-orange-500" />
                Transporteurs disponibles depuis {product.originCountry.flag} {product.originCountry.name}
              </h2>
              <p className="text-sm text-gray-400 mt-0.5">
                {availableTrips.length === 0
                  ? "Aucun voyage planifié depuis ce pays actuellement."
                  : `${availableTrips.length} voyage${availableTrips.length > 1 ? "s" : ""} planifié${availableTrips.length > 1 ? "s" : ""} · Sélectionnez le trajet qui vous convient`}
              </p>
            </div>
            {selectedTrip && (
              <button
                onClick={() => setSelectedTrip(null)}
                className="text-xs text-gray-400 hover:text-gray-600 underline flex-shrink-0"
              >
                Effacer choix
              </button>
            )}
          </div>

          {availableTrips.length === 0 ? (
            <div className="card p-10 text-center">
              <Truck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aucun transporteur disponible depuis ce pays pour le moment.</p>
              <p className="text-xs text-gray-400 mt-1">Revenez prochainement ou contactez un vendeur directement.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transporterGroups.map(({ transporter, trips }) => (
                <TransporterGroupCard
                  key={transporter.id}
                  transporter={transporter}
                  trips={trips}
                  selectedTripId={selectedTrip?.id ?? null}
                  onSelect={(trip) => { setPendingTrip(trip); setShowTripConfirmModal(true); }}
                />
              ))}
            </div>
          )}

          {/* Guarantees strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            {[
              { icon: "🔒", title: "Escrow sécurisé", desc: "Paiement protégé jusqu'à réception" },
              { icon: "🚚", title: "GP certifiés", desc: "Transporteurs vérifiés par SangoMarket" },
              { icon: "✅", title: "Retrait ou domicile", desc: "Vous choisissez à Bangui" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-gray-50 rounded-xl p-3 sm:p-4 flex items-start gap-3">
                <span className="text-xl">{icon}</span>
                <div>
                  <div className="text-xs font-bold text-gray-800">{title}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── RELATED PRODUCTS ── */}
      {related.length > 0 && (
        <section>
          <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4 sm:mb-6">
            Plus de produits depuis {product.originCountry.flag} {product.originCountry.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── MODAL CONFIRMATION VOYAGE GP ── */}
      {showTripConfirmModal && pendingTrip && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleTripCancel} />
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-fade-in">
            <button
              onClick={handleTripCancel}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center font-extrabold text-orange-600 text-lg flex-shrink-0">
                {pendingTrip.transporter.companyName.charAt(0)}
              </div>
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Confirmer le transporteur</p>
                <p className="font-extrabold text-gray-900">{pendingTrip.transporter.companyName}</p>
              </div>
            </div>

            {/* Trajet */}
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4">
              <span className="text-xl">{pendingTrip.originCountry.flag}</span>
              <div className="flex-1 h-px border-t-2 border-dashed border-gray-300 relative">
                <Plane className="w-3.5 h-3.5 text-gray-400 absolute -top-2 left-1/2 -translate-x-1/2 bg-gray-50" />
              </div>
              <span className="text-xl">🇨🇫</span>
              <div className="text-xs text-gray-500">
                <p className="font-semibold text-gray-700">{fmtShort(pendingTrip.departureDate)}</p>
                {pendingTrip.arrivalDate && (
                  <p className="text-orange-600 font-semibold">→ {fmtShort(pendingTrip.arrivalDate)}</p>
                )}
              </div>
            </div>

            {/* Récap coûts */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-orange-400" />
                  Transport GP ({weight * qty} kg)
                </span>
                <span className="font-bold text-gray-900">
                  {formatPrice(Math.round(weight * qty * pendingTrip.pricePerKg), pendingTrip.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-blue-400" />
                  Livraison domicile (optionnel)
                </span>
                <span className="text-gray-500 text-xs">+{formatPrice(localDeliveryCostXAF, "XAF")}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-900">Total transport estimé</span>
                <span className="font-extrabold text-orange-600">
                  {formatPrice(Math.round(weight * qty * pendingTrip.pricePerKg), pendingTrip.currency)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleTripCancel}
                className="py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleTripConfirm}
                className="py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL DE VALIDATION ── */}
      {showValidationModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleModalClose}
          />
          {/* Panel */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-fade-in">
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                <Info className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                Veuillez choisir votre mode de livraison
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Vous devez compléter les options de livraison avant de finaliser votre commande.
              </p>
              {deliveryDestination === null && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Choisissez votre destination
                </p>
              )}
              {deliveryDestination === "bangui" && banguiMode === null && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <Package className="w-3.5 h-3.5" /> Choisissez Standard ou Transporteur GP
                </p>
              )}
              {deliveryDestination === "bangui" && banguiMode === "advanced" && !selectedTrip && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Sélectionnez un transporteur GP
                </p>
              )}
              {deliveryDestination === "bangui" && banguiMode !== null && !receptionMode && (
                <p className="text-xs text-orange-600 font-medium mt-2 flex items-center justify-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Choisissez point relais ou domicile
                </p>
              )}
            </div>
            <button
              onClick={handleModalClose}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl transition-colors text-sm"
            >
              Choisir la livraison
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
