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
      <div className="max-w-lg mx-auto px-4 py-20 text-center relative z-10">
        <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm border border-teal-100">
          <svg
            className="w-10 h-10 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Experience submitted!</h2>
        <p className="text-gray-500 font-medium text-sm mb-10 leading-relaxed max-w-[350px] mx-auto">
          Your experience has been saved. The AI is now auto-tagging topics and creating a searchable
          embedding in the background.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(`/experiences/${submitted.experienceId}`)}
            className="px-6 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            View my experience
          </button>
          <button
            onClick={() => {
              setSubmitted(null)
            }}
            className="px-6 py-3.5 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-bold shadow-sm hover:border-gray-300 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
          >
            Submit another
          </button>
        </div>
      </div>
    )
  }

  // ── Submission form ──────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 relative z-10">
      <div className="mb-10 mt-4 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Share your placement experience</h1>
        <p className="text-gray-500 font-medium mt-3 text-sm max-w-lg mx-auto">
          Help juniors prepare smarter. Your experience will be auto-tagged and made searchable by AI.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company + Role row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              {...register('company', { required: 'Company is required' })}
              placeholder="Amazon, Google, TCS..."
              autoFocus
              className={`w-full bg-white text-gray-900 border rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm ${
                errors.company ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.company && <p className="text-red-500 font-medium text-xs mt-2 ml-1">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Role <span className="text-red-500">*</span>
            </label>
            <input
              {...register('role', { required: 'Role is required' })}
              placeholder="SDE-1, System Engineer..."
              className={`w-full bg-white text-gray-900 border rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.role && <p className="text-red-500 font-medium text-xs mt-2 ml-1">{errors.role.message}</p>}
          </div>
        </div>

        {/* Year + Round type row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Year <span className="text-red-500">*</span>
            </label>
            <select
              {...register('year', { required: 'Year is required' })}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
              Round Type <span className="text-red-500">*</span>
            </label>
            <select
              {...register('roundType', { required: 'Round type is required' })}
              className={`w-full bg-white text-gray-900 border rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm ${
                errors.roundType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="" disabled className="text-gray-400">Select round type</option>
              {ROUND_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            {errors.roundType && <p className="text-red-500 font-medium text-xs mt-2 ml-1">{errors.roundType.message}</p>}
          </div>
        </div>

        {/* CTC + Offer row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">CTC Offered</label>
            <input
              {...register('ctcOffered')}
              placeholder="18 LPA (optional)"
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Did you get an offer?</label>
            <select
              {...register('offerReceived')}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm"
            >
              <option value="">Prefer not to say</option>
              <option value="true">Yes — got the offer</option>
              <option value="false">No — did not get offer</option>
            </select>
          </div>
        </div>

        {/* Narrative */}
        <div className="pt-2">
          <label className="flex flex-col mb-3 pl-1">
            <span className="text-sm font-bold text-gray-900 mb-1.5">
              Your experience <span className="text-red-500">*</span>
            </span>
            <span className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">
              What was asked? How was the interviewer? Min 100 char.
            </span>
          </label>
          
          <textarea
            {...register('narrative', {
              required: 'Narrative is required',
              minLength: { value: 100, message: 'Write at least 100 characters to help juniors' },
            })}
            rows={8}
            placeholder="The Amazon SDE-1 technical round had 3 questions. First was implement LRU Cache..."
            className={`w-full bg-white text-gray-900 border rounded-xl px-4 py-4 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none transition-colors shadow-sm leading-relaxed ${
              errors.narrative ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="flex justify-between mt-2 pl-1">
            {errors.narrative ? (
              <p className="text-red-500 font-bold text-xs">{errors.narrative.message}</p>
            ) : (
              <span />
            )}
            <span className={`text-[10px] font-mono font-bold tracking-widest ${narrativeValue.length < 100 ? 'text-red-500/80' : 'text-gray-400'}`}>
              {narrativeValue.length} / 10,000
            </span>
          </div>
        </div>

        {/* Preparation tips */}
        <div className="pt-2">
          <label className="flex flex-col mb-3 pl-1">
            <span className="text-sm font-bold text-gray-900 mb-1.5">
              Preparation tips <span className="text-gray-400 font-semibold ml-1">(optional but helpful)</span>
            </span>
          </label>
          <textarea
            {...register('preparationTips')}
            rows={4}
            placeholder="Focus on LeetCode medium problems. Read about Amazon Leadership Principles..."
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-4 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none transition-colors shadow-sm leading-relaxed"
          />
          <p className="text-[10px] text-gray-400 mt-2 font-mono font-bold tracking-widest text-right">
            {tipsValue.length} / 3,000
          </p>
        </div>

        {/* Error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-4 text-center">
            {submitError}
          </div>
        )}

        {/* Submit */}
        <div className="pt-6 pb-20 text-center">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-gray-900 text-white rounded-xl text-[13px] font-black hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-[0.2em] shadow-lg"
          >
            {submitting ? 'Submitting to Archive...' : 'Submit experience'}
          </button>

          <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-8">
            Your experience will be auto-tagged by AI within seconds of submission.
          </p>
        </div>
      </form>
    </div>
  )
}
