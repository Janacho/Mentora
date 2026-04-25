'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  TIPOS_INSTITUCION,
  INSTITUCIONES_POR_TIPO,
  type TipoInstitucion,
} from '@/lib/utils'

function baseNombre(nombre: string) {
  return nombre.replace(/\s*\([^)]+\)$/, '').trim()
}

interface MaterialFiltersProps {
  universidades: string[]
  initialRamo: string
  initialUniversidad: string
  initialTipo: string
}

export default function MaterialFilters({
  universidades,
  initialRamo,
  initialUniversidad,
  initialTipo,
}: MaterialFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [ramo, setRamo] = useState(initialRamo)
  const [tipoInstitucion, setTipoInstitucion] = useState<TipoInstitucion | ''>('')
  const [universidad, setUniversidad] = useState(initialUniversidad)
  const [tipo, setTipo] = useState(initialTipo)

  const institucionesFiltradas = tipoInstitucion
    ? INSTITUCIONES_POR_TIPO[tipoInstitucion]
    : Object.values(INSTITUCIONES_POR_TIPO).flat()

  const applyFilters = (updates: { ramo?: string; universidad?: string; tipo?: string }) => {
    const params = new URLSearchParams(searchParams.toString())

    const newRamo = updates.ramo ?? ramo
    const newUniversidad = updates.universidad ?? universidad
    const newTipo = updates.tipo ?? tipo

    if (newRamo) params.set('ramo', newRamo); else params.delete('ramo')
    if (newUniversidad) params.set('universidad', newUniversidad); else params.delete('universidad')
    if (newTipo && newTipo !== 'all') params.set('tipo', newTipo); else params.delete('tipo')

    startTransition(() => {
      router.push(`/material?${params.toString()}`)
    })
  }

  const handleRamoChange = (value: string) => {
    setRamo(value)
  }

  const handleRamoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters({ ramo })
  }

  const handleUniversidadChange = (value: string) => {
    setUniversidad(value)
    applyFilters({ universidad: value })
  }

  const handleTipoChange = (value: string) => {
    setTipo(value)
    applyFilters({ tipo: value })
  }

  const clearAll = () => {
    setRamo('')
    setTipoInstitucion('')
    setUniversidad('')
    setTipo('')
    startTransition(() => {
      router.push('/material')
    })
  }

  const hasFilters = ramo || tipoInstitucion || universidad || (tipo && tipo !== 'all')

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Ramo filter */}
        <form onSubmit={handleRamoSubmit} className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Ramo
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ramo}
              onChange={(e) => handleRamoChange(e.target.value)}
              placeholder="Buscar por ramo..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              type="submit"
              className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              🔍
            </button>
          </div>
        </form>

        {/* Tipo de institución */}
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Tipo de institución
          </label>
          <select
            value={tipoInstitucion}
            onChange={e => {
              setTipoInstitucion(e.target.value as TipoInstitucion | '')
              setUniversidad('')
              applyFilters({ universidad: '' })
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          >
            <option value="">Todos los tipos</option>
            {TIPOS_INSTITUCION.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Institución */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Institución
          </label>
          <select
            value={universidad}
            onChange={e => handleUniversidadChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          >
            <option value="">Todas</option>
            {tipoInstitucion
              ? institucionesFiltradas.map(i => (
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

        {/* Tipo filter */}
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => handleTipoChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
          >
            <option value="all">Todos los tipos</option>
            <option value="apuntes">Apuntes</option>
            <option value="resumen">Resumen</option>
            <option value="prueba_antigua">Prueba Antigua</option>
          </select>
        </div>

        {/* Clear button */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-gray-500 hover:text-gray-800 underline whitespace-nowrap pb-2"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {isPending && (
        <p className="text-xs text-violet-500 mt-2">Aplicando filtros...</p>
      )}
    </div>
  )
}
