"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, Trash2, CheckCircle, AlertCircle,
  Package, Loader2, ImageIcon, X, Tag, Truck,
  DollarSign, Info, Percent, Calendar, Upload, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import { ImageUploader } from "@/components/ui/ImageUploader";

// ─── Types ────────────────────────────────────────────────────────────────────

type Currency = "XAF" | "EUR" | "USD";
type Category =
  | "electronique" | "mode" | "alimentation" | "maison"
  | "beaute" | "jouets" | "sante" | "sport" | "auto" | "autre";

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "electronique",  label: "Électronique",  emoji: "📱" },
  { value: "mode",          label: "Mode",           emoji: "👗" },
  { value: "alimentation",  label: "Alimentation",  emoji: "🥘" },
  { value: "maison",        label: "Maison",         emoji: "🏠" },
  { value: "beaute",        label: "Beauté",         emoji: "💄" },
  { value: "jouets",        label: "Jouets",         emoji: "🧸" },
  { value: "sante",         label: "Santé",          emoji: "💊" },
  { value: "sport",         label: "Sport",          emoji: "⚽" },
  { value: "auto",          label: "Auto",           emoji: "🚗" },
  { value: "autre",         label: "Autre",          emoji: "📦" },
];

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "XAF", label: "FCFA", symbol: "FCFA" },
  { value: "EUR", label: "EUR",  symbol: "€"    },
  { value: "USD", label: "USD",  symbol: "$"    },
];

type SaleType = "normal" | "grossiste" | "mixte";

interface WholesaleTier {
  min_qty: number;
  max_qty?: number | null;
  price: number;
}

interface FormState {
  // Base
  title:          string;
  description:    string;
  category:       Category;
  originCountry:  string;
  // Pricing
  price:          string;
  currency:       Currency;
  stock:          string;
  localDelivery:  string;
  // Promo
  hasPromo:       boolean;
  promoPrice:     string;
  promoEndDate:   string;
  // Wholesale
  typeVente:      SaleType;
  wholesalePrices: WholesaleTier[];
  // Images
  images:         string[];
  // Details
  weightKg:       string;
  dimensions:     string;
  colors:         string[];
  tags:           string;
  // Standard shipping (GP)
  offerShipping:      boolean;
  tripDepartureDate:  string;
  tripArrivalDate:    string;
  tripPricePerKg:     string;
  tripCurrency:       Currency;
  tripCapacityKg:     string;
  tripNotes:          string;
}

// ─── Field components ─────────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900",
        "placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all",
        className
      )}
    />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 resize-none",
        "placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all",
        className
      )}
    />
  );
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 cursor-pointer",
        "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all",
        className
      )}
    >
      {children}
    </select>
  );
}

