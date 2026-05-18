"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2, Clock, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.login(form.email, form.password) as any;
      // login() updates context state + localStorage simultaneously
      login(res.user, res.token);
      if (res.user?.role === "admin") {
        router.push("/dashboard/admin");
      } else if (res.user?.role === "vendeur") {
        router.push("/dashboard/vendeur");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message ?? "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-6 sm:py-12 bg-gray-50">
      <div className="w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">Bon retour !</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre compte SangoStore</p>
        </div>

        <div className="card p-5 sm:p-8">
          {error && (
            error.includes("attente de validation") ? (
              <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <Clock className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-semibold mb-0.5">Compte en attente de validation</p>
                  <p className="text-xs text-amber-700">Notre équipe examine votre profil. Vous recevrez un email sous 24–48h.</p>
                </div>
              </div>
            ) : error.includes("pas été approuvée") ? (
              <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <div>
                  <p className="font-semibold mb-0.5">Demande non approuvée</p>
                  <p className="text-xs">Votre demande n'a pas été acceptée. <a href="mailto:contact@sangostore.com" className="underline">Contactez-nous</a> pour plus d'informations.</p>
                </div>
              </div>
            ) : (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Mot de passe</label>
                <Link href="/auth/forgot-password" className="text-xs text-orange-500 hover:text-orange-600">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
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

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Pas encore de compte ?{" "}
          <Link href="/auth/register" className="text-orange-500 hover:text-orange-600 font-semibold">
            S'inscrire gratuitement
          </Link>
        </p>
      </div>
    </div>
  );
}
