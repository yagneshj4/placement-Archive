import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DifficultyBadge from './DifficultyBadge'
import TagChip from './TagChip'
import SimilarityBar from './SimilarityBar'
import { experiencesApi } from '../../api/experiences'
import { useAuth } from '../../hooks/useAuth'

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
  coding: 'bg-blue-100 text-blue-800',
  technical: 'bg-purple-100 text-purple-800',
  hr: 'bg-green-100 text-green-800',
  system_design: 'bg-orange-100 text-orange-800',
  managerial: 'bg-teal-100 text-teal-800',
  aptitude: 'bg-gray-100 text-gray-700',
}

export default function ExperienceCard({ experience, onBookmarkToggle, similarityScore }) {
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
      className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => navigate(`/experiences/${experience._id}`)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 text-sm">{experience.company}</h3>
            {experience.isVerified && <span className="text-xs text-blue-600 font-medium">✓ Verified</span>}
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            {experience.role} · {experience.year} · {ROUND_LABELS[experience.roundType] || experience.roundType}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Round type badge */}
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              ROUND_COLORS[experience.roundType] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {ROUND_LABELS[experience.roundType]}
          </span>

          {/* Offer badge */}
          {experience.offerReceived === true && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">
              Got Offer
            </span>
          )}

          {/* Difficulty */}
          <DifficultyBadge difficulty={difficulty} />
        </div>
      </div>

      {/* Narrative preview */}
      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-3">{experience.narrative}</p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.slice(0, 5).map((tag, i) => (
            <TagChip key={tag} label={tag} index={i} />
          ))}
          {tags.length > 5 && <span className="text-xs text-gray-400">+{tags.length - 5} more</span>}
        </div>
      )}

      {/* Similarity score bar */}
      {similarityScore !== undefined && similarityScore !== null && (
        <SimilarityBar score={similarityScore} />
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{experience.views || 0} views</span>
          {experience.submittedBy?.name && <span>by {experience.submittedBy.name}</span>}
          {isProcessing && <span className="text-amber-600 font-medium">⟳ AI processing...</span>}
        </div>

        {/* Bookmark button */}
        <button
          onClick={handleBookmark}
          className={`flex items-center gap-1 text-xs transition-colors ${
            bookmarked ? 'text-blue-600' : 'text-gray-400 hover:text-blue-500'
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
          {bookmarkCount > 0 && <span>{bookmarkCount}</span>}
        </button>
      </div>
    </div>
  )
}
