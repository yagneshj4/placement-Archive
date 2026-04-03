import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { User } from '../models/index.js'

async function createUser() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error('MONGODB_URI not found in .env')
    
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')

    const existing = await User.findOne({ email: 'student@vrsec.ac.in' })
    if (existing) {
      console.log('User already exists: student@vrsec.ac.in')
      process.exit(0)
    }

    const newUser = await User.create({
      name: 'Sample Student',
      email: 'student@vrsec.ac.in',
      passwordHash: 'Student@123',
      role: 'student',
      college: 'VR Siddhartha Engineering College',
      graduationYear: 2024,
      isVerified: true
    })

    console.log('User created successfully:')
    console.log(`Email: ${newUser.email}`)
    console.log(`Password: Student@123`)
    
    process.exit(0)
  } catch (err) {
    console.error('Error creating user:', err.message)
    process.exit(1)
  }
}

createUser()
