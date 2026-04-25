import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getNotaColor(nota: number): string {
  if (nota >= 6.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  if (nota >= 6.0) return 'bg-blue-100 text-blue-800 border-blue-300'
  return 'bg-green-100 text-green-800 border-green-300'
}

export function getNotaLabel(nota: number): string {
  if (nota >= 6.5) return 'Sobresaliente'
  if (nota >= 6.0) return 'Notable'
  return 'Bueno'
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(price)
}

export function getMaterialDisp(materialDispJson: string): string[] {
  try {
    return JSON.parse(materialDispJson)
  } catch {
    return []
  }
}

// ─── Instituciones ────────────────────────────────────────────────────────────

export const TIPOS_INSTITUCION = [
  'Universidad',
  'Instituto Profesional',
  'Centro de Formación Técnica',
] as const

export type TipoInstitucion = (typeof TIPOS_INSTITUCION)[number]

export const INSTITUCIONES_POR_TIPO: Record<TipoInstitucion, string[]> = {
  'Universidad': [
    'Pontificia Universidad Católica de Chile (PUC)',
    'Pontificia Universidad Católica de Valparaíso (PUCV)',
    'Universidad Adolfo Ibáñez (UAI)',
    'Universidad Alberto Hurtado (UAH)',
    'Universidad Andrés Bello (UNAB)',
    'Universidad Autónoma de Chile',
    'Universidad Austral de Chile (UACh)',
    'Universidad Católica de la Santísima Concepción (UCSC)',
    'Universidad Católica de Temuco (UCT)',
    'Universidad Católica del Maule (UCM)',
    'Universidad Católica del Norte (UCN)',
    'Universidad de Antofagasta (UA)',
    'Universidad de Chile',
    'Universidad de Concepción (UdeC)',
    'Universidad de La Frontera (UFRO)',
    'Universidad de La Serena (ULS)',
    'Universidad de los Andes (UANDES)',
    'Universidad de Playa Ancha (UPLA)',
    'Universidad de Santiago de Chile (USACH)',
    'Universidad de Talca (UTalca)',
    'Universidad de Tarapacá (UTA)',
    'Universidad de Valparaíso (UV)',
    'Universidad del Bío-Bío (UBB)',
    'Universidad del Desarrollo (UDD)',
    'Universidad Diego Portales (UDP)',
    'Universidad Mayor',
    'Universidad Metropolitana de Ciencias de la Educación (UMCE)',
    'Universidad San Sebastián (USS)',
    'Universidad Santo Tomás (UST)',
    'Universidad Técnica Federico Santa María (UTFSM)',
  ],
  'Instituto Profesional': [
    'AIEP',
    'Duoc UC',
    'IACC',
    'INACAP',
    'IP Chile',
    'IPP (Instituto Profesional Providencia)',
    'La Araucana',
    'Los Leones',
    'Santo Tomás (IP)',
    'Virginio Gómez',
  ],
  'Centro de Formación Técnica': [
    'CEDUC-UCN',
    'CFT Duoc UC',
    'CFT Estatales',
    'CFT INACAP',
    'CFT Los Lagos',
    'CFT Manpower',
    'CFT PUCV',
    'CFT Santo Tomás',
  ],
}

// ─── Carreras ─────────────────────────────────────────────────────────────────
// Agrega o quita nombres aquí para marcar qué carreras tienen tutores disponibles

const CARRERAS_CON_TUTORES = new Set([
  'Ingeniería Civil Industrial',
  'Ingeniería Civil Informática',
  'Ingeniería Comercial',
  'Ingeniería Civil Eléctrica',
  'Psicología',
  'Medicina',
  'Derecho',
  'Administración de Empresas',
  'Contador Auditor',
  'Arquitectura',
])

export interface CarreraItem {
  nombre: string
  profesorDisponible: boolean
}

export interface AreaCarreras {
  area: string
  carreras: CarreraItem[]
}

export const CARRERAS_POR_AREA: AreaCarreras[] = [
  {
    area: 'Diseño y Arte',
    carreras: [
      'Arquitectura',
      'Diseño Gráfico',
      'Gastronomía',
      'Publicidad',
    ].map(n => ({ nombre: n, profesorDisponible: CARRERAS_CON_TUTORES.has(n) })),
  },
  {
    area: 'Ingeniería y Tecnología',
    carreras: [
      'Analista Programador / Desarrollo de Software',
      'Ingeniería Civil Eléctrica',
      'Ingeniería Civil Industrial',
      'Ingeniería Civil Informática',
      'Ingeniería Civil Mecánica',
      'Ingeniería Comercial',
      'Ingeniería en Construcción',
      'Ingeniería en Minas',
      'Técnico en Mecánica Automotriz',
    ].map(n => ({ nombre: n, profesorDisponible: CARRERAS_CON_TUTORES.has(n) })),
  },
  {
    area: 'Negocios y Administración',
    carreras: [
      'Administración de Empresas',
      'Contador Auditor',
      'Ingeniería en Administración',
      'Técnico en Administración',
    ].map(n => ({ nombre: n, profesorDisponible: CARRERAS_CON_TUTORES.has(n) })),
  },
  {
    area: 'Otras Carreras',
    carreras: [
      'Agronomía',
      'Medicina Veterinaria',
      'Prevención de Riesgos',
    ].map(n => ({ nombre: n, profesorDisponible: CARRERAS_CON_TUTORES.has(n) })),
  },
  {
    area: 'Salud',
    carreras: [
      'Enfermería',
      'Fonoaudiología',
      'Kinesiología',
      'Medicina',
      'Nutrición y Dietética',
      'Obstetricia',
      'Técnico en Enfermería (TENS)',
      'Tecnología Médica',
      'Terapia Ocupacional',
      'Odontología',
    ].map(n => ({ nombre: n, profesorDisponible: CARRERAS_CON_TUTORES.has(n) })),
  },
  {
    area: 'Ciencias Sociales y Humanidades',
    carreras: [
      'Derecho',
      'Pedagogía en Educación Básica',
      'Pedagogía en Educación Física',
      'Pedagogía en Educación Parvularia',
      'Periodismo',
      'Psicología',
      'Sociología',
      'Trabajo Social',
    ].map(n => ({ nombre: n, profesorDisponible: CARRERAS_CON_TUTORES.has(n) })),
  },
]

// Flat list for backwards compatibility
export const UNIVERSIDADES = INSTITUCIONES_POR_TIPO['Universidad']
export const CARRERAS = CARRERAS_POR_AREA.flatMap(a => a.carreras.map(c => c.nombre))

// ─── Puntos Mentora ──────────────────────────────────────────────────────────

export const PUNTOS_REGLAS = {
  reviewDada:        10,
  salaConfirmada:    25,
  materialComprado:  5,
  salaEnsenada:      100,
  reviewRecibida5:   20,
  reviewRecibida4:   10,
  materialVendido:   15,
} as const

export interface NivelMentora {
  nombre: string
  emoji: string
  minPuntos: number
  color: string
}

export const NIVELES_MENTORA: NivelMentora[] = [
  { nombre: 'Novato',        emoji: '🌱', minPuntos: 0,    color: 'text-gray-500'   },
  { nombre: 'Estudiante',    emoji: '📖', minPuntos: 100,  color: 'text-blue-600'   },
  { nombre: 'Avanzado',      emoji: '✨', minPuntos: 300,  color: 'text-violet-600' },
  { nombre: 'Experto',       emoji: '🏆', minPuntos: 600,  color: 'text-amber-600'  },
  { nombre: 'Mentora Elite', emoji: '👑', minPuntos: 1000, color: 'text-yellow-500' },
]

export function getNivelMentora(puntos: number): NivelMentora {
  return [...NIVELES_MENTORA].reverse().find(n => puntos >= n.minPuntos) ?? NIVELES_MENTORA[0]
}

export function getProgresoNivel(puntos: number): { porcentaje: number; puntosParaSiguiente: number } {
  const nivelActual = getNivelMentora(puntos)
  const idxActual = NIVELES_MENTORA.findIndex(n => n.nombre === nivelActual.nombre)
  const siguiente = NIVELES_MENTORA[idxActual + 1]
  if (!siguiente) return { porcentaje: 100, puntosParaSiguiente: 0 }
  const rango = siguiente.minPuntos - nivelActual.minPuntos
  const progreso = puntos - nivelActual.minPuntos
  return {
    porcentaje: Math.min(100, Math.round((progreso / rango) * 100)),
    puntosParaSiguiente: siguiente.minPuntos - puntos,
  }
}

export const PRECIO_POR_PERSONAS: Record<number, number> = {
  2: 10000,
  3: 7500,
  4: 6500,
  5: 5800,
  6: 5200,
  7: 4800,
}

export function getSalaPrecio(participantes: number): number {
  return PRECIO_POR_PERSONAS[participantes] ?? 10000
}

export const RAMOS_AGRUPADOS: { grupo: string; ramos: string[] }[] = [
  { grupo: '1er año — 1er semestre', ramos: ['Cálculo I', 'Álgebra Lineal', 'Introducción a la Programación', 'Inglés Técnico I', 'Física I'] },
  { grupo: '1er año — 2do semestre', ramos: ['Cálculo II', 'Estadística', 'Programación Orientada a Objetos', 'Inglés Técnico II', 'Física II'] },
  { grupo: '2do año — 1er semestre', ramos: ['Cálculo III', 'Estructuras de Datos', 'Bases de Datos', 'Termodinámica', 'Electromagnetismo'] },
  { grupo: '2do año — 2do semestre', ramos: ['Ecuaciones Diferenciales', 'Algoritmos', 'Sistemas Operativos', 'Economía', 'Probabilidades'] },
  { grupo: '3er año — 1er semestre', ramos: ['Redes de Computadores', 'Ingeniería de Software', 'Inteligencia Artificial', 'Finanzas', 'Investigación Operacional'] },
  { grupo: '3er año — 2do semestre', ramos: ['Arquitectura de Sistemas', 'Machine Learning', 'Contabilidad Avanzada', 'Marketing', 'Gestión de Proyectos'] },
  { grupo: '4to año', ramos: ['Tesis I', 'Tesis II', 'Electivo I', 'Electivo II', 'Práctica Profesional', 'Seminario', 'Gestión Empresarial', 'Ética Profesional'] },
]

export const RAMOS_LIST: string[] = RAMOS_AGRUPADOS.flatMap(g => g.ramos)

export const RAMOS_POR_ANIO: Record<number, Record<number, string[]>> = {
  1: {
    1: ['Cálculo I', 'Álgebra Lineal', 'Introducción a la Programación', 'Inglés Técnico I', 'Física I'],
    2: ['Cálculo II', 'Estadística', 'Programación Orientada a Objetos', 'Inglés Técnico II', 'Física II'],
  },
  2: {
    1: ['Cálculo III', 'Estructuras de Datos', 'Bases de Datos', 'Termodinámica', 'Electromagnetismo'],
    2: ['Ecuaciones Diferenciales', 'Algoritmos', 'Sistemas Operativos', 'Economía', 'Probabilidades'],
  },
  3: {
    1: ['Redes de Computadores', 'Ingeniería de Software', 'Inteligencia Artificial', 'Finanzas', 'Investigación Operacional'],
    2: ['Arquitectura de Sistemas', 'Machine Learning', 'Contabilidad Avanzada', 'Marketing', 'Gestión de Proyectos'],
  },
  4: {
    1: ['Tesis I', 'Electivo I', 'Electivo II', 'Práctica Profesional', 'Seminario'],
    2: ['Tesis II', 'Electivo III', 'Electivo IV', 'Gestión Empresarial', 'Ética Profesional'],
  },
}
