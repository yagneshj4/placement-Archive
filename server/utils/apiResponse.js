// Every API response uses these helpers — consistent format across all routes

export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200) => {
	return res.status(statusCode).json({
		success: true,
		message,
		data,
	})
}

export const sendError = (res, message = 'Something went wrong', statusCode = 400, errors = null) => {
	return res.status(statusCode).json({
		success: false,
		message,
		...(errors && { errors }),
	})
}

// Usage in any controller:
// sendSuccess(res, { user }, 'Login successful')
// sendError(res, 'Invalid credentials', 401)
