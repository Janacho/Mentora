"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TIPOS_INSTITUCION,
  INSTITUCIONES_POR_TIPO,
  CARRERAS_POR_AREA,
  type TipoInstitucion,
} from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const RAMOS_POR_ANO: Record<string, string[]> = {
  "1° Año": [
    "Cálculo I", "Álgebra Lineal", "Introducción a la Programación",
    "Física I", "Química General", "Biología Celular",
    "Economía General", "Administración de Empresas I",
  ],
  "2° Año": [
    "Cálculo II", "Ecuaciones Diferenciales", "Programación Orientada a Objetos",
    "Física II", "Estadística", "Termodinámica", "Contabilidad", "Microeconomía",
  ],
  "3° Año": [
    "Estructuras de Datos", "Bases de Datos", "Sistemas Operativos",
    "Redes de Computadores", "Macroeconomía", "Finanzas Corporativas",
    "Ingeniería de Software", "Investigación de Operaciones",
  ],
  "4° y 5° Año": [
    "Inteligencia Artificial", "Machine Learning", "Diseño de Sistemas",
    "Gestión de Proyectos", "Derecho Empresarial", "Marketing Digital",
    "Preparación y Evaluación de Proyectos",
  ],
};

// ---------------------------------------------------------------------------
// InstitutionCareerSelector sub-component
// ---------------------------------------------------------------------------

interface SelectorConfirmed {
  tipo: TipoInstitucion
  institucion: string
  carrera: string
}

