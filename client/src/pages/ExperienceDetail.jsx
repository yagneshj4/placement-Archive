import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { experiencesApi } from '../api/experiences'
import { useAuth } from '../hooks/useAuth'
import { useDifficulty } from '../hooks/useDifficulty'
import DifficultyBadgeWithSHAP from '../components/ui/DifficultyBadgeWithSHAP'
import TagChip from '../components/ui/TagChip'
import ProcessingBanner from '../components/ui/ProcessingBanner'
import SimilarExperiences from '../components/ui/SimilarExperiences'
import { ExperienceCardSkeleton } from '../components/ui/LoadingSkeleton'

const ROUND_LABELS = {
  coding: 'Coding',
  technical: 'Technical Interview',
  hr: 'HR Round',
  system_design: 'System Design',
  managerial: 'Managerial',
  aptitude: 'Aptitude Test',
  group_discussion: 'Group Discussion',
}

export default function ExperienceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Difficulty prediction ────────────────────────────────────
  const { mutate: predictDifficulty, data: difficultyPrediction, isPending: isPredicting } = useDifficulty()

  // ── Fetch experience ─────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['experience', id],
    queryFn: async () => {
      const { data } = await experiencesApi.getById(id)
      setBookmarked(data.data.experience.upvotedBy?.includes(user?.id) || false)
      return data.data.experience
    },
    enabled: !!id,
    retry: 1,
  })

  // ── Trigger difficulty prediction when experience loads ──────
  useEffect(() => {
    if (data?.company && data?.roundType && data?.extractedTags?.topics) {
      predictDifficulty({
        company: data.company,
        round_type: data.roundType,
        topics: data.extractedTags.topics || [],
        skip_rate: 0.2,  // Default: 20% skip rate
        avg_time_seconds: 150,  // Default: 2.5 min average
        self_rated_difficulty: data.extractedTags?.difficulty || 3,
        attempt_count: 20,  // Default: 20 attempts
      })
    }
  }, [data])

  // ── Bookmark mutation ────────────────────────────────────────
  const bookmarkMutation = useMutation({
    mutationFn: () => experiencesApi.toggleBookmark(id),
    onSuccess: (res) => {
      setBookmarked(res.data.data.bookmarked)
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  const handleBookmark = () => {
    if (!user) {
      navigate('/auth')
      return
    }
    bookmarkMutation.mutate()
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Loading state ────────────────────────────────────────────
  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ExperienceCardSkeleton />
        <div className="mt-4">
          <ExperienceCardSkeleton />
        </div>
      </div>
    )

  // ── Error / not found ────────────────────────────────────────
  if (isError || !data)
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-sm mb-4">Experience not found.</p>
        <Link to="/" className="text-blue-600 text-sm hover:underline">
          ← Back to experiences
        </Link>
      </div>
    )

  const exp = data
  const tags = exp.extractedTags?.topics || []
  const isProcessing = ['pending', 'processing'].includes(exp.embeddingStatus)
  const isOwner = user && exp.submittedBy?._id === user.id

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {/* AI processing banner */}
      {isProcessing && <ProcessingBanner experienceId={id} />}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl font-bold text-gray-900">{exp.company}</h1>
                {exp.isVerified && (
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    ✓ Verified
                  </span>
                )}
                {exp.offerReceived === true && (
                  <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                    Got offer
                  </span>
                )}
                {exp.offerReceived === false && (
                  <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                    No offer
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm">
                {exp.role} · {ROUND_LABELS[exp.roundType] || exp.roundType} · {exp.year}
                {exp.ctcOffered && <span className="ml-2 font-medium text-gray-700">{exp.ctcOffered}</span>}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Bookmark */}
              <button
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  bookmarked
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
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
                {bookmarked ? 'Saved' : 'Save'}
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {copied ? 'Copied!' : 'Share'}
              </button>

              {/* Edit — only for owner */}
              {isOwner && (
                <Link
                  to={`/experiences/${id}/edit`}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors"
                >
                  Edit
                </Link>
              )}
            </div>
          </div>

          {/* Tags row */}
          {(tags.length > 0 || difficultyPrediction) && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {difficultyPrediction && (
                <DifficultyBadgeWithSHAP
                  difficulty={difficultyPrediction.difficulty}
                  difficulty_label={difficultyPrediction.difficulty_label}
                  probability={difficultyPrediction.probability}
                  shap_values={difficultyPrediction.shap_values || []}
                  model_used={difficultyPrediction.model_used}
                  top_driver={difficultyPrediction.top_driver}
                />
              )}
              {isPredicting && !difficultyPrediction && (
                <div className="px-2 py-1 text-xs text-gray-400 animate-pulse">
                  Analyzing difficulty...
                </div>
              )}
              {tags.map((tag, i) => (
                <TagChip
                  key={tag}
                  label={tag}
                  index={i}
                  onClick={() =>
                    navigate(`/search?roundType=${exp.roundType}&q=${encodeURIComponent(tag)}`)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Narrative */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Experience</h2>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{exp.narrative}</div>
        </div>

        {/* Preparation tips */}
        {exp.preparationTips && (
          <div className="p-6 border-b border-gray-100 bg-amber-50">
            <h2 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Preparation tips
            </h2>
            <p className="text-amber-800 text-sm leading-relaxed whitespace-pre-wrap">{exp.preparationTips}</p>
          </div>
        )}

        {/* Footer meta */}
        <div className="p-4 bg-gray-50 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span>{exp.views} views</span>
            <span>{exp.upvotes} saves</span>
            {exp.submittedBy?.name && (
              <span>
                Shared by <span className="font-medium text-gray-600">{exp.submittedBy.name}</span>
              </span>
            )}
            {exp.submittedBy?.college && <span>{exp.submittedBy.college}</span>}
          </div>
          <span>
            {new Date(exp.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Related experiences */}
      <SimilarExperiences experienceId={id} company={exp.company} />
    </div>
  )
}
