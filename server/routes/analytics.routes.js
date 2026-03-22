import { Router } from 'express'
import {
	getOverview,
	getSubmissionTrends,
	getCompanyStats,
	getTopicStats,
	getLeaderboard,
} from '../controllers/analytics.controller.js'
import { protect, restrictTo } from '../middleware/auth.middleware.js'
import { User } from '../models/index.js'
import { emailQueue } from '../queues/index.js'

const router = Router()

// Public unsubscribe link used from digest emails
router.get('/unsubscribe/:token', async (req, res) => {
	try {
		const userId = Buffer.from(req.params.token, 'base64url').toString('utf8')
		await User.findByIdAndUpdate(userId, { emailDigest: false })
		res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/unsubscribed`)
	} catch {
		res.status(400).send('Invalid unsubscribe link')
	}
})

router.use(protect, restrictTo('admin'))

router.get('/overview', getOverview)
router.get('/submissions', getSubmissionTrends)
router.get('/companies', getCompanyStats)
router.get('/topics', getTopicStats)
router.get('/leaderboard', getLeaderboard)

router.post('/trigger-digest', async (req, res, next) => {
	try {
		console.log('[API] Trigger digest request received')
		const job = await emailQueue.add('dispatch-weekly-digests', {})
		console.log('[API] Digest job added to queue:', job.id)
		res.status(200).json({ success: true, message: 'Digest dispatch triggered', jobId: job.id })
	} catch (err) {
		console.error('[API] Trigger digest error:', err)
		next(err)
	}
})

export default router
