import { db } from '@/lib/db'
import { getMaterialDisp } from '@/lib/utils'
import TutorCard from '@/components/TutorCard'
import SearchFiltersClient from './SearchFiltersClient'

interface SearchParams {
  universidad?: string
  carrera?: string
  ramo?: string
  modalidad?: string
  precioMax?: string
  notaMin?: string
  tieneMaterial?: string
  fueAyudante?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function TutoresPage({ searchParams }: PageProps) {
  const params = await searchParams

  const {
    universidad,
    carrera,
    ramo,
    modalidad,
    precioMax,
    notaMin,
    tieneMaterial,
    fueAyudante,
  } = params

  // Build Prisma where clause
  const ramoFilter = ramo
    ? { some: { nombreRamo: { contains: ramo } } }
    : undefined

  const notaMinVal = notaMin ? parseFloat(notaMin) : undefined
  const ramoNotaFilter =
    notaMinVal !== undefined
      ? { some: { nota: { gte: notaMinVal } } }
      : undefined

  const ayudanteFilter =
    fueAyudante === 'true' ? { some: { fueAyudante: true } } : undefined

  // Merge ramo sub-filters (use combined if needed)
  const ramosWhere = (() => {
    if (ramo && notaMinVal !== undefined && fueAyudante === 'true') {
      return {
        some: {
          nombreRamo: { contains: ramo, mode: 'default' as const },
          nota: { gte: notaMinVal },
          fueAyudante: true,
        },
      }
    }
    if (ramo && notaMinVal !== undefined) {
      return {
        some: {
          nombreRamo: { contains: ramo, mode: 'default' as const },
          nota: { gte: notaMinVal },
        },
      }
    }
    if (ramo && fueAyudante === 'true') {
      return {
        some: {
          nombreRamo: { contains: ramo, mode: 'default' as const },
          fueAyudante: true,
        },
      }
    }
    if (notaMinVal !== undefined && fueAyudante === 'true') {
      return { some: { nota: { gte: notaMinVal }, fueAyudante: true } }
    }
    if (ramo) return ramoFilter
    if (notaMinVal !== undefined) return ramoNotaFilter
    if (fueAyudante === 'true') return ayudanteFilter
    return undefined
  })()

  const tutores = await db.tutorProfile.findMany({
    where: {
      estado: 'aprobado',
      ...(universidad ? { universidad } : {}),
      ...(carrera ? { carrera: { contains: carrera } } : {}),
      ...(modalidad && modalidad !== 'todas' ? { modalidad } : {}),
      ...(precioMax ? { precioPorHora: { lte: parseInt(precioMax) } } : {}),
      ...(ramosWhere ? { ramos: ramosWhere } : {}),
    },
    include: {
      ramos: true,
      user: true,
    },
    orderBy: [{ calificacion: 'desc' }, { totalResenas: 'desc' }],
  })

  // Filter by tieneMaterial in JS (stored as JSON string in DB)
  const filteredTutores = tieneMaterial === 'true'
    ? tutores.filter(t => t.ramos.some(r => {
        const mat = getMaterialDisp(r.materialDisp)
        return mat.length > 0
      }))
    : tutores

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Buscar Tutores</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Encuentra al tutor ideal para aprobar tus ramos
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filters */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <SearchFiltersClient
              initialParams={params}
              universidades={[]}
            />
          </aside>

          {/* Results */}
          <main className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-4 font-medium">
              {filteredTutores.length === 0
                ? 'No se encontraron tutores con esos filtros'
                : `${filteredTutores.length} tutor${filteredTutores.length !== 1 ? 'es' : ''} encontrado${filteredTutores.length !== 1 ? 's' : ''}`}
            </p>

            {filteredTutores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </div>
                <h3 className="text-gray-700 font-semibold text-lg mb-1">Sin resultados</h3>
                <p className="text-gray-400 text-sm">Prueba ajustando los filtros de búsqueda</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredTutores.map(tutor => {
                  // Pick the best matching ramo to display
                  const displayRamo = ramo
                    ? tutor.ramos.find(r =>
                        r.nombreRamo.toLowerCase().includes(ramo.toLowerCase())
                      ) ?? tutor.ramos[0]
                    : tutor.ramos[0]

                  if (!displayRamo) return null

                  const firstName = (tutor.nombreCompleto || tutor.user?.name || 'Tutor').split(' ')[0]
                  const materialDispArr = getMaterialDisp(displayRamo.materialDisp)

                  return (
                    <TutorCard
                      key={tutor.id}
                      id={tutor.id}
                      firstName={firstName}
                      universidad={tutor.universidad}
                      carrera={tutor.carrera}
                      ramoNombre={displayRamo.nombreRamo}
                      nota={displayRamo.nota}
                      modalidad={tutor.modalidad}
                      precioPorHora={tutor.precioPorHora}
                      calificacion={tutor.calificacion ?? 0}
                      totalResenas={tutor.totalResenas ?? 0}
                      fueAyudante={displayRamo.fueAyudante}
                      materialDisp={materialDispArr}
                      estado={tutor.estado}
                    />
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
