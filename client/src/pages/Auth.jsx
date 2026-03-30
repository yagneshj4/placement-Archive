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
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
			{/* Ambient Background Glows */}
			<div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[120px] pointer-events-none opacity-60" />
			<div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
            
			{/* Grid pattern overlay */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
            />

			<div className="w-full max-w-md bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-[2rem] p-8 sm:p-10 shadow-2xl relative z-10 transition-all">
				
				{/* Header */}
				<div className="text-center mb-8">
					<div className="w-12 h-12 mx-auto bg-gray-900 rounded-xl flex items-center justify-center shadow-lg mb-6">
						<span className="text-white text-xl">◆</span>
					</div>
					<h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">The Archive</h1>
					<p className="text-gray-500 text-sm">
						{mode === 'login' ? 'Welcome back. Sign in to continue.' : 'Join the most prepared candidates.'}
					</p>
				</div>

				{/* Mode toggle */}
				<div className="flex bg-gray-100 p-1.5 rounded-xl mb-8 border border-gray-200">
					{['login', 'register'].map((m) => (
						<button
							key={m}
							onClick={() => {
								setMode(m)
								setError('')
							}}
							className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
								mode === m 
									? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
									: 'text-gray-500 hover:text-gray-700 transparent'
							}`}
						>
							{m === 'login' ? 'Sign In' : 'Create Account'}
						</button>
					))}
				</div>

				{/* Error */}
				{error && (
					<div className="bg-red-50 border border-red-200 text-red-600 font-medium text-sm rounded-xl px-4 py-3 mb-6 text-center">
						{error}
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit} className="space-y-4">
					{mode === 'register' && (
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Full Name</label>
							<input
								name="name"
								value={form.name}
								onChange={handleChange}
								required
								placeholder="Yagnesh Kumar"
								className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder-gray-400 transition-colors shadow-sm"
							/>
						</div>
					)}

					<div>
						<label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
						<input
							name="email"
							type="email"
							value={form.email}
							onChange={handleChange}
							required
							placeholder="you@vrsec.ac.in"
							className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder-gray-400 transition-colors shadow-sm"
						/>
					</div>

					<div>
						<label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
						<input
							name="password"
							type="password"
							value={form.password}
							onChange={handleChange}
							required
							placeholder="••••••••"
							className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder-gray-400 transition-colors shadow-sm"
						/>
					</div>

					{mode === 'register' && (
						<div>
							<label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">College</label>
							<input
								name="college"
								value={form.college}
								onChange={handleChange}
								placeholder="VR Siddhartha Engineering College"
								className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 placeholder-gray-400 transition-colors shadow-sm"
							/>
						</div>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full bg-gray-900 text-white py-4 rounded-xl text-sm font-bold tracking-widest uppercase hover:bg-gray-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
					>
						{loading ? 'Authenticating...' : (mode === 'login' ? 'Enter Archive' : 'Establish Access')}
					</button>
				</form>

				{/* Quick test credentials */}
				<div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-xs flex flex-col items-center text-center shadow-inner">
					<p className="font-bold text-gray-400 mb-2 uppercase tracking-widest text-[10px]">Test Credentials</p>
					<div className="space-y-1 font-mono">
						<p><span className="text-gray-500 font-semibold">Student:</span> <span className="text-gray-700">priya@vrsec.ac.in</span> <span className="text-gray-400 mx-1">/</span> <span className="text-gray-700">Student@1234</span></p>
						<p><span className="text-gray-500 font-semibold">Admin:</span> <span className="text-gray-700">admin@vrsec.ac.in</span> <span className="text-gray-400 mx-1">/</span> <span className="text-gray-700">Admin@1234</span></p>
					</div>
				</div>
			</div>
		</div>
	)
}
