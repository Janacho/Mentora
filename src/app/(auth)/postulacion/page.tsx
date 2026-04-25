'use client'

import { useState } from 'react'
import { submitTutorApplication } from '@/app/actions/tutor'
import {
  TIPOS_INSTITUCION,
  INSTITUCIONES_POR_TIPO,
  CARRERAS_POR_AREA,
  RAMOS_AGRUPADOS,
  type TipoInstitucion,
} from '@/lib/utils'

function baseNombre(nombre: string) {
  return nombre.replace(/\s*\([^)]+\)$/, '').trim()
}

const MATERIAL_OPTIONS = ['Pruebas antiguas', 'Apuntes', 'Resúmenes']

const currentYear = new Date().getFullYear()
const YEARS_INGRESO = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i)
const YEARS_CURSADO = Array.from({ length: 7 }, (_, i) => 2024 - i)

interface Ramo {
  nombreRamo: string
  nota: string
  profesor: string
  anio: string
  semestre: string
  fueAyudante: boolean
  materialDisp: string[]
}

const emptyRamo = (): Ramo => ({
  nombreRamo: '',
  nota: '5.0',
  profesor: '',
  anio: '2023',
  semestre: '1',
  fueAyudante: false,
  materialDisp: [],
})

export default function PostulacionPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 1 state
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [tipoInstitucion, setTipoInstitucion] = useState<TipoInstitucion | ''>('')
  const [universidad, setUniversidad] = useState('')
  const [carrera, setCarrera] = useState('')
  const [anioIngreso, setAnioIngreso] = useState('2020')
  const [precioPorHora, setPrecioPorHora] = useState('15000')
  const [modalidad, setModalidad] = useState('ambas')

  // Step 2 state
  const [ramos, setRamos] = useState<Ramo[]>([emptyRamo()])
  const [currentRamo, setCurrentRamo] = useState<Ramo>(emptyRamo())

  // Step 3 state
  const [certificadoFile, setCertificadoFile] = useState<File | null>(null)

  const updateCurrentRamo = (field: keyof Ramo, value: string | boolean | string[]) => {
    setCurrentRamo(prev => ({ ...prev, [field]: value }))
  }

  const toggleMaterial = (mat: string) => {
    setCurrentRamo(prev => ({
      ...prev,
      materialDisp: prev.materialDisp.includes(mat)
        ? prev.materialDisp.filter(m => m !== mat)
        : [...prev.materialDisp, mat],
    }))
  }

  const addRamo = () => {
    if (!currentRamo.nombreRamo || !currentRamo.profesor.trim()) {
      setError('Completa el nombre del ramo y el profesor antes de agregar.')
      return
    }
    setError(null)
    setRamos(prev => [...prev.slice(0, -1), currentRamo])
    setCurrentRamo(emptyRamo())
    setRamos(prev => [...prev, emptyRamo()])
  }

  const removeRamo = (index: number) => {
    setRamos(prev => prev.filter((_, i) => i !== index))
  }

  const handleStep1Continue = () => {
    if (!nombre || !email || !universidad || !carrera) {
      setError('Por favor completa todos los campos.')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleStep2Continue = () => {
    const confirmed = ramos.filter(r => r.nombreRamo)
    if (confirmed.length === 0) {
      setError('Agrega al menos un ramo.')
      return
    }
    setError(null)
    setRamos(confirmed)
    setStep(3)
  }

  const handleSubmit = async () => {
    if (!certificadoFile) {
      setError('Debes subir tu certificado de notas en PDF.')
      return
    }
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.set('nombre', nombre)
    formData.set('email', email)
    formData.set('universidad', universidad)
    formData.set('carrera', carrera)
    formData.set('anioIngreso', anioIngreso)
    formData.set('precioPorHora', precioPorHora)
    formData.set('modalidad', modalidad)
    formData.set('certificadoUrl', certificadoFile.name)
    formData.set('ramos', JSON.stringify(ramos))

    const result = await submitTutorApplication(formData)
    setLoading(false)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-violet-50 border border-violet-200 rounded-2xl p-10 shadow-lg">
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-violet-800 mb-3">Postulación enviada</h2>
          <p className="text-gray-600 leading-relaxed">
            Tu postulación fue enviada a revisión. Te avisaremos cuando sea aprobada.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-2.5 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Postula como Tutor</h1>
          <p className="mt-2 text-gray-500">Comparte tu conocimiento y ayuda a otros estudiantes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {[
            { num: 1, label: 'Info Personal' },
            { num: 2, label: 'Ramos que enseñas' },
            { num: 3, label: 'Confirmar' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                    step === s.num
                      ? 'bg-violet-600 text-white'
                      : step > s.num
                      ? 'bg-violet-200 text-violet-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.num ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span className={`mt-1 text-xs font-medium hidden sm:block ${step === s.num ? 'text-violet-600' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-16 sm:w-24 h-0.5 mx-1 mb-4 ${step > s.num ? 'bg-violet-300' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-800 mb-1">Información Personal</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    placeholder="Juan Pérez González"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo institucional</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="juan.perez@uchile.cl"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  />
                </div>

                {/* Tipo de institución */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de institución</label>
                  <div className="flex flex-wrap gap-2">
                    {(['', ...TIPOS_INSTITUCION] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setTipoInstitucion(t as TipoInstitucion | ''); setUniversidad('') }}
                        className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                          tipoInstitucion === t
                            ? 'bg-violet-600 text-white border-violet-600 font-medium'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                        }`}
                      >
                        {t === '' ? 'Todos' : t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Institución */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institución</label>
                  <select
                    value={universidad}
                    onChange={e => setUniversidad(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white"
                  >
                    <option value="">Selecciona tu institución</option>
                    {tipoInstitucion
                      ? INSTITUCIONES_POR_TIPO[tipoInstitucion].map(i => (
                          <option key={i} value={baseNombre(i)}>{i}</option>
                        ))
                      : TIPOS_INSTITUCION.map(tipo => (
                          <optgroup key={tipo} label={tipo}>
                            {INSTITUCIONES_POR_TIPO[tipo].map(i => (
                              <option key={i} value={baseNombre(i)}>{i}</option>
                            ))}
                          </optgroup>
                        ))
                    }
                  </select>
                </div>

                {/* Carrera */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
                  <select
                    value={carrera}
                    onChange={e => setCarrera(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white"
                  >
                    <option value="">Selecciona tu carrera</option>
                    {CARRERAS_POR_AREA.map(area => (
                      <optgroup key={area.area} label={`— ${area.area}`}>
                        {area.carreras.map(c => (
                          <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año de ingreso</label>
                  <select
                    value={anioIngreso}
                    onChange={e => setAnioIngreso(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white"
                  >
                    {YEARS_INGRESO.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                  <select
                    value={modalidad}
                    onChange={e => setModalidad(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent bg-white"
                  >
                    <option value="ambas">Presencial y Online</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio por hora (CLP)
                  </label>
                  <input
                    type="number"
                    value={precioPorHora}
                    onChange={e => setPrecioPorHora(e.target.value)}
                    min={5000}
                    max={50000}
                    step={500}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-400">Entre $5.000 y $50.000 por hora</p>
                </div>
              </div>

              <button
                onClick={handleStep1Continue}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors mt-2"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold text-gray-800">Ramos que enseñas</h2>
                <button onClick={() => setStep(1)} className="text-sm text-violet-600 hover:underline">
                  Volver
                </button>
              </div>

              {/* Confirmed ramos list */}
              {ramos.filter(r => r.nombreRamo).length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ramos agregados</p>
                  {ramos.filter(r => r.nombreRamo).map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-lg px-4 py-2.5">
                      <div>
                        <span className="font-medium text-sm text-gray-800">{r.nombreRamo}</span>
                        <span className="ml-2 text-xs text-gray-500">{r.profesor} · Nota {r.nota}</span>
                      </div>
                      <button
                        onClick={() => removeRamo(i)}
                        className="text-red-400 hover:text-red-600 ml-3"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Current ramo form */}
              <div className="border border-dashed border-violet-300 rounded-xl p-5 space-y-4 bg-violet-50/40">
                <p className="text-sm font-medium text-violet-700">Nuevo ramo</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del ramo</label>
                    <select
                      value={currentRamo.nombreRamo}
                      onChange={e => updateCurrentRamo('nombreRamo', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    >
                      <option value="">— Selecciona un ramo —</option>
                      {RAMOS_AGRUPADOS.map(g => (
                        <optgroup key={g.grupo} label={g.grupo}>
                          {g.ramos.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota obtenida</label>
                    <input
                      type="number"
                      value={currentRamo.nota}
                      onChange={e => updateCurrentRamo('nota', e.target.value)}
                      min={5.0}
                      max={7.0}
                      step={0.1}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profesor</label>
                    <input
                      type="text"
                      value={currentRamo.profesor}
                      onChange={e => updateCurrentRamo('profesor', e.target.value)}
                      placeholder="Prof. Martínez"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Año cursado</label>
                    <select
                      value={currentRamo.anio}
                      onChange={e => updateCurrentRamo('anio', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    >
                      {YEARS_CURSADO.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semestre</label>
                    <select
                      value={currentRamo.semestre}
                      onChange={e => updateCurrentRamo('semestre', e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
                    >
                      <option value="1">1er semestre</option>
                      <option value="2">2do semestre</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="fueAyudante"
                    checked={currentRamo.fueAyudante}
                    onChange={e => updateCurrentRamo('fueAyudante', e.target.checked)}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <label htmlFor="fueAyudante" className="text-sm text-gray-700">Fui ayudante de este ramo</label>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Material disponible</p>
                  <div className="flex flex-wrap gap-3">
                    {MATERIAL_OPTIONS.map(mat => (
                      <label key={mat} className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentRamo.materialDisp.includes(mat)}
                          onChange={() => toggleMaterial(mat)}
                          className="w-4 h-4 accent-violet-600"
                        />
                        <span className="text-sm text-gray-700">{mat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addRamo}
                  className="flex items-center gap-1.5 px-4 py-2 border border-violet-400 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar otro ramo
                </button>
              </div>

              <button
                onClick={handleStep2Continue}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
              >
                Continuar
              </button>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-semibold text-gray-800">Confirmar postulación</h2>
                <button onClick={() => setStep(2)} className="text-sm text-violet-600 hover:underline">
                  Volver
                </button>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Datos personales</span>
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Nombre:</span> {nombre}</p>
                    <p><span className="font-medium">Email:</span> {email}</p>
                    <p><span className="font-medium">Universidad:</span> {universidad}</p>
                    <p><span className="font-medium">Carrera:</span> {carrera}</p>
                    <p><span className="font-medium">Año ingreso:</span> {anioIngreso}</p>
                    <p><span className="font-medium">Precio:</span> ${parseInt(precioPorHora).toLocaleString('es-CL')}/hr</p>
                    <p><span className="font-medium">Modalidad:</span> {modalidad}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ramos ({ramos.length})</span>
                  <ul className="mt-2 space-y-1">
                    {ramos.map((r, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-medium">{r.nombreRamo}</span>
                        <span className="text-gray-400">· Nota {r.nota} · {r.profesor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Certificate upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificado de notas PDF <span className="text-red-500">(obligatorio)</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-violet-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    id="certificado"
                    className="hidden"
                    onChange={e => setCertificadoFile(e.target.files?.[0] ?? null)}
                  />
                  <label htmlFor="certificado" className="cursor-pointer">
                    {certificadoFile ? (
                      <div className="flex items-center justify-center gap-2 text-violet-700">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium">{certificadoFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <svg className="w-10 h-10 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-gray-500">
                          <span className="text-violet-600 font-medium">Haz clic para subir</span> tu certificado PDF
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Enviando...
                  </span>
                ) : (
                  'Enviar postulación'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
