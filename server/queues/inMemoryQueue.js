// In-memory queue fallback for development when Redis is read-only
// Jobs are processed immediately without persistence

const jobHandlers = new Map()
const pendingJobs = []

export const createInMemoryQueue = (name) => {
  return {
    add: async (jobName, data, options = {}) => {
      // Create job object
      const jobId = `${Date.now()}-${Math.random().toString(36).slice(9)}`
      const job = {
        id: jobId,
        name: jobName,
        data,
        state: 'pending',
        attempts: 0,
        progress: 0,
        timestamp: new Date(),
      }

      pendingJobs.push(job)
      console.log(`📥 In-memory job queued: ${jobId} for ${jobName}`)

      // Process immediately if handler registered
      const handler = jobHandlers.get(`${name}:${jobName}`)
      if (handler) {
        try {
          job.state = 'active'
          await handler(job)
          job.state = 'completed'
          job.progress = 100
          console.log(`✅ In-memory job completed: ${jobId}`)
        } catch (err) {
          job.state = 'failed'
          job.error = err.message
          console.error(`❌ In-memory job failed: ${jobId} - ${err.message}`)
        }
      }

      return job
    },

    process: (jobName, handler) => {
      jobHandlers.set(`${name}:${jobName}`, handler)
    },

    on: (event, callback) => {
      // No-op for in-memory - events not tracked
    },

    close: async () => {
      // No-op for in-memory
    },
  }
}

export const getJobStatus = (queueName, jobId) => {
  return pendingJobs.find(j => j.id === jobId) || null
}

export const getPendingJobs = (queueName) => {
  return pendingJobs.filter(j => j.state === 'pending')
}

export default { createInMemoryQueue, getJobStatus, getPendingJobs }
