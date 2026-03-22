const colors = [
  'bg-blue-100 text-blue-800',
  'bg-purple-100 text-purple-800',
  'bg-teal-100 text-teal-800',
  'bg-amber-100 text-amber-800',
]

export default function TagChip({ label, index = 0, onClick }) {
  const color = colors[index % colors.length]
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color} ${
        onClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
      }`}
    >
      {label}
    </button>
  )
}
