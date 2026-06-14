import { Router } from 'express'
import { getProfile, updateProfile, getGapAnalysis } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { validate, updateProfileSchema } from '../middleware/validate.middleware.js'

const router = Router()

router.get('/profile', protect, getProfile)
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile)
router.get('/gap-analysis', protect, getGapAnalysis)

export default router