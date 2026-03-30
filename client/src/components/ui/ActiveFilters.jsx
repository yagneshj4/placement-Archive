const ROUND_LABELS = {
  coding:'Coding', technical:'Technical', hr:'HR',
  system_design:'System Design', managerial:'Managerial',
  group_discussion:'Group Discussion', aptitude:'Aptitude',
}

export default function ActiveFilters({
  query, company, roundType, year,
  setQuery, setCompany, setRoundType, setYear,
  clearFilters, total,
}) {
  const chips = []
  if (query)     chips.push({ key:'q',         label: `"${query}"`,                 clear: () => setQuery('') })
  if (company)   chips.push({ key:'company',   label: company,                       clear: () => setCompany('') })
  if (roundType) chips.push({ key:'roundType', label: ROUND_LABELS[roundType] || roundType, clear: () => setRoundType('') })
  if (year)      chips.push({ key:'year',      label: year,                          clear: () => setYear('') })

  if (chips.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap py-2">
      {/* Result count */}
      <span className="text-[11px] font-black uppercase tracking-widest text-gray-500 mr-2 bg-white px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
        {total !== undefined ? `${total} result${total !== 1 ? 's' : ''}` : ''}
      </span>

      {/* Active filter chips */}
      {chips.map(chip => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 hover:border-gray-300 text-gray-900 rounded-full text-xs font-bold shadow-sm transition-colors"
        >
          {chip.label}
          <button
            onClick={chip.clear}
            className="text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full p-0.5"
            aria-label={`Remove ${chip.label} filter`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {/* Clear all */}
      {chips.length > 1 && (
        <button
          onClick={clearFilters}
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
