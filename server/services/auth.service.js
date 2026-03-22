import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { AppError } from '../middleware/error.middleware.js'

// Token generation
export const generateAccessToken = (userId, role) => {
	return jwt.sign(
		{ id: userId, role },
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
	)
}

export const generateRefreshToken = (userId) => {
	return jwt.sign(
		{ id: userId },
		process.env.JWT_REFRESH_SECRET,
		{ expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' },
	)
}

// Cookie helper
export const setRefreshTokenCookie = (res, refreshToken) => {
	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 7 * 24 * 60 * 60 * 1000,
	})
}

export const clearRefreshTokenCookie = (res) => {
	res.cookie('refreshToken', '', {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		expires: new Date(0),
	})
}

// Register
export const registerUser = async ({ name, email, password, college, graduationYear }) => {
	const existing = await User.findOne({ email: email.toLowerCase().trim() })
	if (existing) {
		throw new AppError('An account with this email already exists', 409)
	}

	const user = await User.create({
		name: name.trim(),
		email: email.toLowerCase().trim(),
		passwordHash: password,
		college: college || 'VR Siddhartha Engineering College',
		graduationYear: graduationYear || null,
		isVerified: true,
	})

	const accessToken = generateAccessToken(user._id, user.role)
	const refreshToken = generateRefreshToken(user._id)

	return { user: user.toSafeObject(), accessToken, refreshToken }
}

// Login
export const loginUser = async ({ email, password }) => {
	const user = await User.findOne({ email: email.toLowerCase().trim() })
		.select('+passwordHash')

	if (!user) {
		throw new AppError('Invalid email or password', 401)
	}

	const isMatch = await user.comparePassword(password)
	if (!isMatch) {
		throw new AppError('Invalid email or password', 401)
	}

	user.lastActive = new Date()
	await user.save({ validateBeforeSave: false })

	const accessToken = generateAccessToken(user._id, user.role)
	const refreshToken = generateRefreshToken(user._id)

	return { user: user.toSafeObject(), accessToken, refreshToken }
}

// Refresh access token
export const refreshAccessToken = async (refreshToken) => {
	if (!refreshToken) {
		throw new AppError('No refresh token provided', 401)
	}

	let decoded
	try {
		decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
	} catch (err) {
		if (err.name === 'TokenExpiredError') {
			throw new AppError('Refresh token expired - please login again', 401)
		}
		if (err.name === 'JsonWebTokenError') {
			throw new AppError('Invalid refresh token signature - please login again', 401)
		}
		throw new AppError('Invalid refresh token - please login again', 401)
	}

	const user = await User.findById(decoded.id)
	if (!user) {
		throw new AppError('User belonging to this token no longer exists', 401)
	}

	const newAccessToken = generateAccessToken(user._id, user.role)

	return { accessToken: newAccessToken, user: user.toSafeObject() }
}

// Get current user
export const getCurrentUser = async (userId) => {
	const user = await User.findById(userId)
	if (!user) {
		throw new AppError('User not found', 404)
	}
	return user.toSafeObject()
}
