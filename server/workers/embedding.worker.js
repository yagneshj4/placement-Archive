import { embeddingQueue } from '../queues/index.js'
import { Experience } from '../models/index.js'
import axios from 'axios'

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
const ML_KEY = process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key'

// Axios instance for ML service calls
const mlClient = axios.create({
	baseURL: ML_URL,
	headers: { 'X-API-Key': ML_KEY, 'Content-Type': 'application/json' },
	timeout: 30000,   // 30 second timeout (model inference can be slow)
})

embeddingQueue.process('embed-experience', 2, async (job) => {
	const { experienceId, narrativeText } = job.data
	console.log(`\n🔄 Processing embedding job ${job.id} for ${experienceId}`)

	try {
		// ── Step 1: Mark as processing ───────────────────────────
		await Experience.findByIdAndUpdate(experienceId, { embeddingStatus: 'processing' })
		await job.progress(10)

		// ── Step 2: Fetch experience metadata for ChromaDB ───────
		const exp = await Experience.findById(experienceId).lean()
		if (!exp) throw new Error(`Experience ${experienceId} not found in MongoDB`)

		// ── Step 3: Call FastAPI /embed ───────────────────────────
		console.log(`  📡 Calling FastAPI /embed for ${experienceId}`)
		const { data } = await mlClient.post('/embed', {
			text:       narrativeText,
			doc_id:     experienceId,
			collection: 'experiences',
			metadata: {
				company:   exp.company   || '',
				role:      exp.role      || '',
				year:      exp.year      || 0,
				roundType: exp.roundType || '',
				// Store key metadata in ChromaDB so we can filter during search
			},
		})
		await job.progress(80)

		// ── Step 4: Update MongoDB with real embedding ID ─────────
		await Experience.findByIdAndUpdate(experienceId, {
			embeddingId:     data.embedding_id,
			embeddingStatus: 'done',
		})
		await job.progress(100)

		console.log(`  ✅ Embedded ${experienceId} — ID: ${data.embedding_id} (dim: ${data.dimension})\n`)
		return { success: true, embeddingId: data.embedding_id }

	} catch (err) {
		console.error(`  ❌ Embedding job ${job.id} failed: ${err.message}`)

		// If ML service is down — mark as failed so it can be retried
		await Experience.findByIdAndUpdate(experienceId, { embeddingStatus: 'failed' })
		throw err   // re-throw so Bull retries
	}
})

// ════════════════════════════════════════════════════════════════
// AUTO-TAGGING JOB PROCESSOR
// ════════════════════════════════════════════════════════════════

embeddingQueue.process('autotag-experience', 4, async (job) => {
	const { experienceId, narrativeText } = job.data
	console.log(`\n🏷️  Processing auto-tag job ${job.id} for ${experienceId}`)

	try {
		// ── Step 1: Mark as processing ───────────────────────────
		await Experience.findByIdAndUpdate(experienceId, { taggingStatus: 'processing' })
		await job.progress(10)

		// ── Step 2: Call FastAPI /autotag ────────────────────────
		console.log(`  📡 Calling FastAPI /autotag for ${experienceId}`)
		const { data } = await mlClient.post('/autotag', {
			text:           narrativeText,
			experience_id:  experienceId,
		})
		await job.progress(80)

		// ── Step 3: Save extracted tags to MongoDB ─────────────────
		if (data.success) {
			const { tags } = data
			await Experience.findByIdAndUpdate(experienceId, {
				extractedTags: {
					company:                tags.company,
					role:                   tags.role,
					roundType:              tags.roundType,
					roundTypeConfidence:    tags.roundTypeConfidence,
					topics:                 tags.topics || [],
					difficulty:             tags.difficulty || 3,
					keywords:               tags.keywords || [],
					modelUsed:              data.model_used,
					processingTimeMs:       data.processing_time_ms,
					taggedAt:               new Date(),
				},
				taggingStatus: 'done',
			})
			await job.progress(100)

			console.log(`  ✅ Tagged ${experienceId}`)
			console.log(`     Company: ${tags.company}`)
			console.log(`     RoundType: ${tags.roundType} (${(tags.roundTypeConfidence * 100).toFixed(1)}%)`)
			console.log(`     Topics: ${tags.topics.join(', ') || 'None'}`)
			console.log(`     Difficulty: ${tags.difficulty}/5\n`)
			
			return { success: true, tags }
		} else {
			throw new Error(data.error || 'Auto-tagging failed')
		}

	} catch (err) {
		console.error(`  ❌ Auto-tag job ${job.id} failed: ${err.message}`)

		// Mark as failed so it can be retried
		await Experience.findByIdAndUpdate(experienceId, { taggingStatus: 'failed' })
		throw err   // re-throw so Bull retries
	}
})

console.log('🟢 Embedding worker started — connecting to FastAPI at', ML_URL)
