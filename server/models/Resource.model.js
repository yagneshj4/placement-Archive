import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema(
	{
		skill: {
			type: String,
			required: [true, 'Skill tag is required'],
			trim: true,
			index: true,
		},
		title: {
			type: String,
			required: [true, 'Resource title is required'],
			trim: true,
			maxlength: [200, 'Title too long'],
		},
		type: {
			type: String,
			required: true,
			enum: {
				values: ['video', 'article', 'course', 'documentation', 'practice', 'book'],
				message: '{VALUE} is not a valid resource type',
			},
		},
		url: {
			type: String,
			required: [true, 'URL is required'],
			trim: true,
		},
		platform: {
			type: String,
			trim: true,
			default: '',
		},
		duration: {
			type: String,
			default: '',
		},
		difficulty: {
			type: Number,
			min: 1,
			max: 3,
			default: 2,
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
		addedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			default: null,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		tags: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
	},
)

resourceSchema.index({ skill: 1, difficulty: 1 })
resourceSchema.index({ skill: 1, upvotes: -1 })
resourceSchema.index({ type: 1 })

export default mongoose.model('Resource', resourceSchema)
