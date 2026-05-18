"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plus, CheckCircle, AlertCircle,
  Package, Loader2, ImageIcon, X, Tag,
  DollarSign, Percent, Calendar, Upload, Save, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { uploadImage } from "@/lib/imageUtils";
import { SELLER_CATEGORIES, getApiCategory } from "@/lib/categories";

// ─── Types ────────────────────────────────────────────────────────────────────

type Currency = "XAF" | "EUR" | "USD";
type SaleType = "normal" | "grossiste" | "mixte";

interface WholesaleTier {
  min_qty: number;
  max_qty?: number | null;
  price: number;
}

interface FormState {
  title:         string;
  description:   string;
  categorySlug:  string;
  subSpace:      string;
  subcategory:   string;
  originCountry: string;
  price:         string;
  currency:      Currency;
  stock:         string;
  isAvailable:   boolean;
  hasPromo:      boolean;
  promoPrice:    string;
  promoEndDate:  string;
  images:        string[];
  weightKg:      string;
  dimensions:    string;
  tags:          string;
  typeVente:     SaleType;
  wholesalePrices: WholesaleTier[];
}

const DEFAULT_FORM: FormState = {
  title: "", description: "", categorySlug: "electronique",
  subSpace: "", subcategory: "", originCountry: "FR",
  price: "", currency: "EUR", stock: "0", isAvailable: true,
  hasPromo: false, promoPrice: "", promoEndDate: "",
  images: [""], weightKg: "", dimensions: "", tags: "",
  typeVente: "normal", wholesalePrices: [],
};

const CURRENCIES: { value: Currency; symbol: string }[] = [
  { value: "XAF", symbol: "FCFA" },
  { value: "EUR", symbol: "€"    },
  { value: "USD", symbol: "$"    },
];

// ─── Shared field helpers ─────────────────────────────────────────────────────

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children} {required && <span className="text-red-500">*</span>}
    </label>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props} className={cn(
      "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900",
      "placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all",
      className
    )} />
  );
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea {...props} className={cn(
      "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 resize-none",
      "placeholder:text-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all",
      className
    )} />
  );
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(
      "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 cursor-pointer",
      "focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all",
      className
    )}>
      {children}
    </select>
  );
}

function Toggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-2.5 group">
      <div className={cn(
        "relative w-10 rounded-full transition-colors duration-200",
        enabled ? "bg-orange-500" : "bg-gray-200"
      )} style={{ height: "22px" }}>
        <span className={cn(
          "absolute top-0.5 bg-white rounded-full shadow transition-transform duration-200",
          enabled ? "translate-x-5" : "translate-x-0.5"
        )} style={{ width: "18px", height: "18px" }} />
      </div>
      <span className={cn("text-sm font-semibold transition-colors",
        enabled ? "text-orange-600" : "text-gray-500 group-hover:text-gray-700")}>
        {label}
      </span>
    </button>
  );
}

