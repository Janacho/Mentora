-- CreateTable
CREATE TABLE "Sala" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tipo" TEXT NOT NULL,
    "ramo" TEXT NOT NULL,
    "modalidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    "privacidad" TEXT NOT NULL DEFAULT 'publica',
    "cuposMax" INTEGER NOT NULL DEFAULT 7,
    "precioBase" INTEGER,
    "ubicacion" TEXT,
    "fechaClase" DATETIME,
    "horaInicio" TEXT,
    "fechaLimite" DATETIME,
    "descripcion" TEXT,
    "creadorId" TEXT NOT NULL,
    "tutorAsignadoId" TEXT,
    "tutorSolicitadoId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sala_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sala_tutorAsignadoId_fkey" FOREIGN KEY ("tutorAsignadoId") REFERENCES "TutorProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sala_tutorSolicitadoId_fkey" FOREIGN KEY ("tutorSolicitadoId") REFERENCES "TutorProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaParticipante" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salaId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalaParticipante_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalaParticipante_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalaPostulacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "salaId" TEXT NOT NULL,
    "tutorProfileId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "mensaje" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SalaPostulacion_salaId_fkey" FOREIGN KEY ("salaId") REFERENCES "Sala" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalaPostulacion_tutorProfileId_fkey" FOREIGN KEY ("tutorProfileId") REFERENCES "TutorProfile" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
