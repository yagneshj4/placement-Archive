import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
	{
		text: {
			type: String,
			required: [true, 'Question text is required'],
			trim: true,
			minlength: [10, 'Question must be at least 10 characters'],
			maxlength: [2000, 'Question cannot exceed 2000 characters'],
		},
		company: {
			type: String,
			trim: true,
			default: '',
			index: true,
		},
		year: {
			type: Number,
			min: 2018,
		},
		roundType: {
			type: String,
			enum: ['coding', 'technical', 'hr', 'system_design', 'managerial', 'aptitude', ''],
			default: '',
		},
		tags: {
			type: [String],
			default: [],
			index: true,
		},

		// AI difficulty prediction fields (XGBoost features)
		difficulty: {
			type: Number,
			min: 1,
			max: 5,
			default: null,
		},
		difficultyLabel: {
			type: String,
			enum: ['Easy', 'Medium', 'Hard', 'Expert', ''],
			default: '',
		},
		difficultyPredictedAt: {
			type: Date,
			default: null,
		},

		// Engagement signals (collected from AnalyticsEvents)
		viewCount: { type: Number, default: 0 },
		skipRate: { type: Number, min: 0, max: 1, default: 0 },
		avgTimeSeconds: { type: Number, default: 0 },
		selfRatedDifficulty: { type: Number, min: 1, max: 5, default: null },
		attemptCount: { type: Number, default: 0 },

		// Vector embedding (cosine similarity)
		embeddingId: {
			type: String,
			default: null,
		},
		embeddingStatus: {
			type: String,
			enum: ['pending', 'done', 'failed'],
			default: 'pending',
		},

		// Source and quality
		sourceExperience: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Experience',
			default: null,
		},
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		upvotes: { type: Number, default: 0 },
		isPublic: { type: Boolean, default: true },
	},
	{
		timestamps: true,
	},
)

questionSchema.index({ company: 1, tags: 1 })
questionSchema.index({ difficulty: 1 })
questionSchema.index({ embeddingStatus: 1 })
questionSchema.index({ text: 'text' }, { name: 'question_text_index' })

// Helper: map numeric difficulty to label
questionSchema.methods.setDifficultyLabel = function () {
	const map = { 1: 'Easy', 2: 'Easy', 3: 'Medium', 4: 'Hard', 5: 'Expert' }
	this.difficultyLabel = map[Math.round(this.difficulty)] || ''
}

export default mongoose.model('Question', questionSchema)
