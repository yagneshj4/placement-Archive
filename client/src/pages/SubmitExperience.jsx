import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { experiencesApi } from '../api/experiences'
import {
  Building2, Briefcase, Calendar, Layers, IndianRupee, Trophy,
  FileText, Lightbulb, ChevronRight, ChevronLeft, Check, Sparkles,
  Send, AlertCircle, Eye, Loader2,
} from 'lucide-react'

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────

const ROUND_TYPES = [
  { value: 'coding', label: 'Coding Round', icon: '💻', desc: 'DSA, problem solving, online assessment' },
  { value: 'technical', label: 'Technical', icon: '⚙️', desc: 'CS fundamentals, system concepts' },
  { value: 'hr', label: 'HR Round', icon: '🤝', desc: 'Behavioral, cultural fit' },
  { value: 'system_design', label: 'System Design', icon: '🏗️', desc: 'Architecture, scalability' },
  { value: 'managerial', label: 'Managerial', icon: '👔', desc: 'Leadership, team fit' },
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

// ─────────────────────────────────────────────
//  SMALL REUSABLE COMPONENTS
// ─────────────────────────────────────────────

/** A thin coloured line at the top of every card */
function CardAccent() {
  return (
    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
  )
}

/** Standard card wrapper used in Step 1, 2, and the tips section of Step 3 */
function Card({ children }) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
      <CardAccent />
      {children}
    </div>
  )
}

/** Field-level validation error line */
function FieldError({ message }) {
  if (!message) return null
  return (
    <p className="text-red-500 font-bold text-xs mt-2 ml-1 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {message}
    </p>
  )
}

/** Shared text-input styling (pass `error` bool to switch to red border) */
function inputClass(hasError) {
  return [
    'w-full bg-gray-50 text-gray-900 border-2 rounded-2xl px-4 py-4',
    'text-sm font-medium placeholder-gray-400',
    'focus:outline-none focus:border-gray-900 focus:bg-white transition-all',
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-300',
  ].join(' ')
}

// ─────────────────────────────────────────────
//  STEP COMPONENTS
// ─────────────────────────────────────────────

/**
 * Step 1 — Company, role, round type, year, CTC, offer status.
 */
