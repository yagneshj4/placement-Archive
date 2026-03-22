import { Link } from 'react-router-dom'

const RESOURCE_TYPE_ICONS = {
  video: 'VID',
  article: 'DOC',
  course: 'CRS',
  documentation: 'REF',
  practice: 'PRC',
  book: 'BOK',
}

export default function GapCard({ gap, rank }) {
  const urgency = gap.gapScore >= 50
    ? 'High'
    : gap.gapScore >= 20
      ? 'Medium'
      : 'Low'

  const urgencyColor = urgency === 'High'
    ? 'text-red-600 bg-red-50 border-red-100'
    : urgency === 'Medium'
      ? 'text-amber-600 bg-amber-50 border-amber-100'
      : 'text-gray-500 bg-gray-50 border-gray-100'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
            {rank}
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{gap.topic}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Appears in <b>{gap.frequency}%</b> of {gap.companies.slice(0, 2).join(', ')} interviews
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${urgencyColor}`}>
          {urgency} priority
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Your coverage</span>
          <span>{gap.isCovered ? 'Covered' : 'Not covered'}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: gap.isCovered ? '100%' : '5%',
              background: gap.isCovered ? '#0F6E56' : '#E24B4A',
            }}
          />
        </div>
      </div>

      {gap.resources && gap.resources.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Recommended resources</p>
          <div className="space-y-1.5">
            {gap.resources.map((resource, idx) => (
              <a
                key={`${resource.url}-${idx}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 group"
              >
                <span className="text-[10px] text-gray-500 w-7 flex-shrink-0">
                  {RESOURCE_TYPE_ICONS[resource.type] || 'LINK'}
                </span>
                <span className="truncate group-hover:underline">{resource.title}</span>
                {resource.platform && (
                  <span className="text-gray-400 flex-shrink-0">{resource.platform}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <Link
        to={`/search?q=${encodeURIComponent(gap.topic)}`}
        className="mt-3 text-xs text-violet-600 hover:underline block"
      >
        Find {gap.topic} experiences in the archive
      </Link>
    </div>
  )
}
