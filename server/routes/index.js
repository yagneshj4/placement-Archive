import { Router } from 'express'
import authRoutes from './auth.routes.js'
import experienceRoutes from './experience.routes.js'
import searchRoutes from './search.routes.js'
import aiRoutes from './ai.routes.js'
import analyticsRoutes from './analytics.routes.js'
import userRoutes from './user.routes.js'

const router = Router()

// All routes are prefixed with /api (set in index.js)
// So /api/auth/login, /api/experiences, /api/search, etc.

router.use('/auth', authRoutes)
router.use('/experiences', experienceRoutes)
router.use('/search', searchRoutes)
router.use('/ai', aiRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/users', userRoutes)

export default router
