import { Experience, User, AnalyticsEvent } from '../models/index.js'
import { addEmbeddingJob, addAutoTagJob } from '../queues/index.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'
import { AppError } from '../middleware/error.middleware.js'
import { sanitizeText } from '../utils/sanitizer.js'

// GET /api/experiences
export const getExperiences = async (req, res, next) => {
	try {
		const { company, role, year, roundType, page = 1, limit = 10, sort = '-createdAt' } = req.query

		const filter = {}
		if (company) filter.company = new RegExp(company, 'i')
		if (role) filter.role = new RegExp(role, 'i')
		if (year) filter.year = Number(year)
		if (roundType) filter.roundType = roundType

		const skip = (Number(page) - 1) * Number(limit)

		const [experiences, total] = await Promise.all([
			Experience.find(filter) //
				.sort(sort)
				.skip(skip)
				.limit(Number(limit))
				.populate('submittedBy', 'name college'),
			Experience.countDocuments(filter),
		])

		sendSuccess(
			res,
			{
				experiences,
				pagination: {
					total,
					page: Number(page),
					pages: Math.ceil(total / Number(limit)),
					limit: Number(limit),
				},
			},
			'Experiences fetched',
		)
	} catch (err) {
		next(err)
	}
}

// GET /api/experiences/:id
export const getExperienceById = async (req, res, next) => {
	try {
		const experience = await Experience.findById(req.params.id) //
			.populate('submittedBy', 'name college')

		if (!experience) throw new AppError('Experience not found', 404)

		// Increment view count asynchronously
		experience.views += 1
		experience.save({ validateBeforeSave: false }).catch(() => {})

		// Log user view event when a logged-in user opens an experience
		if (req.user?.id) {
			AnalyticsEvent.create({
				userId: req.user.id,
				eventType: 'experience_view',
				targetId: experience._id,
				targetModel: 'Experience',
				payload: {
					company: experience.company,
					roundType: experience.roundType,
				},
				sessionId: req.headers['x-session-id'] || null,
				userAgent: req.headers['user-agent'] || '',
			}).catch(() => {})
		}

		sendSuccess(res, { experience }, 'Experience fetched')
	} catch (err) {
		next(err)
	}
}

// POST /api/experiences  ← THIS IS WHERE THE QUEUE IS TRIGGERED
export const createExperience = async (req, res, next) => {
	try {
		const {
			company,
			role,
			year,
			roundType,
			narrative,
			preparationTips,
			ctcOffered,
			offerReceived,
		} = req.body

		// 1. Save the experience to MongoDB immediately
		const experience = await Experience.create({
			company: sanitizeText(company),
			role: sanitizeText(role),
			year: Number(year),
			roundType,
			narrative: sanitizeText(narrative),
			preparationTips: sanitizeText(preparationTips || ''),
			ctcOffered: sanitizeText(ctcOffered || ''),
			offerReceived: offerReceived ?? null,
			submittedBy: req.user.id,
			embeddingStatus: 'pending', // starts as pending
		})

		// 2. Queue the embedding + auto-tagging jobs — non-blocking, API returns immediately
		const embeddingJobId = await addEmbeddingJob(experience._id, experience.narrative)
		const autoTagJobId = await addAutoTagJob(experience._id, experience.narrative)

		// 3. Increment contributor count
		// (fire and forget — don't await)
		User.findByIdAndUpdate(req.user.id, { $inc: { contributionCount: 1 } })
			.catch(() => {})

		// 4. Return success with job IDs so frontend can poll status
		sendSuccess(
			res,
			{
				experience,
				jobIds: { embeddingJobId, autoTagJobId },
				message: 'Experience saved. AI processing (embedding + auto-tagging) started in background.',
			},
			'Experience submitted successfully',
			201,
		)
	} catch (err) {
		next(err)
	}
}

