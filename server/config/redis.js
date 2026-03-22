import { createClient } from 'redis'

let client = null

export const connectRedis = async () => {
  try {
    client = createClient({ url: process.env.REDIS_URL })

    client.on('error', (err) => {
      console.error('Redis error:', err.message)
    })

    await client.connect()
    console.log('✅ Redis connected (Upstash)')
    return client
  } catch (err) {
    console.error('❌ Redis connection failed:', err.message)
    // Redis failure is non-fatal — app still works, just no job queue
    return null
  }
}

export const getRedisClient = () => client

export default { connectRedis, getRedisClient }
