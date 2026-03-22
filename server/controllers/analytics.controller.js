import { Experience, User, Question } from '../models/index.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const getOverview = async (req, res, next) => {
	try {
		const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

		const [
			totalExperiences,
			totalUsers,
			totalQuestions,
			totalEmbedded,
			recentExperiences,
			recentUsers,
		] = await Promise.all([
			Experience.countDocuments(),
			User.countDocuments(),
			Question.countDocuments(),
			Experience.countDocuments({ embeddingStatus: 'done' }),
			Experience.countDocuments({ createdAt: { $gte: weekAgo } }),
			User.countDocuments({ createdAt: { $gte: weekAgo } }),
		])

		sendSuccess(
			res,
			{
				totalExperiences,
				totalUsers,
				totalQuestions,
				embeddingCoverage:
					totalExperiences > 0 ? Math.round((totalEmbedded / totalExperiences) * 100) : 0,
				recentExperiences,
				recentUsers,
			},
			'Overview fetched',
		)
	} catch (err) {
		next(err)
	}
}

export const getSubmissionTrends = async (req, res, next) => {
	try {
		const weeks = Number(req.query.weeks || 12)
		const since = new Date()
		since.setDate(since.getDate() - weeks * 7)

		const trends = await Experience.aggregate([
			{ $match: { createdAt: { $gte: since } } },
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						week: { $week: '$createdAt' },
					},
					count: { $sum: 1 },
					companies: { $addToSet: '$company' },
				},
			},
			{ $sort: { '_id.year': 1, '_id.week': 1 } },
		])

		sendSuccess(res, { trends, weeks }, 'Trends fetched')
	} catch (err) {
		next(err)
	}
}

export const getCompanyStats = async (req, res, next) => {
	try {
		const companies = await Experience.aggregate([
			{
				$group: {
					_id: '$company',
					count: { $sum: 1 },
					roundTypes: { $addToSet: '$roundType' },
					avgDifficulty: { $avg: '$extractedTags.difficulty' },
					offerRate: {
						$avg: {
							$cond: [{ $eq: ['$offerReceived', true] }, 1, 0],
						},
					},
					latestYear: { $max: '$year' },
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 20 },
			{
				$project: {
					_id: 0,
					company: '$_id',
					count: 1,
					roundTypes: 1,
					avgDifficulty: { $round: ['$avgDifficulty', 1] },
					offerRate: { $round: ['$offerRate', 2] },
					latestYear: 1,
				},
			},
		])

		sendSuccess(res, { companies }, 'Company stats fetched')
	} catch (err) {
		next(err)
	}
}

export const getTopicStats = async (req, res, next) => {
	try {
		const topics = await Experience.aggregate([
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
			{
				$project: {
					_id: 0,
					topic: '$_id',
					count: 1,
					companyCount: { $size: '$companies' },
					avgDifficulty: { $round: ['$avgDifficulty', 1] },
				},
			},
		])

		sendSuccess(res, { topics }, 'Topic stats fetched')
	} catch (err) {
		next(err)
	}
}

export const getLeaderboard = async (req, res, next) => {
	try {
		const leaderboard = await User.find(
			{ contributionCount: { $gt: 0 } },
			{ name: 1, college: 1, contributionCount: 1, graduationYear: 1 },
		)
			.sort({ contributionCount: -1 })
			.limit(10)
			.lean()

		sendSuccess(res, { leaderboard }, 'Leaderboard fetched')
	} catch (err) {
		next(err)
	}
}
