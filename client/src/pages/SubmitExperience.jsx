import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { experiencesApi } from '../api/experiences'
import {
  Building2, Briefcase, Calendar, Layers, IndianRupee, Trophy,
  FileText, Lightbulb, ChevronRight, ChevronLeft, Check, Sparkles,
  Send, AlertCircle, Eye, ArrowRight, Loader2
} from 'lucide-react'

const ROUND_TYPES = [
  { value: 'coding', label: 'Coding Round', icon: '💻', desc: 'DSA, problem solving, online assessment' },
  { value: 'technical', label: 'Technical Interview', icon: '⚙️', desc: 'CS fundamentals, system concepts' },
  { value: 'hr', label: 'HR Round', icon: '🤝', desc: 'Behavioral, cultural fit' },
  { value: 'system_design', label: 'System Design', icon: '🏗️', desc: 'Architecture, scalability' },
  { value: 'managerial', label: 'Managerial Round', icon: '👔', desc: 'Leadership, team fit' },
  { value: 'group_discussion', label: 'Group Discussion', icon: '💬', desc: 'Communication, articulation' },
  { value: 'aptitude', label: 'Aptitude Test', icon: '🧠', desc: 'Quant, verbal, logical' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 8 }, (_, i) => CURRENT_YEAR - i)

const STEPS = [
  { id: 1, title: 'Company Details', subtitle: 'Where did you interview?', icon: Building2 },
  { id: 2, title: 'Your Story', subtitle: 'Tell us what happened', icon: FileText },
  { id: 3, title: 'Tips & Submit', subtitle: 'Help others prepare', icon: Lightbulb },
]

