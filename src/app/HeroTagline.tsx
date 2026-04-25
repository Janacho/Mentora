'use client'

import { useState, useEffect } from 'react'

const FRASES = [
  'Deja de buscar en WhatsApp. Tu tutor está aquí.',
  'El ramo que te está matando, a alguien ya le fue bien.',
  'No estudies solo lo que otros ya entendieron.',
  'Deja de pelear solo con ese ramo.',
  'El que ya pasó ese ramo está esperando ayudarte.',
  'Estudia con alguien que ya estuvo donde tú estás.',
]

export default function HeroTagline() {
  const [frase, setFrase] = useState('')

  useEffect(() => {
    setFrase(FRASES[Math.floor(Math.random() * FRASES.length)])
  }, [])

  return (
    <p className="text-lg md:text-xl text-white/90 text-center max-w-2xl leading-relaxed mb-16 drop-shadow">
      {frase}
    </p>
  )
}
