import axios from '../api/axios.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'

/**
 * Answer a placement interview question using RAG + Gemini API.
 *
 * Request body:
 *   query: string — student's question (e.g. "What does Amazon ask in interviews?")
 *   filters?: {company?, year?, roundType?} — optional metadata filters
 *   n_results?: integer 1-20 — how many experiences to retrieve (default 5)
 *   use_cache?: boolean — use Redis cache (default true)
 *
 * Response:
 *   answer: string — Gemini-generated answer grounded in experiences
 *   sources: [{doc_id, citation, similarity, company, role, year}] — retrieved experiences
 *   source_count: integer
 *   cached: boolean
 *   retrieval_ms, llm_ms, total_ms: timing metrics
 */
export const ragQuery = async (req, res, next) => {
	try {
		const { query, filters = {}, n_results = 5, use_cache = true } = req.body

		// Validate input
		if (!query || typeof query !== 'string' || query.trim().length < 5) {
			return sendError(
				res,
				'Invalid query — must be at least 5 characters',
				400,
			)
		}

		// Call FastAPI RAG pipeline
		const response = await axios.post(
			`${ML_SERVICE_URL}/rag`,
			{
				query: query.trim(),
				filters,
				n_results,
				use_cache,
			},
			{
				headers: {
					'x-api-key': process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key',
				},
			},
		)

		if (!response.data.success) {
			return sendError(res, 'RAG pipeline failed', 500)
		}

		// Return the full response with timing metrics
		sendSuccess(
			res,
			{
				answer: response.data.answer,
				sources: response.data.sources,
				source_count: response.data.source_count,
				cached: response.data.cached,
				timing: {
					retrieval_ms: response.data.retrieval_ms,
					llm_ms: response.data.llm_ms,
					total_ms: response.data.total_ms,
				},
			},
			'Answer generated successfully',
			200,
		)
	} catch (err) {
		// Handle ML service errors with detail when available
		if (err.response?.status >= 400) {
			const detail = err.response?.data?.detail
			return sendError(
				res,
				detail
					? `ML service error — ${detail}`
					: 'ML service error — failed to process the request',
				err.response.status,
			)
		}
		next(err)
	}
}

/**
 * Find similar questions from the archive.
 *
 * Request: { query: string }
 * Response: { questions: [{doc_id, company, role, question_text, match_score}] }
 */
export const getSimilarQuestions = async (req, res, next) => {
	try {
		const { query } = req.body

		if (!query || query.trim().length < 3) {
			return sendError(res, 'Query must be at least 3 characters', 400)
		}

		// Use semantic search endpoint to find similar experiences
		const response = await axios.post(
			`${ML_SERVICE_URL}/search`,
			{
				query: query.trim(),
				n_results: 5,
			},
			{
				headers: {
					'x-api-key': process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key',
				},
			},
		)

		if (!response.data.success) {
			return sendError(res, 'Search failed', 500)
		}

		// Transform results into question format
		const questions = response.data.results.map(r => ({
			doc_id: r.doc_id,
			company: r.metadata.company,
			role: r.metadata.role,
			round_type: r.metadata.roundType,
			match_score: r.similarity,
			excerpt: r.metadata.narrative_preview?.substring(0, 200) || '',
		}))

		sendSuccess(res, { questions }, 'Similar questions found', 200)
	} catch (err) {
		next(err)
	}
}

/**
 * Trigger auto-tagging for an experience (called when user submits).
 *
 * Request: { experience_id: string, text: string }
 * Response: { tags: {company, role, roundType, topics, keywords, difficulty} }
 */
export const autoTagExperience = async (req, res, next) => {
	try {
		const { experience_id, text } = req.body

		if (!experience_id || !text) {
			return sendError(res, 'Missing experience_id or text', 400)
		}

		// Call FastAPI auto-tag endpoint
		const response = await axios.post(
			`${ML_SERVICE_URL}/autotag`,
			{ text },
			{
				headers: {
					'x-api-key': process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key',
				},
			},
		)

		if (!response.data.success) {
			return sendError(res, 'Auto-tagging failed', 500)
		}

		sendSuccess(
			res,
			{
				experience_id,
				tags: response.data.tags,
				model_used: response.data.model_used || 'distilBERT',
			},
			'Tags extracted successfully',
			200,
		)
	} catch (err) {
		next(err)
	}
}

