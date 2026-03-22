import { Router } from 'express'
import {
	ragQuery,
	getSimilarQuestions,
	autoTagExperience,
	predictDifficulty,
	getSimilarExperiencesById,
} from '../controllers/ai.controller.js'
import { protect, optionalAuth } from '../middleware/auth.middleware.js'
import { aiRateLimiter } from '../middleware/rateLimiter.middleware.js'

const router = Router()

// All AI routes are protected + rate limited (10 req/min per user)
router.post('/qa', protect, aiRateLimiter, ragQuery)
router.post('/similar', protect, aiRateLimiter, getSimilarQuestions)
router.post('/autotag', protect, autoTagExperience)
router.post('/difficulty', protect, predictDifficulty)
router.get('/similar/:experienceId', optionalAuth, getSimilarExperiencesById)

export default router
