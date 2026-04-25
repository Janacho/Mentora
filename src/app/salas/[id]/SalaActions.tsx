'use client'

import { useState, useTransition } from 'react'
import { joinSala, postularSala, aceptarPostulacion, aceptarParticipante, cancelarSala } from '@/app/actions/salas'
import { useRouter } from 'next/navigation'

interface SalaActionsProps {
  salaId: string
  userRole: string
  userId: string
  isCreador: boolean
  isTutorAsignado: boolean
  estado: string
  yaParticipa: boolean
  yaPostulo: boolean
  esTutorAprobado: boolean
  tutorAsignadoId: string | null
  postulaciones: { id: string; tutorNombre: string; tutorCalif: number; mensaje: string | null; estado: string }[]
  participantesPendientes: { id: string; userName: string }[]
}

export default function SalaActions({
  salaId, userRole, isCreador, isTutorAsignado, estado,
  yaParticipa, yaPostulo, esTutorAprobado, tutorAsignadoId,
  postulaciones, participantesPendientes,
}: SalaActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [msg, setMsg] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [showPostularForm, setShowPostularForm] = useState(false)

  const doAction = async (fn: () => Promise<{ error?: string; success?: boolean }>) => {
    startTransition(async () => {
      const res = await fn()
      if (res?.error) setFeedback(res.error)
      else { setFeedback(null); router.refresh() }
    })
  }

  if (estado === 'cancelada') {
    return <p className="text-sm text-red-500 font-medium text-center py-2">Esta sala fue cancelada.</p>
  }

  return (
    <div className="space-y-4">
      {feedback && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{feedback}</div>
      )}

      {/* Alumno: join */}
      {userRole !== 'tutor' && !isCreador && !yaParticipa && estado === 'abierta' && (
        <button
          onClick={() => doAction(() => joinSala(salaId))}
          disabled={isPending}
          className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-60"
        >
          Solicitar unirme a la sala
        </button>
      )}
      {yaParticipa && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 text-center font-medium">
          ✅ Eres participante de esta sala
        </div>
      )}

      {/* Tutor: postulate */}
      {userRole === 'tutor' && !isTutorAsignado && esTutorAprobado && !yaPostulo && !tutorAsignadoId && estado === 'abierta' && (
        <div className="space-y-3">
          {!showPostularForm ? (
            <button
              onClick={() => setShowPostularForm(true)}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              📣 Postularme como tutor
            </button>
          ) : (
            <>
              <textarea
                value={msg}
                onChange={e => setMsg(e.target.value)}
                rows={3}
                placeholder="Mensaje para los alumnos (opcional)..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => doAction(() => postularSala(salaId, msg))}
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  Enviar postulación
                </button>
                <button onClick={() => setShowPostularForm(false)} className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {yaPostulo && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-sm text-indigo-700 text-center font-medium">
          ✅ Ya postulaste a esta sala — esperando respuesta
        </div>
      )}

      {/* Creador: review postulaciones */}
      {isCreador && postulaciones.filter(p => p.estado === 'pendiente').length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Postulaciones de tutores</p>
          {postulaciones.filter(p => p.estado === 'pendiente').map(p => (
            <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  <span className="blur-sm select-none mr-1">████</span> {p.tutorNombre} · ⭐ {p.tutorCalif.toFixed(1)}
                </p>
                {p.mensaje && <p className="text-xs text-gray-500 mt-0.5 italic">"{p.mensaje}"</p>}
              </div>
              <button
                onClick={() => doAction(() => aceptarPostulacion(p.id))}
                disabled={isPending}
                className="px-4 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
              >
                Aceptar
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tutor asignado: review participant requests */}
      {(isTutorAsignado || isCreador) && participantesPendientes.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Solicitudes de participantes</p>
          {participantesPendientes.map(p => (
            <div key={p.id} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-700">{p.userName}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => doAction(() => aceptarParticipante(p.id, true))}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  Aceptar
                </button>
                <button
                  onClick={() => doAction(() => aceptarParticipante(p.id, false))}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Creador: cancel */}
      {isCreador && estado !== 'cancelada' && estado !== 'confirmada' && (
        <button
          onClick={() => {
            if (confirm('¿Seguro que quieres cancelar esta sala?')) {
              doAction(() => cancelarSala(salaId))
            }
          }}
          disabled={isPending}
          className="w-full py-2 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
        >
          Cancelar sala
        </button>
      )}
    </div>
  )
}