export default function SubmitExperience() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    trigger,
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
  const companyValue = watch('company') || ''
  const roleValue = watch('role') || ''
  const roundTypeValue = watch('roundType') || ''

  const nextStep = async () => {
    let valid = true
    if (currentStep === 1) {
      valid = await trigger(['company', 'role', 'roundType'])
    } else if (currentStep === 2) {
      valid = await trigger(['narrative'])
    }
    if (valid) setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

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
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-200"
          >
            <Check className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>
          
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">
            Experience Published! 🎉
          </h2>
          <p className="text-gray-500 font-medium text-sm mb-3 leading-relaxed max-w-[350px] mx-auto">
            Your interview experience has been saved to the archive.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2 rounded-full mb-10">
            <Sparkles className="w-3.5 h-3.5" />
            AI is auto-tagging topics & creating embeddings
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(`/experiences/${submitted.experienceId}`)}
              className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Eye className="w-4 h-4" />
              View Experience
            </button>
            <button
              onClick={() => {
                setSubmitted(null)
                setCurrentStep(1)
              }}
              className="flex items-center gap-2 px-6 py-3.5 border-2 border-gray-200 bg-white text-gray-700 rounded-2xl text-sm font-bold hover:border-gray-900 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
            >
              <Send className="w-4 h-4" />
              Submit Another
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Multi-step form ──────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-[10px] font-black uppercase tracking-[0.25em] px-5 py-2 rounded-full mb-6 shadow-lg">
          <Sparkles className="w-3.5 h-3.5" />
          AI-Powered Submission
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
          Share Your Experience
        </h1>
        <p className="text-gray-400 font-medium text-sm max-w-md mx-auto">
          Help juniors prepare smarter. Your story will be auto-tagged and searchable by AI.
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {STEPS.map((step, i) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isDone = currentStep > step.id
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => {
                  if (isDone) setCurrentStep(step.id)
                }}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-300 scale-105'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:scale-105'
                    : 'bg-gray-50 text-gray-400 border border-gray-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  isActive ? 'bg-white/20' : isDone ? 'bg-emerald-100' : 'bg-gray-100'
                }`}>
                  {isDone ? (
                    <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                  ) : (
                    <StepIcon className="w-4 h-4" strokeWidth={2} />
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[11px] font-black uppercase tracking-widest">{step.title}</p>
                  <p className={`text-[10px] font-medium ${isActive ? 'text-white/60' : 'text-gray-400'}`}>{step.subtitle}</p>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 rounded-full transition-colors ${
                  currentStep > step.id ? 'bg-emerald-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Company Details ─── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl"
            >
              <h2 className="text-lg font-black text-gray-900 mb-1">Company & Role Details</h2>
              <p className="text-sm text-gray-400 font-medium mb-8">Tell us where you interviewed and what the role was.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Company */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    Company <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('company', { required: 'Company is required' })}
                    placeholder="Amazon, Google, TCS..."
                    autoFocus
                    className={`w-full bg-gray-50 text-gray-900 border-2 rounded-2xl px-4 py-4 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white focus:ring-0 transition-all ${
                      errors.company ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  />
                  {errors.company && <p className="text-red-500 font-bold text-xs mt-2 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.company.message}</p>}
                </div>

                {/* Role */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('role', { required: 'Role is required' })}
                    placeholder="SDE-1, System Engineer..."
                    className={`w-full bg-gray-50 text-gray-900 border-2 rounded-2xl px-4 py-4 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white focus:ring-0 transition-all ${
                      errors.role ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-300'
                    }`}
                  />
                  {errors.role && <p className="text-red-500 font-bold text-xs mt-2 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.role.message}</p>}
                </div>
              </div>

              {/* Round Type Cards */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                  <Layers className="w-4 h-4 text-gray-400" />
                  Round Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {ROUND_TYPES.map(r => (
                    <label
                      key={r.value}
                      className={`relative cursor-pointer rounded-2xl border-2 p-3.5 text-center transition-all hover:scale-[1.02] ${
                        roundTypeValue === r.value
                          ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-300'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        value={r.value}
                        {...register('roundType', { required: 'Round type is required' })}
                        className="sr-only"
                      />
                      <span className="text-2xl block mb-1">{r.icon}</span>
                      <span className="text-[11px] font-black block leading-tight">{r.label}</span>
                      <span className={`text-[9px] font-medium mt-1 block ${
                        roundTypeValue === r.value ? 'text-white/60' : 'text-gray-400'
                      }`}>{r.desc}</span>
                    </label>
                  ))}
                </div>
                {errors.roundType && <p className="text-red-500 font-bold text-xs mt-2 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.roundType.message}</p>}
              </div>

              {/* Year + CTC + Offer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('year', { required: 'Year is required' })}
                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-gray-900 focus:bg-white transition-all hover:border-gray-300"
                  >
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <IndianRupee className="w-4 h-4 text-gray-400" />
                    CTC Offered
                  </label>
                  <input
                    {...register('ctcOffered')}
                    placeholder="e.g. 18 LPA"
                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white transition-all hover:border-gray-300"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
                    <Trophy className="w-4 h-4 text-gray-400" />
                    Got offer?
                  </label>
                  <select
                    {...register('offerReceived')}
                    className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-gray-900 focus:bg-white transition-all hover:border-gray-300"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="true">✅ Yes — got the offer</option>
                    <option value="false">❌ No — did not get offer</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 2: Your Story ─── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl"
            >
              {/* Preview badge */}
              {companyValue && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider">
                    <Building2 className="w-3 h-3" /> {companyValue}
                  </span>
                  {roleValue && (
                    <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                      <Briefcase className="w-3 h-3" /> {roleValue}
                    </span>
                  )}
                  {roundTypeValue && (
                    <span className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-lg text-[11px] font-bold">
                      {ROUND_TYPES.find(r => r.value === roundTypeValue)?.icon} {ROUND_TYPES.find(r => r.value === roundTypeValue)?.label}
                    </span>
                  )}
                </div>
              )}

              <h2 className="text-lg font-black text-gray-900 mb-1">Your Interview Experience</h2>
              <p className="text-sm text-gray-400 font-medium mb-6">
                What was asked? How was the interviewer? What did you learn? Be as detailed as possible.
              </p>

              <div className="relative">
                <textarea
                  {...register('narrative', {
                    required: 'Experience narrative is required',
                    minLength: { value: 100, message: 'Write at least 100 characters to help juniors' },
                  })}
                  rows={12}
                  placeholder="The Amazon SDE-1 technical round had 3 questions. First was implement LRU Cache. The interviewer was friendly and gave hints when I was stuck. I started by explaining my approach before coding..."
                  className={`w-full bg-gray-50 text-gray-900 border-2 rounded-2xl px-5 py-5 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white resize-none transition-all leading-relaxed ${
                    errors.narrative ? 'border-red-400 bg-red-50' : 'border-gray-100'
                  }`}
                />
                
                {/* Character counter */}
                <div className="flex justify-between mt-3 px-1">
                  {errors.narrative ? (
                    <p className="text-red-500 font-bold text-xs flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{errors.narrative.message}
                    </p>
                  ) : (
                    <div className="flex items-center gap-2">
                      {narrativeValue.length >= 100 && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Min reached
                        </span>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          narrativeValue.length < 100 ? 'bg-red-400' : narrativeValue.length < 500 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, (narrativeValue.length / 500) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold tracking-widest ${narrativeValue.length < 100 ? 'text-red-500' : 'text-gray-400'}`}>
                      {narrativeValue.length.toLocaleString()} / 10,000
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── STEP 3: Tips & Submit ─── */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xl">
                <h2 className="text-lg font-black text-gray-900 mb-1">Preparation Tips</h2>
                <p className="text-sm text-gray-400 font-medium mb-6">
                  What would you tell a junior preparing for this exact interview? <span className="text-gray-300">(optional but super helpful)</span>
                </p>

                <textarea
                  {...register('preparationTips')}
                  rows={6}
                  placeholder="Focus on LeetCode medium problems, especially arrays and trees. Read about Amazon Leadership Principles — they ask behavioral questions based on them. Practice explaining your approach out loud..."
                  className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl px-5 py-5 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white resize-none transition-all leading-relaxed"
                />
                <p className="text-[10px] text-gray-400 mt-2 font-mono font-bold tracking-widest text-right">
                  {tipsValue.length.toLocaleString()} / 3,000
                </p>
              </div>

              {/* Summary Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Preview Before Submitting
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Company</p>
                    <p className="text-sm font-black text-gray-900 truncate">{companyValue || '—'}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</p>
                    <p className="text-sm font-black text-gray-900 truncate">{roleValue || '—'}</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Round</p>
                    <p className="text-sm font-black text-gray-900 truncate">
                      {ROUND_TYPES.find(r => r.value === roundTypeValue)?.label || '—'}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Story</p>
                    <p className="text-sm font-black text-gray-900">{narrativeValue.length.toLocaleString()} chars</p>
                  </div>
                </div>
              </div>

              {/* Error */}
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 text-red-700 text-sm font-bold rounded-2xl px-5 py-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {submitError}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pb-20">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3.5 text-gray-600 font-bold text-sm hover:text-gray-900 transition-colors rounded-2xl hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Step indicator dots */}
            <div className="flex gap-1.5 mr-4">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`w-2 h-2 rounded-full transition-all ${
                    s === currentStep ? 'bg-gray-900 w-6' : s < currentStep ? 'bg-emerald-400' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-gray-800 hover:shadow-xl hover:-translate-y-0.5 transition-all shadow-lg uppercase tracking-wider"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-2xl text-sm font-black hover:shadow-2xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl uppercase tracking-wider"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publish Experience
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
