import Joi from 'joi'
import { sendError } from '../utils/apiResponse.js'

// Generic validation middleware factory
// Usage: router.post('/register', validate(registerSchema), register)
export const validate = (schema) => (req, res, next) => {
	const { error } = schema.validate(req.body, { abortEarly: false })
	if (error) {
		const messages = error.details.map(d => d.message.replace(/"/g, ''))
		return sendError(res, 'Validation failed', 400, messages)
	}
	next()
}

// Auth validation schemas
export const registerSchema = Joi.object({
	name: Joi.string().min(2).max(50).required()
		.messages({ 'string.min': 'Name must be at least 2 characters' }),
	email: Joi.string().email().required()
		.messages({ 'string.email': 'Please provide a valid email address' }),
	password: Joi.string().min(6).required()
		.messages({ 'string.min': 'Password must be at least 6 characters' }),
	college: Joi.string().optional().allow(''),
	graduationYear: Joi.number().min(2020).max(2035).optional(),
})

export const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string().required(),
})

export const updateProfileSchema = Joi.object({
	name: Joi.string().min(2).max(50).optional(),
	targetCompanies: Joi.array().items(Joi.string()).optional(),
	targetRole: Joi.string().optional().allow(''),
	college: Joi.string().optional().allow(''),
	graduationYear: Joi.number().min(2020).max(2035).optional(),
})

// ── Experience validation schemas ───────────────────────────────
export const createExperienceSchema = Joi.object({
	company: Joi.string().min(2).max(100).required()
		.messages({ 'string.empty': 'Company name is required' }),

	role: Joi.string().min(2).max(100).required()
		.messages({ 'string.empty': 'Role is required' }),

	year: Joi.number().min(2018).max(new Date().getFullYear() + 1).required()
		.messages({ 'number.base': 'Year must be a number' }),

	roundType: Joi.string()
		.valid('coding', 'technical', 'hr', 'system_design', 'managerial', 'group_discussion', 'aptitude')
		.required()
		.messages({ 'any.only': 'Please select a valid round type' }),

	narrative: Joi.string().min(100).max(10000).required()
		.messages({
			'string.min': 'Narrative must be at least 100 characters — share enough detail to help juniors',
			'string.empty': 'Narrative is required',
		}),

	preparationTips: Joi.string().max(3000).optional().allow(''),
	ctcOffered: Joi.string().max(50).optional().allow(''),
	offerReceived: Joi.boolean().optional().allow(null),
})

export const updateExperienceSchema = Joi.object({
	company: Joi.string().min(2).max(100).optional(),
	role: Joi.string().min(2).max(100).optional(),
	year: Joi.number().min(2018).max(new Date().getFullYear() + 1).optional(),
	roundType: Joi.string().valid('coding', 'technical', 'hr', 'system_design', 'managerial', 'group_discussion', 'aptitude').optional(),
	narrative: Joi.string().min(100).max(10000).optional(),
	preparationTips: Joi.string().max(3000).optional().allow(''),
	ctcOffered: Joi.string().max(50).optional().allow(''),
	offerReceived: Joi.boolean().optional().allow(null),
})
