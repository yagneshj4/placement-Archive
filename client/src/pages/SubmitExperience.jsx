import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { experiencesApi } from '../api/experiences'

const ROUND_TYPES = [
  { value: 'coding', label: 'Coding Round' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'hr', label: 'HR Round' },
  { value: 'system_design', label: 'System Design' },
  { value: 'managerial', label: 'Managerial Round' },
  { value: 'group_discussion', label: 'Group Discussion' },
  { value: 'aptitude', label: 'Aptitude Test' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i)

export default function SubmitExperience() {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null) // { experienceId, jobId }
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      company: '',
      role: '',
      year: CURRENT_YEAR,
      roundType: '',
      narrative: '',
      preparationTips: '',
      ctcOffered: '',
      offerReceived: '',
    },
  })

  const narrativeValue = watch('narrative') || ''
  const tipsValue = watch('preparationTips') || ''

  const onSubmit = async (formData) => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        offerReceived:
          formData.offerReceived === 'true' ? true : formData.offerReceived === 'false' ? false : null,
      }
      const { data } = await experiencesApi.create(payload)
      setSubmitted({
        experienceId: data.data.experience._id,
        jobId: data.data.jobId,
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.'
      const errs = err.response?.data?.errors
      setSubmitError(errs ? errs.join(' · ') : msg)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Success screen ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Experience submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your experience has been saved. The AI is now auto-tagging topics and creating a searchable
          embedding in the background.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(`/experiences/${submitted.experienceId}`)}
            className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition-colors"
          >
            View my experience
          </button>
          <button
            onClick={() => {
              setSubmitted(null)
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Submit another
          </button>
        </div>
      </div>
    )
  }

  // ── Submission form ──────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Share your placement experience</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Help juniors prepare smarter. Your experience will be auto-tagged and made searchable by AI.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company + Role row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              {...register('company', { required: 'Company is required' })}
              placeholder="Amazon, Google, TCS..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.company ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              {...register('role', { required: 'Role is required' })}
              placeholder="SDE-1, System Engineer..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.role ? 'border-red-400' : 'border-gray-300'
              }`}
            />
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
          </div>
        </div>

        {/* Year + Round type row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              {...register('year', { required: 'Year is required' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Round Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('roundType', { required: 'Round type is required' })}
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.roundType ? 'border-red-400' : 'border-gray-300'
              }`}
            >
              <option value="">Select round type</option>
              {ROUND_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.roundType && <p className="text-red-500 text-xs mt-1">{errors.roundType.message}</p>}
          </div>
        </div>

        {/* CTC + Offer row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CTC Offered</label>
            <input
              {...register('ctcOffered')}
              placeholder="18 LPA (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Did you get an offer?</label>
            <select
              {...register('offerReceived')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Prefer not to say</option>
              <option value="true">Yes — got the offer</option>
              <option value="false">No — did not get offer</option>
            </select>
          </div>
        </div>

        {/* Narrative */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your experience <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-400 mb-2">
            What questions were asked? How was the interviewer? What was the difficulty? Min 100 characters.
          </p>
          <textarea
            {...register('narrative', {
              required: 'Narrative is required',
              minLength: { value: 100, message: 'Write at least 100 characters to help juniors' },
            })}
            rows={8}
            placeholder="The Amazon SDE-1 technical round had 3 questions. First was implement LRU Cache..."
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
              errors.narrative ? 'border-red-400' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-1">
            {errors.narrative ? (
              <p className="text-red-500 text-xs">{errors.narrative.message}</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ${narrativeValue.length < 100 ? 'text-red-400' : 'text-gray-400'}`}>
              {narrativeValue.length} / 10,000
            </span>
          </div>
        </div>

        {/* Preparation tips */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Preparation tips <span className="text-gray-400 font-normal">(optional but very helpful)</span>
          </label>
          <textarea
            {...register('preparationTips')}
            rows={4}
            placeholder="Focus on LeetCode medium problems. Read about Amazon Leadership Principles..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {tipsValue.length} / 3,000
          </p>
        </div>

        {/* Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {submitError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-purple-700 text-white py-3 rounded-lg text-sm font-medium hover:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Submitting...' : 'Submit experience'}
        </button>

        <p className="text-center text-xs text-gray-400">
          Your experience will be auto-tagged by AI within seconds of submission.
        </p>
      </form>
    </div>
  )
}
