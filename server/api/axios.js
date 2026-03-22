import axios from 'axios'

/**
 * Axios instance for making HTTP requests from the Node.js backend.
 * 
 * This is used for:
 * - Calling the FastAPI ML service (endpoints for embedding, search, auto-tagging, RAG)
 * - Any external APIs the backend needs to communicate with
 */

const instance = axios.create({
  timeout: 30000, // 30-second timeout for ML service calls
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for logging
instance.interceptors.request.use(
  config => {
    console.log(`[axios] ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  error => {
    console.error('[axios] Request error:', error.message)
    return Promise.reject(error)
  }
)

// Add response interceptor for error handling
instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error(`[axios] Response error: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      console.error('[axios] No response received:', error.message)
    } else {
      console.error('[axios] Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default instance
