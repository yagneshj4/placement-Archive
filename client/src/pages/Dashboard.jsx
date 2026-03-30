import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { experiencesApi } from '../api/experiences'
import ExperienceCard from '../components/ui/ExperienceCard'
import { PageSkeleton } from '../components/ui/LoadingSkeleton'

const ROUND_TYPES = [
  { value: '', label: 'All rounds' },
  { value: 'coding', label: 'Coding' },
  { value: 'technical', label: 'Technical' },
  { value: 'hr', label: 'HR' },
  { value: 'system_design', label: 'System Design' },
  { value: 'aptitude', label: 'Aptitude' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [
  { value: '', label: 'All years' },
  { value: String(CURRENT_YEAR), label: String(CURRENT_YEAR) },
  { value: String(CURRENT_YEAR - 1), label: String(CURRENT_YEAR - 1) },
  { value: String(CURRENT_YEAR - 2), label: String(CURRENT_YEAR - 2) },
  { value: String(CURRENT_YEAR - 3), label: String(CURRENT_YEAR - 3) },
]

export default function Dashboard() {
  const [filters, setFilters] = useState({
    company: '',
    roundType: '',
    year: '',
    page: 1,
  })
  const [allExperiences, setAllExperiences] = useState([])
  const [hasMore, setHasMore] = useState(true)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['experiences', filters],
    queryFn: async () => {
      const params = {}
      if (filters.company) params.company = filters.company
      if (filters.roundType) params.roundType = filters.roundType
      if (filters.year) params.year = filters.year
      params.page = filters.page
      params.limit = 10
      const { data } = await experiencesApi.getAll(params)
      return data.data
    },
  })

  useEffect(() => {
    if (data) {
      if (filters.page === 1) {
        setAllExperiences(data.experiences)
      } else {
        setAllExperiences((prev) => {
          // Deduplicate nicely to handle strict mode multiple renders
          const newExps = data.experiences.filter(
            (newE) => !prev.some((oldE) => oldE._id === newE._id)
          )
          return [...prev, ...newExps]
        })
      }
      setHasMore(data.pagination.page < data.pagination.pages)
    }
  }, [data, filters.page])

  const handleFilterChange = (key, value) => {
    setFilters({ company: '', roundType: '', year: '', page: 1, [key]: value })
    setAllExperiences([])
  }

  const loadMore = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Placement experiences</h1>
          {data && (
            <p className="text-sm font-semibold text-gray-500 mt-1">{data.pagination.total} experiences from VRSEC students</p>
          )}
        </div>
        <Link
          to="/submit"
          className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          + Share yours
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-8">
        {/* Round type filter */}
        <div className="flex gap-1 flex-wrap">
          {ROUND_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => handleFilterChange('roundType', rt.value)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border ${
                filters.roundType === rt.value
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-900 shadow-sm'
              }`}
            >
              {rt.label}
            </button>
          ))}
        </div>

        {/* Year filter */}
        <select
          value={filters.year}
          onChange={(e) => handleFilterChange('year', e.target.value)}
          className="border border-gray-200 rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-gray-900 bg-white transition-colors shadow-sm"
        >
          {YEARS.map((y) => (
            <option key={y.value} value={y.value}>
              {y.label}
            </option>
          ))}
        </select>

        {/* Company search */}
        <input
          value={filters.company}
          onChange={(e) => handleFilterChange('company', e.target.value)}
          placeholder="Search company..."
          className="border border-gray-200 rounded-full px-4 py-1.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 bg-white min-w-[140px] transition-colors shadow-sm"
        />
      </div>

      {/* Experience list */}
      {isLoading && filters.page === 1 ? (
        <PageSkeleton count={5} />
      ) : allExperiences.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-gray-500 font-bold text-sm">No experiences found for these filters.</p>
          <button
            onClick={() => handleFilterChange('roundType', '')}
            className="mt-3 text-gray-900 text-sm font-black hover:underline transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {allExperiences.map((exp) => (
            <ExperienceCard key={exp._id} experience={exp} />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-8">
              <button
                onClick={loadMore}
                disabled={isFetching}
                className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white shadow-sm rounded-xl text-sm font-bold hover:border-gray-300 hover:shadow-md hover:text-gray-900 hover:-translate-y-0.5 disabled:opacity-50 transition-all"
              >
                {isFetching ? 'Loading...' : 'Load more experiences'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
