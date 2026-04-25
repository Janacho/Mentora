'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

interface SalasFiltersProps {
  initialRamo: string
  initialModalidad: string
  initialTipo: string
}

export default function SalasFilters({ initialRamo, initialModalidad, initialTipo }: SalasFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [ramo, setRamo] = useState(initialRamo)
  const [modalidad, setModalidad] = useState(initialModalidad)
  const [tipo, setTipo] = useState(initialTipo)

  const apply = (updates: { ramo?: string; modalidad?: string; tipo?: string }) => {
    const params = new URLSearchParams(searchParams.toString())
    const newRamo     = updates.ramo     !== undefined ? updates.ramo     : ramo
    const newModalidad = updates.modalidad !== undefined ? updates.modalidad : modalidad
    const newTipo     = updates.tipo     !== undefined ? updates.tipo     : tipo
    if (newRamo)      params.set('ramo', newRamo);      else params.delete('ramo')
    if (newModalidad) params.set('modalidad', newModalidad); else params.delete('modalidad')
    if (newTipo)      params.set('tipo', newTipo);      else params.delete('tipo')
    startTransition(() => router.push(`/salas?${params.toString()}`))
  }

  const clearAll = () => {
    setRamo(''); setModalidad(''); setTipo('')
    startTransition(() => router.push('/salas'))
  }

  const hasFilters = ramo || modalidad || tipo

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Ramo */}
        <form onSubmit={e => { e.preventDefault(); apply({ ramo }) }} className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Ramo</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ramo}
              onChange={e => setRamo(e.target.value)}
              placeholder="Cálculo, Estadística..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-sm transition-colors">
              🔍
            </button>
          </div>
        </form>

        {/* Modalidad */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Modalidad</label>
          <select
            value={modalidad}
            onChange={e => { setModalidad(e.target.value); apply({ modalidad: e.target.value }) }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">Todas</option>
            <option value="presencial">Presencial</option>
            <option value="online">Online</option>
            <option value="ambas">Presencial y Online</option>
          </select>
        </div>

        {/* Tipo */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Tipo de sala</label>
          <select
            value={tipo}
            onChange={e => { setTipo(e.target.value); apply({ tipo: e.target.value }) }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value="">Todos</option>
            <option value="alumno_crea">Alumnos buscan tutor</option>
            <option value="tutor_crea">Tutor ofrece clase</option>
          </select>
        </div>

        {hasFilters && (
          <button onClick={clearAll} className="text-sm text-gray-500 hover:text-gray-800 underline whitespace-nowrap pb-2">
            Limpiar
          </button>
        )}
      </div>
      {isPending && <p className="text-xs text-violet-500 mt-2">Buscando...</p>}
    </div>
  )
}
