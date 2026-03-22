import mongoose from 'mongoose'

const experienceSchema = new mongoose.Schema(
	{
		// Core metadata (used for filtering)
		company: {
			type: String,
			required: [true, 'Company name is required'],
			trim: true,
			index: true,
		},
		role: {
			type: String,
			required: [true, 'Role is required'],
			trim: true,
			index: true,
		},
		year: {
			type: Number,
			required: [true, 'Year is required'],
			min: [2018, 'Year must be 2018 or later'],
			max: [new Date().getFullYear() + 1, 'Year cannot be in the future'],
			index: true,
		},
		roundType: {
			type: String,
			required: [true, 'Round type is required'],
			enum: {
				values: ['coding', 'technical', 'hr', 'system_design', 'managerial', 'group_discussion', 'aptitude'],
				message: '{VALUE} is not a valid round type',
			},
			index: true,
		},
		ctcOffered: {
			type: String,
			trim: true,
			default: '',
		},
		offerReceived: {
			type: Boolean,
			default: null,
		},

		// The actual experience content
		narrative: {
			type: String,
			required: [true, 'Experience narrative is required'],
			trim: true,
			minlength: [100, 'Narrative must be at least 100 characters'],
			maxlength: [10000, 'Narrative cannot exceed 10,000 characters'],
		},
		preparationTips: {
			type: String,
			trim: true,
			default: '',
		},

		// AI/ML fields (populated by Phase 3 pipeline)
		extractedTags: {
			company: { type: String, default: null },
			role: { type: String, default: null },
			roundType: { type: String, default: null },
			roundTypeConfidence: { type: Number, default: 0, min: 0, max: 1 },
			topics: { type: [String], default: [] },
			keywords: { type: [String], default: [] },
			difficulty: { type: Number, min: 1, max: 5, default: null },
			modelUsed: { type: String, default: null },  // "full", "rules", "error"
			processingTimeMs: { type: Number, default: null },
			taggedAt: { type: Date, default: null },
			autoTagged: { type: Boolean, default: false },
		},
		embeddingId: {
			type: String,
			default: null,
			index: true,
		},
		embeddingStatus: {
			type: String,
			enum: ['pending', 'processing', 'done', 'failed'],
			default: 'pending',
		},
		taggingStatus: {
			type: String,
			enum: ['pending', 'processing', 'done', 'failed'],
			default: 'pending',
		},

		// Authorship and quality
		submittedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		upvotes: {
			type: Number,
			default: 0,
		},
		upvotedBy: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
		],
		isVerified: {
			type: Boolean,
			default: false,
		},
		views: {
			type: Number,
			default: 0,
		},
	},
	{
		timestamps: true,
	},
)

// Compound indexes for common filter combinations
experienceSchema.index({ company: 1, year: -1 })
experienceSchema.index({ company: 1, role: 1, year: -1 })
experienceSchema.index({ company: 1, roundType: 1, year: -1 })
experienceSchema.index({ embeddingStatus: 1 })
// submittedBy has index from field definition, removed duplicate

// Full-text index for keyword-search fallback
experienceSchema.index(
	{ narrative: 'text', preparationTips: 'text' },
	{ weights: { narrative: 10, preparationTips: 5 }, name: 'experience_text_index' },
)

// Virtual: check if embedding is ready
experienceSchema.virtual('isEmbedded').get(function () {
	return this.embeddingStatus === 'done' && this.embeddingId !== null
})

// Increment view count
experienceSchema.methods.incrementViews = function () {
	this.views += 1
	return this.save()
}

export default mongoose.model('Experience', experienceSchema)
