import Bull from 'bull'
import { createInMemoryQueue } from './inMemoryQueue.js'

let retrainingQueue

try {
  retrainingQueue = new Bull('retraining', {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
      attempts: 1,                    // retraining should not silently retry
      removeOnComplete: 5,
      removeOnFail: 10,
    },
  })
  retrainingQueue.on('error', (err) => {
    if (err.message.includes('read-only')) {
      console.warn('⚠️  Redis is read-only, switching to in-memory queue...')
      retrainingQueue = createInMemoryQueue('retraining')
    }
  })
} catch (err) {
  console.warn(`⚠️  Redis connection failed (${err.message}), using in-memory queue`)
  retrainingQueue = createInMemoryQueue('retraining')
}

// Add model retraining job
export const addRetrainingJob = async (modelType = 'difficulty') => {
  const job = await retrainingQueue.add(
    'retrain-model',
    { modelType, triggeredAt: new Date().toISOString() },
    { priority: 3 }
  )
  console.log(`🔁 Retraining job queued: ${job.id} for model: ${modelType}`)
  return job.id
}

retrainingQueue.on('failed', (job, err) => {
  console.error(`❌ Retraining job ${job.id} failed: ${err.message}`)
})

export { retrainingQueue }
