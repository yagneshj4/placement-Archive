import { Router } from 'express'
import { semanticSearch } from '../controllers/search.controller.js'
import { optionalAuth } from '../middleware/auth.middleware.js'

const router = Router()

// Main search — text + filters combined
router.get('/', optionalAuth, semanticSearch)

export default router
