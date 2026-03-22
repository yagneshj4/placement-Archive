import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
	const [mode, setMode] = useState('login')   // 'login' | 'register'
	const [form, setForm] = useState({ name: '', email: '', password: '', college: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const { login, register } = useAuth()
	const navigate = useNavigate()

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
		setError('')
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		setError('')

		try {
			if (mode === 'login') {
				await login({ email: form.email, password: form.password })
			} else {
				await register({ name: form.name, email: form.email, password: form.password, college: form.college })
			}
			navigate('/')   // redirect to dashboard on success
		} catch (err) {
			const msg = err.response?.data?.message || 'Something went wrong. Try again.'
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
			<div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">

				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-2xl font-bold text-gray-900">The Placement Archive</h1>
					<p className="text-gray-500 mt-1 text-sm">
						{mode === 'login' ? 'Sign in to your account' : 'Create your account'}
					</p>
				</div>

				{/* Mode toggle */}
				<div className="flex rounded-lg border border-gray-200 p-1 mb-6">
					{['login', 'register'].map((m) => (
						<button
							key={m}
							onClick={() => {
								setMode(m)
								setError('')
							}}
							className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
								mode === m ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'
							}`}
						>
							{m === 'login' ? 'Sign In' : 'Create Account'}
						</button>
					))}
				</div>

				{/* Error */}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
						{error}
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === 'register' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
							<input
								name="name"
								value={form.name}
								onChange={handleChange}
								required
								placeholder="Yagnesh Kumar"
								className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							name="email"
							type="email"
							value={form.email}
							onChange={handleChange}
							required
							placeholder="you@vrsec.ac.in"
							className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
						<input
							name="password"
							type="password"
							value={form.password}
							onChange={handleChange}
							required
							placeholder="••••••••"
							className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>

					{mode === 'register' && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">College</label>
							<input
								name="college"
								value={form.college}
								onChange={handleChange}
								placeholder="VR Siddhartha Engineering College"
								className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
					>
						{loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
					</button>
				</form>

				{/* Quick test credentials */}
				<div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
					<p className="font-medium text-gray-700 mb-1">Test credentials (from seed data):</p>
					<p>Student: priya@vrsec.ac.in / Student@1234</p>
					<p>Admin: admin@vrsec.ac.in / Admin@1234</p>
				</div>
			</div>
		</div>
	)
}
