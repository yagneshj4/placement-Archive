import { emailQueue } from '../queues/index.js'
import { sendDigestEmail } from '../services/email.service.js'
import { User, Experience, Question } from '../models/index.js'

emailQueue.process('weekly-digest', 2, async (job) => {
	const { userId, email, userName, targetCompanies = [] } = job.data
	console.log(`[📧 Digest] Processing digest for ${email}`)

	let questions = []

	if (targetCompanies.length > 0) {
		const companyRegex = targetCompanies
			.filter(Boolean)
			.map((company) => new RegExp(company, 'i'))

		const topExps = await Experience.find({ company: { $in: companyRegex } })
			.sort({ views: -1, upvotes: -1 })
			.limit(10)
			.lean()

		const expIds = topExps.map((exp) => exp._id)
		if (expIds.length > 0) {
			questions = await Question.find({ sourceExperience: { $in: expIds } })
				.sort({ upvotes: -1 })
				.limit(5)
				.lean()
		}
	}

	if (questions.length < 5) {
		const fallback = await Question.find({})
			.sort({ upvotes: -1, difficulty: -1 })
			.limit(5 - questions.length)
			.lean()

		questions = [...questions, ...fallback]
	}

	const now = new Date()
	const startOfYear = new Date(now.getFullYear(), 0, 1)
	const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7)

	const result = await sendDigestEmail({
		to: email,
		userId,
		userName: userName || 'Student',
		topQuestions: questions.map((q) => ({
			text: q.text,
			company: q.company,
			roundType: q.roundType,
			year: q.year,
			tags: q.tags?.slice(0, 3) || [],
			difficulty: q.difficulty,
		})),
		weekNumber,
	})

	console.log(`[📧 Digest] ${result.sent ? '✅ Sent' : '❌ Failed'} for ${email}`)
	return result
})

emailQueue.process('dispatch-weekly-digests', 1, async () => {
	console.log('[📧 Email Worker] Starting weekly digest dispatch')

	const users = await User.find(
		{ isVerified: true, emailDigest: { $ne: false } },
		{ _id: 1, email: 1, name: 1, targetCompanies: 1 },
	).lean()

	console.log(`[📧 Email Worker] Found ${users.length} verified users to email`)

	for (let index = 0; index < users.length; index += 1) {
		const user = users[index]
		await emailQueue.add(
			'weekly-digest',
			{
				userId: user._id.toString(),
				email: user.email,
				userName: user.name,
				targetCompanies: user.targetCompanies || [],
			},
			{ delay: index * 30000 },
		)
	}

	console.log(`[📧 Email Worker] ✅ Queued ${users.length} digest jobs`)
	return { dispatched: users.length }
})

console.log('Email worker started')
