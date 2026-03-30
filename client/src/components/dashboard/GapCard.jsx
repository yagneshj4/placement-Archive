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
    ? 'text-red-700 bg-red-50 border-red-200'
    : urgency === 'Medium'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-gray-600 bg-gray-100 border-gray-200'

  return (
    <div className="bg-white rounded-[1.25rem] border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110">
            {rank}
          </span>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900 text-[15px] truncate tracking-tight">{gap.topic}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Appears in <b className="text-gray-900">{gap.frequency}%</b> of {gap.companies.slice(0, 2).join(', ')} interviews
            </p>
          </div>
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border shadow-sm flex-shrink-0 ${urgencyColor}`}>
          {urgency} Priority
        </span>
      </div>

      <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          <span>Your coverage</span>
          <span className={gap.isCovered ? "text-teal-600" : "text-red-500"}>{gap.isCovered ? 'Covered' : 'Not covered'}</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: gap.isCovered ? '100%' : '5%',
              background: gap.isCovered ? '#0D9488' : '#EF4444',
            }}
          />
        </div>
      </div>

      {gap.resources && gap.resources.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2.5">Recommended resources</p>
          <div className="space-y-2">
            {gap.resources.map((resource, idx) => (
              <a
                key={`${resource.url}-${idx}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-blue-600 hover:text-blue-800 font-semibold group/link"
              >
                <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 uppercase w-8 text-center flex-shrink-0 transition-transform group-hover/link:scale-105">
                  {RESOURCE_TYPE_ICONS[resource.type] || 'LINK'}
                </span>
                <span className="truncate group-hover/link:underline">{resource.title}</span>
                {resource.platform && (
                  <span className="text-gray-400 flex-shrink-0 bg-gray-100 px-1.5 rounded-md text-[10px] font-bold">{resource.platform}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100">
        <Link
          to={`/search?q=${encodeURIComponent(gap.topic)}`}
          className="text-xs font-bold text-gray-900 group-hover:text-violet-700 transition-colors flex items-center gap-1.5"
        >
          Find {gap.topic} experiences <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  )
}
