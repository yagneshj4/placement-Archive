import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useBookmarks } from '../../hooks/useBookmarks'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { total: bookmarkCount } = useBookmarks()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const isActive = (path) =>
    location.pathname === path ? 'text-blue-700 font-medium' : 'text-gray-600 hover:text-gray-900'

  return (
    <nav className="border-b border-gray-200 bg-white sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-gray-900 text-sm tracking-tight">
          The Placement Archive
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className={isActive('/')}>
            Experiences
          </Link>
          <Link to="/dashboard" className={isActive('/dashboard')}>
            My Prep
          </Link>
          <Link to="/search" className={isActive('/search')}>
            Search
          </Link>
          <Link to="/qa" className={isActive('/qa')}>
            Ask AI
          </Link>

          {/* Bookmarks with count badge */}
          <Link to="/bookmarks" className={`relative ${isActive('/bookmarks')}`}>
            Saved
            {bookmarkCount > 0 && (
              <span className="absolute -top-1.5 -right-3.5 bg-blue-600 text-white text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {bookmarkCount > 9 ? '9+' : bookmarkCount}
              </span>
            )}
          </Link>

          {isAdmin && (
            <Link to="/admin" className={isActive('/admin')}>
              Admin
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            to="/submit"
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Share
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium text-xs">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 text-xs transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
