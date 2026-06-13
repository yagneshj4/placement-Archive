import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useBookmarks } from '../hooks/appHooks.js'

// ── NAVBAR ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { total: bookmarkCount } = useBookmarks()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const isActive = (path) =>
    location.pathname === path ? 'text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'

  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-bold text-gray-900 text-md tracking-tight flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center shadow-md">
            <span className="text-white text-xs">◆</span>
          </div>
          The Placement Archive
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-8 text-sm font-semibold">
          {user ? (
            <>
              <Link to="/home" className={isActive('/home')}>Experiences</Link>
              <Link to="/dashboard" className={isActive('/dashboard')}>My Prep</Link>
              <Link to="/search" className={isActive('/search')}>Search</Link>
              <Link to="/qa" className={isActive('/qa')}>Ask AI</Link>

              <Link to="/bookmarks" className={`relative ${isActive('/bookmarks')}`}>
                Saved
                {bookmarkCount > 0 && (
                  <span className="absolute -top-1.5 -right-3.5 bg-gray-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {bookmarkCount > 9 ? '9+' : bookmarkCount}
                  </span>
                )}
              </Link>

              {isAdmin && <Link to="/admin" className={isActive('/admin')}>Admin</Link>}
            </>
          ) : (
            <p className="text-gray-400 font-medium italic">Placement Archive Hub</p>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/submit"
                className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all text-center"
              >
                + Share
              </Link>
              <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                <Link 
                  to="/profile"
                  title="My Profile"
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-700 flex items-center justify-center font-bold text-xs shadow-sm hover:border-gray-900 transition-all"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-gray-900 text-xs font-bold transition-colors">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/auth" 
              className="px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold hover:shadow-lg transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

// ── PAGE WRAPPER ─────────────────────────────────────────────────────────────
export function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Universal Light Grid Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
      </div>
    </div>
  )
}

// ── PROTECTED ROUTE ──────────────────────────────────────────────────────────
// Redirects to /auth if user is not logged in
export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth()

  // Show nothing while checking auth on mount
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/home" replace />
  }

  return children
}
