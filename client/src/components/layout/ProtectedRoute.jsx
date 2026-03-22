import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// Redirects to /auth if user is not logged in
// Usage: <Route path="/submit" element={<ProtectedRoute><SubmitPage /></ProtectedRoute>} />
export default function ProtectedRoute({ children, adminOnly = false }) {
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
