import { useSearch } from '../hooks/useSearch'
import SearchBar from '../components/ui/SearchBar'
import FilterSidebar from '../components/ui/FilterSidebar'
import ActiveFilters from '../components/ui/ActiveFilters'
import SearchTypeBadge from '../components/ui/SearchTypeBadge'
import ExperienceCard from '../components/ui/ExperienceCard'
import { PageSkeleton } from '../components/ui/LoadingSkeleton'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most relevant' },
  { value: 'date',      label: 'Newest first'  },
  { value: 'upvotes',   label: 'Most upvoted'  },
]

export default function SearchResults() {
  const {
    query, company, roundType, year, sort, page,
    debouncedQuery, hasActiveFilters,
    setQuery, setCompany, setRoundType, setYear, setSort, setPage,
    clearFilters,
    experiences, filterCounts, pagination, searchType,
    isLoading, isFetching, isError,
  } = useSearch()

  const showSkeleton = isLoading && experiences.length === 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Search experiences</h1>
        <p className="text-sm text-gray-500">
          Search across {pagination?.total ?? '...'} placement experiences from VRSEC students
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-3">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder='Search "LRU Cache", "Amazon HR", "system design 2024"...'
          isLoading={isFetching && !!debouncedQuery}
        />
      </div>

      {/* Sort row */}
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <ActiveFilters
            query={debouncedQuery}
            company={company}
            roundType={roundType}
            year={year}
            setQuery={setQuery}
            setCompany={setCompany}
            setRoundType={setRoundType}
            setYear={setYear}
            clearFilters={clearFilters}
            total={pagination?.total}
          />
          <SearchTypeBadge searchType={searchType} />
        </div>

        {/* Sort selector */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white ml-auto"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Main layout: sidebar + results */}
      <div className="flex gap-6 mt-4">

        {/* Filter sidebar */}
        <FilterSidebar
          company={company}
          roundType={roundType}
          year={year}
          setCompany={setCompany}
          setRoundType={setRoundType}
          setYear={setYear}
          filterCounts={filterCounts}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {/* Results column */}
        <div className="flex-1 min-w-0">

          {/* Error state */}
          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
              Search failed. Please try again.
            </div>
          )}

          {/* Search tips — shown when search bar is empty */}
          {!debouncedQuery && !hasActiveFilters && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4 text-sm text-purple-800">
              <p className="font-medium mb-1">Search tips</p>
              <ul className="space-y-0.5 text-xs text-purple-700 list-disc list-inside">
                <li>Search for specific topics: <b>LRU Cache</b>, <b>Kadane algorithm</b></li>
                <li>Search by company: <b>Amazon technical</b></li>
                <li>Exact phrase: put in quotes — <b>"system design"</b></li>
                <li>Exclude words: <b>DSA -aptitude</b></li>
                <li>Use the sidebar filters to narrow by year or round type</li>
              </ul>
            </div>
          )}

          {/* Loading state */}
          {showSkeleton ? (
            <PageSkeleton count={5} />
          ) : experiences.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">
                {debouncedQuery
                  ? `No results for "${debouncedQuery}"`
                  : 'No experiences match these filters'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 text-purple-600 text-sm hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Subtle loading overlay while refetching */}
              <div className={`space-y-4 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
                {experiences.map(exp => (
                  <ExperienceCard
                    key={exp._id}
                    experience={exp}
                    similarityScore={exp._similarityScore}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Prev
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    const p = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        disabled={isFetching}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-purple-700 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages || isFetching}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
