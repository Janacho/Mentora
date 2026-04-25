'use client'

interface StarRatingProps {
  rating: number
  count?: number
  size?: 'sm' | 'md'
}

export default function StarRating({ rating, count, size = 'md' }: StarRatingProps) {
  const clampedRating = Math.min(5, Math.max(0, rating))
  const textSize = size === 'sm' ? 'text-sm' : 'text-base'
  const starSize = size === 'sm' ? 'text-base' : 'text-lg'

  const stars = Array.from({ length: 5 }, (_, i) => {
    const value = i + 1
    if (clampedRating >= value) {
      // Fully filled
      return { key: i, filled: true, half: false }
    }
    if (clampedRating >= value - 0.5) {
      // Half filled
      return { key: i, filled: false, half: true }
    }
    return { key: i, filled: false, half: false }
  })

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className={`flex items-center gap-0.5 ${starSize}`}>
        {stars.map(({ key, filled, half }) => (
          <span
            key={key}
            className={
              filled
                ? 'text-yellow-400'
                : half
                ? 'text-yellow-300'
                : 'text-gray-300'
            }
            aria-hidden="true"
          >
            {filled ? '★' : half ? '★' : '☆'}
          </span>
        ))}
      </span>
      <span className="text-gray-700 font-medium">
        {clampedRating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-gray-400">
          ({count.toLocaleString('es-CL')})
        </span>
      )}
    </div>
  )
}
