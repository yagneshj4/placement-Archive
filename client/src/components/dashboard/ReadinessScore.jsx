export default function ReadinessScore({ score = 0, coveredCount = 0, totalTopics = 0 }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const boundedScore = Math.max(0, Math.min(score, 100))
  const dash = circumference * (boundedScore / 100)

  const color = boundedScore >= 70
    ? '#0F6E56'
    : boundedScore >= 45
      ? '#185FA5'
      : boundedScore >= 25
        ? '#854F0B'
        : '#E24B4A'

  const label = boundedScore >= 70
    ? 'Well prepared'
    : boundedScore >= 45
      ? 'On track'
      : boundedScore >= 25
        ? 'Needs work'
        : 'Just starting'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg width="120" height="120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--color-border-tertiary)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{boundedScore}%</span>
        </div>
      </div>

      <div>
        <p className="text-base font-semibold text-gray-900 mb-1">Readiness score</p>
        <p className="text-sm font-medium mb-2" style={{ color }}>{label}</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          You have covered <b className="text-gray-700">{coveredCount}</b> of the top{' '}
          <b className="text-gray-700">{totalTopics}</b> topics your target companies ask.
        </p>
      </div>
    </div>
  )
}
