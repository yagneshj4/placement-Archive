export const errorHandler = (err, req, res, next) => {
	const statusCode = err.statusCode || 500
	const message = err.message || 'Internal Server Error'

	if (process.env.NODE_ENV === 'development') {
		console.error('Error:', err)
	}

	res.status(statusCode).json({
		success: false,
		message,
		...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
	})
}

// Custom error class for clean error throwing anywhere in the app
export class AppError extends Error {
	constructor(message, statusCode = 400) {
		super(message)
		this.statusCode = statusCode
		this.isOperational = true
	}
}
