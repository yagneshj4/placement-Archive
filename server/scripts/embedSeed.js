// One-time script to embed all existing experiences in ChromaDB
// Run: node scripts/embedSeed.js
import dotenv from 'dotenv'
dotenv.config()

import axios from 'axios'
import { connectDB } from '../config/db.js'
import { Experience } from '../models/index.js'

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000'
const ML_KEY = process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key'

const mlClient = axios.create({
	baseURL: ML_URL,
	headers: { 'X-API-Key': ML_KEY, 'Content-Type': 'application/json' },
	timeout: 60000,
})

async function embedAllExperiences() {
	await connectDB()
	console.log('\n🌱 Embedding all seeded experiences into ChromaDB...\n')

	// Fetch all experiences that need embedding
	const experiences = await Experience.find({
		embeddingStatus: { $in: ['pending', 'failed'] }
	}).lean()

	console.log(`Found ${experiences.length} experiences to embed\n`)

	if (experiences.length === 0) {
		console.log('✅ All experiences already embedded!')
		process.exit(0)
	}

	// Prepare batch request
	const items = experiences.map(exp => ({
		text:     exp.narrative,
		doc_id:   exp._id.toString(),
		metadata: {
			company:   exp.company   || '',
			role:      exp.role      || '',
			year:      exp.year      || 0,
			roundType: exp.roundType || '',
		},
	}))

	// Call FastAPI batch embed endpoint
	console.log(`📡 Calling FastAPI /embed/batch with ${items.length} items...`)
	const { data } = await mlClient.post('/embed/batch', {
		items,
		collection: 'experiences',
	})

	console.log(`  ✅ FastAPI embedded ${data.embedded} experiences`)

	// Update MongoDB embeddingStatus for all successfully embedded experiences
	const ids = experiences.map(e => e._id)
	await Experience.updateMany(
		{ _id: { $in: ids } },
		{
			embeddingStatus: 'done',
		}
	)

	// Set embeddingId = _id string for each doc
	for (const exp of experiences) {
		await Experience.findByIdAndUpdate(exp._id, {
			embeddingId: exp._id.toString(),
			embeddingStatus: 'done',
		})
	}

	console.log(`  ✅ MongoDB updated — all ${experiences.length} experiences marked as done`)

	// AUTO-TAG EXPERIENCES
	console.log(`\n🏷️  Auto-tagging all ${experiences.length} experiences...`)
	for (const exp of experiences) {
		try {
			const { data } = await mlClient.post('/autotag', {
				text: exp.narrative,
				experience_id: exp._id.toString(),
			})

			if (data.success) {
				const { tags } = data
				await Experience.findByIdAndUpdate(exp._id, {
					extractedTags: {
						company: tags.company,
						role: tags.role,
						roundType: tags.roundType,
						roundTypeConfidence: tags.roundTypeConfidence,
						topics: tags.topics || [],
						difficulty: tags.difficulty || 3,
						keywords: tags.keywords || [],
						modelUsed: data.model_used,
						processingTimeMs: data.processing_time_ms,
						taggedAt: new Date(),
						autoTagged: true,
					},
					taggingStatus: 'done',
				})
				console.log(`  ✅ Tagged: ${exp.company} — ${exp.role}`)
			}
		} catch (err) {
			console.warn(`  ⚠️  Auto-tag failed for ${exp._id}: ${err.message}`)
			await Experience.findByIdAndUpdate(exp._id, { taggingStatus: 'failed' })
		}
	}

	console.log(`  ✅ Auto-tagging complete`)

	// Verify ChromaDB state
	const health = await mlClient.get('/health')
	console.log(`\n📊 ChromaDB state after seeding:`)
	console.log(`   experiences: ${health.data.collections.experiences} vectors`)
	console.log(`   questions:   ${health.data.collections.questions} vectors`)
	console.log(`\n✅ Seed embedding complete!\n`)
	process.exit(0)
}

embedAllExperiences().catch(err => {
	console.error('❌ Seed embedding failed:', err.message)
	process.exit(1)
})