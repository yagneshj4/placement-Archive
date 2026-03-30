const config = {
  1: { label: 'Easy', style: 'bg-green-50 text-green-700 border border-green-200' },
  2: { label: 'Easy', style: 'bg-green-50 text-green-700 border border-green-200' },
  3: { label: 'Medium', style: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  4: { label: 'Hard', style: 'bg-orange-50 text-orange-700 border border-orange-200' },
  5: { label: 'Expert', style: 'bg-red-50 text-red-700 border border-red-200' },
}

export default function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null
  const { label, style } = config[Math.round(difficulty)] || config[3]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${style}`}>
      {label}
    </span>
  )
}
