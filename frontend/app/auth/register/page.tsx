"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Package, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import type { UserRole } from "@/lib/types";

const ROLE_OPTIONS: { value: UserRole; label: string; icon: string; desc: string }[] = [
  { value: "client",       icon: "🛒", label: "Client",       desc: "J'achète des produits à Bangui" },
  { value: "vendeur",      icon: "🏪", label: "Vendeur",      desc: "Je vends depuis la diaspora" },
  { value: "transporteur", icon: "🚚", label: "Transporteur", desc: "Je transporte vers Bangui (GP)" },
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "" as UserRole | "",
    countryCode: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    alert("Compte créé ! En production, un email de validation vous serait envoyé.");
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-6 sm:py-12 bg-gray-50">
      <div className="w-full max-w-lg mx-4">
        {/* Logo */}
        <div className="text-center mb-5 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Package className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Créer votre compte</h1>
          <p className="text-gray-500 text-sm mt-1">Rejoignez la marketplace de la diaspora centrafricaine</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-3 mb-5 sm:mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-400"
              }`}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? "text-orange-600" : "text-gray-400"}`}>
                {s === 1 ? "Informations" : "Votre rôle"}
              </span>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? "bg-orange-500" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-5 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Jean-Baptiste Ngombo"
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="votre@email.com"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pays de résidence</label>
                  <select
                    required
                    className="select"
                    value={form.countryCode}
                    onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
                  >
                    <option value="">Choisir votre pays…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="8 caractères minimum"
                      className="input pr-10"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full py-3">
                  Continuer <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quel est votre rôle ?</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Vous pourrez changer de rôle plus tard dans vos paramètres.
                  </p>
                  <div className="space-y-3">
                    {ROLE_OPTIONS.map(({ value, icon, label, desc }) => (
                      <button
                        type="button"
                        key={value}
                        onClick={() => setForm({ ...form, role: value })}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          form.role === value
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <div>
                          <div className={`font-semibold text-sm ${form.role === value ? "text-orange-700" : "text-gray-900"}`}>
                            {label}
                          </div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                        {form.role === value && (
                          <CheckCircle className="w-5 h-5 text-orange-500 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-700">
                  En créant un compte, vous acceptez nos{" "}
                  <Link href="/cgv" className="underline hover:text-blue-900">Conditions Générales</Link>{" "}
                  et notre{" "}
                  <Link href="/confidentialite" className="underline hover:text-blue-900">Politique de confidentialité</Link>.
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">
                    Retour
                  </button>
                  <button type="submit" disabled={!form.role || loading} className="btn-primary flex-1 py-3">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Création…</>
                    ) : (
                      <>Créer mon compte <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link href="/auth/login" className="text-orange-500 hover:text-orange-600 font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
