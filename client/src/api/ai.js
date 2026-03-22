import api from './axios.js'

export const aiApi = {
  // POST /api/ai/qa — RAG Q&A pipeline
  ragQuery: (data) => api.post('/ai/qa', data),

  // POST /api/ai/similar — find similar questions
  getSimilarQuestions: (query) => api.post('/ai/similar', { query }),

  // GET /api/ai/similar/:experienceId — get semantically similar experiences
  getSimilar: (experienceId, params = {}) =>
    api.get(`/ai/similar/${experienceId}`, { params }),

  // POST /api/ai/autotag — auto-tag an experience
  autoTag: (text) => api.post('/ai/autotag', { text }),

  // POST /api/ai/difficulty — predict question difficulty with SHAP
  // Accepts: { company, round_type, topics, skip_rate, avg_time_seconds, self_rated_difficulty, attempt_count }
  // Returns: DifficultyResponse with difficulty (1-5), shap_values[], model_used, etc.
  predictDifficulty: (request) => api.post('/ai/difficulty', request),
}
