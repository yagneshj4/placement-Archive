import dotenv from 'dotenv'
dotenv.config()
import { connectDB } from './config/db.js'
import { registerUser, loginUser } from './services/auth.service.js'
import mongoose from 'mongoose'

async function debug() {
  await connectDB()
  const email = `test_${Date.now()}@vrsec.ac.in`
  console.log('Registering user:', email)
  const regResult = await registerUser({
    name: 'Test Student',
    email,
    password: 'Test@1234',
  })
  console.log('Registration succeeded. user provider:', regResult.user.provider)

  console.log('Logging in...')
  try {
    const loginResult = await loginUser({
      email,
      password: 'Test@1234',
    })
    console.log('Login succeeded:', loginResult)
  } catch (err) {
    console.error('Login failed with error:', err)
  }

  await mongoose.connection.close()
}

debug()
