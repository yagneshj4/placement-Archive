import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export default function TopicRadar({ radarData = [] }) {
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
