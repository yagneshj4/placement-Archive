// Shows a coloured progress bar for semantic similarity score
export default function SimilarityBar({ score }) {
  if (score === null || score === undefined) return null

  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#0F6E56'
              : pct >= 60 ? '#185FA5'
              : pct >= 40 ? '#854F0B'
              : '#6B7280'

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium flex-shrink-0" style={{ color }}>
        {pct}% match
      </span>
    </div>
  )
}
