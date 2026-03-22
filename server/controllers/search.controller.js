import axios from 'axios'
import { Experience } from '../models/index.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8001'
const ML_KEY = process.env.ML_SERVICE_API_KEY || 'ml-service-dev-key'

const mlClient = axios.create({
  baseURL: ML_URL,
  headers: { 'X-API-Key': ML_KEY, 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── GET /api/search ─────────────────────────────────────────────
// Hybrid: semantic primary (ChromaDB) + keyword fallback (MongoDB text index)
export const semanticSearch = async (req, res, next) => {
  try {
    const {
      q,
      company, roundType, year, offerReceived,
      page = 1, limit = 10,
      sort = 'relevance',
    } = req.query

    const hasQuery = q && q.trim().length >= 2
    const skip     = (Number(page) - 1) * Number(limit)

    // ── Path A: Semantic search (query string present) ──────────
    if (hasQuery) {
      let semanticDocIds = []
      let similarityMap  = {}
      let searchType     = 'keyword'

      // 1. Ask FastAPI for semantic similarity scores
      try {
        const { data } = await mlClient.post('/search/hybrid', {
          query:          q.trim(),
          collection:     'experiences',
          n_results:      50,          // fetch more than we need for post-filtering
          min_similarity: 0.25,        // generous threshold
        })

        if (data.results && data.results.length > 0) {
          semanticDocIds = data.results.map(r => r.doc_id)
          data.results.forEach(r => {
            similarityMap[r.doc_id] = r.similarity
          })
          searchType = data.search_type
        }
      } catch (mlErr) {
        // ML service down — degrade gracefully to keyword search
        console.warn('ML service unavailable — falling back to keyword search:', mlErr.message)
      }

      // 2. Build MongoDB query
      let mongoFilter = {}

      if (semanticDocIds.length > 0) {
        // Restrict to semantically similar documents
        const { mongoose } = await import('mongoose')
        mongoFilter._id = { $in: semanticDocIds }
      } else {
        // Fallback: MongoDB text search
        if (hasQuery) mongoFilter.$text = { $search: q.trim() }
      }

      // Apply metadata filters on top
      if (company)   mongoFilter.company   = new RegExp(company.trim(), 'i')
      if (roundType) mongoFilter.roundType = roundType
      if (year)      mongoFilter.year      = Number(year)
      if (offerReceived === 'true')  mongoFilter.offerReceived = true
      if (offerReceived === 'false') mongoFilter.offerReceived = false

      // 3. Fetch matching MongoDB documents
      const [experiences, total] = await Promise.all([
        Experience.find(mongoFilter)
          .populate('submittedBy', 'name college')
          .lean(),
        Experience.countDocuments(mongoFilter),
      ])

      // 4. Sort by semantic similarity score if available
      let sorted = experiences
      if (Object.keys(similarityMap).length > 0 && sort === 'relevance') {
        sorted = experiences.sort((a, b) => {
          const scoreA = similarityMap[a._id.toString()] || 0
          const scoreB = similarityMap[b._id.toString()] || 0
          return scoreB - scoreA
        })
      }

      // 5. Paginate after sorting (semantic sort requires in-memory sort first)
      const paginated = sorted.slice(skip, skip + Number(limit))

      // 6. Attach similarity score to each experience for UI display
      const enriched = paginated.map(exp => ({
        ...exp,
        _similarityScore: similarityMap[exp._id.toString()] || null,
      }))

      // 7. Compute filter aggregations for sidebar (page 1 only)
      let filterCounts = null
      if (Number(page) === 1) {
        const [companyCounts, roundCounts] = await Promise.all([
          Experience.aggregate([
            { $group: { _id: '$company', count: { $sum: 1 } } },
            { $sort: { count: -1 } }, { $limit: 15 },
          ]),
          Experience.aggregate([
            { $group: { _id: '$roundType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
        ])
        filterCounts = {
          companies:  companyCounts.map(c => ({ name: c._id, count: c.count })),
          roundTypes: roundCounts.map(r  => ({ name: r._id, count: r.count })),
        }
      }

      return sendSuccess(res, {
        experiences: enriched,
        searchType,
        query: q,
        filterCounts,
        pagination: {
          total,
          page:  Number(page),
          pages: Math.ceil(total / Number(limit)),
          limit: Number(limit),
        },
      }, enriched.length ? 'Results found' : 'No results found')
    }

    // ── Path B: Browse mode (no query string) ──────────────────
    // Pure MongoDB filter + sort — used for browsing by company/year/roundType
    const filter = {}
    if (company)   filter.company   = new RegExp(company.trim(), 'i')
    if (roundType) filter.roundType = roundType
    if (year)      filter.year      = Number(year)
    if (offerReceived === 'true')  filter.offerReceived = true
    if (offerReceived === 'false') filter.offerReceived = false

    const sortObj = sort === 'upvotes' ? { upvotes: -1 } : { createdAt: -1 }

    const [experiences, total] = await Promise.all([
      Experience.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .populate('submittedBy', 'name college')
        .lean(),
      Experience.countDocuments(filter),
    ])

    // Filter counts for sidebar
    const [companyCounts, roundCounts] = await Promise.all([
      Experience.aggregate([
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 15 },
      ]),
      Experience.aggregate([
        { $group: { _id: '$roundType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ])

    return sendSuccess(res, {
      experiences,
      searchType: 'browse',
      query: '',
      filterCounts: {
        companies:  companyCounts.map(c => ({ name: c._id, count: c.count })),
        roundTypes: roundCounts.map(r  => ({ name: r._id, count: r.count })),
      },
      pagination: {
        total,
        page:  Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    }, 'Experiences fetched')

  } catch (err) { next(err) }
}

// GET /api/search/keyword?q=arrays  — simple keyword fallback (no scoring)
export const keywordSearch = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query
    if (!q || !q.trim()) {
      return sendError(res, 'Query parameter q is required', 400)
    }

    const regex = new RegExp(q.trim(), 'i')
    const filter = {
      $or: [
        { narrative:       { $regex: regex } },
        { preparationTips: { $regex: regex } },
        { company:         { $regex: regex } },
        { 'extractedTags.keywords': { $regex: regex } },
      ],
    }

    const skip = (Number(page) - 1) * Number(limit)
    const [experiences, total] = await Promise.all([
      Experience.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
        .populate('submittedBy', 'name college'),
      Experience.countDocuments(filter),
    ])

    sendSuccess(res, {
      experiences,
      pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)), limit: Number(limit) },
    }, 'Keyword results fetched')

  } catch (err) { next(err) }
}
