import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#3C3489', '#185FA5', '#0F6E56', '#854F0B', '#993C1D', '#5F5E5A']

export default function CompanyCoverage({ coverage = [] }) {
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
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
