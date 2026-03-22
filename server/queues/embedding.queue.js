import Bull from 'bull'
import { createInMemoryQueue } from './inMemoryQueue.js'

// Queue for processing new experience submissions:
// autotag with distilBERT + embed with sentence-transformers
let embeddingQueue

try {
  embeddingQueue = new Bull('embedding', {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
      attempts: 3,                    // retry failed jobs 3 times
      backoff: {
        type: 'exponential',
        delay: 1000,                  // 1s -> 4s -> 16s between retries
      },
      removeOnComplete: 50,           // keep last 50 completed jobs in Redis
      removeOnFail: 100,              // keep last 100 failed jobs for debugging
    },
  })
  // Test connection
  embeddingQueue.on('error', (err) => {
    if (err.message.includes('read-only')) {
      console.warn('⚠️  Redis is read-only, switching to in-memory queue...')
      embeddingQueue = createInMemoryQueue('embedding')
    }
  })
} catch (err) {
  console.warn(`⚠️  Redis connection failed (${err.message}), using in-memory queue`)
  embeddingQueue = createInMemoryQueue('embedding')
}

// Add a new embedding job
export const addEmbeddingJob = async (experienceId, narrativeText) => {
  try {
    const job = await embeddingQueue.add(
      'embed-experience',             // job name (for filtering in Bull Board)
      {
        experienceId: experienceId.toString(),
        narrativeText,
        addedAt: new Date().toISOString(),
      },
      {
        priority: 1,                  // normal priority
      }
    )
    console.log(`📥 Embedding job queued: ${job.id} for experience ${experienceId}`)
    return job.id
  } catch (err) {
    // If queue fails due to read-only Redis, still save experience
    console.warn(`⚠️  Queue unavailable (read-only Redis): ${err.message}`)
    console.log(`ℹ️  Experience saved but background processing skipped. Use a write-enabled Redis connection.`)
    return `fallback_${experienceId}`
  }
}

// Add a new auto-tagging job
export const addAutoTagJob = async (experienceId, narrativeText) => {
  try {
    const job = await embeddingQueue.add(
      'autotag-experience',           // job name (for filtering in Bull Board)
      {
        experienceId: experienceId.toString(),
        narrativeText,
        addedAt: new Date().toISOString(),
      },
      {
        priority: 2,                  // higher priority than embedding
      }
    )
    console.log(`📥 Auto-tag job queued: ${job.id} for experience ${experienceId}`)
    return job.id
  } catch (err) {
    console.warn(`⚠️  Queue unavailable (read-only Redis): ${err.message}`)
    return `fallback_${experienceId}`
  }
}

// Queue event listeners (for monitoring/debugging)
embeddingQueue.on('failed', (job, err) => {
  console.error(`❌ Embedding job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`)
})

embeddingQueue.on('stalled', (job) => {
  console.warn(`⚠️  Embedding job ${job.id} stalled - will be reprocessed`)
})

export { embeddingQueue }
