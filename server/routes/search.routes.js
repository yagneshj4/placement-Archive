import { Router } from 'express'
import { semanticSearch, keywordSearch } from '../controllers/search.controller.js'
import { optionalAuth } from '../middleware/auth.middleware.js'

const router = Router()

// Main search — text + filters combined
router.get('/', optionalAuth, semanticSearch)

// Fallback regex search
router.get('/keyword', optionalAuth, keywordSearch)

export default router
