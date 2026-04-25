'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSala } from '@/app/actions/salas'
import { RAMOS_AGRUPADOS } from '@/lib/utils'

interface TutorOption {
  id: string
  nombre: string
  carrera: string
  calificacion: number
}

interface CrearSalaFormProps {
  tutoresAprobados: TutorOption[]
  userRole: string
}

const inputClass = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

export default function CrearSalaForm({ tutoresAprobados, userRole }: CrearSalaFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(0) // 0=choose type
  const [tipoSala, setTipoSala] = useState<'alumno_crea' | 'tutor_crea' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Shared fields
  const [ramo, setRamo] = useState('')
  const [modalidad, setModalidad] = useState('ambas')
  const [fechaClase, setFechaClase] = useState('')
  const [horaInicio, setHoraInicio] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [descripcion, setDescripcion] = useState('')

  // Alumno-specific
  const [privacidad, setPrivacidad] = useState<'publica' | 'privada'>('publica')
  const [cuposMax, setCuposMax] = useState(5)
  const [tutorPreferencia, setTutorPreferencia] = useState<'especifico' | 'cualquiera'>('cualquiera')
  const [tutorSolicitadoId, setTutorSolicitadoId] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')

  // Tutor-specific
  const [precioBase, setPrecioBase] = useState('8000')

  const handleChooseTipo = (t: 'alumno_crea' | 'tutor_crea') => {
    setTipoSala(t)
    setStep(1)
  }

  const handleSubmit = async () => {
    if (!ramo.trim()) { setError('El ramo es obligatorio.'); return }
    setError(null)
    setLoading(true)

    const fd = new FormData()
    fd.set('tipo', tipoSala)
    fd.set('ramo', ramo)
    fd.set('modalidad', modalidad)
    fd.set('fechaClase', fechaClase)
    fd.set('horaInicio', horaInicio)
    fd.set('descripcion', descripcion)
    if (modalidad === 'presencial' || modalidad === 'ambas') fd.set('ubicacion', ubicacion)

    if (tipoSala === 'alumno_crea') {
      fd.set('privacidad', privacidad)
      fd.set('cuposMax', String(cuposMax))
      fd.set('fechaLimite', fechaLimite)
      if (tutorPreferencia === 'especifico' && tutorSolicitadoId) {
        fd.set('tutorSolicitadoId', tutorSolicitadoId)
      }
    } else {
      fd.set('privacidad', 'publica')
      fd.set('precioBase', precioBase)
      fd.set('cuposMax', String(cuposMax))
    }

    const result = await createSala(fd)
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else if (result?.salaId) {
      router.push(`/salas/${result.salaId}`)
    }
  }

  // Step 0 — Choose type
  if (step === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">¿Cómo quieres crear la sala?</h2>

        <button
          onClick={() => handleChooseTipo('alumno_crea')}
          className="w-full text-left p-5 border-2 border-gray-200 rounded-2xl hover:border-violet-400 hover:bg-violet-50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-violet-200 transition-colors">
              🎓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Soy alumno y busco tutor</p>
              <p className="text-sm text-gray-500 mt-1">
                Crea una sala para tu grupo. Elige un tutor específico o publica la sala para que cualquier tutor disponible la tome.
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">🔓 Pública o 🔒 Privada</span>
                <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Hasta 7 participantes</span>
              </div>
            </div>
          </div>
        </button>

        {userRole === 'tutor' && (
          <button
            onClick={() => handleChooseTipo('tutor_crea')}
            className="w-full text-left p-5 border-2 border-gray-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                📣
              </div>
              <div>
                <p className="font-semibold text-gray-900">Soy tutor y ofrezco una clase</p>
                <p className="text-sm text-gray-500 mt-1">
                  Publica una sesión grupal con fecha, hora y precio definidos. Los alumnos que necesiten ese ramo podrán solicitar unirse.
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Tú defines el precio</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Tú aceptas a los alumnos</span>
                </div>
              </div>
            </div>
          </button>
        )}

        {userRole !== 'tutor' && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 text-center">
            ¿Eres tutor? <a href="/postulacion" className="text-violet-600 font-medium hover:underline">Postula aquí</a> para poder ofrecer clases grupales.
          </div>
        )}
      </div>
    )
  }

  // Step 1 — Form
  const isAlumno = tipoSala === 'alumno_crea'

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xl font-semibold text-gray-800">
          {isAlumno ? '🎓 Sala de alumnos' : '📣 Oferta de clase grupal'}
        </h2>
        <button onClick={() => setStep(0)} className="text-sm text-violet-600 hover:underline">
          Volver
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Ramo */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Ramo <span className="text-red-500">*</span></label>
          <select value={ramo} onChange={e => setRamo(e.target.value)} className={inputClass}>
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

        {/* Modalidad */}
        <div>
          <label className={labelClass}>Modalidad</label>
          <select value={modalidad} onChange={e => setModalidad(e.target.value)} className={inputClass}>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="ambas">Presencial y Online</option>
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className={labelClass}>Fecha de la clase</label>
          <input type="date" value={fechaClase} onChange={e => setFechaClase(e.target.value)} className={inputClass} />
        </div>

        {/* Hora */}
        <div>
          <label className={labelClass}>Hora de inicio</label>
          <input type="time" value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className={inputClass} />
        </div>

        {/* Ubicación */}
        {(modalidad === 'presencial' || modalidad === 'ambas') && (
          <div>
            <label className={labelClass}>Ubicación (si es presencial)</label>
            <input type="text" value={ubicacion} onChange={e => setUbicacion(e.target.value)}
              placeholder="Biblioteca Campus, etc." className={inputClass} />
          </div>
        )}

        {/* Cupos */}
        <div>
          <label className={labelClass}>
            Cupos máximos
            {isAlumno && <span className="text-xs text-gray-400 ml-1">(máx. 7 para sala pública)</span>}
          </label>
          <select value={cuposMax} onChange={e => setCuposMax(parseInt(e.target.value))} className={inputClass}>
            {[2,3,4,5,6,7].map(n => (
              <option key={n} value={n}>{n} personas</option>
            ))}
          </select>
        </div>

        {/* Precio — tutor_crea */}
        {!isAlumno && (
          <div>
            <label className={labelClass}>Precio por persona (CLP/hr)</label>
            <input type="number" value={precioBase} onChange={e => setPrecioBase(e.target.value)}
              min={2000} max={50000} step={500} className={inputClass} />
          </div>
        )}

        {/* Alumno-specific fields */}
        {isAlumno && (
          <>
            {/* Privacidad */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Tipo de sala</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button"
                  onClick={() => setPrivacidad('publica')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${privacidad === 'publica' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <p className="font-semibold text-sm text-gray-900">🔓 Pública</p>
                  <p className="text-xs text-gray-500 mt-0.5">Cualquier alumno con cuenta puede solicitar unirse. Máx. 7 participantes.</p>
                </button>
                <button type="button"
                  onClick={() => setPrivacidad('privada')}
                  className={`p-4 rounded-xl border-2 text-left transition-colors ${privacidad === 'privada' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <p className="font-semibold text-sm text-gray-900">🔒 Privada</p>
                  <p className="text-xs text-gray-500 mt-0.5">Solo los invitados que tengan cuenta pueden unirse. Sin límite de integrantes.</p>
                </button>
              </div>
            </div>

            {/* Tutor preference */}
            <div className="sm:col-span-2">
              <label className={labelClass}>Preferencia de tutor</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button"
                  onClick={() => setTutorPreferencia('cualquiera')}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${tutorPreferencia === 'cualquiera' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <p className="font-semibold text-sm text-gray-900">Cualquiera</p>
                  <p className="text-xs text-gray-500 mt-0.5">Tutores disponibles para este ramo verán la sala y podrán postular.</p>
                </button>
                <button type="button"
                  onClick={() => setTutorPreferencia('especifico')}
                  className={`p-3 rounded-xl border-2 text-left transition-colors ${tutorPreferencia === 'especifico' ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-violet-300'}`}
                >
                  <p className="font-semibold text-sm text-gray-900">Tutor específico</p>
                  <p className="text-xs text-gray-500 mt-0.5">Elige un tutor de la plataforma y envíale la solicitud.</p>
                </button>
              </div>
            </div>

            {tutorPreferencia === 'especifico' && (
              <div className="sm:col-span-2">
                <label className={labelClass}>Selecciona tutor</label>
                <select value={tutorSolicitadoId} onChange={e => setTutorSolicitadoId(e.target.value)} className={inputClass}>
                  <option value="">— Elegir tutor —</option>
                  {tutoresAprobados.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} · {t.carrera} · ⭐ {t.calificacion.toFixed(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fecha límite */}
            <div>
              <label className={labelClass}>Fecha límite para recibir tutores</label>
              <input type="date" value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} className={inputClass} />
            </div>
          </>
        )}

        {/* Descripción */}
        <div className="sm:col-span-2">
          <label className={labelClass}>Descripción / notas adicionales (opcional)</label>
          <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)}
            rows={2} placeholder="Ej: Necesitamos repasar integrales antes del certamen del viernes..."
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Creando sala...
          </span>
        ) : (
          isAlumno ? 'Publicar sala' : 'Publicar oferta de clase'
        )}
      </button>
    </div>
  )
}
