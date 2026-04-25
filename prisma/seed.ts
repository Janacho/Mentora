// This seed file is kept for reference.
// Use the /api/seed endpoint instead (run: npm run dev, then visit http://localhost:3000/api/seed)
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'

const adapter = new PrismaBetterSqlite3({ url: 'file:./prisma/dev.db' })
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin user ──
  const adminHash = await bcrypt.hash('admin123', 10)
  await db.adminUser.upsert({
    where: { email: 'admin@mentora.cl' },
    update: {},
    create: { email: 'admin@mentora.cl', password: adminHash },
  })
  console.log('✅ Admin created: admin@mentora.cl / admin123')

  // ── Demo alumni ──
  const alumnoHash = await bcrypt.hash('alumno123', 10)
  const alumno = await db.user.upsert({
    where: { email: 'maria.gonzalez@uc.cl' },
    update: {},
    create: {
      name: 'María González',
      email: 'maria.gonzalez@uc.cl',
      password: alumnoHash,
      role: 'alumno',
      universidad: 'Pontificia Universidad Católica de Chile',
      carrera: 'Ingeniería Comercial',
      anioActual: 2,
      paymentConfigured: true,
    },
  })
  console.log('✅ Alumno created:', alumno.email)

  // ── Demo Tutores ──
  const tutorHash = await bcrypt.hash('tutor123', 10)

  const tutoresData = [
    {
      email: 'sebastian.morales@uc.cl',
      name: 'Sebastián Morales',
      universidad: 'Pontificia Universidad Católica de Chile',
      carrera: 'Ingeniería Civil',
      anioIngreso: 2021,
      precioPorHora: 12000,
      modalidad: 'ambas',
      estado: 'aprobado',
      calificacion: 4.8,
      totalResenas: 23,
      ramos: [
        { nombreRamo: 'Cálculo I', nota: 6.8, profesor: 'Prof. González', anio: 2021, semestre: 1, fueAyudante: true, materialDisp: ['pruebas', 'apuntes', 'resumenes'] },
        { nombreRamo: 'Cálculo II', nota: 6.5, profesor: 'Prof. González', anio: 2021, semestre: 2, fueAyudante: false, materialDisp: ['apuntes'] },
        { nombreRamo: 'Álgebra Lineal', nota: 7.0, profesor: 'Prof. Martínez', anio: 2021, semestre: 1, fueAyudante: true, materialDisp: ['pruebas', 'resumenes'] },
      ],
    },
    {
      email: 'camila.torres@usach.cl',
      name: 'Camila Torres',
      universidad: 'Universidad de Santiago de Chile',
      carrera: 'Ingeniería Civil Informática',
      anioIngreso: 2020,
      precioPorHora: 9000,
      modalidad: 'online',
      estado: 'aprobado',
      calificacion: 4.6,
      totalResenas: 15,
      ramos: [
        { nombreRamo: 'Estructuras de Datos', nota: 6.9, profesor: 'Prof. Ramírez', anio: 2021, semestre: 1, fueAyudante: false, materialDisp: ['apuntes', 'resumenes'] },
        { nombreRamo: 'Bases de Datos', nota: 6.7, profesor: 'Prof. Vega', anio: 2021, semestre: 2, fueAyudante: true, materialDisp: ['pruebas'] },
        { nombreRamo: 'Algoritmos', nota: 6.4, profesor: 'Prof. Ramírez', anio: 2022, semestre: 1, fueAyudante: false, materialDisp: [] },
      ],
    },
    {
      email: 'matias.silva@uchile.cl',
      name: 'Matías Silva',
      universidad: 'Universidad de Chile',
      carrera: 'Ingeniería Comercial',
      anioIngreso: 2019,
      precioPorHora: 15000,
      modalidad: 'presencial',
      estado: 'aprobado',
      calificacion: 4.9,
      totalResenas: 41,
      ramos: [
        { nombreRamo: 'Estadística', nota: 7.0, profesor: 'Prof. Fuentes', anio: 2020, semestre: 1, fueAyudante: true, materialDisp: ['pruebas', 'apuntes', 'resumenes'] },
        { nombreRamo: 'Economía', nota: 6.8, profesor: 'Prof. Lagos', anio: 2020, semestre: 2, fueAyudante: false, materialDisp: ['resumenes'] },
        { nombreRamo: 'Finanzas', nota: 6.5, profesor: 'Prof. Herrera', anio: 2021, semestre: 1, fueAyudante: false, materialDisp: ['apuntes'] },
      ],
    },
    {
      email: 'valentina.rojas@uai.cl',
      name: 'Valentina Rojas',
      universidad: 'Universidad Adolfo Ibáñez',
      carrera: 'Ingeniería Comercial',
      anioIngreso: 2020,
      precioPorHora: 11000,
      modalidad: 'ambas',
      estado: 'aprobado',
      calificacion: 4.7,
      totalResenas: 19,
      ramos: [
        { nombreRamo: 'Cálculo I', nota: 6.6, profesor: 'Prof. Araya', anio: 2020, semestre: 1, fueAyudante: false, materialDisp: ['apuntes'] },
        { nombreRamo: 'Probabilidades', nota: 6.8, profesor: 'Prof. Muñoz', anio: 2021, semestre: 2, fueAyudante: true, materialDisp: ['pruebas', 'resumenes'] },
      ],
    },
    {
      email: 'ignacio.perez@usm.cl',
      name: 'Ignacio Pérez',
      universidad: 'Universidad Técnica Federico Santa María',
      carrera: 'Ingeniería Civil Electrónica',
      anioIngreso: 2020,
      precioPorHora: 10000,
      modalidad: 'online',
      estado: 'aprobado',
      calificacion: 4.5,
      totalResenas: 8,
      ramos: [
        { nombreRamo: 'Física I', nota: 6.7, profesor: 'Prof. Bravo', anio: 2020, semestre: 1, fueAyudante: false, materialDisp: ['pruebas'] },
        { nombreRamo: 'Física II', nota: 6.3, profesor: 'Prof. Bravo', anio: 2020, semestre: 2, fueAyudante: false, materialDisp: [] },
        { nombreRamo: 'Electromagnetismo', nota: 5.8, profesor: 'Prof. Castro', anio: 2021, semestre: 1, fueAyudante: false, materialDisp: ['apuntes'] },
      ],
    },
    {
      email: 'paula.mendez@udd.cl',
      name: 'Paula Méndez',
      universidad: 'Universidad del Desarrollo',
      carrera: 'Psicología',
      anioIngreso: 2021,
      precioPorHora: 8000,
      modalidad: 'presencial',
      estado: 'pendiente',
      calificacion: 0,
      totalResenas: 0,
      ramos: [
        { nombreRamo: 'Estadística', nota: 6.1, profesor: 'Prof. Vargas', anio: 2021, semestre: 2, fueAyudante: false, materialDisp: ['resumenes'] },
      ],
    },
  ]

  for (const t of tutoresData) {
    const tutorUser = await db.user.upsert({
      where: { email: t.email },
      update: {},
      create: {
        name: t.name,
        email: t.email,
        password: tutorHash,
        role: 'tutor',
        universidad: t.universidad,
        carrera: t.carrera,
      },
    })

    const existingProfile = await db.tutorProfile.findUnique({ where: { userId: tutorUser.id } })
    if (!existingProfile) {
      const profile = await db.tutorProfile.create({
        data: {
          userId: tutorUser.id,
          nombreCompleto: t.name,
          universidad: t.universidad,
          carrera: t.carrera,
          anioIngreso: t.anioIngreso,
          precioPorHora: t.precioPorHora,
          modalidad: t.modalidad,
          estado: t.estado,
          calificacion: t.calificacion,
          totalResenas: t.totalResenas,
        },
      })

      for (const r of t.ramos) {
        await db.tutorRamo.create({
          data: {
            tutorId: profile.id,
            nombreRamo: r.nombreRamo,
            nota: r.nota,
            profesor: r.profesor,
            anio: r.anio,
            semestre: r.semestre,
            fueAyudante: r.fueAyudante,
            materialDisp: JSON.stringify(r.materialDisp),
          },
        })
      }
      console.log(`✅ Tutor created: ${t.name} (${t.estado})`)
    }
  }

  // ── Reviews for approved tutors ──
  const sebastian = await db.tutorProfile.findFirst({
    where: { user: { email: 'sebastian.morales@uc.cl' } },
  })
  const matias = await db.tutorProfile.findFirst({
    where: { user: { email: 'matias.silva@uchile.cl' } },
  })

  if (sebastian) {
    const existing = await db.review.findFirst({ where: { tutorId: sebastian.id } })
    if (!existing) {
      await db.review.createMany({
        data: [
          { alumnoId: alumno.id, tutorId: sebastian.id, ramo: 'Cálculo I', profesor: 'Prof. González', calificacion: 5, texto: 'Excelente tutor, explica súper bien y tiene muchas pruebas antiguas. Pasé el ramo gracias a él.' },
          { alumnoId: alumno.id, tutorId: sebastian.id, ramo: 'Álgebra Lineal', profesor: 'Prof. Martínez', calificacion: 5, texto: 'Me ayudó a entender los vectores propios de una forma muy intuitiva. 100% recomendado.' },
        ],
      })
    }
  }

  if (matias) {
    const existing = await db.review.findFirst({ where: { tutorId: matias.id } })
    if (!existing) {
      await db.review.createMany({
        data: [
          { alumnoId: alumno.id, tutorId: matias.id, ramo: 'Estadística', profesor: 'Prof. Fuentes', calificacion: 5, texto: 'Matías es increíble. Pasé de un 3.5 a un 6.0 en el final. Tiene pruebas de todos los años.' },
          { alumnoId: alumno.id, tutorId: matias.id, ramo: 'Economía', profesor: 'Prof. Lagos', calificacion: 4, texto: 'Muy buen manejo del ramo, me explicó los modelos macro con ejemplos reales. Recomendado.' },
        ],
      })
    }
  }

  // ── Demo material ──
  const existingMaterial = await db.materialItem.findFirst()
  if (!existingMaterial) {
    const sebUser = await db.user.findUnique({ where: { email: 'sebastian.morales@uc.cl' } })
    const matUser = await db.user.findUnique({ where: { email: 'matias.silva@uchile.cl' } })
    const camilaUser = await db.user.findUnique({ where: { email: 'camila.torres@usach.cl' } })

    if (sebUser) {
      await db.materialItem.createMany({
        data: [
          { tutorUserId: sebUser.id, nombre: 'Guía Completa Cálculo I', ramo: 'Cálculo I', universidad: 'Pontificia Universidad Católica de Chile', tipo: 'apuntes', precio: 2500 },
          { tutorUserId: sebUser.id, nombre: 'Pack Pruebas Cálculo I 2019-2023', ramo: 'Cálculo I', universidad: 'Pontificia Universidad Católica de Chile', tipo: 'prueba_antigua', precio: 3000 },
          { tutorUserId: sebUser.id, nombre: 'Resumen Álgebra Lineal — Todo el semestre', ramo: 'Álgebra Lineal', universidad: 'Pontificia Universidad Católica de Chile', tipo: 'resumen', precio: 2000 },
        ],
      })
    }
    if (matUser) {
      await db.materialItem.createMany({
        data: [
          { tutorUserId: matUser.id, nombre: 'Guía Estadística con ejercicios resueltos', ramo: 'Estadística', universidad: 'Universidad de Chile', tipo: 'apuntes', precio: 2000 },
          { tutorUserId: matUser.id, nombre: 'Pruebas Finanzas FCEN 2020-2022', ramo: 'Finanzas', universidad: 'Universidad de Chile', tipo: 'prueba_antigua', precio: 2500 },
        ],
      })
    }
    if (camilaUser) {
      await db.materialItem.createMany({
        data: [
          { tutorUserId: camilaUser.id, nombre: 'Apuntes Estructuras de Datos + Código', ramo: 'Estructuras de Datos', universidad: 'Universidad de Santiago de Chile', tipo: 'apuntes', precio: 1500 },
          { tutorUserId: camilaUser.id, nombre: 'Resumen SQL — Bases de Datos', ramo: 'Bases de Datos', universidad: 'Universidad de Santiago de Chile', tipo: 'resumen', precio: 1000 },
        ],
      })
    }
    console.log('✅ Material items created')
  }

  console.log('\n🎉 Seed complete!')
  console.log('───────────────────────────────')
  console.log('Admin:    admin@mentora.cl      / admin123')
  console.log('Alumno:   maria.gonzalez@uc.cl  / alumno123')
  console.log('Tutor 1:  sebastian.morales@uc.cl / tutor123')
  console.log('Tutor 2:  camila.torres@usach.cl  / tutor123')
  console.log('Tutor 3:  matias.silva@uchile.cl  / tutor123')
  console.log('───────────────────────────────')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
