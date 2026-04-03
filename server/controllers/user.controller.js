import { User, Experience, Resource, AnalyticsEvent } from '../models/index.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { AppError } from '../middleware/error.middleware.js'

const TOPIC_DIFFICULTY = {
	DSA: 3.0,
	Graphs: 4.2,
	'Dynamic Programming': 4.3,
	'System Design': 4.0,
	'Distributed Systems': 4.5,
	LLD: 3.2,
	HLD: 4.0,
	Algorithms: 3.8,
	Multithreading: 4.0,
	Concurrency: 4.1,
	Java: 2.8,
	DBMS: 2.5,
	SQL: 2.3,
	OS: 2.8,
	Networking: 2.7,
	Arrays: 2.5,
	Strings: 2.3,
	'Binary Trees': 3.0,
	'Linked Lists': 2.8,
	Heaps: 3.5,
	Recursion: 3.2,
	Backtracking: 3.8,
	OOP: 2.5,
	'Design Patterns': 3.0,
	HR: 1.5,
	Behavioral: 1.5,
	Aptitude: 1.5,
}

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const getCompanyFilter = (targetCompanies = []) => {
	if (!Array.isArray(targetCompanies) || targetCompanies.length === 0) return {}
	return {
		$or: targetCompanies
			.filter(Boolean)
			.map((company) => ({
				company: { $regex: escapeRegex(company.trim()), $options: 'i' },
			})),
	}
}

export const getProfile = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id).select('-passwordHash')
		if (!user) throw new AppError('User not found', 404)

		sendSuccess(res, { user }, 'Profile fetched')
	} catch (err) {
		next(err)
	}
}

export const updateProfile = async (req, res, next) => {
	try {
		const { targetCompanies, targetRole, name, graduationYear } = req.body
		const updates = {}

		if (targetCompanies !== undefined) {
			updates.targetCompanies = Array.isArray(targetCompanies)
				? [...new Set(targetCompanies.map((c) => String(c).trim()).filter(Boolean))]
				: []
		}
		if (targetRole !== undefined) updates.targetRole = targetRole
		if (name !== undefined) updates.name = String(name).trim()
		if (graduationYear !== undefined && graduationYear !== '' && graduationYear !== null) {
			const year = Number(graduationYear)
			if (year > 0) updates.graduationYear = year
		}

		const user = await User.findByIdAndUpdate(req.user.id, updates, {
			returnDocument: 'after',
			runValidators: true,
		}).select('-passwordHash')

		if (!user) throw new AppError('User not found', 404)

		sendSuccess(res, { user }, 'Profile updated')
	} catch (err) {
		next(err)
	}
}

export const getGapAnalysis = async (req, res, next) => {
	try {
		const user = await User.findById(req.user.id)
			.populate('bookmarks', 'extractedTags company roundType')
			.select('targetCompanies targetRole bookmarks')

		if (!user) throw new AppError('User not found', 404)

		const targetCompanies = user.targetCompanies || []
		const targetRole = user.targetRole || ''
		const companyFilter = getCompanyFilter(targetCompanies)

		const companyTopics = await Experience.aggregate([
			{ $match: companyFilter },
			{ $unwind: '$extractedTags.topics' },
			{
				$group: {
					_id: '$extractedTags.topics',
					count: { $sum: 1 },
					companies: { $addToSet: '$company' },
					avgDifficulty: { $avg: '$extractedTags.difficulty' },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 25 },
		])

		const totalTargetExps = await Experience.countDocuments(companyFilter)

		const bookmarkTopics = new Set()
		;(user.bookmarks || []).forEach((exp) => {
			;(exp.extractedTags?.topics || []).forEach((t) => bookmarkTopics.add(t))
		})

		const viewedExpIds = await AnalyticsEvent.distinct('targetId', {
			userId: req.user.id,
			eventType: 'experience_view',
			targetModel: 'Experience',
		})

		const viewedTopics = new Set()
		if (viewedExpIds.length > 0) {
			const viewedExps = await Experience.find(
				{ _id: { $in: viewedExpIds.slice(0, 50) } },
				{ 'extractedTags.topics': 1 },
			).lean()
			viewedExps.forEach((e) => {
				;(e.extractedTags?.topics || []).forEach((t) => viewedTopics.add(t))
			})
		}

		const coveredTopics = new Set([...bookmarkTopics, ...viewedTopics])

		const gaps = companyTopics
			.map((ct) => {
				const topic = ct._id
				const frequency = totalTargetExps > 0 ? ct.count / totalTargetExps : 0
				const diffWeight = TOPIC_DIFFICULTY[topic] || 3.0
				const isCovered = coveredTopics.has(topic)

				const gapScore = isCovered ? 0 : frequency * (diffWeight / 5) * 100

				return {
					topic,
					frequency: Math.round(frequency * 100),
					diffWeight,
					isCovered,
					gapScore: Math.round(gapScore * 10) / 10,
					expCount: ct.count,
					companies: ct.companies.slice(0, 3),
					avgDifficulty: ct.avgDifficulty ? Math.round(ct.avgDifficulty * 10) / 10 : null,
				}
			})
			.sort((a, b) => b.gapScore - a.gapScore)

		const topGapTopics = gaps
			.filter((g) => !g.isCovered)
			.slice(0, 6)
			.map((g) => g.topic)

		const resourcesRaw = topGapTopics.length
			? await Resource.find(
					{ skill: { $in: topGapTopics }, isVerified: true },
					{ skill: 1, title: 1, type: 1, url: 1, platform: 1, difficulty: 1, upvotes: 1 },
				)
					.sort({ upvotes: -1 })
					.limit(30)
					.lean()
			: []

		const resourcesByTopic = {}
		resourcesRaw.forEach((resource) => {
			if (!resourcesByTopic[resource.skill]) resourcesByTopic[resource.skill] = []
			if (resourcesByTopic[resource.skill].length < 3) {
				resourcesByTopic[resource.skill].push(resource)
			}
		})

		const gapsWithResources = gaps.slice(0, 10).map((gap) => ({
			...gap,
			resources: resourcesByTopic[gap.topic] || [],
		}))

		const companyCoverage = await Promise.all(
			targetCompanies.map(async (company) => {
				const count = await Experience.countDocuments({
					company: { $regex: escapeRegex(company), $options: 'i' },
				})
				return { company, experienceCount: count }
			}),
		)

		const radarData = companyTopics.slice(0, 8).map((ct) => {
			const required = Math.round((totalTargetExps > 0 ? ct.count / totalTargetExps : 0) * 100)
			return {
				topic: ct._id,
				required,
				covered: coveredTopics.has(ct._id) ? required : 0,
			}
		})

		const denominator = Math.max(Math.min(companyTopics.length, 15), 1)
		const readinessScore = companyTopics.length > 0
			? Math.min(Math.round((coveredTopics.size / denominator) * 100), 100)
			: 0

		sendSuccess(
			res,
			{
				targetCompanies,
				targetRole,
				gaps: gapsWithResources,
				radarData,
				companyCoverage,
				coveredCount: coveredTopics.size,
				totalTopics: companyTopics.length,
				readinessScore,
			},
			'Gap analysis computed',
		)
	} catch (err) {
		next(err)
	}
}