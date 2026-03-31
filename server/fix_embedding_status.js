import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

console.log('Connecting to MongoDB...')
await mongoose.connect(process.env.MONGODB_URI, { dbName: 'placement_archive' })
console.log('✅ Connected')

const result = await mongoose.connection.db.collection('experiences').updateMany(
	{},
	{ $set: { embeddingStatus: 'done', taggingStatus: 'done' } }
)

console.log(`✅ Updated ${result.modifiedCount} experiences to embeddingStatus: 'done'`)

const total = await mongoose.connection.db.collection('experiences').countDocuments()
const done = await mongoose.connection.db.collection('experiences').countDocuments({ embeddingStatus: 'done' })
console.log(`Total: ${total} | Done: ${done}`)

await mongoose.disconnect()
console.log('Done!')
process.exit(0)