// PUT /api/experiences/:id
export const updateExperience = async (req, res, next) => {
	try {
		const experience = await Experience.findById(req.params.id)
		if (!experience) throw new AppError('Experience not found', 404)

		// Only owner or admin can update
		if (
			experience.submittedBy.toString() !== req.user.id &&
			req.user.role !== 'admin'
		) {
			throw new AppError('Not authorised to update this experience', 403)
		}

		const {
			company,
			role,
			year,
			roundType,
			narrative,
			preparationTips,
			ctcOffered,
			offerReceived,
		} = req.body

		const updateData = {}
		if (company !== undefined) updateData.company = sanitizeText(company)
		if (role !== undefined) updateData.role = sanitizeText(role)
		if (year !== undefined) updateData.year = Number(year)
		if (roundType !== undefined) updateData.roundType = roundType
		if (narrative !== undefined) updateData.narrative = sanitizeText(narrative)
		if (preparationTips !== undefined) updateData.preparationTips = sanitizeText(preparationTips)
		if (ctcOffered !== undefined) updateData.ctcOffered = sanitizeText(ctcOffered)
		if (offerReceived !== undefined) updateData.offerReceived = offerReceived

		const updated = await Experience.findByIdAndUpdate(
			req.params.id,
			{ ...updateData, embeddingStatus: 'pending' }, // re-queue embedding
			{ new: true, runValidators: true },
		)

		// Re-queue embedding with updated text
		await addEmbeddingJob(updated._id, updated.narrative)

		sendSuccess(res, { experience: updated }, 'Experience updated')
	} catch (err) {
		next(err)
	}
}

// DELETE /api/experiences/:id
export const deleteExperience = async (req, res, next) => {
	try {
		const experience = await Experience.findById(req.params.id)
		if (!experience) throw new AppError('Experience not found', 404)

		if (
			experience.submittedBy.toString() !== req.user.id &&
			req.user.role !== 'admin'
		) {
			throw new AppError('Not authorised to delete this experience', 403)
		}

		await Experience.findByIdAndDelete(req.params.id)
		sendSuccess(res, {}, 'Experience deleted')
	} catch (err) {
		next(err)
	}
}

// PUT /api/experiences/:id/bookmark
export const bookmarkExperience = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id)
		const expId = req.params.id

		const isBookmarked = user.bookmarks.some((b) => b.toString() === expId)

		if (isBookmarked) {
			user.bookmarks = user.bookmarks.filter((b) => b.toString() !== expId)
		} else {
			user.bookmarks.push(expId)
		}
		await user.save({ validateBeforeSave: false })

		sendSuccess(
			res,
			{
				bookmarked: !isBookmarked,
				bookmarkCount: user.bookmarks.length,
			},
			isBookmarked ? 'Bookmark removed' : 'Bookmarked successfully',
		)
	} catch (err) {
		next(err)
	}
}

// GET /api/experiences/:id/status
// Returns the current embedding status of an experience
export const getEmbeddingStatus = async (req, res, next) => {
	try {
		const experience = await Experience.findById(req.params.id)
			.select(
				'embeddingStatus embeddingId extractedTags company role year',
			)

		if (!experience) throw new AppError('Experience not found', 404)

		const statusMessages = {
			pending: 'Queued for AI processing',
			processing: 'AI is analysing and embedding your experience',
			done: 'AI processing complete — experience is fully searchable',
			failed: 'AI processing failed — will be retried automatically',
		}

		sendSuccess(
			res,
			{
				experienceId: experience._id,
				status: experience.embeddingStatus,
				message: statusMessages[experience.embeddingStatus],
				isSearchable: experience.embeddingStatus === 'done',
				extractedTags:
					experience.embeddingStatus === 'done'
						? experience.extractedTags
						: null,
			},
			'Status fetched',
		)
	} catch (err) {
		next(err)
	}
}

// POST /api/experiences/recover
export const recoverFailedEmbeddings = async (req, res, next) => {
	try {
		// Find all experiences where either embeddingStatus or taggingStatus is 'failed'
		const failedExperiences = await Experience.find({
			$or: [
				{ embeddingStatus: 'failed' },
				{ taggingStatus: 'failed' },
			],
		})

		let reembeddedCount = 0
		let retaggedCount = 0

		for (const exp of failedExperiences) {
			let updated = false
			if (exp.embeddingStatus === 'failed') {
				exp.embeddingStatus = 'pending'
				await addEmbeddingJob(exp._id, exp.narrative)
				reembeddedCount++
				updated = true
			}
			if (exp.taggingStatus === 'failed') {
				exp.taggingStatus = 'pending'
				await addAutoTagJob(exp._id, exp.narrative)
				retaggedCount++
				updated = true
			}
			if (updated) {
				await exp.save()
			}
		}

		sendSuccess(
			res,
			{
				processed: failedExperiences.length,
				reembeddedCount,
				retaggedCount,
			},
			`Failed embedding recovery run complete. Re-queued ${reembeddedCount} embeddings and ${retaggedCount} taggings.`,
		)
	} catch (err) {
		next(err)
	}
}
