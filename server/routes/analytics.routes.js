import { Router } from 'express'
import {
	getOverview,
	getSubmissionTrends,
	getCompanyStats,
	getTopicStats,
	getLeaderboard,
} from '../controllers/analytics.controller.js'
import { protect, restrictTo } from '../middleware/auth.middleware.js'

const router = Router()



router.use(protect, restrictTo('admin'))

router.get('/overview', getOverview)
router.get('/submissions', getSubmissionTrends)
router.get('/companies', getCompanyStats)
router.get('/topics', getTopicStats)
router.get('/leaderboard', getLeaderboard)



export default router
