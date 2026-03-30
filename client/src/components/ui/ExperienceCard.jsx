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
  coding: 'bg-blue-50 text-blue-700 border border-blue-200',
  technical: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  hr: 'bg-green-50 text-green-700 border border-green-200',
  system_design: 'bg-orange-50 text-orange-700 border border-orange-200',
  managerial: 'bg-teal-50 text-teal-700 border border-teal-200',
  aptitude: 'bg-gray-100 text-gray-700 border border-gray-300',
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
