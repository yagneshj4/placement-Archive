import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { connectDB } from './config/db.js'
import { connectRedis } from './config/redis.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'
import { embeddingQueue, emailQueue, retrainingQueue } from './queues/index.js'

// Import workers — registers their process() handlers with Bull
import './workers/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Security and utility middleware
app.use(helmet({ contentSecurityPolicy: false }))  // false for Bull Board UI

// CORS: Allow localhost on dev ports (5173, 5174, 5175, 3000)
const allowedOrigins = [
	'http://localhost:5173',
	'http://localhost:5174',
	'http://localhost:5175',
	'http://localhost:3000',
	process.env.CLIENT_URL,
]
app.use(
	cors({
		origin: (origin, callback) => {
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, true)
			} else {
				callback(new Error('CORS not allowed'))
			}
		},
		credentials: true,
	}),
)
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Bull Board monitoring UI
const serverAdapter = new ExpressAdapter()
serverAdapter.setBasePath('/admin/queues')

createBullBoard({
	queues: [
		new BullAdapter(embeddingQueue),
		new BullAdapter(emailQueue),
		new BullAdapter(retrainingQueue),
	],
	serverAdapter,
})

// Mount Bull Board — accessible at /admin/queues
app.use('/admin/queues', serverAdapter.getRouter())

// Health check
app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		message: 'Placement Archive API running',
		queues: {
			embedding: 'active',
			email: 'active',
			retraining: 'active',
		},
	})
})

// All API routes
app.use('/api', routes)

// Global error handler (must be last)
app.use(errorHandler)

// Start server after DB connects
connectDB()
	.then(async () => {
		await connectRedis()

		app.listen(PORT, () => {
			console.log(`\n✅ Server running on http://localhost:${PORT}`)
			console.log(`📊 Bull Board:  http://localhost:${PORT}/admin/queues`)
			console.log(`🔥 Health:      http://localhost:${PORT}/health`)
			console.log(`📡 Environment: ${process.env.NODE_ENV}\n`)

			emailQueue
				.add(
					'dispatch-weekly-digests',
					{},
					{
						repeat: {
							cron: '0 8 * * 0',
							tz: 'Asia/Kolkata',
						},
						jobId: 'weekly-digest-cron',
					},
				)
				.then(() => {
					console.log('📅 Weekly digest cron registered (Sunday 8am IST)')
				})
				.catch((err) => {
					console.warn(`⚠️  Weekly digest cron not registered: ${err.message}`)
				})
		})
	})
	.catch((err) => {
		console.error('❌ Failed to connect to MongoDB:', err)
		process.exit(1)
	})