function StepCompanyDetails({ register, errors, roundTypeValue }) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
    >
      <Card>
        <h2 className="text-lg font-black text-gray-900 mb-1">Company & Role Details</h2>
        <p className="text-sm text-gray-400 font-medium mb-8">
          Tell us where you interviewed and what the role was.
        </p>

        {/* Company + Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
              <Building2 className="w-4 h-4 text-gray-400" />
              Company <span className="text-red-500">*</span>
            </label>
            <input
              {...register('company', { required: 'Company is required' })}
              placeholder="Amazon, Google, TCS…"
              autoFocus
              className={inputClass(!!errors.company)}
            />
            <FieldError message={errors.company?.message} />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
              <Briefcase className="w-4 h-4 text-gray-400" />
              Role <span className="text-red-500">*</span>
            </label>
            <input
              {...register('role', { required: 'Role is required' })}
              placeholder="SDE-1, System Engineer…"
              className={inputClass(!!errors.role)}
            />
            <FieldError message={errors.role?.message} />
          </div>
        </div>

        {/* Round Type */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
            <Layers className="w-4 h-4 text-gray-400" />
            Round Type <span className="text-red-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {ROUND_TYPES.map((round) => {
              const isSelected = roundTypeValue === round.value
              return (
                <label
                  key={round.value}
                  className={[
                    'relative cursor-pointer rounded-2xl border-2 p-3.5 text-center transition-all hover:scale-[1.02]',
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg shadow-gray-300'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-700',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    value={round.value}
                    {...register('roundType', { required: 'Round type is required' })}
                    className="sr-only"
                  />
                  <span className="text-2xl block mb-1">{round.icon}</span>
                  <span className="text-[11px] font-black block leading-tight">{round.label}</span>
                  <span className={`text-[9px] font-medium mt-1 block ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                    {round.desc}
                  </span>
                </label>
              )
            })}
          </div>

          <FieldError message={errors.roundType?.message} />
        </div>

        {/* Year + CTC + Offer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2.5">
              <Calendar className="w-4 h-4 text-gray-400" />
              Year <span className="text-red-500">*</span>
            </label>
            <select
              {...register('year', { required: true })}
              className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-gray-900 focus:bg-white transition-all hover:border-gray-300"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
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
              className={inputClass(false)}
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
      </Card>
    </motion.div>
  )
}

/**
 * Step 2 — Long-form narrative textarea.
 * Shows a "preview badge" of the selected company / role / round at the top.
 */
function StepYourStory({ register, errors, companyValue, roleValue, roundTypeValue, narrativeValue }) {
  const charCount = narrativeValue.length
  const minReached = charCount >= 100
  const barPercent = Math.min(100, (charCount / 500) * 100)
  const barColor = charCount < 100 ? 'bg-red-400' : charCount < 500 ? 'bg-amber-400' : 'bg-emerald-400'

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
    >
      <Card>
        {/* Context badges from Step 1 */}
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
                {ROUND_TYPES.find(r => r.value === roundTypeValue)?.icon}{' '}
                {ROUND_TYPES.find(r => r.value === roundTypeValue)?.label}
              </span>
            )}
          </div>
        )}

        <h2 className="text-lg font-black text-gray-900 mb-1">Your Interview Experience</h2>
        <p className="text-sm text-gray-400 font-medium mb-6">
          What was asked? How was the interviewer? What did you learn? Be as detailed as possible.
        </p>

        <textarea
          {...register('narrative', {
            required: 'Experience narrative is required',
            minLength: { value: 100, message: 'Write at least 100 characters to help juniors' },
          })}
          rows={12}
          placeholder="The Amazon SDE-1 technical round had 3 questions. First was implement LRU Cache. The interviewer was friendly and gave hints when I was stuck…"
          className={[
            'w-full bg-gray-50 text-gray-900 border-2 rounded-2xl px-5 py-5',
            'text-sm font-medium placeholder-gray-400 focus:outline-none',
            'focus:border-gray-900 focus:bg-white resize-none transition-all leading-relaxed',
            errors.narrative ? 'border-red-400 bg-red-50' : 'border-gray-100',
          ].join(' ')}
        />

        {/* Error or progress bar */}
        <div className="flex justify-between items-center mt-3 px-1">
          <div>
            {errors.narrative ? (
              <FieldError message={errors.narrative.message} />
            ) : minReached ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" /> Min reached
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                style={{ width: `${barPercent}%` }}
              />
            </div>
            <span className={`text-[10px] font-mono font-bold tracking-widest ${charCount < 100 ? 'text-red-500' : 'text-gray-400'}`}>
              {charCount.toLocaleString()} / 10,000
            </span>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

/**
 * Step 3 — Optional tips textarea + submission preview + submit button.
 */
function StepTipsAndSubmit({
  register,
  tipsValue,
  companyValue,
  roleValue,
  roundTypeValue,
  narrativeValue,
  submitError,
  submitting,
}) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-6"
    >
      {/* Tips textarea */}
      <Card>
        <h2 className="text-lg font-black text-gray-900 mb-1">Preparation Tips</h2>
        <p className="text-sm text-gray-400 font-medium mb-6">
          What would you tell a junior preparing for this exact interview?{' '}
          <span className="text-gray-300">(optional but super helpful)</span>
        </p>

        <textarea
          {...register('preparationTips')}
          rows={6}
          placeholder="Focus on LeetCode medium problems, especially arrays and trees. Read about Amazon Leadership Principles…"
          className="w-full bg-gray-50 text-gray-900 border-2 border-gray-100 rounded-2xl px-5 py-5 text-sm font-medium placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:bg-white resize-none transition-all leading-relaxed"
        />
        <p className="text-[10px] text-gray-400 mt-2 font-mono font-bold tracking-widest text-right">
          {tipsValue.length.toLocaleString()} / 3,000
        </p>
      </Card>

      {/* Read-only preview */}
      <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8">
        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
          <Eye className="w-4 h-4" /> Preview Before Submitting
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Company', value: companyValue },
            { label: 'Role', value: roleValue },
            {
              label: 'Round',
              value: ROUND_TYPES.find(r => r.value === roundTypeValue)?.label,
            },
            { label: 'Story', value: `${narrativeValue.length.toLocaleString()} chars` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm font-black text-gray-900 truncate">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* API error banner */}
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
  )
}

// ─────────────────────────────────────────────
//  SUCCESS SCREEN
// ─────────────────────────────────────────────

function SuccessScreen({ experienceId, onReset }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center"
      >
        {/* Checkmark icon */}
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
            onClick={() => navigate(`/experiences/${experienceId}`)}
            className="flex items-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Eye className="w-4 h-4" />
            View Experience
          </button>
          <button
            onClick={onReset}
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

// ─────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────

export default function SubmitExperience() {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(null)   // { experienceId, jobId }
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, watch, trigger, formState: { errors } } = useForm({
    defaultValues: {
      company: '', role: '', year: CURRENT_YEAR,
      roundType: '', narrative: '', preparationTips: '',
      ctcOffered: '', offerReceived: '',
    },
  })

  // Watch live values for preview badges and counters
  const companyValue = watch('company') || ''
  const roleValue = watch('role') || ''
  const roundTypeValue = watch('roundType') || ''
  const narrativeValue = watch('narrative') || ''
  const tipsValue = watch('preparationTips') || ''

  // ── Navigation ──────────────────────────────
  const goNext = async () => {
    // Validate current step's required fields before proceeding
    const fieldsToValidate = {
      1: ['company', 'role', 'roundType'],
      2: ['narrative'],
    }
    const valid = fieldsToValidate[currentStep]
      ? await trigger(fieldsToValidate[currentStep])
      : true

    if (valid) setCurrentStep(prev => Math.min(prev + 1, 3))
  }

  const goPrev = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  // ── Submit ───────────────────────────────────
  const onSubmit = async (formData) => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        // Convert string 'true'/'false' from <select> to real booleans (or null)
        offerReceived:
          formData.offerReceived === 'true' ? true :
            formData.offerReceived === 'false' ? false : null,
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

  // ── Success screen ───────────────────────────
  if (submitted) {
    return (
      <SuccessScreen
        experienceId={submitted.experienceId}
        onReset={() => { setSubmitted(null); setCurrentStep(1) }}
      />
    )
  }

  // ── Multi-step form ──────────────────────────
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-900 selection:text-white relative overflow-x-hidden">

      {/* Subtle grid background */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">

        {/* ── Page header ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-[0.25em] px-5 py-2 rounded-full shadow-sm border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Submission
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter italic uppercase mb-4">
            Share Your Story
          </h1>
          <p className="text-gray-500 font-medium text-sm max-w-sm mx-auto leading-relaxed">
            Help your juniors prepare smarter. Your experience will be indexed by AI to help 500+ students.
          </p>
        </motion.div>

        {/* ── Step indicator ───────────────── */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {STEPS.map((step, i) => {
            const StepIcon = step.icon
            const isActive = currentStep === step.id
            const isDone = currentStep > step.id

            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => isDone && setCurrentStep(step.id)}
                  className={[
                    'flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-300 shadow-sm',
                    isActive ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 scale-105'
                      : isDone ? 'bg-blue-50 text-blue-700 border border-blue-100 cursor-pointer hover:scale-105'
                        : 'bg-white/50 text-gray-400 border border-gray-100',
                  ].join(' ')}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : isDone ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                    {isDone
                      ? <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
                      : <StepIcon className="w-4 h-4" strokeWidth={2} />
                    }
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-[11px] font-black uppercase tracking-widest">{step.title}</p>
                    <p className={`text-[10px] font-medium ${isActive ? 'text-white/60' : 'text-gray-400'}`}>
                      {step.subtitle}
                    </p>
                  </div>
                </button>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 rounded-full transition-colors ${currentStep > step.id ? 'bg-blue-400' : 'bg-gray-100'}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Form ─────────────────────────── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepCompanyDetails
                register={register}
                errors={errors}
                roundTypeValue={roundTypeValue}
              />
            )}
            {currentStep === 2 && (
              <StepYourStory
                register={register}
                errors={errors}
                companyValue={companyValue}
                roleValue={roleValue}
                roundTypeValue={roundTypeValue}
                narrativeValue={narrativeValue}
              />
            )}
            {currentStep === 3 && (
              <StepTipsAndSubmit
                register={register}
                tipsValue={tipsValue}
                companyValue={companyValue}
                roleValue={roleValue}
                roundTypeValue={roundTypeValue}
                narrativeValue={narrativeValue}
                submitError={submitError}
                submitting={submitting}
              />
            )}
          </AnimatePresence>

          {/* ── Bottom navigation ───────────── */}
          <div className="flex items-center justify-between mt-8 pb-20">
            {/* Back button */}
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex items-center gap-2 px-6 py-3.5 text-gray-500 font-bold text-sm hover:text-gray-900 transition-all rounded-2xl hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>

            {/* Dot progress */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${s === currentStep ? 'bg-gray-900 w-6' : s < currentStep ? 'bg-blue-400 w-2' : 'bg-gray-100 w-2'
                    }`}
                />
              ))}
            </div>

            {/* Next / Submit */}
            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-lg uppercase tracking-wider"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl text-sm font-black shadow-xl uppercase tracking-wider disabled:opacity-50"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Publishing…</>
                ) : (
                  <><Send className="w-4 h-4" /> Publish Experience</>
                )}
              </motion.button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}