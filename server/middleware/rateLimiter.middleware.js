import rateLimit from 'express-rate-limit'

// General API rate limiter
export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: { success: false, message: 'Too many requests, please try again later.' },
	standardHeaders: true,
	legacyHeaders: false,
})

// Strict limiter for AI endpoints (expensive LLM calls)
export const aiRateLimiter = rateLimit({
	windowMs: 1 * 60 * 1000,
	max: 10,
	message: { success: false, message: 'AI request limit reached. Wait 1 minute.' },
	standardHeaders: true,
	legacyHeaders: false,
})

// Auth limiter (prevents brute force on login)
export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
})
