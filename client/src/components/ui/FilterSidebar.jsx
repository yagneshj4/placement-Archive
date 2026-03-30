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
    <aside className="w-64 flex-shrink-0 hidden lg:block">
      <div className="bg-white rounded-[1.25rem] border border-gray-200 p-5 sticky top-24 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[11px] font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Round type section */}
        <div className="mb-6 border-b border-gray-100 pb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Round type</p>
          <div className="space-y-1.5">
            <button
              onClick={() => setRoundType('')}
              className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                !roundType ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>All rounds</span>
            </button>

            {filterCounts?.roundTypes?.map(rt => (
              <button
                key={rt.name}
                onClick={() => setRoundType(roundType === rt.name ? '' : rt.name)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  roundType === rt.name
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{ROUND_LABELS[rt.name] || rt.name}</span>
                <span className={`text-[10px] font-black rounded-md px-1.5 py-0.5 ${
                  roundType === rt.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {rt.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Year section */}
        <div className="mb-6 border-b border-gray-100 pb-6">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Year</p>
          <div className="space-y-1.5 flex flex-wrap gap-2">
            <button
              onClick={() => setYear('')}
              className={`text-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !year ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {YEAR_OPTIONS.map((y, idx) => (
              <button
                key={y}
                onClick={() => setYear(year === y ? '' : y)}
                className={`text-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  year === y ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Company section */}
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Company</p>

          <input
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="Search filters..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 mb-3 bg-gray-50 focus:bg-white transition-all shadow-sm"
          />

          <div className="space-y-1.5">
            {filterCounts?.companies?.slice(0, 8).map(c => (
              <button
                key={c.name}
                onClick={() => setCompany(company === c.name ? '' : c.name)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-bold transition-all ${
                  company === c.name
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="truncate">{c.name}</span>
                <span className={`ml-1 text-[10px] font-black rounded-md px-1.5 py-0.5 flex-shrink-0 ${
                  company === c.name ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </aside>
  )
}
