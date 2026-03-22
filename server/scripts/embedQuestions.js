import dotenv from 'dotenv'
dotenv.config({ path: '../.env' })

import axios from 'axios'
import { connectDB } from '../config/db.js'
import { Question } from '../models/index.js'

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001'
const ML_KEY = process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key'
const mlClient = axios.create({
  baseURL: ML_URL,
  headers: { 'X-API-Key': ML_KEY, 'Content-Type': 'application/json' },
  timeout: 60000,
})

async function embedAllQuestions() {
  await connectDB()
  console.log('\n🌱 Embedding questions into ChromaDB...\n')

  const questions = await Question.find({
    embeddingStatus: { $in: ['pending', 'failed'] }
  }).lean()

  console.log(`Found ${questions.length} questions to embed`)
  if (questions.length === 0) {
    console.log('✅ All questions already embedded!')
    process.exit(0)
  }

  const items = questions.map(q => ({
    text:     q.text,
    doc_id:   q._id.toString(),
    metadata: {
      company:    q.company    || '',
      tags:       (q.tags     || []).join(','),
      roundType:  q.roundType  || '',
      year:       q.year       || 0,
      difficulty: q.difficulty || 0,
      question_preview: q.text.slice(0, 300),
    },
  }))

  const { data } = await mlClient.post('/embed/batch', {
    items,
    collection: 'questions',
  })
  console.log(`✅ Embedded ${data.embedded} questions into ChromaDB`)

  // Update MongoDB embeddingStatus
  for (const q of questions) {
    await Question.findByIdAndUpdate(q._id, {
      embeddingId:     q._id.toString(),
      embeddingStatus: 'done',
    })
  }

  const health = await mlClient.get('/health')
  console.log(`\n📊 ChromaDB state:`)
  console.log(`   experiences: ${health.data.collections.experiences} vectors`)
  console.log(`   questions:   ${health.data.collections.questions} vectors`)
  console.log('\n✅ Question embedding complete!')
  process.exit(0)
}

embedAllQuestions().catch(err => {
  console.error('❌ Failed:', err.message)
  process.exit(1)
})
