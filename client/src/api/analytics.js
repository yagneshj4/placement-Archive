import api from './axios.js'

export const analyticsApi = {
	overview: () => api.get('/analytics/overview'),
	submissions: (weeks = 12) => api.get(`/analytics/submissions?weeks=${weeks}`),
	companies: () => api.get('/analytics/companies'),
	topics: () => api.get('/analytics/topics'),
	leaderboard: () => api.get('/analytics/leaderboard'),
	triggerDigest: () => api.post('/analytics/trigger-digest'),
}