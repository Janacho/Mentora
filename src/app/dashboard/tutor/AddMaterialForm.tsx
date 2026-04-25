'use client'

import { useState, useRef } from 'react'
import { addMaterial } from '@/app/actions/tutor'

interface Props {
  ramos: string[]
}

const TIPOS = [
  { value: 'apuntes',        label: '📚 Apuntes' },
  { value: 'resumen',        label: '📄 Resumen' },
  { value: 'prueba_antigua', label: '📝 Prueba antigua' },
]

export default function AddMaterialForm({ ramos }: Props) {
  const [nombre,     setNombre]     = useState('')
  const [ramo,       setRamo]       = useState(ramos[0] ?? '')
  const [ramoCustom, setRamoCustom] = useState('')
  const [tipo,       setTipo]       = useState('apuntes')
  const [precio,     setPrecio]     = useState('')
  const [file,       setFile]       = useState<File | null>(null)
  const [dragOver,   setDragOver]   = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [progress,   setProgress]   = useState(0)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const ramoFinal = ramo === '__custom__' ? ramoCustom : ramo

  function handleFile(f: File) {
    setFile(f)
    setError('')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!nombre.trim())    return setError('Ingresa un nombre para el material.')
    if (!ramoFinal.trim()) return setError('Selecciona o escribe el nombre del ramo.')
    if (!precio || parseInt(precio) < 100) return setError('El precio mínimo es $100.')

    setUploading(true)
    setProgress(10)

    let archivoUrl = ''

    if (file) {
      const fd = new FormData()
      fd.append('file', file)
      setProgress(30)

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      setProgress(60)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Error al subir el archivo.')
        setUploading(false)
        setProgress(0)
        return
      }
      archivoUrl = data.url
    }

    setProgress(80)

    const formData = new FormData()
    formData.append('nombre',     nombre.trim())
    formData.append('ramo',       ramoFinal.trim())
    formData.append('tipo',       tipo)
    formData.append('precio',     precio)
    formData.append('archivoUrl', archivoUrl)

    const result = await addMaterial(formData)
    setProgress(100)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setNombre('')
      setRamo(ramos[0] ?? '')
      setRamoCustom('')
      setTipo('apuntes')
      setPrecio('')
      setFile(null)
      setTimeout(() => setSuccess(false), 4000)
    }

    setUploading(false)
    setProgress(0)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm font-medium">
          ✅ Material publicado. Ya está visible en el marketplace.
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Nombre */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Nombre del material <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Guía completa Cálculo I con ejercicios resueltos"
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            required
          />
        </div>

        {/* Ramo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Ramo <span className="text-red-400">*</span>
          </label>
          <select
            value={ramo}
            onChange={e => setRamo(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white"
          >
            {ramos.map(r => <option key={r} value={r}>{r}</option>)}
            <option value="__custom__">Otro ramo (escribir)</option>
          </select>
          {ramo === '__custom__' && (
            <input
              type="text"
              value={ramoCustom}
              onChange={e => setRamoCustom(e.target.value)}
              placeholder="Nombre del ramo"
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
            />
          )}
        </div>

        {/* Tipo */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Tipo <span className="text-red-400">*</span>
          </label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition bg-white"
          >
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Precio (CLP) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">$</span>
            <input
              type="number"
              value={precio}
              onChange={e => setPrecio(e.target.value)}
              placeholder="2500"
              min={100}
              step={100}
              className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 transition"
              required
            />
          </div>
          <p className="text-xs text-gray-400">Recibirás el 80% — la plataforma retiene 20%.</p>
        </div>

        {/* File upload */}
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Archivo{' '}
            <span className="text-gray-400 font-normal">(PDF o imagen · máx. 20 MB)</span>
          </label>

          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all select-none
              ${dragOver
                ? 'border-violet-500 bg-violet-50'
                : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/40 bg-gray-50/50'
              }
            `}
          >
            {file ? (
              <div className="space-y-1">
                <div className="text-3xl">{file.type === 'application/pdf' ? '📄' : '🖼️'}</div>
                <p className="text-sm font-semibold text-green-700 truncate max-w-xs mx-auto">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB ·{' '}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setFile(null) }}
                    className="text-red-500 hover:underline font-medium"
                  >
                    Quitar archivo
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-2 pointer-events-none">
                <div className="text-4xl">📁</div>
                <p className="text-sm text-gray-600 font-medium">
                  Arrastra tu archivo aquí o{' '}
                  <span className="text-violet-600">haz clic para seleccionar</span>
                </p>
                <p className="text-xs text-gray-400">PDF, JPG, PNG o WEBP</p>
              </div>
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      </div>

      {/* Progress bar */}
      {uploading && progress > 0 && (
        <div className="space-y-1">
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-violet-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {progress < 60 ? 'Subiendo archivo…' : progress < 90 ? 'Guardando…' : 'Listo ✓'}
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading}
        className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
      >
        {uploading ? 'Publicando…' : '📤 Publicar material'}
      </button>
    </form>
  )
}
