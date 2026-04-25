import { db } from '@/lib/db'
import { formatPrice, UNIVERSIDADES } from '@/lib/utils'
import MaterialFilters from './MaterialFilters'

interface MaterialPageProps {
  searchParams: Promise<{ ramo?: string; universidad?: string; tipo?: string }>
}

const tipoLabel: Record<string, string> = {
  apuntes: 'Apuntes',
  resumen: 'Resumen',
  prueba_antigua: 'Prueba Antigua',
}

const tipoColors: Record<string, string> = {
  apuntes: 'bg-blue-100 text-blue-700',
  resumen: 'bg-green-100 text-green-700',
  prueba_antigua: 'bg-amber-100 text-amber-700',
}

const tipoIcons: Record<string, string> = {
  apuntes: '📚',
  resumen: '📄',
  prueba_antigua: '📝',
}

export default async function MaterialPage({ searchParams }: MaterialPageProps) {
  const params = await searchParams
  const ramoFilter      = params.ramo ?? ''
  const universidadFilter = params.universidad ?? ''
  const tipoFilter      = params.tipo ?? ''

  const items = await db.materialItem.findMany({
    where: {
      ...(ramoFilter      ? { ramo: { contains: ramoFilter } }           : {}),
      ...(universidadFilter ? { universidad: { contains: universidadFilter } } : {}),
      ...(tipoFilter && tipoFilter !== 'all' ? { tipo: tipoFilter }      : {}),
    },
    include: { tutor: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Marketplace de Material</h1>
          <p className="text-gray-500 mt-1">
            Apuntes, resúmenes y pruebas de universitarios reales
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <MaterialFilters
            initialRamo={ramoFilter}
            initialUniversidad={universidadFilter}
            initialTipo={tipoFilter}
            universidades={UNIVERSIDADES}
          />
        </div>

        {/* Count */}
        <p className="text-sm text-gray-500 mb-4 font-medium">
          {items.length === 0
            ? 'No se encontraron items'
            : `${items.length} item${items.length !== 1 ? 's' : ''} disponible${items.length !== 1 ? 's' : ''}`}
        </p>

        {/* Grid */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-500">No hay material disponible con esos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => {
              const tutorFirstName = (item.tutor.name ?? 'Tutor').split(' ')[0]
              return (
                <div
                  key={item.id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                >
                  {/* Type badge + icon */}
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tipoColors[item.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                      {tipoIcons[item.tipo]} {tipoLabel[item.tipo] ?? item.tipo}
                    </span>
                    <span className="text-gray-300 text-xs">{item.universidad.split(' ').slice(-2).join(' ')}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                    {item.nombre}
                  </h3>

                  {/* Ramo */}
                  <p className="text-xs text-gray-500">
                    📖 <span className="font-medium">{item.ramo}</span>
                  </p>

                  {/* Tutor */}
                  <p className="text-xs text-gray-400">por {tutorFirstName}</p>

                  {/* Price + CTA */}
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <span className="font-bold text-violet-700 text-base">
                      {formatPrice(item.precio)}
                    </span>
                    <button className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      Comprar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 text-center mt-8">
          La plataforma retiene un 20% de cada venta para mantener la calidad del servicio.
        </p>
      </div>
    </div>
  )
}
