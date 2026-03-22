import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Landing          from './pages/Landing'
import Dashboard        from './pages/Dashboard'
import GapDashboard     from './pages/GapDashboard'
import Auth             from './pages/Auth'
import SubmitExperience from './pages/SubmitExperience'
import SearchResults    from './pages/SearchResults'
import ExperienceDetail from './pages/ExperienceDetail'
import Bookmarks        from './pages/Bookmarks'
import QandA            from './pages/QandA'
import AdminAnalytics   from './pages/AdminAnalytics'
import Unsubscribed     from './pages/Unsubscribed'
import NotFound         from './pages/NotFound'
import ProtectedRoute   from './components/layout/ProtectedRoute'
import PageWrapper      from './components/layout/PageWrapper'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/auth" element={user ? <Navigate to="/home" replace /> : <Auth />} />

        {/* Public landing — 3D hero for guests, redirect to experience feed if logged in */}
        <Route
          path="/"
          element={
            user
              ? <Navigate to="/home" replace />
              : <Landing />
          }
        />

        {/* Public — no login needed */}
        <Route path="/experiences/:id" element={<PageWrapper><ExperienceDetail /></PageWrapper>} />

        {/* Protected — login required */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <GapDashboard />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <SearchResults />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <SubmitExperience />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookmarks"
          element={
            <ProtectedRoute>
              <PageWrapper>
                <Bookmarks />
              </PageWrapper>
            </ProtectedRoute>
          }
        />
        <Route
          path="/qa"
          element={
            <ProtectedRoute>
              <QandA />
            </ProtectedRoute>
          }
        />

        {/* Admin only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <PageWrapper>
                <AdminAnalytics />
              </PageWrapper>
            </ProtectedRoute>
          }
        />

        <Route path="/unsubscribed" element={<PageWrapper><Unsubscribed /></PageWrapper>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
