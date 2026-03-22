import jwt from 'jsonwebtoken'
import { User } from '../models/index.js'
import { AppError } from './error.middleware.js'

// protect - verify JWT and attach user to request
export const protect = async (req, res, next) => {
	try {
		// 1. Get token from Authorization header
		const authHeader = req.headers.authorization
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			throw new AppError('Not authorised - please login to continue', 401)
		}

		const token = authHeader.split(' ')[1]

		// 2. Verify token
		let decoded
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET)
		} catch (err) {
			if (err.name === 'TokenExpiredError') {
				throw new AppError('Your session has expired - please login again', 401)
			}
			throw new AppError('Invalid token - please login again', 401)
		}

		// 3. Check user still exists in DB
		const user = await User.findById(decoded.id).select('-passwordHash')
		if (!user) {
			throw new AppError('The user belonging to this token no longer exists', 401)
		}

		// 4. Attach user to request - available as req.user in all controllers
		req.user = {
			id: user._id.toString(),
			role: user.role,
			name: user.name,
			email: user.email,
			college: user.college,
		}

		next()
	} catch (err) {
		next(err)
	}
}

// restrictTo - role-based access control
// Usage: router.get('/admin-data', protect, restrictTo('admin'), controller)
export const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return next(new AppError('You do not have permission to perform this action', 403))
		}
		next()
	}
}

// optionalAuth - attach user if token present, continue if not
// Usage: router.get('/experiences', optionalAuth, getExperiences)
// Allows both logged-in and guest users to access the same route
export const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.split(' ')[1]
			const decoded = jwt.verify(token, process.env.JWT_SECRET)
			const user = await User.findById(decoded.id).select('-passwordHash')
			if (user) {
				req.user = { id: user._id.toString(), role: user.role, name: user.name }
			}
		}
	} catch {
		// Invalid token - continue as guest
	}
	next()
}
