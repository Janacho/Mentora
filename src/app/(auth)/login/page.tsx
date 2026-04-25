"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Credenciales incorrectas. Intenta de nuevo.");
        return;
      }

      // Redirect based on role returned by the API
      if (data.role === "tutor") {
        window.location.href = "/dashboard/tutor";
      } else {
        window.location.href = "/dashboard/alumno";
      }
    } catch {
      setError("Error de conexión. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-4xl font-black text-violet-700 tracking-tight">Mentora</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Iniciar Sesión</h1>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@uc.cl"
                className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 text-base transition-colors duration-150"
            >
              {loading ? "Iniciando sesión…" : "Iniciar Sesión"}
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 flex flex-col gap-2 text-center text-sm text-slate-500">
            <p>
              ¿No tienes cuenta?{" "}
              <Link href="/registro" className="text-violet-600 hover:underline font-medium">
                Regístrate
              </Link>
            </p>
            <p>
              ¿Eres tutor?{" "}
              <Link href="/postulacion" className="text-indigo-600 hover:underline font-medium">
                Postúlate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
