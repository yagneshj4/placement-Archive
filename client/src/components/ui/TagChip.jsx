const colors = [
  'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'bg-purple-50 text-purple-700 border border-purple-200',
  'bg-teal-50 text-teal-700 border border-teal-200',
  'bg-amber-50 text-amber-700 border border-amber-200',
]

export default function TagChip({ label, index = 0, onClick }) {
  const color = colors[index % colors.length]
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${color} shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : 'cursor-default'
      }`}
    >
      {label}
    </button>
  )
}
