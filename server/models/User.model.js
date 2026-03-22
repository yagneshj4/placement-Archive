import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
			minlength: [2, 'Name must be at least 2 characters'],
			maxlength: [50, 'Name cannot exceed 50 characters'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
		},
		passwordHash: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, 'Password must be at least 6 characters'],
			select: false,
		},
		role: {
			type: String,
			enum: ['student', 'admin'],
			default: 'student',
		},
		college: {
			type: String,
			trim: true,
			default: 'VR Siddhartha Engineering College',
		},
		graduationYear: {
			type: Number,
			min: 2020,
			max: 2035,
		},
		targetCompanies: {
			type: [String],
			default: [],
		},
		targetRole: {
			type: String,
			enum: ['SDE', 'Data Engineer', 'DevOps', 'ML Engineer', 'Product Manager', 'Other', ''],
			default: '',
		},
		bookmarks: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Experience',
			},
		],
		isVerified: {
			type: Boolean,
			default: false,
		},
		contributionCount: {
			type: Number,
			default: 0,
		},
		lastActive: {
			type: Date,
			default: Date.now,
		},
		emailDigest: {
			type: Boolean,
			default: true,
		},
	},
	{
		timestamps: true,
	},
)

// Index for leaderboard query (email has unique index from field definition)
userSchema.index({ college: 1, contributionCount: -1 })

// Hash password before save when passwordHash changes
userSchema.pre('save', async function () {
	if (!this.isModified('passwordHash')) return
	this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
})

// Compare candidate password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.passwordHash)
}

// Return a safe object without passwordHash
userSchema.methods.toSafeObject = function () {
	const obj = this.toObject()
	delete obj.passwordHash
	return obj
}

export default mongoose.model('User', userSchema)
