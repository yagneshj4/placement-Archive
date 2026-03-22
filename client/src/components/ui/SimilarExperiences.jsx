import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { aiApi } from '../../api/ai'
import SimilarityBar from './SimilarityBar'

const ROUND_LABELS = {
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

export default function SimilarExperiences({ experienceId, company }) {
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
                  {exp.role} · {ROUND_LABELS[exp.roundType] || exp.roundType} · {exp.year}
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
