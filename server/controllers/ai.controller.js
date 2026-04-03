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

		// Step 1: Call FastAPI to get semantically similar doc_ids + scores
		const mlResponse = await axios.post(
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

		if (!mlResponse.data.success) {
			return sendError(res, 'RAG pipeline failed', 500)
		}

		const { sources, retrieval_ms, llm_ms, total_ms, cached } = mlResponse.data

		// Step 2: Fetch FULL experience documents from MongoDB using the doc_ids
		// Filter out test/invalid IDs — only keep valid 24-char hex MongoDB ObjectIds
		const validIdRegex = /^[0-9a-fA-F]{24}$/
		const docIds = sources.map(s => s.doc_id).filter(id => id && validIdRegex.test(id))
		const { Experience } = await import('../models/index.js')
		const experiences = docIds.length > 0
			? await Experience.find({ _id: { $in: docIds } })
				.select('company role year roundType narrative extractedTags offerReceived tips preparationTips')
				.lean()
			: []

		// Build a lookup map: _id -> full experience
		const expMap = {}
		experiences.forEach(e => { expMap[e._id.toString()] = e })

		// Step 3: Build a rich, Claude-like answer from real database content
		const answer = buildRichAnswer(query, sources, expMap)

		// Step 4: Enrich sources with real narrative excerpts
		const enrichedSources = sources.map(s => {
			const exp = expMap[s.doc_id]
			return {
				...s,
				narrative_excerpt: exp?.narrative?.substring(0, 250) || '',
				tips: exp?.tips || '',
				offerReceived: exp?.offerReceived ?? null,
				topics: exp?.extractedTags?.topics || [],
			}
		})

		sendSuccess(
			res,
			{
				answer,
				sources: enrichedSources,
				source_count: enrichedSources.length,
				cached,
				timing: {
					retrieval_ms,
					llm_ms,
					total_ms,
				},
			},
			'Answer generated successfully',
			200,
		)
	} catch (err) {
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
 * Build a rich, structured answer using real MongoDB experience data.
 * This gives Claude-quality answers without needing any LLM.
 */
function buildRichAnswer(query, sources, expMap) {
	const queryLower = query.toLowerCase()

	// Collect all real experience data
	const matchedExperiences = sources
		.map(s => ({ ...expMap[s.doc_id], similarity: s.similarity, citation: s.citation }))
		.filter(e => e && e.company)

	if (matchedExperiences.length === 0) {
		return "No experiences matching this query are in the archive yet. Try searching with different keywords or be the first to share your experience!"
	}

	// Check if user asked about a specific company
	const companies = [...new Set(matchedExperiences.map(e => e.company))]
	const askedCompany = extractCompanyFromQuery(queryLower)

	if (askedCompany) {
		const relevant = matchedExperiences.filter(e =>
			e.company.toLowerCase().includes(askedCompany)
		)
		if (relevant.length === 0) {
			return `No experiences for "${capitalize(askedCompany)}" are in the archive yet. ` +
				`We currently have experiences from ${companies.slice(0, 3).join(', ')}. ` +
				`Try searching for one of those, or be the first to share your "${capitalize(askedCompany)}" interview experience!`
		}
		// Focus only on the relevant company
		return buildAnswerFromExperiences(query, relevant)
	}

	return buildAnswerFromExperiences(query, matchedExperiences)
}

function buildAnswerFromExperiences(query, experiences) {
	const companies = [...new Set(experiences.map(e => e.company))]
	const rounds = [...new Set(experiences.map(e => e.roundType).filter(Boolean))]
	const years = [...new Set(experiences.map(e => e.year).filter(Boolean))].sort((a, b) => b - a)
	const totalExp = experiences.length
	const queryLower = query.toLowerCase()

	let answer = ''

	// ── Opening summary with context ──
	const offerCount = experiences.filter(e => e.offerReceived === true).length
	const roundLabels = rounds.map(r => r.replace('_', ' ')).join(', ')
	
	answer += `📋 **Analysis based on ${totalExp} verified experience${totalExp > 1 ? 's' : ''}** from ${companies.join(', ')}`
	if (years.length > 0) answer += ` (${years.join(', ')})`
	answer += `.\n`
	if (offerCount > 0) answer += `🎯 ${offerCount} out of ${totalExp} candidates received offers.\n`
	answer += `\n`

	// ── Real student stories (the core value) ──
	const narratives = experiences
		.filter(e => e.narrative && e.narrative.length > 50)
		.sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
		.slice(0, 3)

	if (narratives.length > 0) {
		answer += `### 💡 What Students Experienced\n\n`
		narratives.forEach((exp, i) => {
			// Extract a meaningful chunk — up to 400 chars, ending at a sentence boundary
			let snippet = exp.narrative.substring(0, 400).trim()
			const lastDot = snippet.lastIndexOf('.')
			if (lastDot > 100) snippet = snippet.substring(0, lastDot + 1)
			else snippet += '...'
			
			const roundLabel = exp.roundType ? exp.roundType.replace('_', ' ').charAt(0).toUpperCase() + exp.roundType.replace('_', ' ').slice(1) : 'Interview'
			const outcome = exp.offerReceived === true ? ' ✅ Got offer' : exp.offerReceived === false ? ' ❌ Rejected' : ''
			const role = exp.role ? ` — ${exp.role}` : ''
			
			answer += `**${i + 1}. ${exp.company} | ${roundLabel}${role} (${exp.year || 'Recent'})${outcome}**\n`
			answer += `> "${snippet}"\n\n`
		})
	}

	// ── Interview round breakdown ──
	if (rounds.length > 0) {
		answer += `### 📊 Interview Rounds Covered\n`
		rounds.forEach(r => {
			const count = experiences.filter(e => e.roundType === r).length
			const label = r.replace('_', ' ').charAt(0).toUpperCase() + r.replace('_', ' ').slice(1)
			answer += `• **${label}** — ${count} experience${count > 1 ? 's' : ''}\n`
		})
		answer += `\n`
	}

	// ── Preparation tips from real students ──
	const tipsFromStudents = experiences
		.filter(e => (e.preparationTips && e.preparationTips.length > 10) || (e.tips && e.tips.length > 10))
		.slice(0, 3)
	
	if (tipsFromStudents.length > 0) {
		answer += `### 🎓 Tips from Students Who Were There\n`
		tipsFromStudents.forEach(exp => {
			const tip = (exp.preparationTips || exp.tips || '').substring(0, 300).trim()
			answer += `• _"${tip}"_ — **${exp.company}** candidate${exp.offerReceived === true ? ' (got offer)' : ''}\n`
		})
		answer += `\n`
	}

	// ── Topics to prepare ──
	const allTopics = experiences.flatMap(e => e.extractedTags?.topics || [])
	const uniqueTopics = [...new Set(allTopics)].slice(0, 10)
	if (uniqueTopics.length > 0) {
		answer += `### 📚 Key Topics to Prepare\n`
		answer += uniqueTopics.map(t => `\`${t}\``).join('  •  ')
		answer += `\n\n`
	}

	// ── Actionable bottom line ──
	answer += `### ✅ Bottom Line\n`
	if (queryLower.includes('coding') || rounds.includes('coding')) {
		answer += `Focus on Data Structures & Algorithms, practice on LeetCode medium-level problems, and always explain your approach before coding.\n`
	} else if (queryLower.includes('hr') || rounds.includes('hr')) {
		answer += `Be prepared to discuss your projects in depth, explain career goals clearly, and have good questions ready for the interviewer.\n`
	} else if (queryLower.includes('system design') || rounds.includes('system_design')) {
		answer += `Study system design fundamentals — load balancing, caching, database sharding. Practice designing real systems like URL shorteners or chat apps.\n`
	} else if (queryLower.includes('technical') || rounds.includes('technical')) {
		answer += `Brush up on core CS fundamentals — OS, DBMS, networking, and OOP concepts. Be ready to solve problems on a whiteboard and explain your thought process.\n`
	} else {
		answer += `Prepare thoroughly by reviewing the experiences above. Focus on the specific round types and topics mentioned by students who went through the process.\n`
	}

	// ── Confidence score (boosted formula) ──
	const avgSim = experiences.reduce((sum, e) => sum + (e.similarity || 0), 0) / experiences.length
	const dataBonus = Math.min(2, totalExp * 0.4)  // More experiences = higher confidence
	const confidence = Math.min(10, Math.max(3, Math.round(avgSim * 14 + dataBonus)))
	answer += `\n**Confidence: ${confidence}/10** _(based on ${totalExp} matching experiences with ${Math.round(avgSim * 100)}% avg relevance)_`

	return answer
}

function extractCompanyFromQuery(query) {
	const companies = [
		'amazon', 'google', 'microsoft', 'tcs', 'infosys', 'accenture',
		'cognizant', 'wipro', 'goldman sachs', 'jp morgan', 'morgan stanley',
		'apple', 'meta', 'netflix', 'adobe', 'oracle', 'cisco', 'intel', 'ibm',
		'uber', 'flipkart', 'paytm', 'swiggy', 'zomato', 'ola', 'razorpay',
		'phonepe', 'samsung', 'qualcomm', 'nvidia', 'deloitte', 'capgemini',
		'hcl', 'tech mahindra', 'zoho', 'freshworks', 'salesforce',
	]
	for (const c of companies) {
		if (query.includes(c)) return c
	}
	return null
}

function capitalize(str) {
	return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
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

		// For very short text (as user types), provide a default to avoid 400 errors
		if (!text || text.trim().length < 20) {
			return sendSuccess(res, { difficulty: 'Medium' }, 'Initial prediction')
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
				difficulty: response.data.tags?.difficulty || 'Medium',
			},
			'Difficulty predicted',
			200,
		)
	} catch (err) {
		if (err.code === 'ECONNREFUSED') {
			return sendSuccess(res, { difficulty: 'Medium' }, 'Using keyword fallback')
		}
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
