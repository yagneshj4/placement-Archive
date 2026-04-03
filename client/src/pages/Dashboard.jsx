import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Building2, Users, FileText, PlusCircle, Frown } from 'lucide-react'
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

const TRENDING_COMPANIES = ['Amazon', 'Tcs', 'Infosys', 'Google', 'Microsoft', 'Accenture', 'Cognizant']

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

  const handleClearFilters = () => {
    setFilters({ company: '', roundType: '', year: '', page: 1 })
    setAllExperiences([])
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 font-sans">
      
      {/* 4. Quick Stats Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Experiences</p>
            <p className="text-2xl font-black text-gray-900">{data ? data.pagination.total : '--'}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Active Students</p>
            <p className="text-2xl font-black text-gray-900">{data ? Math.floor(data.pagination.total * 0.8 || 1) + '+' : '--'}</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm shadow-gray-200/50 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Top Companies</p>
            <p className="text-2xl font-black text-gray-900">40+</p>
          </div>
        </div>
      </motion.div>

      {/* Page header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Placement Archive</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Discover interview patterns and placement experiences.</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            to="/submit"
            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-xl transition-all w-full md:w-auto justify-center"
          >
            <PlusCircle size={18} />
            Share yours
          </Link>
        </motion.div>
      </div>

      {/* 2. Trending Companies Quick-Tags */}
      <div className="mb-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] shrink-0 mr-2 bg-gray-100 px-2 py-1 rounded">Trending</span>
        {TRENDING_COMPANIES.map(company => (
          <button
            key={company}
            onClick={() => handleFilterChange('company', company)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
              filters.company.toLowerCase() === company.toLowerCase()
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-inner'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm'
            }`}
          >
            {company}
          </button>
        ))}
      </div>

      {/* 1. Sticky Glassmorphism Filter Bar */}
      <div className="sticky top-16 z-40 bg-white/70 backdrop-blur-xl border border-gray-200 py-3 mb-8 shadow-sm rounded-2xl p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder="Search by company name..."
              className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-white transition-all shadow-inner"
            />
          </div>

          <div className="flex gap-3">
            {/* Round type filter */}
            <select
              value={filters.roundType}
              onChange={(e) => handleFilterChange('roundType', e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-gray-900 bg-white transition-all shadow-sm cursor-pointer min-w-[140px]"
            >
              {ROUND_TYPES.map((rt) => (
                <option key={rt.value} value={rt.value}>{rt.label}</option>
              ))}
            </select>

            {/* Year filter */}
            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-gray-900 bg-white transition-all shadow-sm cursor-pointer min-w-[120px]"
            >
              {YEARS.map((y) => (
                <option key={y.value} value={y.value}>{y.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Experience list */}
      {isLoading && filters.page === 1 ? (
        <PageSkeleton count={4} />
      ) : allExperiences.length === 0 ? (
        
        /* 5. A Better "Empty State" */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 pointer-events-none"></div>
          <Frown size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-black text-gray-900 mb-2">No experiences found</h3>
          <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto mb-6">
            We couldn't find any interview experiences that perfectly match your current search filters.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-white text-gray-900 border border-gray-200 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all relative z-10"
            >
              Clear filters
            </button>
            <Link
              to="/submit"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-xl transition-all relative z-10"
            >
              Be the first to add one!
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-4 relative z-0">
          <AnimatePresence mode="popLayout">
            {allExperiences.map((exp, index) => (
              <motion.div
                key={exp._id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4), type: "spring", stiffness: 300, damping: 25 }}
              >
                <ExperienceCard experience={exp} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load more */}
          {hasMore && (
            <div className="text-center pt-10 pb-4">
              <button
                onClick={loadMore}
                disabled={isFetching}
                className="px-8 py-3 border border-gray-200 text-gray-700 bg-white shadow-sm rounded-xl text-sm font-bold hover:border-gray-300 hover:shadow-md hover:text-gray-900 hover:-translate-y-0.5 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                {isFetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : 'Load more experiences'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
