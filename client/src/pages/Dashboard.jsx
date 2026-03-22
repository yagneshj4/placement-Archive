import { useState } from 'react'
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
    onSuccess: (data) => {
      if (filters.page === 1) {
        setAllExperiences(data.experiences)
      } else {
        setAllExperiences((prev) => [...prev, ...data.experiences])
      }
      setHasMore(data.pagination.page < data.pagination.pages)
    },
    keepPreviousData: true,
  })

  const handleFilterChange = (key, value) => {
    setFilters({ company: '', roundType: '', year: '', page: 1, [key]: value })
    setAllExperiences([])
  }

  const loadMore = () => {
    setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Placement experiences</h1>
          {data && (
            <p className="text-sm text-gray-500 mt-0.5">{data.pagination.total} experiences from VRSEC students</p>
          )}
        </div>
        <Link
          to="/submit"
          className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors"
        >
          + Share yours
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex gap-2 flex-wrap mb-6">
        {/* Round type filter */}
        <div className="flex gap-1 flex-wrap">
          {ROUND_TYPES.map((rt) => (
            <button
              key={rt.value}
              onClick={() => handleFilterChange('roundType', rt.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.roundType === rt.value
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          className="border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
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
          className="border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 min-w-[140px]"
        />
      </div>

      {/* Experience list */}
      {isLoading && filters.page === 1 ? (
        <PageSkeleton count={5} />
      ) : allExperiences.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No experiences found for these filters.</p>
          <button
            onClick={() => handleFilterChange('roundType', '')}
            className="mt-3 text-purple-600 text-sm hover:underline"
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
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                disabled={isFetching}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {isFetching ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

