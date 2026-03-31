import {
	registerUser,
	loginUser,
	refreshAccessToken,
	getCurrentUser,
	setRefreshTokenCookie,
	clearRefreshTokenCookie,
	loginWithGoogle
} from '../services/auth.service.js'
import { sendSuccess, sendError } from '../utils/apiResponse.js'

// POST /api/auth/register
export const register = async (req, res, next) => {
	try {
		const { name, email, password, college, graduationYear } = req.body
		const { user, accessToken, refreshToken } = await registerUser({
			name, email, password, college, graduationYear,
		})

		// Set refresh token as httpOnly cookie
		setRefreshTokenCookie(res, refreshToken)

		sendSuccess(res, { user, accessToken }, 'Account created successfully', 201)
	} catch (err) {
		next(err)
	}
}

// POST /api/auth/login
export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body
		const { user, accessToken, refreshToken } = await loginUser({ email, password })

		setRefreshTokenCookie(res, refreshToken)

		sendSuccess(res, { user, accessToken }, 'Login successful')
	} catch (err) {
		next(err)
	}
}

// POST /api/auth/google
export const googleAuth = async (req, res, next) => {
	try {
		const { idToken } = req.body
		const { user, accessToken, refreshToken } = await loginWithGoogle({ idToken })

		setRefreshTokenCookie(res, refreshToken)

		sendSuccess(res, { user, accessToken }, 'Google login successful')
	} catch (err) {
		next(err)
	}
}

// POST /api/auth/refresh
export const refreshToken = async (req, res, next) => {
	try {
		// Primary source: httpOnly cookie. Fallbacks are useful for manual testing tools.
		const authHeader = req.headers.authorization
		const bearerToken = authHeader && authHeader.startsWith('Bearer ')
			? authHeader.split(' ')[1]
			: null
		const token = req.cookies?.refreshToken || bearerToken || req.body?.refreshToken
		const { accessToken, user } = await refreshAccessToken(token)

		sendSuccess(res, { accessToken, user }, 'Token refreshed')
	} catch (err) {
		if (err.statusCode === 401) {
			clearRefreshTokenCookie(res)
		}
		next(err)
	}
}

// POST /api/auth/logout
export const logout = async (req, res, next) => {
	try {
		clearRefreshTokenCookie(res)
		sendSuccess(res, {}, 'Logged out successfully')
	} catch (err) {
		next(err)
	}
}

// GET /api/auth/me  (protected)
export const getMe = async (req, res, next) => {
	try {
		// req.user is set by protect middleware
		const user = await getCurrentUser(req.user.id)
		sendSuccess(res, { user }, 'Current user fetched')
	} catch (err) {
		next(err)
	}
}

// GET /api/auth/bookmarks  (protected)
export const getBookmarks = async (req, res, next) => {
	try {
		const { User } = await import('../models/index.js')
		const user = await User.findById(req.user.id)
			.populate({
				path: 'bookmarks',
				select: 'company role year roundType narrative preparationTips extractedTags embeddingStatus offerReceived ctcOffered upvotes views submittedBy createdAt isVerified',
				populate: { path: 'submittedBy', select: 'name college' },
				options: { sort: { createdAt: -1 } },
			})

		if (!user) {
			return sendError(res, 'User not found', 404)
		}

		sendSuccess(res, {
			bookmarks: user.bookmarks,
			total: user.bookmarks.length,
		}, 'Bookmarks fetched')
	} catch (err) { next(err) }
}

// DELETE /api/auth/bookmarks/:experienceId  (protected)
export const removeBookmark = async (req, res, next) => {
	try {
		const { User } = await import('../models/index.js')
		const user = await User.findById(req.user.id)
		user.bookmarks = user.bookmarks.filter(
			b => b.toString() !== req.params.experienceId
		)
		await user.save({ validateBeforeSave: false })
		sendSuccess(res, { total: user.bookmarks.length }, 'Bookmark removed')
	} catch (err) { next(err) }
}