function SectionHeader({ step, icon: Icon, title, subtitle, color = "orange" }: {
  step: number; icon: React.ElementType; title: string; subtitle?: string;
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

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">{children}</div>;
}
function Divider() { return <div className="border-t border-gray-100 -mx-5 sm:-mx-6" />; }
function Field({ children }: { children: React.ReactNode }) { return <div className="space-y-1">{children}</div>; }
function ErrMsg({ children }: { children: React.ReactNode }) { return <p className="text-xs text-red-500 mt-0.5">{children}</p>; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseImagesFromApi(raw: any): string[] {
  let arr: any[] = [];
  if (Array.isArray(raw)) { arr = raw; }
  else if (typeof raw === "string" && raw.startsWith("[")) {
    try { arr = JSON.parse(raw); } catch { arr = []; }
  } else if (typeof raw === "string" && raw.startsWith("{")) {
    arr = raw.slice(1, -1).split(",").map((s: string) => s.replace(/^"|"$/g, ""));
  }
  return arr.map((u: any) => (typeof u === "string" ? u.trim() : "")).filter(Boolean);
}

function parseWholesale(raw: any): WholesaleTier[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") { try { return JSON.parse(raw); } catch { return []; } }
  return [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ModifierProduitPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [form,       setForm]       = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [uploadMsg,  setUploadMsg]  = useState("");
  const [success,    setSuccess]    = useState(false);
  const [errors,     setErrors]     = useState<Partial<Record<keyof FormState | "images" | "general", string>>>({});

  // imageFiles[i] = File to upload | null (already-uploaded URL, keep as-is)
  const imageFiles = useRef<(File | null)[]>([null]);

  const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  // ── Load product ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      try {
        const { api } = await import("@/lib/api");
        const res = await api.products.get(id);
        const p: any = (res as any)?.data ?? res;
        if (!p?.id) { setNotFound(true); setLoading(false); return; }

        const imgs = parseImagesFromApi(p.images);
        const displayImgs = imgs.length ? imgs : [""];
        imageFiles.current = displayImgs.map(() => null);

        const wPrices = parseWholesale(p.wholesale_prices);

        const catSlug = p.seller_category ?? p.category ?? "electronique";
        const sellerCat = SELLER_CATEGORIES.find(c => c.slug === catSlug);
        const rawTags: string[] = Array.isArray(p.tags)
          ? p.tags
          : (typeof p.tags === "string" && p.tags
              ? p.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
              : []);
        const subSpaceSlug = sellerCat?.subSpaces
          ? (sellerCat.subSpaces.find(ss => rawTags.includes(ss.slug))?.slug ?? "")
          : "";
        const userTags = rawTags.filter(t => !sellerCat?.subSpaces?.some(ss => ss.slug === t));

        setForm({
          title:         p.title         ?? "",
          description:   p.description   ?? "",
          categorySlug:  catSlug,
          subSpace:      subSpaceSlug,
          subcategory:   p.subcategory   ?? "",
          originCountry: p.origin_country ?? "FR",
          price:         p.price          != null ? String(parseFloat(p.price)) : "",
          currency:      (p.currency as Currency) ?? "EUR",
          stock:         p.stock          != null ? String(p.stock) : "0",
          isAvailable:   p.is_available   ?? true,
          hasPromo:      p.promo_price    != null,
          promoPrice:    p.promo_price    != null ? String(parseFloat(p.promo_price)) : "",
          promoEndDate:  p.promo_end
            ? new Date(p.promo_end).toISOString().split("T")[0]
            : "",
          images:         displayImgs,
          weightKg:       p.weight_kg != null ? String(p.weight_kg) : "",
          dimensions:     p.dimensions   ?? "",
          tags:           userTags.join(", "),
          typeVente:      wPrices.length > 0 ? "mixte" : "normal",
          wholesalePrices: wPrices,
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // ── Form helpers ────────────────────────────────────────────────────────────

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key as keyof typeof errors]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function resetCategory(slug: string) {
    setForm(prev => ({ ...prev, categorySlug: slug, subSpace: "", subcategory: "" }));
    setErrors(prev => ({ ...prev, categorySlug: undefined, subSpace: undefined, subcategory: undefined }));
  }

  function addImage() {
    if (form.images.length >= 6) return;
    imageFiles.current = [...imageFiles.current, null];
    set("images", [...form.images, ""]);
  }

  function removeImage(i: number) {
    if (form.images[i]?.startsWith("blob:")) URL.revokeObjectURL(form.images[i]);
    imageFiles.current = imageFiles.current.filter((_, idx) => idx !== i);
    const next = form.images.filter((_, idx) => idx !== i);
    set("images", next.length ? next : [""]);
  }

  function handleFileChange(i: number, file: File) {
    if (form.images[i]?.startsWith("blob:")) URL.revokeObjectURL(form.images[i]);
    const previewUrl = URL.createObjectURL(file);
    imageFiles.current[i] = file;
    const imgs = [...form.images];
    imgs[i] = previewUrl;
    setErrors(prev => ({ ...prev, images: undefined }));
    set("images", imgs);
  }


  // ── Wholesale tier helpers ──────────────────────────────────────────────────

  function addTier() {
    set("wholesalePrices", [...form.wholesalePrices, { min_qty: 5, price: 0 }]);
  }

  function removeTier(i: number) {
    set("wholesalePrices", form.wholesalePrices.filter((_, idx) => idx !== i));
  }

  function updateTier(i: number, field: keyof WholesaleTier, val: number | null) {
    const next = form.wholesalePrices.map((t, idx) =>
      idx === i ? { ...t, [field]: val } : t
    );
    set("wholesalePrices", next);
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: Partial<Record<keyof FormState | "images" | "general", string>> = {};
    if (!form.title.trim())                                                  errs.title    = "Le titre est obligatoire";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0) errs.price    = "Prix de vente invalide";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)  errs.stock    = "Stock invalide";
    if (!form.originCountry)                                                 errs.originCountry = "Pays obligatoire";

    const selectedCat = SELLER_CATEGORIES.find(c => c.slug === form.categorySlug);
    if (selectedCat?.subSpaces?.length) {
      if (!form.subSpace) errs.subSpace = "Choisissez un espace (Homme, Femme, etc.)";
      else if (!form.subcategory) errs.subcategory = "Choisissez une sous-catégorie";
    } else if (selectedCat && selectedCat.subcategories.length > 0 && !form.subcategory) {
      errs.subcategory = "Choisissez une sous-catégorie";
    }

    if (form.hasPromo) {
      if (!form.promoPrice || isNaN(Number(form.promoPrice)) || Number(form.promoPrice) <= 0)
        errs.promoPrice = "Prix promotionnel invalide";
      if (form.promoPrice && Number(form.promoPrice) >= Number(form.price))
        errs.promoPrice = "Le prix promo doit être inférieur au prix normal";
    }
    if (form.typeVente !== "normal" && form.wholesalePrices.length === 0) {
      errs.general = "Ajoutez au moins un palier de prix grossiste";
    }
    setErrors(errs);
    return Object.values(errs).filter(Boolean).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setErrors({});
    try {
      // Upload any new local File objects
      const finalImages: string[] = [];
      const totalFiles = imageFiles.current.filter(Boolean).length;
      let uploaded = 0;
      for (let i = 0; i < form.images.length; i++) {
        const file = imageFiles.current[i];
        if (file) {
          setUploadMsg(`Optimisation image ${uploaded + 1}/${totalFiles}…`);
          try {
            const url = await uploadImage(file);
            if (form.images[i]?.startsWith("blob:")) URL.revokeObjectURL(form.images[i]);
            finalImages.push(url);
            uploaded++;
          } catch (err: any) {
            if (err?.isAuth) throw new Error("Session expirée — veuillez vous reconnecter");
            // Keep the existing saved URL if this was a re-upload of an already-saved image
            if (form.images[i] && !form.images[i].startsWith("blob:")) {
              finalImages.push(form.images[i]);
            }
          }
        } else if (form.images[i] && !form.images[i].startsWith("blob:")) {
          finalImages.push(form.images[i]);
        }
      }
      setUploadMsg("");

      const { api } = await import("@/lib/api");

      const updatePayload: Record<string, unknown> = {
        title:          form.title,
        description:    form.description || undefined,
        price:          parseFloat(form.price),
        currency:       form.currency,
        images:         finalImages,
        category:       getApiCategory(form.categorySlug),
        sellerCategory: form.categorySlug,
        subcategory:    form.subcategory || undefined,
        originCountry:  form.originCountry,
        stock:          parseInt(form.stock, 10),
        isAvailable:    form.isAvailable,
        tags: (() => {
          const base = form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
          const auto = form.subSpace ? [form.subSpace] : [];
          const all  = [...new Set([...auto, ...base])];
          return all.length > 0 ? all : undefined;
        })(),
      };
      if (form.weightKg) updatePayload.weightKg = parseFloat(form.weightKg);
      // Only send promo fields when explicitly set (avoids sending null for unrelated products)
      updatePayload.promoPrice = form.hasPromo && form.promoPrice ? parseFloat(form.promoPrice) : null;
      updatePayload.promoEnd   = form.hasPromo && form.promoEndDate ? form.promoEndDate : null;
      // Only send wholesalePrices when there are actual tiers (avoids empty-array JSONB issue)
      if (form.typeVente !== "normal" && form.wholesalePrices.length > 0) {
        updatePayload.wholesalePrices = form.wholesalePrices;
      } else if (form.typeVente === "normal") {
        updatePayload.wholesalePrices = [];
      }

      await api.products.update(id, updatePayload as any);

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/vendeur?section=products"), 1800);
    } catch (err: any) {
      const msg: string = err?.message ?? "";
      const isAuth = err?.isAuth || msg.toLowerCase().includes("session")
        || msg.toLowerCase().includes("rôle") || msg.toLowerCase().includes("insuffisant");
      setErrors({ general: isAuth
        ? "Session expirée — reconnectez-vous en tant que vendeur."
        : msg || "Erreur lors de la mise à jour" });
    } finally {
      setSubmitting(false);
      setUploadMsg("");
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          <p className="text-sm text-gray-500">Chargement du produit…</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Produit introuvable</h2>
          <p className="text-sm text-gray-500 mt-2">Ce produit n'existe pas ou vous n'avez pas les droits pour le modifier.</p>
          <Link href="/dashboard/vendeur"
            className="mt-6 inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-sm w-full text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Produit mis à jour !</h2>
          <p className="text-sm text-gray-500 mt-2">Vos modifications ont été enregistrées.</p>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
            Retour à votre espace…
          </div>
        </div>
      </div>
    );
  }

  const hasErrors = Object.values(errors).some(Boolean);
  const currencySymbol = CURRENCIES.find(c => c.value === form.currency)?.symbol ?? form.currency;

  // ── Main form ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/vendeur"
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm font-bold text-gray-900 leading-none">Modifier le produit</h1>
              <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 max-w-[200px]">{form.title || "…"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/vendeur"
              className="hidden sm:flex px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Annuler
            </Link>
            <button
              form="edit-form"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-sm font-bold px-5 py-2 rounded-xl transition-all shadow-sm shadow-orange-200"
            >
              {submitting
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Sauvegarde…</>
                : <><Save className="w-4 h-4" /> Enregistrer</>
              }
            </button>
          </div>
        </div>
      </div>

      <form id="edit-form" onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-5">

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

        {/* ═══ SECTION 1 — Informations de base ═══════════════════════════ */}
        <Card>
          <SectionHeader step={1} icon={Package} title="Informations de base" color="orange" />
          <Divider />

          <Field>
            <Label required>Titre du produit</Label>
            <Input
              placeholder="ex : iPhone 14 Pro 256 Go — Violet, neuf sous blister"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              className={errors.title ? "border-red-300" : ""}
            />
            {errors.title && <ErrMsg>{errors.title}</ErrMsg>}
          </Field>

          <Field>
            <Label>Description</Label>
            <Textarea
              rows={4}
              placeholder="Décrivez votre produit : état, caractéristiques, contenu de la boîte…"
              value={form.description}
              onChange={e => set("description", e.target.value)}
            />
          </Field>

          {/* ── Catégorie principale — grille visuelle ───────────────────── */}
          <Field>
            <Label required>Catégorie principale</Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {SELLER_CATEGORIES.map(cat => {
                const isSelected = form.categorySlug === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => resetCategory(cat.slug)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border-2 p-2.5 transition-all text-center",
                      isSelected
                        ? "border-orange-400 bg-orange-50 shadow-sm shadow-orange-100"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <span className="text-xl leading-none">{cat.emoji}</span>
                    <span className={cn(
                      "text-[10px] font-bold leading-tight",
                      isSelected ? "text-orange-700" : "text-gray-600"
                    )}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* ── Niveau 2 : Sub-spaces (ex: Homme / Femme / Mariage…) ─────── */}
          {(() => {
            const cat = SELLER_CATEGORIES.find(c => c.slug === form.categorySlug);
            if (!cat?.subSpaces?.length) return null;
            return (
              <Field>
                <Label required>Espace</Label>
                <div className="flex flex-wrap gap-2">
                  {cat.subSpaces.map(ss => {
                    const isSelected = form.subSpace === ss.slug;
                    return (
                      <button
                        key={ss.slug}
                        type="button"
                        onClick={() => {
                          setForm(prev => ({ ...prev, subSpace: ss.slug, subcategory: "" }));
                          setErrors(prev => ({ ...prev, subSpace: undefined, subcategory: undefined }));
                        }}
                        className={cn(
                          "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                          isSelected
                            ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                        )}
                      >
                        <span>{ss.emoji}</span>
                        <span>{ss.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.subSpace && <ErrMsg>{errors.subSpace}</ErrMsg>}
              </Field>
            );
          })()}

          {/* ── Niveau 3 : Sous-catégories du sub-space, ou niveau 2 direct ── */}
          {(() => {
            const cat = SELLER_CATEGORIES.find(c => c.slug === form.categorySlug);
            if (!cat) return null;
            let subcats: string[];
            if (cat.subSpaces?.length) {
              if (!form.subSpace) return null;
              subcats = cat.subSpaces.find(s => s.slug === form.subSpace)?.subcategories ?? [];
            } else {
              subcats = cat.subcategories;
            }
            if (subcats.length === 0) return null;
            return (
              <Field>
                <Label required>Sous-catégorie</Label>
                <div className="flex flex-wrap gap-2">
                  {subcats.map(sub => {
                    const isSelected = form.subcategory === sub;
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => set("subcategory", isSelected ? "" : sub)}
                        className={cn(
                          "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all",
                          isSelected
                            ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                            : "bg-white border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-600"
                        )}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
                {form.subcategory && (
                  <p className="text-[11px] text-orange-600 font-semibold mt-1">
                    ✓ {form.subcategory}
                  </p>
                )}
                {errors.subcategory && <ErrMsg>{errors.subcategory}</ErrMsg>}
              </Field>
            );
          })()}

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
        </Card>

        {/* ═══ SECTION 2 — Prix & stock ═══════════════════════════════════ */}
        <Card>
          <SectionHeader step={2} icon={DollarSign} title="Prix & stock" color="violet" />
          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label required>Prix de vente</Label>
              <div className="relative">
                <Input
                  type="number" min="0" step="0.01"
                  placeholder="850"
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

          {/* Disponibilité */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Produit disponible à la vente</p>
              <p className="text-[11px] text-gray-400">Désactivez pour masquer sans supprimer</p>
            </div>
            <Toggle
              enabled={form.isAvailable}
              onToggle={() => set("isAvailable", !form.isAvailable)}
              label={form.isAvailable ? "Actif" : "Inactif"}
            />
          </div>

          {/* Promo */}
          <div className="border-t border-gray-100 pt-4">
            <Toggle
              enabled={form.hasPromo}
              onToggle={() => set("hasPromo", !form.hasPromo)}
              label="Activer un prix promotionnel"
            />
            {form.hasPromo && (
              <div className="mt-4 grid grid-cols-2 gap-4 bg-orange-50 rounded-2xl p-4">
                <Field>
                  <Label required>Prix promotionnel</Label>
                  <div className="relative">
                    <Input
                      type="number" min="0" step="0.01" placeholder="690"
                      value={form.promoPrice}
                      onChange={e => set("promoPrice", e.target.value)}
                      className={cn("bg-white pr-14", errors.promoPrice ? "border-red-300" : "")}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                      {form.currency}
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

                {form.price && form.promoPrice && Number(form.promoPrice) < Number(form.price) && (
                  <div className="col-span-2 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-orange-100">
                    <Percent className="w-4 h-4 text-orange-500 flex-shrink-0" />
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-base font-extrabold text-orange-600">
                        {parseFloat(form.promoPrice).toLocaleString("fr-FR")} {form.currency}
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {parseFloat(form.price).toLocaleString("fr-FR")} {form.currency}
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

        {/* ═══ SECTION 3 — Vente en gros ══════════════════════════════════ */}
        <Card>
          <SectionHeader
            step={3} icon={Layers} title="Type de vente"
            subtitle="Configurez si ce produit est vendu au détail, en gros, ou les deux"
            color="indigo"
          />
          <Divider />

          <Field>
            <Label>Type de vente</Label>
            <Select
              value={form.typeVente}
              onChange={e => {
                const val = e.target.value as SaleType;
                set("typeVente", val);
                if (val === "normal") set("wholesalePrices", []);
              }}
            >
              <option value="normal">🛍️ Normal — vente au détail uniquement</option>
              <option value="mixte">🔀 Mixte — détail + prix de gros selon quantité</option>
              <option value="grossiste">📦 Grossiste — uniquement prix de gros</option>
            </Select>
            <p className="text-[11px] text-gray-400 mt-1">
              {form.typeVente === "normal" && "Prix fixe affiché pour tous les acheteurs."}
              {form.typeVente === "mixte"  && "Le prix de détail est affiché, les paliers gros s'appliquent selon la quantité commandée."}
              {form.typeVente === "grossiste" && "Seuls les prix par paliers sont affichés. Idéal pour les revendeurs."}
            </p>
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

              {/* Column headers */}
              {form.wholesalePrices.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Qté min</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Qté max</span>
                  <span className="text-[10px] font-bold text-indigo-500 uppercase">Prix unité</span>
                  <span />
                </div>
              )}

              {form.wholesalePrices.map((tier, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-white rounded-xl p-3 border border-indigo-100">
                  <Input
                    type="number" min="1" placeholder="5"
                    value={tier.min_qty || ""}
                    onChange={e => updateTier(i, "min_qty", parseInt(e.target.value) || 1)}
                    className="text-center"
                  />
                  <Input
                    type="number" min="1" placeholder="∞"
                    value={tier.max_qty ?? ""}
                    onChange={e => updateTier(i, "max_qty", e.target.value ? parseInt(e.target.value) : null)}
                    className="text-center"
                  />
                  <div className="relative">
                    <Input
                      type="number" min="0" step="0.01" placeholder="0"
                      value={tier.price || ""}
                      onChange={e => updateTier(i, "price", parseFloat(e.target.value) || 0)}
                      className="pr-14"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">
                      {form.currency}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTier(i)}
                    className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {form.wholesalePrices.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-xs text-indigo-400">Aucun palier défini. Cliquez sur "Ajouter un palier".</p>
                </div>
              )}

              {/* Preview */}
              {form.wholesalePrices.length > 0 && form.wholesalePrices[0].price > 0 && (
                <div className="bg-white rounded-xl px-4 py-3 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700 mb-1">Aperçu client :</p>
                  <p className="text-sm font-semibold text-indigo-800">
                    À partir de {form.wholesalePrices.reduce((min, t) => Math.min(min, t.price), Infinity).toLocaleString("fr-FR")} {form.currency}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {form.wholesalePrices.map((t, i) => (
                      <p key={i} className="text-[11px] text-gray-500">
                        {t.min_qty}{t.max_qty ? `–${t.max_qty}` : "+"} unités : {t.price.toLocaleString("fr-FR")} {form.currency}/u
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {errors.general && <ErrMsg>{errors.general}</ErrMsg>}
        </Card>

        {/* ═══ SECTION 4 — Images ═════════════════════════════════════════ */}
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

        {/* ═══ SECTION 5 — Détails ════════════════════════════════════════ */}
        <Card>
          <SectionHeader
            step={5} icon={Tag} title="Détails supplémentaires"
            subtitle="Optionnel — améliore la visibilité et l'expérience client"
            color="amber"
          />
          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <Label>Poids (kg)</Label>
              <Input type="number" min="0" step="0.001" placeholder="0.250"
                value={form.weightKg} onChange={e => set("weightKg", e.target.value)} />
            </Field>
            <Field>
              <Label>Dimensions</Label>
              <Input placeholder="30×20×10 cm"
                value={form.dimensions} onChange={e => set("dimensions", e.target.value)} />
            </Field>
          </div>

          <Field>
            <Label>Tags / mots-clés</Label>
            <Input
              placeholder="iphone, téléphone, apple (séparés par des virgules)"
              value={form.tags}
              onChange={e => set("tags", e.target.value)}
            />
            <p className="text-[11px] text-gray-400 mt-1">Améliorent la visibilité dans les recherches.</p>
          </Field>
        </Card>

        {/* ═══ APERÇU ═════════════════════════════════════════════════════ */}
        {(form.title || form.images[0]) && (
          <Card>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Aperçu</p>
            <div className="flex gap-4">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                {form.images[0]
                  ? <img src={form.images[0]} alt="" className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  : <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{form.title || "Titre du produit"}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{form.description || "Description…"}</p>
                <div className="flex items-baseline gap-2 mt-2 flex-wrap">
                  {form.hasPromo && form.promoPrice && Number(form.promoPrice) < Number(form.price) ? (
                    <>
                      <span className="text-base font-extrabold text-orange-600">
                        {parseFloat(form.promoPrice).toLocaleString("fr-FR")} {form.currency}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        {parseFloat(form.price).toLocaleString("fr-FR")} {form.currency}
                      </span>
                    </>
                  ) : (
                    <span className="text-base font-extrabold text-gray-900">
                      {form.price ? `${parseFloat(form.price).toLocaleString("fr-FR")} ${form.currency}` : "— Prix"}
                    </span>
                  )}
                  {form.typeVente !== "normal" && form.wholesalePrices.length > 0 && (
                    <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                      Gros dès {Math.min(...form.wholesalePrices.map(t => t.min_qty))} unités
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* CTA */}
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
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {uploadMsg || "Enregistrement…"}</>
              : <><Save className="w-4 h-4" /> Enregistrer les modifications</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}
