import api from './axios.js'

export const usersApi = {
	getProfile: () => api.get('/users/profile'),
	updateProfile: (payload) => api.patch('/users/profile', payload),
	getGapAnalysis: () => api.get('/users/gap-analysis'),
}