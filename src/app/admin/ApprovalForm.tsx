'use client'

import { useState, useTransition } from 'react'
import { approveTutor, rejectTutor } from '@/app/actions/tutor'
import { useRouter } from 'next/navigation'

export default function ApprovalForm({ tutorId }: { tutorId: string }) {
  const [mensaje, setMensaje] = useState('')
  const [showReject, setShowReject] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState<'approved' | 'rejected' | null>(null)
  const router = useRouter()

  const handleApprove = () => {
    startTransition(async () => {
      await approveTutor(tutorId, mensaje || undefined)
      setDone('approved')
      router.refresh()
    })
  }

  const handleReject = () => {
    if (!mensaje.trim()) return
    startTransition(async () => {
      await rejectTutor(tutorId, mensaje)
      setDone('rejected')
      router.refresh()
    })
  }

  if (done === 'approved') {
    return <p className="text-green-700 text-sm font-medium">✅ Tutor aprobado correctamente.</p>
  }
  if (done === 'rejected') {
    return <p className="text-red-700 text-sm font-medium">❌ Tutor rechazado.</p>
  }

  return (
    <div className="space-y-3">
      {showReject ? (
        <>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Motivo del rechazo (obligatorio)..."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={isPending || !mensaje.trim()}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Rechazando...' : 'Confirmar rechazo'}
            </button>
            <button
              onClick={() => { setShowReject(false); setMensaje('') }}
              className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-lg border border-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Mensaje opcional para el tutor..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="bg-green-600 hover:bg-green-700 text-white text-sm px-5 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Aprobando...' : '✅ Aprobar tutor'}
            </button>
            <button
              onClick={() => setShowReject(true)}
              className="bg-red-100 hover:bg-red-200 text-red-700 text-sm px-5 py-2 rounded-lg font-medium transition-colors"
            >
              ❌ Rechazar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
