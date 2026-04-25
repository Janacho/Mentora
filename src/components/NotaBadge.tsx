interface NotaBadgeProps {
  nota: number
}

function getBadgeStyles(nota: number): string {
  if (nota >= 6.5) {
    return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
  }
  if (nota >= 6.0) {
    return 'bg-blue-100 text-blue-800 border border-blue-200'
  }
  // >= 5.0 (and below 6.0)
  return 'bg-green-100 text-green-800 border border-green-200'
}

export default function NotaBadge({ nota }: NotaBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${getBadgeStyles(nota)}`}
    >
      {nota.toFixed(1)}
    </span>
  )
}
