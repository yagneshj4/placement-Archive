import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import cookieParser from 'cookie-parser'
import routes from '../routes/index.js'
import { errorHandler } from '../middleware/error.middleware.js'
import './setup.js'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use('/api', routes)
app.use(errorHandler)

let accessToken = ''
const testUser = {
	name: 'Test Student',
	email: `test_${Date.now()}@vrsec.ac.in`,
	password: 'Test@1234',
}

describe('Auth endpoints', () => {
	test('POST /api/auth/register — creates new user', async () => {
		const res = await request(app).post('/api/auth/register').send(testUser)
		expect(res.status).toBe(201)
		expect(res.body.success).toBe(true)
		expect(res.body.data.user.email).toBe(testUser.email)
		expect(res.body.data.accessToken).toBeDefined()
		// passwordHash must never appear in response
		expect(res.body.data.user.passwordHash).toBeUndefined()
	})

	test('POST /api/auth/register — rejects duplicate email', async () => {
		const res = await request(app).post('/api/auth/register').send(testUser)
		expect(res.status).toBe(409)
		expect(res.body.success).toBe(false)
	})

	test('POST /api/auth/register — validation: missing name', async () => {
		const res = await request(app)
			.post('/api/auth/register')
			.send({ email: 'bad@test.com', password: 'pass123' })
		expect(res.status).toBe(400)
		expect(res.body.errors).toBeDefined()
	})

	test('POST /api/auth/login — returns token on valid credentials', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: testUser.email, password: testUser.password })
		expect(res.status).toBe(200)
		expect(res.body.data.accessToken).toBeDefined()
		accessToken = res.body.data.accessToken // save for subsequent tests
		// Check httpOnly cookie was set
		expect(res.headers['set-cookie']).toBeDefined()
	})

	test('POST /api/auth/login — rejects wrong password', async () => {
		const res = await request(app)
			.post('/api/auth/login')
			.send({ email: testUser.email, password: 'wrongpassword' })
		expect(res.status).toBe(401)
		// Must not reveal whether email exists
		expect(res.body.message).toMatch(/invalid|unauthorized/i)
	})

	test('GET /api/auth/me — returns user with valid token', async () => {
		const res = await request(app)
			.get('/api/auth/me')
			.set('Authorization', `Bearer ${accessToken}`)
		expect(res.status).toBe(200)
		expect(res.body.data.user.email).toBe(testUser.email)
	})

	test('GET /api/auth/me — rejects request with no token', async () => {
		const res = await request(app).get('/api/auth/me')
		expect(res.status).toBe(401)
	})

	test('POST /api/auth/logout — clears cookie', async () => {
		const res = await request(app)
			.post('/api/auth/logout')
			.set('Authorization', `Bearer ${accessToken}`)
		expect(res.status).toBe(200)
		expect(res.headers['set-cookie']).toBeDefined()
	})
})
