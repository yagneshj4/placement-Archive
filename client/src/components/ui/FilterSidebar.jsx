const ROUND_LABELS = {
  coding:           'Coding',
  technical:        'Technical',
  hr:               'HR',
  system_design:    'System Design',
  managerial:       'Managerial',
  group_discussion: 'Group Discussion',
  aptitude:         'Aptitude',
}

const CURRENT_YEAR = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => String(CURRENT_YEAR - i))

export default function FilterSidebar({
  company, roundType, year,
  setCompany, setRoundType, setYear,
  filterCounts,
  hasActiveFilters,
  clearFilters,
}) {
  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-20">

        {/* Sidebar header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-purple-600 hover:text-purple-800 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Round type section */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Round type</p>
          <div className="space-y-1">
            {/* All rounds option */}
            <button
              onClick={() => setRoundType('')}
              className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                !roundType ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>All rounds</span>
            </button>

            {/* Dynamic counts from aggregation */}
            {filterCounts?.roundTypes?.map(rt => (
              <button
                key={rt.name}
                onClick={() => setRoundType(roundType === rt.name ? '' : rt.name)}
                className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-colors ${
                  roundType === rt.name
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{ROUND_LABELS[rt.name] || rt.name}</span>
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  roundType === rt.name ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {rt.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Year section */}
        <div className="mb-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Year</p>
          <div className="space-y-1">
            <button
              onClick={() => setYear('')}
              className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                !year ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All years
            </button>
            {YEAR_OPTIONS.map(y => (
              <button
                key={y}
                onClick={() => setYear(year === y ? '' : y)}
                className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors ${
                  year === y ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Company section */}
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Company</p>

          {/* Free text input for company */}
          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Type company name..."
            className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          />

          {/* Top companies from aggregation */}
          {filterCounts?.companies?.slice(0, 8).map(c => (
            <button
              key={c.name}
              onClick={() => setCompany(company === c.name ? '' : c.name)}
              className={`w-full text-left flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors ${
                company === c.name
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="truncate">{c.name}</span>
              <span className={`ml-1 text-xs rounded-full px-1.5 py-0.5 flex-shrink-0 ${
                company === c.name ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {c.count}
              </span>
            </button>
          ))}
        </div>

      </div>
    </aside>
  )
}
