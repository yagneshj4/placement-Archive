import { Router } from 'express'
import {
	createExperience,
	getExperiences,
	getExperienceById,
	updateExperience,
	deleteExperience,
	bookmarkExperience,
	getEmbeddingStatus,
	recoverFailedEmbeddings,
	upvoteExperience,
} from '../controllers/experience.controller.js'
import { optionalAuth, protect, restrictTo } from '../middleware/auth.middleware.js'
import { validate, createExperienceSchema, updateExperienceSchema } from '../middleware/validate.middleware.js'

const router = Router()

router.get('/', optionalAuth, getExperiences)
router.post('/recover', protect, restrictTo('admin'), recoverFailedEmbeddings)
router.get('/:id', optionalAuth, getExperienceById)
router.get('/:id/status', protect, getEmbeddingStatus)
router.post('/', protect, validate(createExperienceSchema), createExperience)
router.put('/:id', protect, validate(updateExperienceSchema), updateExperience)
router.delete('/:id', protect, deleteExperience)
router.put('/:id/bookmark', protect, bookmarkExperience)
router.put('/:id/upvote', protect, upvoteExperience)

export default router

