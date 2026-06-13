import { useRef, useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { experiencesApi, aiApi } from '../api/api.js'
import { useAuth } from '../context/AuthContext.jsx'
import { DifficultyBadge, TagChip, SimilarityBar } from './CommonUI.jsx'

// ── SEARCH BAR ───────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder, isLoading }) {
  const inputRef = useRef(null)

  return (
    <div className="relative">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none drop-shadow-sm">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <input
        ref={inputRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search experiences, questions, companies...'}
        className="w-full pl-14 pr-20 py-4 border border-gray-200 rounded-2xl text-[15px] font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 bg-white shadow-sm transition-all"
      />

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
        {isLoading && (
          <div className="w-5 h-5 border-[3px] border-gray-900 border-t-white rounded-full animate-spin" />
        )}
        {value && (
          <button
            onClick={() => { onChange(''); inputRef.current?.focus() }}
            type="button"
            className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

// ── ACTIVE FILTERS ───────────────────────────────────────────────────────────
const ACTIVE_ROUND_LABELS = {
  coding:'Coding', technical:'Technical', hr:'HR',
  system_design:'System Design', managerial:'Managerial',
  group_discussion:'Group Discussion', aptitude:'Aptitude',
}

export function ActiveFilters({
  query, company, roundType, year,
  setQuery, setCompany, setRoundType, setYear,
  clearFilters, total,
}) {
  const chips = []
  if (query)     chips.push({ key:'q',         label: `"${query}"`,                 clear: () => setQuery('') })
  if (company)   chips.push({ key:'company',   label: company,                       clear: () => setCompany('') })
  if (roundType) chips.push({ key:'roundType', label: ACTIVE_ROUND_LABELS[roundType] || roundType, clear: () => setRoundType('') })
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
            type="button"
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
          type="button"
          className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors ml-1"
        >
          Clear all
        </button>
      )}
    </div>
  )
}

// ── FILTER SIDEBAR ───────────────────────────────────────────────────────────
const SIDEBAR_ROUND_LABELS = {
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

export function FilterSidebar({
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
              type="button"
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
              type="button"
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
                type="button"
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  roundType === rt.name
                    ? 'bg-gray-900 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{SIDEBAR_ROUND_LABELS[rt.name] || rt.name}</span>
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
              type="button"
              className={`text-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                !year ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {YEAR_OPTIONS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(year === y ? '' : y)}
                type="button"
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
                type="button"
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

// ── EXPERIENCE CARD ──────────────────────────────────────────────────────────
const ROUND_LABELS = {
  coding: 'Coding',
  technical: 'Technical',
  hr: 'HR',
  system_design: 'System Design',
  managerial: 'Managerial',
  group_discussion: 'Group Discussion',
  aptitude: 'Aptitude',
}

const ROUND_COLORS = {
  coding: 'bg-blue-50 text-blue-700 border border-blue-200',
  technical: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  hr: 'bg-green-50 text-green-700 border border-green-200',
  system_design: 'bg-orange-50 text-orange-700 border border-orange-200',
  managerial: 'bg-teal-50 text-teal-700 border border-teal-200',
  aptitude: 'bg-gray-100 text-gray-700 border border-gray-300',
}

export function ExperienceCard({ experience, onBookmarkToggle, similarityScore }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [bookmarked, setBookmarked] = useState(user ? experience.upvotedBy?.includes(user.id) : false)
  const [bookmarkCount, setBookmarkCount] = useState(experience.upvotes || 0)

  const handleBookmark = async (e) => {
    e.stopPropagation()
    if (!user) {
      navigate('/auth')
      return
    }
    try {
      const { data } = await experiencesApi.toggleBookmark(experience._id)
      setBookmarked(data.data.bookmarked)
      setBookmarkCount((prev) => (data.data.bookmarked ? prev + 1 : prev - 1))
      onBookmarkToggle?.()
    } catch (err) {
      console.error('Bookmark error:', err)
    }
  }

  const tags = experience.extractedTags?.topics || []
  const difficulty = experience.extractedTags?.difficulty
  const isProcessing =
    experience.embeddingStatus === 'pending' || experience.embeddingStatus === 'processing'

  return (
    <div
      className="bg-white rounded-[1.25rem] border border-gray-200 p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/experiences/${experience._id}`)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-extrabold text-gray-900 tracking-tight text-lg">{experience.company}</h3>
            {experience.isVerified && <span className="text-[10px] text-teal-700 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 shadow-sm">✓ Verified</span>}
          </div>
          <p className="text-gray-500 font-semibold text-xs mt-1">
            {experience.role} · {experience.year} · {ROUND_LABELS[experience.roundType] || experience.roundType}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Round type badge */}
          <span
            className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded shadow-sm ${
              ROUND_COLORS[experience.roundType] || 'bg-gray-50 text-gray-600 border border-gray-200'
            }`}
          >
            {ROUND_LABELS[experience.roundType]}
          </span>

          {/* Offer badge */}
          {experience.offerReceived === true && (
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 shadow-sm">
              Got Offer
            </span>
          )}

          {/* Difficulty */}
          <DifficultyBadge difficulty={difficulty} />
        </div>
      </div>

      {/* Narrative preview */}
      <p className="text-gray-700 text-sm line-clamp-3 leading-relaxed mb-4">{experience.narrative}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 5).map((tag, i) => (
            <TagChip key={tag} label={tag} index={i} />
          ))}
          {tags.length > 5 && <span className="text-xs text-gray-400 font-bold ml-1">+{tags.length - 5} more</span>}
        </div>
      )}

      {/* Similarity score bar */}
      {similarityScore !== undefined && similarityScore !== null && (
        <SimilarityBar score={similarityScore} />
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
        <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold">
          <span>{experience.views || 0} views</span>
          {experience.submittedBy?.name && <span>by {experience.submittedBy.name}</span>}
          {isProcessing && <span className="text-amber-600 font-bold">⟳ AI processing...</span>}
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          type="button"
          className={`flex items-center gap-1.5 text-xs transition-colors p-1.5 rounded-md ${
            bookmarked ? 'text-gray-900 bg-gray-100' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={bookmarked ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          {bookmarkCount > 0 && <span className="font-bold">{bookmarkCount}</span>}
        </button>
      </div>
    </div>
  )
}

// ── SIMILAR EXPERIENCES ──────────────────────────────────────────────────────
const SIMILAR_ROUND_LABELS = {
  coding:'Coding', technical:'Technical', hr:'HR',
  system_design:'System Design', managerial:'Managerial',
  aptitude:'Aptitude', group_discussion:'Group Discussion',
}

function SimilarCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-28 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
      <div className="h-3 bg-gray-200 rounded w-4/5 mb-3" />
      <div className="h-1.5 bg-gray-100 rounded w-full" />
    </div>
  )
}

export function SimilarExperiences({ experienceId, company }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['similar', experienceId],
    queryFn: async () => {
      const { data } = await aiApi.getSimilar(experienceId, {
        n_results: 4,
        exclude_same_company: false,
      })
      return data.data
    },
    enabled: !!experienceId,
    staleTime: 1000 * 60 * 10,   // cache for 10 minutes
    retry: 1,
  })

  // If ML service is down, show nothing gracefully
  if (isError) return null

  if (isLoading) {
    return (
      <div className="mt-8">
        <div className="h-4 bg-gray-200 rounded w-44 animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <SimilarCardSkeleton key={i} />)}
        </div>
      </div>
    )
  }

  const similar = data?.similar || []
  if (similar.length === 0) return null

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">
          Semantically similar experiences
        </h2>
        <span className="text-xs text-gray-400 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
          🧠 AI-powered
        </span>
      </div>

      <div className="space-y-3">
        {similar.map(exp => (
          <Link
            key={exp._id}
            to={`/experiences/${exp._id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-200 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900 text-sm">{exp.company}</span>
                  {exp.offerReceived === true && (
                    <span className="text-xs text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                      Offer
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {exp.role} · {SIMILAR_ROUND_LABELS[exp.roundType] || exp.roundType} · {exp.year}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <p className="text-gray-500 text-xs line-clamp-2 mb-2 leading-relaxed">
              {exp.narrative}
            </p>

            {/* Tags */}
            {exp.extractedTags?.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {exp.extractedTags.topics.slice(0, 3).map(tag => (
                  <span key={tag}
                    className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Similarity bar */}
            <SimilarityBar score={exp._similarityScore} />
          </Link>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-center">
        Ranked by semantic similarity — not just same company
      </p>
    </div>
  )
}

// ── PROCESSING BANNER ────────────────────────────────────────────────────────
// Polls /experiences/:id/status every 3 seconds until done or failed
export function ProcessingBanner({ experienceId }) {
  const [status, setStatus] = useState('pending')
  const [dots, setDots] = useState('.')

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => {
      setDots((d) => (d.length >= 3 ? '.' : d + '.'))
    }, 500)
    return () => clearInterval(t)
  }, [])

  // Poll status
  useEffect(() => {
    if (status === 'done' || status === 'failed') return
    const poll = setInterval(async () => {
      try {
        const { data } = await experiencesApi.getStatus(experienceId)
        setStatus(data.data.status)
      } catch {
        /* ignore */
      }
    }, 3000)
    return () => clearInterval(poll)
  }, [experienceId, status])

  if (status === 'done')
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-green-700">
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        AI processing complete — this experience is now fully searchable.
      </div>
    )

  if (status === 'failed')
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 text-sm text-red-700">
        AI processing failed — this experience is saved but may not appear in semantic search yet. It will be retried automatically.
      </div>
    )

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2 text-sm text-blue-700">
      <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
      AI is analysing and indexing this experience{dots} It will appear in search results shortly.
    </div>
  )
}
