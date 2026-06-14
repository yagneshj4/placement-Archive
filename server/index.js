import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter'
import { ExpressAdapter } from '@bull-board/express'
import { connectDB } from './config/db.js'
import { connectRedis } from './config/redis.js'
import routes from './routes/index.js'
import { errorHandler } from './middleware/error.middleware.js'
import { embeddingQueue } from './queues/index.js'
import { protect, restrictTo } from './middleware/auth.middleware.js'
import { generalLimiter } from './middleware/rateLimiter.middleware.js'

// Import workers — registers their process() handlers with Bull
import './workers/index.js'

const app = express()
const PORT = process.env.PORT || 5000

// Security and utility middleware (CSP enabled globally)
app.use(helmet())

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
	],
	serverAdapter,
})

// Mount Bull Board — accessible at /admin/queues (restricted to admins, CSP disabled locally for UI layout)
app.use(
	'/admin/queues',
	protect,
	restrictTo('admin'),
	helmet({ contentSecurityPolicy: false }),
	serverAdapter.getRouter(),
)

// Health check
app.get('/health', (req, res) => {
	res.json({
		status: 'ok',
		message: 'Placement Archive API running',
		queues: {
			embedding: 'active',
		},
	})
})

// All API routes
app.use('/api', generalLimiter, routes)

// Global error handler (must be last)
app.use(errorHandler)

// Start server after DB connects
connectDB()
	.then(() => {
		// Connect Redis asynchronously (non-blocking)
		connectRedis()

		app.listen(PORT, () => {
			console.log(`\n✅ Server running on http://localhost:${PORT}`)
			console.log(`📊 Bull Board:  http://localhost:${PORT}/admin/queues`)
			console.log(`🔥 Health:      http://localhost:${PORT}/health`)
			console.log(`📡 Environment: ${process.env.NODE_ENV}\n`)
		})
	})
	.catch((err) => {
		console.error('❌ Failed to connect to MongoDB:', err)
		process.exit(1)
	})
