import api from './axios.js'

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

  // GET /api/search/keyword — fallback regex search
  keywordSearch: (params = {}) => api.get('/search/keyword', { params }),
}