function SectionHeader({
  step, icon: Icon, title, subtitle, color = "orange",
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: "orange" | "violet" | "blue" | "green" | "amber" | "indigo";
}) {
  const palette: Record<string, string> = {
    orange: "bg-orange-100 text-orange-600",
    violet: "bg-violet-100 text-violet-600",
    blue:   "bg-blue-100 text-blue-600",
    green:  "bg-green-100 text-green-600",
    amber:  "bg-amber-100 text-amber-600",
    indigo: "bg-indigo-100 text-indigo-600",
  };
  return (
    <div className="flex items-start gap-3 pb-1">
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", palette[color])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-gray-900">{title}</h2>
          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{step}</span>
        </div>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-2.5 group"
    >
      <div className={cn(
        "relative w-10 h-5.5 rounded-full transition-colors duration-200",
        enabled ? "bg-orange-500" : "bg-gray-200"
      )} style={{ height: "22px" }}>
        <span className={cn(
          "absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform duration-200",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )} style={{ width: "18px", height: "18px" }} />
      </div>
      <span className={cn("text-sm font-semibold transition-colors", enabled ? "text-orange-600" : "text-gray-500 group-hover:text-gray-700")}>
        {label}
      </span>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NouveauProduitPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    title:             "",
    description:       "",
    category:          "electronique",
    originCountry:     "FR",
    price:             "",
    currency:          "EUR",
    stock:             "1",
    localDelivery:     "2500",
    hasPromo:          false,
    promoPrice:        "",
    promoEndDate:      "",
    typeVente:         "normal",
    wholesalePrices:   [],
    images:            [""],
    weightKg:          "",
    dimensions:        "",
    colors:            [],
    tags:              "",
    offerShipping:     false,
    tripDepartureDate: "",
    tripArrivalDate:   "",
    tripPricePerKg:    "",
    tripCurrency:      "EUR",
    tripCapacityKg:    "",
    tripNotes:         "",
  });

  const [colorInput, setColorInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState | "images", string>>>({});

  // imageFiles[i] holds the actual File; form.images[i] holds the blob: preview URL
  const imageFiles = useRef<(File | null)[]>([null]);

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof typeof errors]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  // Images — preview locally, upload only on submit
  function addImage() {
    if (form.images.length >= 6) return;
    imageFiles.current = [...imageFiles.current, null];
    set("images", [...form.images, ""]);
  }

  function removeImage(i: number) {
    // Revoke blob URL to free memory
    if (form.images[i]?.startsWith("blob:")) URL.revokeObjectURL(form.images[i]);
    imageFiles.current = imageFiles.current.filter((_, idx) => idx !== i);
    set("images", form.images.filter((_, idx) => idx !== i));
  }

  function handleFileChange(i: number, file: File) {
    // Revoke previous blob if any
    if (form.images[i]?.startsWith("blob:")) URL.revokeObjectURL(form.images[i]);
    const previewUrl = URL.createObjectURL(file);
    imageFiles.current[i] = file;
    const imgs = [...form.images];
    imgs[i] = previewUrl;
    setErrors(prev => ({ ...prev, images: undefined }));
    set("images", imgs);
  }

  // Upload a single File to the backend, return the permanent URL
  async function uploadFile(file: File): Promise<string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("sango_token") : null;
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(`${BASE}/api/uploads/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.message ?? `Erreur upload (${res.status})`);
    return json.url as string;
  }

  // Colors
  function addColor() {
    const c = colorInput.trim();
    if (c && !form.colors.includes(c)) set("colors", [...form.colors, c]);
    setColorInput("");
  }
  function removeColor(c: string) { set("colors", form.colors.filter(x => x !== c)); }

  // Validate
  function validate(): boolean {
    const errs: Partial<Record<keyof FormState | "images", string>> = {};
    if (!form.title.trim())                                              errs.title       = "Le titre est obligatoire";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price  = "Prix de vente invalide";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)  errs.stock  = "Stock invalide";
    if (!form.originCountry)                                             errs.originCountry = "Pays obligatoire";
    const hasImage = imageFiles.current.some(Boolean) || form.images.some(url => url && !url.startsWith("blob:"));
    if (!hasImage) errs.images = "Au moins une image est requise";
    if (form.hasPromo) {
      if (!form.promoPrice || isNaN(Number(form.promoPrice)) || Number(form.promoPrice) <= 0)
        errs.promoPrice  = "Prix promotionnel invalide";
      if (form.promoPrice && Number(form.promoPrice) >= Number(form.price))
        errs.promoPrice  = "Le prix promo doit être inférieur au prix normal";
    }
    if (form.offerShipping) {
      if (!form.tripDepartureDate) errs.tripDepartureDate = "Date de départ requise";
      if (!form.tripArrivalDate)   errs.tripArrivalDate   = "Date d'arrivée requise";
      if (!form.tripPricePerKg || isNaN(Number(form.tripPricePerKg)) || Number(form.tripPricePerKg) <= 0)
        errs.tripPricePerKg = "Prix/kg invalide";
      if (!form.tripCapacityKg || isNaN(Number(form.tripCapacityKg)) || Number(form.tripCapacityKg) <= 0)
        errs.tripCapacityKg = "Capacité invalide";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function addTier() {
    set("wholesalePrices", [...form.wholesalePrices, { min_qty: 5, price: 0 }]);
  }
  function removeTier(i: number) {
    set("wholesalePrices", form.wholesalePrices.filter((_, idx) => idx !== i));
  }
  function updateTier(i: number, field: keyof WholesaleTier, val: number | null) {
    set("wholesalePrices", form.wholesalePrices.map((t, idx) =>
      idx === i ? { ...t, [field]: val } : t
    ));
  }

  function saveDemoProduct(product: Record<string, unknown>) {
    try {
      const existing = JSON.parse(localStorage.getItem("sango_demo_products") ?? "[]") as unknown[];
      existing.unshift(product);
      localStorage.setItem("sango_demo_products", JSON.stringify(existing));
    } catch { /* ignore */ }
  }

  function isNetworkError(err: unknown): boolean {
    if (!(err instanceof Error)) return false;
    const msg = err.message.toLowerCase();
    return msg.includes("failed to fetch") || msg.includes("network") || msg.includes("fetch");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      // 1. Upload local File objects → permanent URLs (best-effort, skip if backend unreachable)
      const finalImages: string[] = [];
      for (let i = 0; i < form.images.length; i++) {
        const file = imageFiles.current[i];
        if (file) {
          try {
            const url = await uploadFile(file);
            if (form.images[i]?.startsWith("blob:")) URL.revokeObjectURL(form.images[i]);
            finalImages.push(url);
          } catch {
            finalImages.push(form.images[i]); // keep blob URL if upload fails
          }
        } else if (form.images[i]) {
          finalImages.push(form.images[i]);
        }
      }

      // 2. Create product — strip blob: URLs (not valid for the DB)
      const safeImages = finalImages.filter(u => u && !u.startsWith("blob:"));
      const { api } = await import("@/lib/api");

      try {
        await api.products.create({
          title:         form.title,
          description:   form.description || undefined,
          price:         parseFloat(form.price),
          currency:      form.currency,
          images:        safeImages,
          category:      form.category,
          originCountry: form.originCountry,
          stock:         parseInt(form.stock, 10),
          weightKg:      form.weightKg  ? parseFloat(form.weightKg)  : undefined,
          dimensions:    form.dimensions || undefined,
          tags:          form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
          promoPrice:      form.hasPromo && form.promoPrice ? parseFloat(form.promoPrice) : null,
          promoEnd:        form.hasPromo && form.promoEndDate ? form.promoEndDate : null,
          wholesalePrices: form.typeVente !== "normal" ? form.wholesalePrices : [],
        });

        // 3. Create GP trip if vendor offers shipping
        if (form.offerShipping) {
          await api.trips.create({
            originCountry:     form.originCountry,
            departureDate:     form.tripDepartureDate,
            arrivalDate:       form.tripArrivalDate,
            pricePerKg:        parseFloat(form.tripPricePerKg),
            currency:          form.tripCurrency,
            availableCapacity: parseFloat(form.tripCapacityKg),
            description:       form.tripNotes || undefined,
          });
        }
      } catch (apiErr) {
        if (!isNetworkError(apiErr)) throw apiErr;
        // Backend unreachable → save to localStorage so the dashboard can show it
        saveDemoProduct({
          id:           `demo_${Date.now()}`,
          title:        form.title,
          price:        parseFloat(form.price),
          currency:     form.currency,
          images:       finalImages.filter(Boolean),
          category:     form.category,
          origin_country: form.originCountry,
          stock:        parseInt(form.stock, 10),
          is_available: true,
          avg_rating:   "0",
          review_count: "0",
          order_count:  "0",
          created_at:   new Date().toISOString(),
        });
      }

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/vendeur"), 2200);
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      setErrors({
        images: msg.includes("401") || msg.toLowerCase().includes("autoris")
          ? "Vous devez être connecté en tant que vendeur pour publier un produit."
          : msg || "Erreur lors de la création du produit",
      });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Produit créé !</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Votre produit a été soumis et sera visible sur la marketplace après validation par l'équipe SangoMarket.
          </p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
            Retour à votre espace…
          </div>
        </div>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;
  const currency  = CURRENCIES.find(c => c.value === form.currency)!;

  // ── Main form ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/vendeur" className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">Nouveau produit</h1>
              <p className="text-[11px] text-gray-400 mt-0.5">Remplissez les informations ci-dessous</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/vendeur"
              className="hidden sm:flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </Link>
            <button
              form="product-form"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-sm shadow-orange-200"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Création…</>
                : <><Package className="w-4 h-4" /> Publier</>
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <form id="product-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

        {/* Error banner */}
        {hasErrors && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-700">Corrigez les erreurs avant de continuer</p>
              <ul className="mt-1 space-y-0.5">
                {Object.values(errors).filter(Boolean).map(msg => (
                  <li key={msg} className="text-xs text-red-600">• {msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — Informations de base
        ═══════════════════════════════════════════════════════════════════ */}
        <Card>
          <SectionHeader step={1} icon={Package} title="Informations de base" color="orange" />
          <Divider />

          <Field>
            <Label required>Titre du produit</Label>
            <Input
              placeholder="ex : iPhone 14 Pro 256 Go — Violet, neuf sous blister"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              className={errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}
            />
          </Field>

          <Field>
            <Label>Description</Label>
            <Textarea
              rows={4}
              placeholder="Décrivez votre produit : état, caractéristiques, contenu de la boîte, garantie…"
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <Label required>Catégorie</Label>
              <Select value={form.category} onChange={e => set("category", e.target.value as Category)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
              </Select>
            </Field>
            <Field>
              <Label required>Pays d'expédition</Label>
              <Select
                value={form.originCountry}
                onChange={e => set("originCountry", e.target.value)}
                className={errors.originCountry ? "border-red-300" : ""}
              >
                {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
              </Select>
            </Field>
          </div>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — Prix & stock
        ═══════════════════════════════════════════════════════════════════ */}
        <Card>
          <SectionHeader step={2} icon={DollarSign} title="Prix & stock" color="violet" />
          <Divider />

          <div className="grid grid-cols-2 gap-4">
            {/* Prix principal */}
            <Field>
              <Label required>Prix de vente</Label>
              <div className="relative">
                <Input
                  type="number" min="0" step="0.01" placeholder="850"
                  value={form.price}
                  onChange={e => set("price", e.target.value)}
                  className={cn("pr-20", errors.price ? "border-red-300" : "")}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <select
                    value={form.currency}
                    onChange={e => set("currency", e.target.value as Currency)}
                    className="border-0 bg-transparent text-xs text-gray-500 font-bold focus:outline-none cursor-pointer w-16"
                  >
                    {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                  </select>
                </div>
              </div>
              {errors.price && <ErrMsg>{errors.price}</ErrMsg>}
            </Field>

            {/* Stock */}
            <Field>
              <Label required>Stock disponible</Label>
              <Input
                type="number" min="0" step="1" placeholder="10"
                value={form.stock}
                onChange={e => set("stock", e.target.value)}
                className={errors.stock ? "border-red-300" : ""}
              />
              {errors.stock && <ErrMsg>{errors.stock}</ErrMsg>}
            </Field>
          </div>

          {/* Livraison locale */}
          <Field>
            <Label>Coût livraison domicile à Bangui (FCFA)</Label>
            <Input
              type="number" min="0" placeholder="2500"
              value={form.localDelivery}
              onChange={e => set("localDelivery", e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-1">Frais de livraison locale facturés au client une fois le colis arrivé à Bangui.</p>
          </Field>

          {/* ── Prix promotionnel (toggle) ────────────────────────────── */}
          <div className="border-t border-gray-100 pt-4">
            <Toggle
              enabled={form.hasPromo}
              onToggle={() => set("hasPromo", !form.hasPromo)}
              label="Activer un prix promotionnel"
            />
            <p className="text-[11px] text-gray-400 mt-1 ml-[52px]">Le prix barré + promo s'afficheront sur la fiche produit.</p>

            {form.hasPromo && (
              <div className="mt-4 grid grid-cols-2 gap-4 bg-orange-50 rounded-2xl p-4">
                <Field>
                  <Label required>Prix promotionnel</Label>
                  <div className="relative">
                    <Input
                      type="number" min="0" step="0.01"
                      placeholder="690"
                      value={form.promoPrice}
                      onChange={e => set("promoPrice", e.target.value)}
                      className={cn("bg-white pr-14", errors.promoPrice ? "border-red-300" : "")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      {currency.value}
                    </span>
                  </div>
                  {errors.promoPrice && <ErrMsg>{errors.promoPrice}</ErrMsg>}
                </Field>
                <Field>
                  <Label>Fin de la promotion</Label>
                  <Input
                    type="date"
                    value={form.promoEndDate}
                    onChange={e => set("promoEndDate", e.target.value)}
                    className="bg-white"
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Laisser vide = durée illimitée</p>
                </Field>

                {/* Aperçu prix */}
                {form.price && form.promoPrice && Number(form.promoPrice) < Number(form.price) && (
                  <div className="col-span-2 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-orange-100">
                    <Percent className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-orange-600">
                        {parseFloat(form.promoPrice).toLocaleString("fr-FR")} {currency.value}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {parseFloat(form.price).toLocaleString("fr-FR")} {currency.value}
                      </span>
                      <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        -{Math.round((1 - Number(form.promoPrice) / Number(form.price)) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 — Type de vente / Grossiste
        ═══════════════════════════════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            step={3} icon={Layers} title="Type de vente"
            subtitle="Configurez si ce produit est vendu au détail, en gros, ou les deux"
            color="indigo"
          />
          <Divider />

          <Field>
            <Label>Type de vente</Label>
            <select
              value={form.typeVente}
              onChange={e => {
                const val = e.target.value as SaleType;
                set("typeVente", val);
                if (val === "normal") set("wholesalePrices", []);
              }}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 cursor-pointer focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            >
              <option value="normal">🛍️ Normal — vente au détail uniquement</option>
              <option value="mixte">🔀 Mixte — détail + prix de gros selon quantité</option>
              <option value="grossiste">📦 Grossiste — uniquement prix de gros</option>
            </select>
          </Field>

          {form.typeVente !== "normal" && (
            <div className="bg-indigo-50 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-indigo-800">Paliers de prix grossiste</p>
                <button
                  type="button"
                  onClick={addTier}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-3 py-1.5 rounded-xl transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Ajouter un palier
                </button>
              </div>

              {form.wholesalePrices.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Qté min</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Qté max</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Prix/u</span>
                  <span />
                </div>
              )}

              {form.wholesalePrices.map((tier, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-white rounded-xl p-3 border border-indigo-100">
                  <input
                    type="number" min="1" placeholder="5"
                    value={tier.min_qty || ""}
                    onChange={e => updateTier(i, "min_qty", parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-orange-400 transition-all"
                  />
                  <input
                    type="number" min="1" placeholder="∞"
                    value={tier.max_qty ?? ""}
                    onChange={e => updateTier(i, "max_qty", e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-orange-400 transition-all"
                  />
                  <div className="relative">
                    <input
                      type="number" min="0" step="0.01" placeholder="0"
                      value={tier.price || ""}
                      onChange={e => updateTier(i, "price", parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 pr-14 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400 transition-all"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                      {form.currency}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(i)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {form.wholesalePrices.length === 0 && (
                <p className="text-xs text-indigo-400 text-center py-3">Aucun palier défini. Cliquez sur "Ajouter un palier".</p>
              )}

              {form.wholesalePrices.length > 0 && form.wholesalePrices[0].price > 0 && (
                <div className="bg-white rounded-xl px-4 py-3 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700 mb-1">Aperçu client :</p>
                  <p className="text-sm font-semibold text-indigo-800">
                    À partir de {Math.min(...form.wholesalePrices.map((t: WholesaleTier) => t.price)).toLocaleString("fr-FR")} {form.currency}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 — Images
        ═══════════════════════════════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            step={4} icon={ImageIcon} title="Images du produit"
            subtitle="Glissez-déposez ou sélectionnez jusqu'à 6 photos — tous formats acceptés"
            color="blue"
          />
          <Divider />
          <ImageUploader
            images={form.images}
            files={imageFiles.current}
            error={errors.images}
            onFilesChange={(newFiles, newPreviews) => {
              imageFiles.current = newFiles;
              setErrors(prev => ({ ...prev, images: undefined }));
              set("images", newPreviews);
            }}
          />
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 — Livraison standard / GP (toggle)
        ═══════════════════════════════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            step={5} icon={Truck} title="Livraison standard (GP)"
            subtitle="Proposez votre propre voyage pour transporter ce produit"
            color="green"
          />
          <Divider />

          <Toggle
            enabled={form.offerShipping}
            onToggle={() => set("offerShipping", !form.offerShipping)}
            label="Je propose la livraison pour ce produit"
          />
          <p className="text-[11px] text-gray-400 mt-1 ml-[52px]">
            Un trajet GP sera créé et associé à votre produit. Les clients pourront choisir cette option.
          </p>

          {form.offerShipping && (
            <div className="mt-5 space-y-4 bg-green-50 rounded-2xl p-5">

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <Label required>Date de départ</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={form.tripDepartureDate}
                      onChange={e => set("tripDepartureDate", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={cn("bg-white pl-9", errors.tripDepartureDate ? "border-red-300" : "")}
                    />
                  </div>
                  {errors.tripDepartureDate && <ErrMsg>{errors.tripDepartureDate}</ErrMsg>}
                </Field>
                <Field>
                  <Label required>Arrivée estimée à Bangui</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="date"
                      value={form.tripArrivalDate}
                      onChange={e => set("tripArrivalDate", e.target.value)}
                      min={form.tripDepartureDate || new Date().toISOString().split("T")[0]}
                      className={cn("bg-white pl-9", errors.tripArrivalDate ? "border-red-300" : "")}
                    />
                  </div>
                  {errors.tripArrivalDate && <ErrMsg>{errors.tripArrivalDate}</ErrMsg>}
                </Field>
              </div>

              {/* Prix / kg + Capacité */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field>
                  <Label required>Prix par kg</Label>
                  <div className="relative flex">
                    <Input
                      type="number" min="0" step="0.01" placeholder="8"
                      value={form.tripPricePerKg}
                      onChange={e => set("tripPricePerKg", e.target.value)}
                      className={cn("bg-white rounded-r-none border-r-0", errors.tripPricePerKg ? "border-red-300" : "")}
                    />
                    <select
                      value={form.tripCurrency}
                      onChange={e => set("tripCurrency", e.target.value as Currency)}
                      className="bg-white border border-l-0 border-gray-200 rounded-r-xl text-xs font-bold text-gray-600 px-3 focus:outline-none focus:border-orange-400 cursor-pointer"
                    >
                      {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.value}</option>)}
                    </select>
                  </div>
                  {errors.tripPricePerKg && <ErrMsg>{errors.tripPricePerKg}</ErrMsg>}
                </Field>
                <Field>
                  <Label required>Capacité disponible (kg)</Label>
                  <div className="relative">
                    <Input
                      type="number" min="0" step="0.5" placeholder="30"
                      value={form.tripCapacityKg}
                      onChange={e => set("tripCapacityKg", e.target.value)}
                      className={cn("bg-white pr-10", errors.tripCapacityKg ? "border-red-300" : "")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">kg</span>
                  </div>
                  {errors.tripCapacityKg && <ErrMsg>{errors.tripCapacityKg}</ErrMsg>}
                </Field>
              </div>

              {/* Notes */}
              <Field>
                <Label>Notes / informations supplémentaires</Label>
                <Textarea
                  rows={2}
                  placeholder="ex : Trajet Paris → Bangui via Paris-CDG, bagages en soute, fragile accepté…"
                  value={form.tripNotes}
                  onChange={e => set("tripNotes", e.target.value)}
                  className="bg-white"
                />
              </Field>

              {/* Info pill */}
              <div className="flex items-start gap-2.5 bg-white rounded-xl px-4 py-3 border border-green-100">
                <Info className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Ce trajet sera visible dans l'espace «&nbsp;Transporteurs&nbsp;» de la marketplace. Les clients pourront réserver des kg restants pour leurs propres colis.
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 — Détails supplémentaires (optionnel)
        ═══════════════════════════════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            step={6} icon={Tag} title="Détails supplémentaires"
            subtitle="Optionnel — améliore la visibilité et l'expérience client"
            color="amber"
          />
          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Poids (kg)</Label>
              <Input type="number" min="0" step="0.001" placeholder="0.250" value={form.weightKg} onChange={e => set("weightKg", e.target.value)} />
            </Field>
            <Field>
              <Label>Dimensions</Label>
              <Input placeholder="30×20×10 cm" value={form.dimensions} onChange={e => set("dimensions", e.target.value)} />
            </Field>
          </div>

          {/* Couleurs */}
          <Field>
            <Label>Couleurs disponibles</Label>
            <div className="flex gap-2">
              <Input
                placeholder="ex : Noir, Or rose…"
                value={colorInput}
                onChange={e => setColorInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
              />
              <button type="button" onClick={addColor}
                className="px-3.5 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-bold hover:bg-orange-600 transition-colors flex-shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.colors.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {form.colors.map(c => (
                  <span key={c} className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                    {c}
                    <button type="button" onClick={() => removeColor(c)} className="text-gray-400 hover:text-red-400 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </Field>

          {/* Tags */}
          <Field>
            <Label>Tags / mots-clés</Label>
            <Input
              placeholder="iphone, téléphone, apple (séparés par des virgules)"
              value={form.tags}
              onChange={e => set("tags", e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-1">Améliorent la visibilité dans les recherches de la marketplace.</p>
          </Field>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════
            APERÇU
        ═══════════════════════════════════════════════════════════════════ */}
        {(form.title || form.images[0]) && (
          <Card>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Aperçu de la fiche produit</p>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                {form.images[0]
                  ? <img src={form.images[0]} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-8 h-8 text-gray-300" /></div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{form.title || "Titre du produit"}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{form.description || "Description du produit…"}</p>
                <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                  {form.hasPromo && form.promoPrice && Number(form.promoPrice) < Number(form.price) ? (
                    <>
                      <span className="text-base font-extrabold text-orange-600">
                        {parseFloat(form.promoPrice).toLocaleString("fr-FR")} {currency.value}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {parseFloat(form.price).toLocaleString("fr-FR")} {currency.value}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-extrabold text-gray-900">
                      {form.price ? `${parseFloat(form.price).toLocaleString("fr-FR")} ${currency.value}` : "— Prix"}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">{form.stock} en stock</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.offerShipping && (
                    <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                      <Truck className="w-3 h-3" /> Livraison GP
                    </span>
                  )}
                  {form.colors.slice(0, 3).map(c => (
                    <span key={c} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* ── CTA final ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1 pb-8">
          <Link href="/dashboard/vendeur"
            className="flex-1 flex items-center justify-center py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
            Annuler
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-2xl text-sm shadow-lg shadow-orange-200 transition-all"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Création en cours…</>
              : <><Package className="w-4 h-4" /> Publier le produit</>
            }
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center -mt-4 pb-4">
          Votre produit sera visible sur la marketplace après validation par l'équipe SangoMarket (24–48&nbsp;h).
        </p>
      </form>
    </div>
  );
}

// ─── Tiny layout helpers ──────────────────────────────────────────────────────

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
      {children}
    </div>
  );
}

function Divider() {
  return <div className="border-t border-gray-100 -mx-5 sm:-mx-6" />;
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="space-y-1">{children}</div>;
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-500 mt-0.5">{children}</p>;
}
