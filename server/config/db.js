import mongoose from 'mongoose'

export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			dbName: 'placement_archive',
		})
		console.log(`✅ MongoDB connected: ${conn.connection.host}`)
	} catch (error) {
		console.error('❌ MongoDB connection error:', error.message)
		throw error
	}
}

// Graceful shutdown
process.on('SIGINT', async () => {
	await mongoose.connection.close()
	console.log('MongoDB connection closed (app termination)')
	process.exit(0)
})
