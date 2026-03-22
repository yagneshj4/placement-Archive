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
      <span className="text-sm text-gray-500 mr-1">
        {total !== undefined ? `${total} result${total !== 1 ? 's' : ''}` : ''}
      </span>

      {/* Active filter chips */}
      {chips.map(chip => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium"
        >
          {chip.label}
          <button
            onClick={chip.clear}
            className="ml-0.5 hover:text-purple-600 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      {/* Clear all */}
      {chips.length > 1 && (
        <button
          onClick={clearFilters}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
