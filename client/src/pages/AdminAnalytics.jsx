import { useMutation, useQuery } from '@tanstack/react-query'
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	Cell,
} from 'recharts'
import { analyticsApi } from '../api/analytics'

const COLORS = ['#3C3489', '#185FA5', '#0F6E56', '#854F0B', '#993C1D', '#534AB7', '#0B7285', '#8C3D99']

function StatCard({ label, value, sub, color = '#3C3489' }) {
	return (
		<div className="bg-white rounded-xl border border-gray-200 p-4">
			<p className="text-xs text-gray-400 mb-1">{label}</p>
			<p className="text-2xl font-bold" style={{ color }}>{value}</p>
			{sub ? <p className="text-xs text-gray-400 mt-1">{sub}</p> : null}
		</div>
	)
}

function Section({ title, children }) {
	return (
		<div className="mb-6">
			<h2 className="text-sm font-semibold text-gray-900 mb-3">{title}</h2>
			{children}
		</div>
	)
}

export default function AdminAnalytics() {
	const overviewQuery = useQuery({
		queryKey: ['analytics-overview'],
		queryFn: () => analyticsApi.overview().then((r) => r.data.data),
		staleTime: 60_000,
	})

	const companyQuery = useQuery({
		queryKey: ['analytics-companies'],
		queryFn: () => analyticsApi.companies().then((r) => r.data.data),
		staleTime: 60_000,
	})

	const topicQuery = useQuery({
		queryKey: ['analytics-topics'],
		queryFn: () => analyticsApi.topics().then((r) => r.data.data),
		staleTime: 60_000,
	})

	const leaderboardQuery = useQuery({
		queryKey: ['analytics-leaderboard'],
		queryFn: () => analyticsApi.leaderboard().then((r) => r.data.data),
		staleTime: 60_000,
	})

	const trendsQuery = useQuery({
		queryKey: ['analytics-submissions'],
		queryFn: () => analyticsApi.submissions(12).then((r) => r.data.data),
		staleTime: 60_000,
	})

	const triggerDigest = useMutation({
		mutationFn: () => analyticsApi.triggerDigest(),
	})

	const overview = overviewQuery.data
	const companies = companyQuery.data?.companies || []
	const topics = topicQuery.data?.topics || []
	const leaderboard = leaderboardQuery.data?.leaderboard || []
	const trends = (trendsQuery.data?.trends || []).map((item) => ({
		label: `W${item._id.week}`,
		count: item.count,
	}))

	return (
		<div className="max-w-5xl mx-auto px-4 py-8">
			<div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
				<h1 className="text-xl font-bold text-gray-900">Admin analytics</h1>
				<div className="flex items-center gap-2">
					<span className="text-xs bg-red-100 text-red-700 px-2.5 py-1 rounded-full font-medium">
						Admin only
					</span>
					<button
						onClick={() => triggerDigest.mutate()}
						disabled={triggerDigest.isPending}
						className="px-3 py-1.5 bg-violet-700 text-white rounded-lg text-xs font-medium hover:bg-violet-800 disabled:opacity-60"
					>
						{triggerDigest.isPending ? 'Triggering...' : 'Trigger digest'}
					</button>
				</div>
			</div>

			{triggerDigest.isSuccess ? (
				<div className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700">
					Digest dispatch queued successfully.
				</div>
			) : null}
			{triggerDigest.isError ? (
				<div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
					Failed to trigger digest.
				</div>
			) : null}

			{overview ? (
				<Section title="Platform overview">
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
						<StatCard label="Experiences" value={overview.totalExperiences} color="#3C3489" />
						<StatCard label="Users" value={overview.totalUsers} color="#185FA5" />
						<StatCard label="Questions" value={overview.totalQuestions} color="#0F6E56" />
						<StatCard
							label="AI indexed"
							value={`${overview.embeddingCoverage}%`}
							color="#854F0B"
							sub="embedded"
						/>
						<StatCard
							label="New this week"
							value={overview.recentExperiences}
							color="#993C1D"
							sub="experiences"
						/>
						<StatCard
							label="New users"
							value={overview.recentUsers}
							color="#534AB7"
							sub="this week"
						/>
					</div>
				</Section>
			) : null}

			{trends.length > 0 ? (
				<Section title="Submission trend (12 weeks)">
					<div className="bg-white rounded-xl border border-gray-200 p-4">
						<ResponsiveContainer width="100%" height={200}>
							<LineChart data={trends} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
								<XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
								<YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
								<Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
								<Line type="monotone" dataKey="count" stroke="#3C3489" strokeWidth={2} dot={{ r: 3 }} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</Section>
			) : null}

			{companies.length > 0 ? (
				<Section title="Coverage by company">
					<div className="bg-white rounded-xl border border-gray-200 p-4">
						<ResponsiveContainer width="100%" height={220}>
							<BarChart data={companies.slice(0, 12)} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
								<XAxis
									dataKey="company"
									tick={{ fontSize: 10 }}
									angle={-30}
									textAnchor="end"
									axisLine={false}
									tickLine={false}
								/>
								<YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
								<Tooltip
									contentStyle={{ fontSize: 12, borderRadius: 8 }}
									formatter={(val, _name, props) => [
										`${val} experiences | ${Math.round((props.payload.offerRate || 0) * 100)}% offer rate`,
										props.payload.company,
									]}
								/>
								<Bar dataKey="count" radius={[4, 4, 0, 0]}>
									{companies.slice(0, 12).map((_, idx) => (
										<Cell key={idx} fill={COLORS[idx % COLORS.length]} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</Section>
			) : null}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{topics.length > 0 ? (
					<Section title="Top interview topics">
						<div className="bg-white rounded-xl border border-gray-200 p-4">
							<div className="space-y-2">
								{topics.slice(0, 10).map((topic, idx) => {
									const maxCount = topics[0]?.count || 1
									const pct = Math.round((topic.count / maxCount) * 100)
									return (
										<div key={topic.topic}>
											<div className="flex justify-between text-xs mb-0.5">
												<span className="text-gray-700 font-medium truncate">{topic.topic}</span>
												<span className="text-gray-400 ml-2 flex-shrink-0">
													{topic.count} exp | {topic.companyCount} co.
												</span>
											</div>
											<div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
												<div className="h-full rounded-full" style={{ width: `${pct}%`, background: COLORS[idx % COLORS.length] }} />
											</div>
										</div>
									)
								})}
							</div>
						</div>
					</Section>
				) : null}

				{leaderboard.length > 0 ? (
					<Section title="Top contributors">
						<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
							{leaderboard.map((user, idx) => (
								<div
									key={user._id}
									className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0"
								>
									<span
										className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
											idx === 0
												? 'bg-yellow-100 text-yellow-700'
												: idx === 1
													? 'bg-gray-100 text-gray-600'
													: idx === 2
														? 'bg-orange-100 text-orange-700'
														: 'bg-gray-50 text-gray-400'
										}`}
									>
										{idx + 1}
									</span>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
										<p className="text-xs text-gray-400">
											{user.college || 'VRSEC'}
											{user.graduationYear ? ` | ${user.graduationYear}` : ''}
										</p>
									</div>
									<span className="text-sm font-semibold text-violet-700">{user.contributionCount}</span>
								</div>
							))}
						</div>
					</Section>
				) : null}
			</div>
		</div>
	)
}
