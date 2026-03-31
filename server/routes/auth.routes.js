import { Router } from 'express'
import { register, login, googleAuth, refreshToken, logout, getMe, getBookmarks, removeBookmark } from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { authLimiter } from '../middleware/rateLimiter.middleware.js'
import { validate, registerSchema, loginSchema } from '../middleware/validate.middleware.js'

const router = Router()

// Public routes - with rate limiter on auth endpoints
router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/google', authLimiter, googleAuth)
router.post('/refresh', refreshToken)
router.post('/logout', logout)

// Protected routes
router.get('/me', protect, getMe)
router.get('/bookmarks', protect, getBookmarks)
router.delete('/bookmarks/:experienceId', protect, removeBookmark)

export default router
