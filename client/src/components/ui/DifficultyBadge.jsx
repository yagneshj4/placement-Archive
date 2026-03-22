const config = {
  1: { label: 'Easy', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: 'Easy', bg: 'bg-green-100', text: 'text-green-800' },
  3: { label: 'Medium', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: 'Hard', bg: 'bg-orange-100', text: 'text-orange-800' },
  5: { label: 'Expert', bg: 'bg-red-100', text: 'text-red-800' },
}

export default function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null
  const { label, bg, text } = config[Math.round(difficulty)] || config[3]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bg} ${text}`}>
      {label}
    </span>
  )
}
