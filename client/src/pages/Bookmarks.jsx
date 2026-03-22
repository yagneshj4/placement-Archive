import { Link } from 'react-router-dom'
import { useBookmarks } from '../hooks/useBookmarks'
import ExperienceCard from '../components/ui/ExperienceCard'
import EmptyState from '../components/ui/EmptyState'
import { PageSkeleton } from '../components/ui/LoadingSkeleton'

export default function Bookmarks() {
  const { bookmarks, total, isLoading, isError, removeBookmark, isRemoving } = useBookmarks()

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />
        <PageSkeleton count={3} />
      </div>
    )

  if (isError)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <p className="text-red-500 text-sm">Failed to load bookmarks. Please refresh.</p>
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Saved experiences</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} {total === 1 ? 'experience' : 'experiences'} saved
          </p>
        </div>
        <Link to="/search" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
          Browse more →
        </Link>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          title="No saved experiences yet"
          description="Save experiences from the search page to quickly find them later."
          action={
            <Link
              to="/search"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Browse experiences
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {bookmarks.map((exp) => (
            <div key={exp._id} className="relative group">
              <ExperienceCard experience={exp} />

              {/* Remove bookmark button — appears on hover */}
              <button
                onClick={() => removeBookmark(exp._id)}
                disabled={isRemoving}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 hover:text-red-500 hover:border-red-200 shadow-sm"
                title="Remove bookmark"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
