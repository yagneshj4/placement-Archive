import { embeddingQueue } from '../queues/index.js'
import { Experience } from '../models/index.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../middleware/error.middleware.js'

// GET /api/experiences/:id/status
// Returns the current embedding status of an experience
export const getEmbeddingStatus = async (req, res, next) => {
	try {
		const experience = await Experience.findById(req.params.id) //
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
