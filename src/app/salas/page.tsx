import { db } from '@/lib/db'
import SalaCard from './SalaCard'
import SalasFilters from './SalasFilters'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{ ramo?: string; modalidad?: string; tipo?: string }>
}

export default async function SalasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ramoFilter     = params.ramo ?? ''
  const modalidadFilter = params.modalidad ?? ''
  const tipoFilter     = params.tipo ?? ''

  const salas = await db.sala.findMany({
    where: {
      estado: { in: ['abierta', 'completa'] },
      privacidad: 'publica',
      ...(ramoFilter     ? { ramo: { contains: ramoFilter } }         : {}),
      ...(modalidadFilter ? { modalidad: modalidadFilter }             : {}),
      ...(tipoFilter      ? { tipo: tipoFilter }                       : {}),
    },
    include: {
      participantes: true,
      tutorAsignado: { include: { user: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🏫 Salas de Clase Grupal
            </h1>
            <p className="text-gray-500 mt-1 text-sm max-w-xl">
              Únete a una clase grupal con otros alumnos o crea tu propia sala y encuentra un tutor
            </p>
          </div>
          <Link
            href="/salas/crear"
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Crear sala
          </Link>
        </div>

        {/* Pricing info */}
        <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-violet-800 mb-3">💡 Precio por persona según cuántos participen</p>
          <div className="flex flex-wrap gap-2">
            {([
              [2, 10000], [3, 7500], [4, 6500], [5, 5800], [6, 5200], [7, 4800],
            ] as [number, number][]).map(([n, p]) => (
              <div key={n} className="bg-white border border-violet-100 rounded-lg px-3 py-1.5 text-center">
                <div className="text-xs text-gray-500">{n} personas</div>
                <div className="text-sm font-bold text-violet-700">
                  ${p.toLocaleString('es-CL')}/hr
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <SalasFilters
            initialRamo={ramoFilter}
            initialModalidad={modalidadFilter}
            initialTipo={tipoFilter}
          />
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4 font-medium">
          {salas.length === 0
            ? 'No se encontraron salas disponibles'
            : `${salas.length} sala${salas.length !== 1 ? 's' : ''} disponible${salas.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid */}
        {salas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center shadow-sm">
            <p className="text-4xl mb-3">🏫</p>
            <h3 className="text-gray-700 font-semibold text-lg mb-1">No hay salas abiertas</h3>
            <p className="text-gray-400 text-sm mb-5">Sé el primero en crear una sala grupal</p>
            <Link
              href="/salas/crear"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 transition-colors"
            >
              Crear sala
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {salas.map(sala => {
              const confirmados = sala.participantes.filter(p => p.estado === 'confirmado').length
              const tutorNombre = sala.tutorAsignado?.user?.name?.split(' ')[0] ?? null
              return (
                <SalaCard
                  key={sala.id}
                  id={sala.id}
                  tipo={sala.tipo}
                  ramo={sala.ramo}
                  modalidad={sala.modalidad}
                  estado={sala.estado}
                  privacidad={sala.privacidad}
                  cuposMax={sala.cuposMax}
                  confirmados={confirmados}
                  precioBase={sala.precioBase}
                  fechaClase={sala.fechaClase}
                  horaInicio={sala.horaInicio}
                  tutorNombre={tutorNombre}
                  descripcion={sala.descripcion}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
