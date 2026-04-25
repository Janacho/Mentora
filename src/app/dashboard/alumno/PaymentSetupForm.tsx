'use client'

import { useState } from 'react'
import { configurePayment } from '@/app/actions/auth'

export default function PaymentSetupForm() {
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 2) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const rawCard = cardNumber.replace(/\s/g, '')
    if (rawCard.length < 16) { setError('Número de tarjeta inválido'); return }
    if (expiry.length < 5) { setError('Fecha de vencimiento inválida'); return }
    if (cvv.length < 3) { setError('CVV inválido'); return }

    setLoading(true)
    try {
      const result = await configurePayment()
      if (result?.error) {
        setError(result.error)
      } else {
        setSuccess(true)
      }
    } catch {
      setError('Error al guardar el método de pago')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-4">
        <span>✅</span>
        <span className="font-medium">Método de pago configurado exitosamente. Recarga la página para ver los cambios.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-amber-800 mb-1">
            Número de tarjeta
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className="w-full border border-amber-300 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">
            Vencimiento
          </label>
          <input
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            placeholder="MM/AA"
            maxLength={5}
            className="w-full border border-amber-300 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-mono"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-amber-800 mb-1">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="123"
            maxLength={4}
            className="w-full border border-amber-300 rounded-lg px-3 py-2 text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-mono"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </form>
  )
}
