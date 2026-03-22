import axios from 'axios'

// Base axios instance - all API calls use this
const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
	withCredentials: true,
	headers: { 'Content-Type': 'application/json' },
})

// Request interceptor - attach access token
api.interceptors.request.use(
	(config) => {
		const token = getAccessToken()
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	(error) => Promise.reject(error),
)

// Response interceptor - silent token refresh on 401
let isRefreshing = false
let failedQueue = []

const isAuthEndpoint = (url = '') => {
	const authPaths = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout']
	return authPaths.some((path) => url.includes(path))
}

const processQueue = (error, token = null) => {
	failedQueue.forEach((prom) => {
		if (error) prom.reject(error)
		else prom.resolve(token)
	})
	failedQueue = []
}

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config
		const status = error.response?.status

		if (
			status === 401
			&& originalRequest
			&& !originalRequest._retry
			&& !isAuthEndpoint(originalRequest.url)
			&& !!getAccessToken()
		) {
			if (isRefreshing) {
				// Queue this request until refresh completes
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject })
				})
					.then((token) => {
						originalRequest.headers = originalRequest.headers || {}
						originalRequest.headers.Authorization = `Bearer ${token}`
						return api(originalRequest)
					})
					.catch((err) => Promise.reject(err))
			}

			originalRequest._retry = true
			isRefreshing = true

			try {
				// Silent refresh - uses httpOnly cookie automatically
				const { data } = await axios.post(
					`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
					{},
					{ withCredentials: true },
				)
				const newToken = data.data.accessToken
				setAccessToken(newToken)
				processQueue(null, newToken)
				originalRequest.headers = originalRequest.headers || {}
				originalRequest.headers.Authorization = `Bearer ${newToken}`
				return api(originalRequest)
			} catch (refreshError) {
				processQueue(refreshError, null)
				setAccessToken(null)
				window.dispatchEvent(new CustomEvent('auth:logout'))
				return Promise.reject(refreshError)
			} finally {
				isRefreshing = false
			}
		}

		return Promise.reject(error)
	},
)

// In-memory token store (NOT localStorage)
let _accessToken = null
export const getAccessToken = () => _accessToken
export const setAccessToken = (token) => {
	_accessToken = token
}

export default api
