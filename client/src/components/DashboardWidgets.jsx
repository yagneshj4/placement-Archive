import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'

// ── COMPANY COVERAGE ─────────────────────────────────────────────────────────
const COVERAGE_COLORS = ['#3C3489', '#185FA5', '#0F6E56', '#854F0B', '#993C1D', '#5F5E5A']

export function CompanyCoverage({ coverage = [] }) {
  if (coverage.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-2">Archive coverage</p>
        <p className="text-xs text-gray-400">Set target companies to see coverage stats.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900">Archive coverage</p>
        <p className="text-xs text-gray-400">Experiences per company</p>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={coverage} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="company"
            tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(val) => [val, 'experiences']}
          />
          <Bar dataKey="experienceCount" radius={[4, 4, 0, 0]}>
            {coverage.map((_, index) => (
              <Cell key={index} fill={COVERAGE_COLORS[index % COVERAGE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-2 text-center">
        More experiences means more accurate gap analysis
      </p>
    </div>
  )
}

// ── GAP CARD ─────────────────────────────────────────────────────────────────
const RESOURCE_TYPE_ICONS = {
  video: 'VID',
  article: 'DOC',
  course: 'CRS',
  documentation: 'REF',
  practice: 'PRC',
  book: 'BOK',
}

export function GapCard({ gap, rank }) {
  const urgency = gap.gapScore >= 50
    ? 'High'
    : gap.gapScore >= 20
      ? 'Medium'
      : 'Low'

  const urgencyColor = urgency === 'High'
    ? 'text-red-700 bg-red-50 border-red-200'
    : urgency === 'Medium'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-gray-600 bg-gray-100 border-gray-200'

  return (
    <div className="bg-white rounded-[1.25rem] border border-gray-200 p-5 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm transition-transform group-hover:scale-110">
            {rank}
          </span>
          <div className="min-w-0">
            <p className="font-extrabold text-gray-900 text-[15px] truncate tracking-tight">{gap.topic}</p>
            <p className="text-xs font-semibold text-gray-500 mt-1">
              Appears in <b className="text-gray-900">{gap.frequency}%</b> of {gap.companies.slice(0, 2).join(', ')} interviews
            </p>
          </div>
        </div>
        <span className={`text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full border shadow-sm flex-shrink-0 ${urgencyColor}`}>
          {urgency} Priority
        </span>
      </div>

      <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
          <span>Your coverage</span>
          <span className={gap.isCovered ? "text-teal-600" : "text-red-500"}>{gap.isCovered ? 'Covered' : 'Not covered'}</span>
        </div>
        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: gap.isCovered ? '100%' : '5%',
              background: gap.isCovered ? '#0D9488' : '#EF4444',
            }}
          />
        </div>
      </div>

      {gap.resources && gap.resources.length > 0 && (
        <div className="mb-2">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2.5">Recommended resources</p>
          <div className="space-y-2">
            {gap.resources.map((resource, idx) => (
              <a
                key={`${resource.url}-${idx}`}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-xs text-blue-600 hover:text-blue-800 font-semibold group/link"
              >
                <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100 uppercase w-8 text-center flex-shrink-0 transition-transform group-hover/link:scale-105">
                  {RESOURCE_TYPE_ICONS[resource.type] || 'LINK'}
                </span>
                <span className="truncate group-hover/link:underline">{resource.title}</span>
                {resource.platform && (
                  <span className="text-gray-400 flex-shrink-0 bg-gray-100 px-1.5 rounded-md text-[10px] font-bold">{resource.platform}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-gray-100">
        <Link
          to={`/search?q=${encodeURIComponent(gap.topic)}`}
          className="text-xs font-bold text-gray-900 group-hover:text-violet-700 transition-colors flex items-center gap-1.5"
        >
          Find {gap.topic} experiences <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  )
}

// ── PROFILE SETUP ─────────────────────────────────────────────────────────────
const POPULAR_COMPANIES = [
  'Amazon',
  'Google',
  'Microsoft',
  'Flipkart',
  'JP Morgan',
  'Infosys',
  'TCS',
  'Wipro',
  'Razorpay',
  'Adobe',
  'Goldman Sachs',
  'Uber',
  'Swiggy',
  'PhonePe',
  'Atlassian',
]

const ROLES = ['SDE', 'Data Engineer', 'ML Engineer', 'DevOps', 'Data Analyst', 'Product Manager', 'Other']

export function ProfileSetup({ onSave, isSaving, initialCompanies = [], initialRole = '' }) {
  const [selected, setSelected] = useState(new Set(initialCompanies))
  const [customInput, setCustomInput] = useState('')
  const [role, setRole] = useState(initialRole)

  const selectedCount = useMemo(() => selected.size, [selected])

  const toggleCompany = (company) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(company)) next.delete(company)
      else next.add(company)
      return next
    })
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !selected.has(trimmed)) {
      setSelected((prev) => new Set([...prev, trimmed]))
    }
    setCustomInput('')
  }

  const handleSave = () => {
    onSave({ targetCompanies: [...selected], targetRole: role })
  }

  return (
    <div className="bg-white rounded-[1.5rem] border border-gray-200 p-8 max-w-2xl shadow-xl">
      <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">Set your target companies</h2>
      <p className="text-sm font-medium text-gray-500 mb-6 leading-relaxed">
        Select the companies you are preparing for. The ML dashboard will prioritize analyzing topics that matter most for these specific technical interviews.
      </p>

      <div className="flex flex-wrap gap-2.5 mb-6">
        {POPULAR_COMPANIES.map((company) => (
          <button
            key={company}
            onClick={() => toggleCompany(company)}
            type="button"
            className={`px-4 py-2 rounded-xl text-[13px] border font-bold transition-all shadow-sm hover:-translate-y-0.5 ${
              selected.has(company)
                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900'
            }`}
          >
            {selected.has(company) ? '✓ ' : ''}
            {company}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-8">
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addCustom()
          }}
          placeholder="Add another company..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors shadow-sm"
        />
        <button
          onClick={addCustom}
          type="button"
          className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:border-gray-300 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
        >
          Add
        </button>
      </div>

      <div className="mb-8 p-6 bg-gray-50 rounded-[1.25rem] border border-gray-100">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-3">Target role</p>
        <div className="flex flex-wrap gap-2.5">
          {ROLES.map((option) => (
            <button
              key={option}
              onClick={() => setRole(option)}
              type="button"
              className={`px-4 py-2 rounded-xl text-[13px] font-bold border transition-all hover:-translate-y-0.5 ${
                role === option
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm hover:text-gray-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving || selectedCount === 0}
        type="button"
        className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-xl text-sm font-black tracking-widest uppercase hover:bg-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSaving ? 'Saving parameters...' : `Analyze gaps for ${selectedCount} compan${selectedCount === 1 ? 'y' : 'ies'}`}
      </button>
    </div>
  )
}

// ── READINESS SCORE ───────────────────────────────────────────────────────────
export function ReadinessScore({ score = 0, coveredCount = 0, totalTopics = 0 }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const boundedScore = Math.max(0, Math.min(score, 100))
  const dash = circumference * (boundedScore / 100)

  const color = boundedScore >= 70
    ? '#0F6E56'
    : boundedScore >= 45
      ? '#185FA5'
      : boundedScore >= 25
        ? '#854F0B'
        : '#E24B4A'

  const label = boundedScore >= 70
    ? 'Well prepared'
    : boundedScore >= 45
      ? 'On track'
      : boundedScore >= 25
        ? 'Needs work'
        : 'Just starting'

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-5">
      <div className="relative flex-shrink-0">
        <svg width="120" height="120" className="-rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--color-border-tertiary)"
            strokeWidth="10"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - dash}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{boundedScore}%</span>
        </div>
      </div>

      <div>
        <p className="text-base font-semibold text-gray-900 mb-1">Readiness score</p>
        <p className="text-sm font-medium mb-2" style={{ color }}>{label}</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          You have covered <b className="text-gray-700">{coveredCount}</b> of the top{' '}
          <b className="text-gray-700">{totalTopics}</b> topics your target companies ask.
        </p>
      </div>
    </div>
  )
}

// ── TOPIC RADAR ──────────────────────────────────────────────────────────────
export function TopicRadar({ radarData = [] }) {
  if (radarData.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-4">Topic coverage radar</p>
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Set target companies to see the radar
        </div>
      </div>
    )
  }

  const chartData = radarData.map((d) => ({
    ...d,
    topicShort: d.topic.length > 12 ? `${d.topic.slice(0, 10)}...` : d.topic,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-900">Topic coverage radar</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-violet-600 inline-block" />Required
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-teal-600 inline-block" />Covered
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="var(--color-border-tertiary)" />
          <PolarAngleAxis
            dataKey="topicShort"
            tick={{ fontSize: 11, fill: 'var(--color-text-tertiary)' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9 }}
            tickCount={4}
          />
          <Radar
            name="Required"
            dataKey="required"
            stroke="#7C3AED"
            fill="#7C3AED"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Radar
            name="Covered"
            dataKey="covered"
            stroke="#0F6E56"
            fill="#0F6E56"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid var(--color-border-secondary)',
            }}
            formatter={(val, name) => [`${val}%`, name]}
          />
        </RadarChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 text-center mt-1">
        Axes show topic frequency in target company interviews
      </p>
    </div>
  )
}
