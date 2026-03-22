import { describe, test, expect, beforeAll } from '@jest/globals'
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

let token = ''
let expId = ''

const validExp = {
	company: 'TestCo',
	role: 'SDE-1',
	year: 2024,
	roundType: 'technical',
	narrative:
		'The TestCo technical interview had two rounds. First round focused on dynamic programming problems — longest common subsequence and coin change. Second round was system design — design a URL shortener. Both rounds had strict time limits. The first round took 45 minutes and the second took 60 minutes. Overall experience was positive and I learned a lot from it.',
}

beforeAll(async () => {
	// Register + login to get token
	const reg = await request(app)
		.post('/api/auth/register')
		.send({
			name: 'Exp Tester',
			email: `exp_${Date.now()}@test.com`,
			password: 'Test@1234',
		})
	token = reg.body.data.accessToken
})

describe('Experience endpoints', () => {
	test('GET /api/experiences — returns experience list (public)', async () => {
		const res = await request(app).get('/api/experiences')
		expect(res.status).toBe(200)
		expect(Array.isArray(res.body.data.experiences)).toBe(true)
	})

	test('GET /api/experiences — supports filter by roundType', async () => {
		const res = await request(app).get('/api/experiences?roundType=technical')
		expect(res.status).toBe(200)
		if (res.body.data.experiences.length > 0) {
			res.body.data.experiences.forEach((exp) => {
				expect(exp.roundType).toBe('technical')
			})
		}
	})

	test(
		'POST /api/experiences — creates experience when authenticated',
		async () => {
			const res = await request(app)
				.post('/api/experiences')
				.set('Authorization', `Bearer ${token}`)
				.send(validExp)
			expect(res.status).toBe(201)
			expect(res.body.data.experience.company).toBe('TestCo')
			expId = res.body.data.experience._id
		},
		10000
	)

	test('POST /api/experiences — rejects unauthenticated request', async () => {
		const res = await request(app).post('/api/experiences').send(validExp)
		expect(res.status).toBe(401)
	})

	test('POST /api/experiences — rejects narrative under 100 chars', async () => {
		const res = await request(app)
			.post('/api/experiences')
			.set('Authorization', `Bearer ${token}`)
			.send({ ...validExp, narrative: 'Too short' })
		expect(res.status).toBe(400)
	})

	test('GET /api/experiences/:id — returns 404 for invalid id', async () => {
		const res = await request(app).get('/api/experiences/000000000000000000000000')
		expect(res.status).toBe(404)
	})

	test('GET /api/experiences — returns valid response', async () => {
		const res = await request(app).get('/api/experiences')
		expect(res.status).toBe(200)
		expect(res.body.data.experiences).toBeDefined()
	})
})