/**
 * Predict difficulty level for an experience.
 *
 * Request: { text: string }
 * Response: { difficulty: "Easy" | "Medium" | "Hard" | "Very Hard" }
 */
export const predictDifficulty = async (req, res, next) => {
	try {
		const { text } = req.body

		if (!text || text.trim().length < 20) {
			return sendError(res, 'Text must be at least 20 characters', 400)
		}

		// Call FastAPI auto-tag endpoint which includes difficulty prediction
		const response = await axios.post(
			`${ML_SERVICE_URL}/autotag`,
			{ text },
			{
				headers: {
					'x-api-key': process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key',
				},
			},
		)

		if (!response.data.success) {
			return sendError(res, 'Difficulty prediction failed', 500)
		}

		sendSuccess(
			res,
			{
				difficulty: response.data.tags?.difficulty || 'Unknown',
			},
			'Difficulty predicted',
			200,
		)
	} catch (err) {
		next(err)
	}
}

/**
 * Get semantically similar experiences for a given experience.
 *
 * Used by: SimilarExperiences panel on the detail page
 * Retrieves experiences based on vector similarity to the source experience's narrative.
 *
 * Query params:
 *   n_results: integer (default 4) — how many to return
 *   exclude_same_company: boolean (default false) — filter out same company
 *
 * Response:
 *   similar: [{_id, company, role, year, narrative, tags, similarity}]
 *   sourceCompany: string
 *   total: integer
 */
export const getSimilarExperiencesById = async (req, res, next) => {
	try {
		const { experienceId } = req.params
		const { n_results = 4, exclude_same_company = false } = req.query

		const { Experience } = await import('../models/index.js')
		const experience = await Experience.findById(experienceId).lean()
		if (!experience) {
			return sendError(res, 'Experience not found', 404)
		}

		// If not yet embedded — return empty (still processing)
		if (experience.embeddingStatus !== 'done') {
			return sendSuccess(res, {
				similar: [],
				reason: 'Experience not yet embedded',
			}, 'Not ready')
		}

		// Call FastAPI hybrid search endpoint with the experience's narrative
		const response = await axios.post(
			`${ML_SERVICE_URL}/search/hybrid`,
			{
				query:          experience.narrative.slice(0, 500),  // use first 500 chars
				collection:     'experiences',
				n_results:      Number(n_results) + 2,  // fetch extra to exclude self
				min_similarity: 0.4,                    // higher threshold for "similar"
			},
			{
				headers: {
					'x-api-key': process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key',
				},
			},
		)

		let results = (response.data.results || [])
			.filter(r => r.doc_id !== experienceId)  // remove self

		if (exclude_same_company === 'true' && experience.company) {
			results = results.filter(r =>
				!r.metadata.company ||
				r.metadata.company.toLowerCase() !== experience.company.toLowerCase()
			)
		}

		// Limit to requested count
		results = results.slice(0, Number(n_results))

		// Fetch full MongoDB documents for the similar experience IDs
		const similarIds = results.map(r => r.doc_id)
		const similar = await Experience.find({ _id: { $in: similarIds } })
			.select('company role year roundType narrative extractedTags offerReceived upvotes views submittedBy')
			.populate('submittedBy', 'name')
			.lean()

		// Preserve ChromaDB ranking order + attach similarity score
		const similarityMap = {}
		results.forEach(r => { similarityMap[r.doc_id] = r.similarity })

		const ranked = similarIds
			.map(id => similar.find(e => e._id.toString() === id))
			.filter(Boolean)
			.map(e => ({ ...e, _similarityScore: similarityMap[e._id.toString()] || 0 }))

		sendSuccess(res, {
			similar: ranked,
			sourceCompany: experience.company,
			total: ranked.length,
		}, 'Similar experiences fetched', 200)

	} catch (err) {
		if (err.code === 'ECONNREFUSED') {
			return sendError(res, 'ML service is not running', 503)
		}
		next(err)
	}
}
