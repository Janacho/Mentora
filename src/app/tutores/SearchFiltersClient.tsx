'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TIPOS_INSTITUCION,
  INSTITUCIONES_POR_TIPO,
  CARRERAS_POR_AREA,
  type TipoInstitucion,
} from '@/lib/utils'

interface SearchFiltersClientProps {
  initialParams: {
    universidad?: string
    carrera?: string
    ramo?: string
    modalidad?: string
    precioMax?: string
    notaMin?: string
    tieneMaterial?: string
    fueAyudante?: string
  }
  universidades: string[]
}

// Strip "(ABBR)" suffix so the value matches what's stored in the DB
function baseNombre(nombre: string) {
  return nombre.replace(/\s*\([^)]+\)$/, '').trim()
}

export default function SearchFiltersClient({ initialParams }: SearchFiltersClientProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const [tipoInstitucion, setTipoInstitucion] = useState<TipoInstitucion | ''>('')
  const [universidad,     setUniversidad]     = useState(initialParams.universidad ?? '')
  const [carrera,         setCarrera]         = useState(initialParams.carrera ?? '')
  const [ramo,            setRamo]            = useState(initialParams.ramo ?? '')
  const [modalidad,       setModalidad]       = useState(initialParams.modalidad ?? 'todas')
  const [precioMax,       setPrecioMax]       = useState(initialParams.precioMax ?? '50000')
  const [notaMin,         setNotaMin]         = useState(initialParams.notaMin ?? '5.0')
  const [tieneMaterial,   setTieneMaterial]   = useState(initialParams.tieneMaterial === 'true')
  const [fueAyudante,     setFueAyudante]     = useState(initialParams.fueAyudante === 'true')

  const institucionesFiltradas = tipoInstitucion
    ? INSTITUCIONES_POR_TIPO[tipoInstitucion]
    : Object.values(INSTITUCIONES_POR_TIPO).flat().sort((a, b) => a.localeCompare(b, 'es'))

  function handleTipo(tipo: TipoInstitucion | '') {
    setTipoInstitucion(tipo)
    setUniversidad('')
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (universidad) params.set('universidad', universidad)
    if (carrera)     params.set('carrera', carrera)
    if (ramo)        params.set('ramo', ramo)
    if (modalidad && modalidad !== 'todas') params.set('modalidad', modalidad)
    if (precioMax && precioMax !== '50000') params.set('precioMax', precioMax)
    if (notaMin && notaMin !== '5.0')      params.set('notaMin', notaMin)
    if (tieneMaterial) params.set('tieneMaterial', 'true')
    if (fueAyudante)   params.set('fueAyudante', 'true')
    router.push(`/tutores?${params.toString()}`)
    setOpen(false)
  }

  const clearFilters = () => {
    setTipoInstitucion('')
    setUniversidad('')
    setCarrera('')
    setRamo('')
    setModalidad('todas')
    setPrecioMax('50000')
    setNotaMin('5.0')
    setTieneMaterial(false)
    setFueAyudante(false)
    router.push('/tutores')
    setOpen(false)
  }

  const hasActiveFilters =
    tipoInstitucion || universidad || carrera || ramo ||
    modalidad !== 'todas' || precioMax !== '50000' ||
    notaMin !== '5.0' || tieneMaterial || fueAyudante

  const filtersBody = (
    <div className="space-y-5">

      {/* Tipo de institución */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de institución
        </label>
        <div className="flex flex-col gap-1.5">
          {(['', ...TIPOS_INSTITUCION] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => handleTipo(t as TipoInstitucion | '')}
              className={`text-left text-sm px-3 py-2 rounded-lg border transition-colors ${
                tipoInstitucion === t
                  ? 'bg-violet-600 text-white border-violet-600 font-medium'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
              }`}
            >
              {t === '' ? 'Todos los tipos' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Institución */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Institución
        </label>
        <select
          value={universidad}
          onChange={e => setUniversidad(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">Todas</option>
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Carrera</label>
        <select
          value={carrera}
          onChange={e => setCarrera(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="">Todas las carreras</option>
          {CARRERAS_POR_AREA.map(area => (
            <optgroup key={area.area} label={`— ${area.area}`}>
              {area.carreras.map(c => (
                <option key={c.nombre} value={c.nombre}>{c.nombre}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Ramo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del ramo</label>
        <input
          type="text"
          value={ramo}
          onChange={e => setRamo(e.target.value)}
          placeholder="Ej: Cálculo II"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
        />
      </div>

      {/* Modalidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
        <select
          value={modalidad}
          onChange={e => setModalidad(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
        >
          <option value="todas">Todas</option>
          <option value="ambas">Presencial y Online</option>
        </select>
      </div>

      {/* Precio máximo */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Precio máximo</label>
          <span className="text-sm font-semibold text-violet-700">
            ${parseInt(precioMax).toLocaleString('es-CL')}/hr
          </span>
        </div>
        <input
          type="range" min={5000} max={50000} step={1000}
          value={precioMax}
          onChange={e => setPrecioMax(e.target.value)}
          className="w-full accent-violet-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>$5.000</span><span>$50.000</span>
        </div>
      </div>

      {/* Nota mínima */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">Nota mínima del tutor</label>
          <span className="text-sm font-semibold text-violet-700">{parseFloat(notaMin).toFixed(1)}</span>
        </div>
        <input
          type="range" min={5.0} max={7.0} step={0.1}
          value={notaMin}
          onChange={e => setNotaMin(e.target.value)}
          className="w-full accent-violet-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
          <span>5.0</span><span>7.0</span>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={tieneMaterial}
            onChange={e => setTieneMaterial(e.target.checked)}
            className="w-4 h-4 accent-violet-600 rounded"
          />
          <span className="text-sm text-gray-700">Tiene material disponible</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" checked={fueAyudante}
            onChange={e => setFueAyudante(e.target.checked)}
            className="w-4 h-4 accent-violet-600 rounded"
          />
          <span className="text-sm text-gray-700">Fue ayudante</span>
        </label>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={applyFilters}
          className="w-full py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors"
        >
          Aplicar filtros
        </button>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="w-full py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filtros
          {hasActiveFilters && <span className="ml-auto w-2 h-2 rounded-full bg-violet-600" />}
          <svg className={`w-4 h-4 ml-auto text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            {filtersBody}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-800">Filtros</h2>
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-violet-600" />}
        </div>
        {filtersBody}
      </div>
    </>
  )
}
