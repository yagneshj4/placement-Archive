import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Auth() {
	const [mode, setMode] = useState('login')   // 'login' | 'register'
	const [form, setForm] = useState({ name: '', email: '', password: '', college: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const { login, register, loginWithGoogle } = useAuth()
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

	const handleGoogleLogin = async () => {
		setLoading(true)
		setError('')
		try {
			await loginWithGoogle()
			navigate('/')
		} catch (err) {
			const msg = err.response?.data?.message || err.message || 'Google Auth failed'
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

				<div className="relative flex items-center justify-center mt-6 mb-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-3 bg-white text-gray-400 font-bold text-xs uppercase tracking-widest">Or</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleGoogleLogin}
					disabled={loading}
					className="w-full bg-white border border-gray-200 text-gray-900 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
						<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
						<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
						<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
					</svg>
					Continue with Google
				</button>

			</div>
		</div>
	)
}
