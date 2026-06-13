import api from './apiClient.js'

export const aiApi = {
  // POST /api/ai/qa — RAG Q&A pipeline
  ragQuery: (data) => api.post('/ai/qa', data),

  // GET /api/ai/similar/:experienceId — get semantically similar experiences
  getSimilar: (experienceId, params = {}) =>
    api.get(`/ai/similar/${experienceId}`, { params }),
}

export const analyticsApi = {
  overview: () => api.get('/analytics/overview'),
  submissions: (weeks = 12) => api.get(`/analytics/submissions?weeks=${weeks}`),
  companies: () => api.get('/analytics/companies'),
  topics: () => api.get('/analytics/topics'),
  leaderboard: () => api.get('/analytics/leaderboard'),
}

export const authApi = {
  register:       (data) => api.post('/auth/register', data),
  login:          (data) => api.post('/auth/login', data),
  google:         (data) => api.post('/auth/google', data),
  logout:         ()     => api.post('/auth/logout'),
  refresh:        ()     => api.post('/auth/refresh'),
  getBookmarks:   ()     => api.get('/auth/bookmarks'),
  removeBookmark: (id)   => api.delete(`/auth/bookmarks/${id}`),
}

export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (payload) => api.patch('/users/profile', payload),
  getGapAnalysis: () => api.get('/users/gap-analysis'),
}

export const experiencesApi = {
  // GET /api/experiences — list with filters + pagination
  getAll: (params = {}) => api.get('/experiences', { params }),

  // GET /api/experiences/:id — single experience
  getById: (id) => api.get(`/experiences/${id}`),

  // GET /api/experiences/:id/status — embedding job status
  getStatus: (id) => api.get(`/experiences/${id}/status`),

  // POST /api/experiences — submit new experience
  create: (data) => api.post('/experiences', data),

  // PUT /api/experiences/:id — update
  update: (id, data) => api.put(`/experiences/${id}`, data),

  // DELETE /api/experiences/:id
  remove: (id) => api.delete(`/experiences/${id}`),

  // PUT /api/experiences/:id/bookmark
  toggleBookmark: (id) => api.put(`/experiences/${id}/bookmark`),

  // GET /api/search — full-text + filter search
  search: (params = {}) => api.get('/search', { params }),
}
