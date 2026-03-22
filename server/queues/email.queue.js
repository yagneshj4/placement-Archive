import Bull from 'bull'
import { createInMemoryQueue } from './inMemoryQueue.js'

let emailQueue

try {
  emailQueue = new Bull('email', {
    redis: process.env.REDIS_URL,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 5000 },
      removeOnComplete: 20,
      removeOnFail: 50,
    },
  })
  emailQueue.on('error', (err) => {
    if (err.message.includes('read-only')) {
      console.warn('⚠️  Redis is read-only, switching to in-memory queue...')
      emailQueue = createInMemoryQueue('email')
    }
  })
} catch (err) {
  console.warn(`⚠️  Redis connection failed (${err.message}), using in-memory queue`)
  emailQueue = createInMemoryQueue('email')
}

// Add weekly digest email job
export const addEmailJob = async (userId, email, topQuestions) => {
  const job = await emailQueue.add(
    'weekly-digest',
    { userId: userId.toString(), email, topQuestions },
    { priority: 2 }
  )
  return job.id
}

emailQueue.on('failed', (job, err) => {
  console.error(`❌ Email job ${job.id} failed: ${err.message}`)
})

export { emailQueue }
