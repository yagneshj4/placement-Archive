import dotenv from 'dotenv'
import { connectDB } from '../config/db.js'
import mongoose from 'mongoose'

// Load env vars from .env file
dotenv.config()

// Connect to test DB before all tests
beforeAll(async () => {
	process.env.NODE_ENV = 'test'
	if (!process.env.MONGODB_URI) {
		throw new Error('MONGODB_URI not set in environment')
	}
	await connectDB()
})

// Clean up after all tests
afterAll(async () => {
	try {
		await mongoose.connection.dropDatabase()
		await mongoose.connection.close()
	} catch (err) {
		console.error('Cleanup error:', err.message)
	}
})