function InstitutionCareerSelector({
  onConfirmed,
}: {
  onConfirmed: (data: SelectorConfirmed) => void
}) {
  const [tipo,        setTipo]        = useState<TipoInstitucion | "">("")
  const [institucion, setInstitucion] = useState("")
  const [carrera,     setCarrera]     = useState("")
  const [confirmed,   setConfirmed]   = useState<SelectorConfirmed | null>(null)
  const [error,       setError]       = useState("")

  const instituciones = tipo ? INSTITUCIONES_POR_TIPO[tipo as TipoInstitucion] : []

  function handleConfirm() {
    if (!tipo)        return setError("Selecciona el tipo de institución.")
    if (!institucion) return setError("Selecciona tu institución.")
    if (!carrera)     return setError("Selecciona tu carrera.")
    setError("")
    const data = { tipo: tipo as TipoInstitucion, institucion, carrera }
    setConfirmed(data)
    onConfirmed(data)
  }

  function handleEdit() {
    setConfirmed(null)
    onConfirmed({ tipo: "" as TipoInstitucion, institucion: "", carrera: "" })
  }

  // ── Summary view (after confirm) ────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="rounded-2xl border-2 border-violet-200 bg-violet-50 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-violet-700">✅ Elección confirmada</p>
          <button
            type="button"
            onClick={handleEdit}
            className="text-xs text-violet-500 hover:text-violet-700 underline transition-colors"
          >
            Editar
          </button>
        </div>
        <div className="space-y-1.5">
          <div className="flex gap-2 text-sm">
            <span className="text-slate-400 w-32 flex-shrink-0">Tipo:</span>
            <span className="font-medium text-slate-700">{confirmed.tipo}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-slate-400 w-32 flex-shrink-0">Institución:</span>
            <span className="font-medium text-slate-700">{confirmed.institucion}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <span className="text-slate-400 w-32 flex-shrink-0">Carrera:</span>
            <span className="font-medium text-slate-700">{confirmed.carrera}</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Selector view ───────────────────────────────────────────────────────
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4">
      <p className="text-sm font-semibold text-slate-700">Institución y carrera</p>

      {/* 1. Tipo de institución */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          1. Tipo de institución
        </label>
        <div className="flex flex-wrap gap-2">
          {TIPOS_INSTITUCION.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTipo(t); setInstitucion(""); setCarrera("") }}
              className={`text-sm px-4 py-2 rounded-xl border font-medium transition-colors ${
                tipo === t
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Institución específica */}
      {tipo && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            2. Nombre de la institución
          </label>
          <select
            value={institucion}
            onChange={e => { setInstitucion(e.target.value); setCarrera("") }}
            className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 bg-white transition"
          >
            <option value="" disabled>Selecciona tu institución</option>
            {instituciones.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      )}

      {/* 3. Carrera */}
      {institucion && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            3. Carrera
          </label>
          <select
            value={carrera}
            onChange={e => setCarrera(e.target.value)}
            className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 bg-white transition"
          >
            <option value="" disabled>Selecciona tu carrera</option>
            {CARRERAS_POR_AREA.map(area => (
              <optgroup key={area.area} label={`— ${area.area}`}>
                {area.carreras.map(c => (
                  <option
                    key={c.nombre}
                    value={c.nombre}
                    disabled={!c.profesorDisponible}
                  >
                    {c.nombre}{!c.profesorDisponible ? ' (sin tutores disponibles)' : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Confirm button */}
      <button
        type="button"
        onClick={handleConfirm}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors"
      >
        Confirmar Elección ✓
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StepOneData {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  universidad: string;
  carrera: string;
  anoCursa: string;
}

// ---------------------------------------------------------------------------
// Progress indicator
// ---------------------------------------------------------------------------

function ProgressBar({ step }: { step: number }) {
  const steps = ["Datos personales", "Método de pago", "Ramos de interés"];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = step === num;
        const done = step > num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done
                    ? "bg-violet-600 text-white"
                    : active
                    ? "bg-violet-600 text-white ring-4 ring-violet-100"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? "✓" : num}
              </div>
              <span
                className={`text-xs hidden sm:block ${
                  active ? "text-violet-700 font-semibold" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-1 mb-5 transition-colors ${
                  step > num ? "bg-violet-500" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function RegistroPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 state
  const [stepOne, setStepOne] = useState<StepOneData>({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
    universidad: "",
    carrera: "",
    anoCursa: "",
  });

  const [selectorConfirmed, setSelectorConfirmed] = useState(false);

  // Step 2 state (mock payment)
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Step 3 state
  const [selectedRamos, setSelectedRamos] = useState<string[]>([]);

  // ---- STEP 1 SUBMIT ----
  async function handleStepOne(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (stepOne.password !== stepOne.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (stepOne.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (!selectorConfirmed || !stepOne.universidad || !stepOne.carrera) {
      setError("Debes confirmar tu institución y carrera antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: stepOne.nombre,
          email: stepOne.email,
          password: stepOne.password,
          universidad: stepOne.universidad,
          carrera: stepOne.carrera,
          anoCursa: stepOne.anoCursa,
          role: "alumno",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "No se pudo crear la cuenta. Intenta de nuevo.");
        return;
      }

      setStep(2);
    } catch {
      setError("Error de conexión. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  // ---- STEP 2 SUBMIT ----
  async function handleStepTwo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardNumber, expiry, cvv }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "No se pudo guardar el método de pago.");
        return;
      }

      setStep(3);
    } catch {
      setError("Error de conexión. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  }

  // ---- STEP 3 SUBMIT ----
  function handleStepThree() {
    router.push("/tutores");
  }

  function toggleRamo(ramo: string) {
    setSelectedRamos((prev) =>
      prev.includes(ramo) ? prev.filter((r) => r !== ramo) : [...prev, ramo]
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-indigo-50 to-white flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl border border-violet-100 p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-3xl font-black text-violet-700 tracking-tight">Mentora</span>
          </div>

          {/* Progress */}
          <ProgressBar step={step} />

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          {/* ---- STEP 1: Basic info ---- */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-6">Crea tu cuenta</h1>

              <form onSubmit={handleStepOne} className="flex flex-col gap-4">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Nombre completo</label>
                  <input
                    type="text"
                    required
                    value={stepOne.nombre}
                    onChange={(e) => setStepOne({ ...stepOne, nombre: e.target.value })}
                    placeholder="María González"
                    className="input-field w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Correo universitario
                  </label>
                  <input
                    type="email"
                    required
                    value={stepOne.email}
                    onChange={(e) => setStepOne({ ...stepOne, email: e.target.value })}
                    placeholder="nombre@uc.cl"
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* Institution + Career selector */}
                <InstitutionCareerSelector
                  onConfirmed={(data) => {
                    if (!data.institucion) {
                      setSelectorConfirmed(false)
                      setStepOne(prev => ({ ...prev, universidad: "", carrera: "" }))
                    } else {
                      setSelectorConfirmed(true)
                      setStepOne(prev => ({
                        ...prev,
                        universidad: data.institucion,
                        carrera: data.carrera,
                      }))
                    }
                  }}
                />

                {/* Año */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Año que cursas</label>
                  <select
                    required
                    value={stepOne.anoCursa}
                    onChange={(e) => setStepOne({ ...stepOne, anoCursa: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 bg-white transition"
                  >
                    <option value="" disabled>Selecciona tu año</option>
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>{y}° año</option>
                    ))}
                  </select>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={stepOne.password}
                    onChange={(e) => setStepOne({ ...stepOne, password: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition"
                  />
                </div>

                {/* Confirm password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={stepOne.confirmPassword}
                    onChange={(e) => setStepOne({ ...stepOne, confirmPassword: e.target.value })}
                    placeholder="Repite tu contraseña"
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 text-base transition-colors duration-150"
                >
                  {loading ? "Creando cuenta…" : "Continuar →"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-violet-600 hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
            </>
          )}

          {/* ---- STEP 2: Payment ---- */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">Configura tu método de pago</h1>
              <p className="text-slate-500 text-sm mb-6">
                Tu pago solo se procesa cuando confirmas una sesión. No se te cobra ahora.
              </p>

              <form onSubmit={handleStepTwo} className="flex flex-col gap-4">
                {/* Card number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700">
                    Número de tarjeta
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      // Format: 1234 5678 9012 3456
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 16);
                      const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
                      setCardNumber(formatted);
                    }}
                    placeholder="1234 5678 9012 3456"
                    className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition font-mono tracking-wider"
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Vencimiento
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => {
                        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 4);
                        const formatted =
                          cleaned.length > 2
                            ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`
                            : cleaned;
                        setExpiry(formatted);
                      }}
                      placeholder="MM/AA"
                      className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition font-mono"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-slate-700">CVV</label>
                    <input
                      type="password"
                      required
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="•••"
                      className="w-full rounded-xl border border-slate-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition font-mono"
                    />
                  </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-2 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3 text-violet-700 text-xs">
                  <span className="mt-0.5">🔒</span>
                  <span>
                    Tu información de pago está cifrada. Solo se procesará un cobro cuando tú
                    confirmes una sesión con un tutor.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-6 py-3 text-base transition-colors duration-150"
                >
                  {loading ? "Guardando…" : "Guardar método de pago →"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full text-slate-400 hover:text-slate-600 text-sm underline transition-colors"
                >
                  Saltar por ahora
                </button>
              </form>
            </>
          )}

          {/* ---- STEP 3: Ramos ---- */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                ¿En qué ramos necesitas ayuda?
              </h1>
              <p className="text-slate-500 text-sm mb-6">
                Selecciona los ramos que te interesan para recibir recomendaciones personalizadas.
                Puedes cambiarlos después.
              </p>

              <div className="flex flex-col gap-5 max-h-80 overflow-y-auto pr-1">
                {Object.entries(RAMOS_POR_ANO).map(([ano, ramos]) => (
                  <div key={ano}>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                      {ano}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {ramos.map((ramo) => {
                        const selected = selectedRamos.includes(ramo);
                        return (
                          <button
                            key={ramo}
                            type="button"
                            onClick={() => toggleRamo(ramo)}
                            className={`text-xs rounded-full px-3 py-1.5 font-medium border transition-colors ${
                              selected
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                            }`}
                          >
                            {ramo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {selectedRamos.length > 0 && (
                <p className="mt-3 text-xs text-violet-600 font-medium">
                  {selectedRamos.length} ramo{selectedRamos.length !== 1 ? "s" : ""} seleccionado
                  {selectedRamos.length !== 1 ? "s" : ""}
                </p>
              )}

              <button
                type="button"
                onClick={handleStepThree}
                className="mt-6 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl px-6 py-3 text-base transition-colors duration-150"
              >
                Continuar al buscador →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
