import React, { useState } from 'react'
import PropTypes from 'prop-types'

// ── TAG CHIP ─────────────────────────────────────────────────────────────────
const tagColors = [
  'bg-indigo-50 text-indigo-700 border border-indigo-200',
  'bg-purple-50 text-purple-700 border border-purple-200',
  'bg-teal-50 text-teal-700 border border-teal-200',
  'bg-amber-50 text-amber-700 border border-amber-200',
]

export function TagChip({ label, index = 0, onClick }) {
  const color = tagColors[index % tagColors.length]
  return (
    <button
      onClick={onClick}
      type="button"
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${color} shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : 'cursor-default'
      }`}
    >
      {label}
    </button>
  )
}

// ── SIMILARITY BAR ───────────────────────────────────────────────────────────
// Shows a coloured progress bar for semantic similarity score
export function SimilarityBar({ score }) {
  if (score === null || score === undefined) return null

  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#0F6E56'
              : pct >= 60 ? '#185FA5'
              : pct >= 40 ? '#854F0B'
              : '#6B7280'

  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-medium flex-shrink-0" style={{ color }}>
        {pct}% match
      </span>
    </div>
  )
}

// ── SEARCH TYPE BADGE ────────────────────────────────────────────────────────
// Badge shown in search results header to indicate search mode
export function SearchTypeBadge({ searchType }) {
  if (!searchType || searchType === 'browse') return null

  const config = {
    semantic:               { label: '🧠 Semantic search',    bg: '#ffffff', color: '#111827', border: '#e5e7eb' },
    keyword:                { label: '🔤 Keyword search',     bg: '#ffffff', color: '#111827', border: '#e5e7eb' },
    fallback_empty_collection: { label: '🔤 Keyword search (building index...)', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  }

  const c = config[searchType] || config.keyword
  return (
    <span
      className="inline-flex items-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border shadow-sm transition-all"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      {c.label}
    </span>
  )
}

// ── EMPTY STATE ──────────────────────────────────────────────────────────────
// Reusable empty state component used on Bookmarks, Search results, etc.
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-20 bg-white border border-gray-100 rounded-[2rem] max-w-3xl mx-auto shadow-sm mt-8">
      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-gray-100 text-gray-300">
        {icon}
      </div>
      <h3 className="text-gray-900 font-black tracking-tight text-xl mb-2">{title}</h3>
      {description && <p className="text-gray-500 font-medium text-sm mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>}
      {action}
    </div>
  )
}

// ── LOADING SKELETON ─────────────────────────────────────────────────────────
// Animated skeleton placeholder shown while data is loading
export function ExperienceCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-16" />
        <div className="h-5 bg-gray-200 rounded-full w-20" />
        <div className="h-5 bg-gray-200 rounded-full w-14" />
      </div>
    </div>
  )
}

export function PageSkeleton({ count = 5 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ExperienceCardSkeleton key={i} />
      ))}
    </div>
  )
}

// ── DIFFICULTY BADGE ──────────────────────────────────────────────────────────
const simpleConfig = {
  1: { label: 'Easy', style: 'bg-green-50 text-green-700 border border-green-200' },
  2: { label: 'Easy', style: 'bg-green-50 text-green-700 border border-green-200' },
  3: { label: 'Medium', style: 'bg-yellow-50 text-yellow-700 border border-yellow-200' },
  4: { label: 'Hard', style: 'bg-orange-50 text-orange-700 border border-orange-200' },
  5: { label: 'Expert', style: 'bg-red-50 text-red-700 border border-red-200' },
}

export const DifficultyBadge = React.memo(({ difficulty, className = '' }) => {
  if (!difficulty) return null

  const { label, style } = simpleConfig[Math.round(difficulty)] || simpleConfig[3]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${style} ${className}`}>
      {label}
    </span>
  )
})

DifficultyBadge.displayName = 'DifficultyBadge'

DifficultyBadge.propTypes = {
  difficulty: PropTypes.number.isRequired,
  className: PropTypes.string,
}
