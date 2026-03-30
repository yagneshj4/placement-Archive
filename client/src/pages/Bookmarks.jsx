import { Link } from 'react-router-dom'
import { useBookmarks } from '../hooks/useBookmarks'
import ExperienceCard from '../components/ui/ExperienceCard'
import EmptyState from '../components/ui/EmptyState'
import { PageSkeleton } from '../components/ui/LoadingSkeleton'

export default function Bookmarks() {
  const { bookmarks, total, isLoading, isError, removeBookmark, isRemoving } = useBookmarks()

  if (isLoading)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <PageSkeleton count={3} />
      </div>
    )

  if (isError)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 w-full">
        <div className="bg-red-50 border border-red-200 text-red-700 font-bold text-sm rounded-2xl px-6 py-4 mb-6 shadow-sm text-center">
          Failed to load bookmarks. Please refresh.
        </div>
      </div>
    )

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative z-10 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">Saved experiences</h1>
          <p className="text-gray-500 font-bold text-sm">
            {total} {total === 1 ? 'experience' : 'experiences'} saved
          </p>
        </div>
        <Link to="/search" className="text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors">
          Browse more →
        </Link>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          }
          title="No saved experiences yet"
          description="Save experiences from the search page to quickly find them later."
          action={
            <Link
              to="/search"
              className="px-6 py-3.5 bg-gray-900 text-white rounded-xl text-[13px] font-black uppercase tracking-widest shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all inline-block mt-4"
            >
              Browse experiences
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {bookmarks.map((exp) => (
            <div key={exp._id} className="relative group">
              <ExperienceCard experience={exp} />

              {/* Remove bookmark button — appears on hover */}
              <button
                onClick={() => removeBookmark(exp._id)}
                disabled={isRemoving}
                className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 bg-white border border-gray-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-600 hover:border-red-200 shadow-md hover:shadow-lg hover:-translate-y-0.5"
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
