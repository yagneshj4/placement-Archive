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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
      
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Search experiences</h1>
        <p className="text-sm font-semibold text-gray-500">
          Search across {pagination?.total ?? '...'} placement experiences from VRSEC students
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-5">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder='Search "LRU Cache", "Amazon HR", "system design 2024"...'
          isLoading={isFetching && !!debouncedQuery}
        />
      </div>

      {/* Sort row */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3 flex-wrap">
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
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-900 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white ml-auto shadow-sm transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Main layout: sidebar + results */}
      <div className="flex gap-8 mt-6">

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
            <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm rounded-2xl px-6 py-4 mb-6 shadow-sm">
              Search failed. Please try again.
            </div>
          )}

          {/* Search tips — shown when search bar is empty */}
          {!debouncedQuery && !hasActiveFilters && (
            <div className="bg-white border border-gray-200 rounded-[1.25rem] p-8 mb-6 shadow-sm">
              <p className="font-black text-gray-900 mb-4 tracking-tight text-lg">Search tricks</p>
              <ul className="space-y-2.5 text-sm text-gray-600 font-medium">
                <li><span className="font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded mr-1">Semantic Topics</span> Search for concepts like "LRU Cache"</li>
                <li><span className="font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded mr-1">Company Search</span> Type "Amazon technical" directly</li>
                <li><span className="font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded mr-1">Exact Match</span> Wrap phrases in quotes like "system design"</li>
                <li><span className="font-black text-gray-900 bg-gray-100 px-2 py-0.5 rounded mr-1">Filters</span> Use the left sidebar to narrow down your results</li>
              </ul>
            </div>
          )}

          {/* Loading state */}
          {showSkeleton ? (
            <PageSkeleton count={5} />
          ) : experiences.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[1.25rem] border border-gray-200 shadow-sm mt-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-gray-900 text-sm font-bold">
                {debouncedQuery
                  ? `No results for "${debouncedQuery}"`
                  : 'No experiences match these filters'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-gray-600 hover:text-gray-900 text-xs font-black uppercase tracking-widest transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Subtle loading overlay while refetching */}
              <div className={`space-y-4 transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
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
                <div className="flex items-center justify-center gap-2 mt-10 mb-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1 || isFetching}
                    className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    ← Prev
                  </button>

                  <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm mx-2">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const p = Math.max(1, Math.min(pagination.pages - 4, page - 2)) + i
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          disabled={isFetching}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                            p === page
                              ? 'bg-gray-900 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages || isFetching}
                    className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
