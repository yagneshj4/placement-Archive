import { describe, test, expect } from '@jest/globals'
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

describe('Search endpoints', () => {
	test('GET /api/search — returns results for valid query', async () => {
		const res = await request(app).get('/api/search?q=system+design')
		expect(res.status).toBe(200)
		expect(res.body.data.experiences).toBeDefined()
		expect(res.body.data.pagination).toBeDefined()
		// searchType could be semantic, keyword, browse, or fallback_empty_collection
		expect(res.body.data.searchType).toBeDefined()
	})

	test('GET /api/search — browse mode (no query) returns all', async () => {
		const res = await request(app).get('/api/search')
		expect(res.status).toBe(200)
		expect(res.body.data.searchType).toBe('browse')
	})

	test('GET /api/search — filter by company', async () => {
		const res = await request(app).get('/api/search?company=Amazon')
		expect(res.status).toBe(200)
		res.body.data.experiences.forEach((exp) => {
			expect(exp.company.toLowerCase()).toMatch(/amazon/i)
		})
	})

	test('GET /api/search — supports pagination', async () => {
		const res = await request(app).get('/api/search?page=1&limit=10')
		expect(res.status).toBe(200)
		expect(res.body.data.pagination.limit).toBe(10)
	})

	test('GET /api/search/keyword — returns regex results', async () => {
		const res = await request(app).get('/api/search/keyword?q=DSA')
		expect(res.status).toBe(200)
		expect(Array.isArray(res.body.data.experiences)).toBe(true)
	})

	test('GET /api/search/keyword — returns 400 without q param', async () => {
		const res = await request(app).get('/api/search/keyword')
		expect(res.status).toBe(400)
	})

	test('GET /api/search — filter by roundType', async () => {
		const res = await request(app).get('/api/search?roundType=technical')
		expect(res.status).toBe(200)
		if (res.body.data.experiences.length > 0) {
			res.body.data.experiences.forEach((exp) => {
				expect(exp.roundType).toBe('technical')
			})
		}
	})

	test('GET /api/search — filter by year', async () => {
		const res = await request(app).get('/api/search?year=2024')
		expect(res.status).toBe(200)
		if (res.body.data.experiences.length > 0) {
			res.body.data.experiences.forEach((exp) => {
				expect(exp.year).toBe(2024)
			})
		}
	})
})
