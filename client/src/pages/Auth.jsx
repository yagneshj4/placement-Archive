import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Flame, ArrowRight, Github, Chrome, Mail, Lock, User, School } from 'lucide-react'

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

export default function Auth() {
	const [searchParams] = useSearchParams()
	const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
	
	const [mode, setMode] = useState(initialMode)   // 'login' | 'register'
	const [form, setForm] = useState({ name: '', email: '', password: '', college: '' })
	const [error, setError] = useState('')
	const [loading, setLoading] = useState(false)

	const { login, register, loginWithGoogle } = useAuth()
	const navigate = useNavigate()

	// Update mode if URL parameter changes
	useEffect(() => {
		const m = searchParams.get('mode')
		if (m === 'register' || m === 'login') {
			setMode(m)
		}
	}, [searchParams])

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
			navigate('/home')   // redirect to dashboard on success
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
			navigate('/home')
		} catch (err) {
			const msg = err.response?.data?.message || err.message || 'Google Auth failed'
			setError(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-6 relative overflow-hidden selection:bg-gray-900 selection:text-white">
			
			{/* FIXED GRID BACKGROUND */}
			<div 
				className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
				style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
			/>

			{/* BACKGROUND GLOWS */}
			<motion.div 
				animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
				transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-100 blur-[150px] -z-10"
			/>
			<motion.div 
				animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.15, 0.1] }}
				transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
				className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-100 blur-[150px] -z-10"
			/>

			<motion.div 
				initial="hidden" animate="visible" variants={{
					visible: { transition: { staggerChildren: 0.1 } }
				}}
				className="w-full max-w-md relative z-10"
			>
				{/* LOGO AREA */}
				<motion.div variants={fadeUp} className="flex flex-col items-center mb-10">
					<Link to="/" className="flex items-center gap-3 mb-4 group">
						<div className="w-12 h-12 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
							<Flame className="text-gray-900" size={28} />
						</div>
					</Link>
					<h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2 text-gray-900">The Archive</h1>
					<p className="text-gray-500 text-sm font-medium">Placement Intelligence Platform</p>
				</motion.div>

				{/* AUTH CARD */}
				<motion.div 
					variants={fadeUp}
					className="bg-white/80 border border-gray-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
				>
					{/* TOP ACCENT LINE */}
					<div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

					{/* MODE TOGGLE */}
					<div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 border border-gray-200">
						{['login', 'register'].map((m) => (
							<button
								key={m}
								onClick={() => {
									setMode(m)
									setError('')
								}}
								className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
									mode === m 
										? 'bg-gray-900 text-white shadow-lg' 
										: 'text-gray-400 hover:text-gray-900'
								}`}
							>
								{m === 'login' ? 'Sign In' : 'Join Us'}
							</button>
						))}
					</div>

					{/* ERROR DISPLAY */}
					<AnimatePresence mode="wait">
						{error && (
							<motion.div 
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: 'auto', opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								className="overflow-hidden"
							>
								<div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-4 py-3 mb-6 text-center italic">
									{error}
								</div>
							</motion.div>
						)}
					</AnimatePresence>

					{/* FORM */}
					<form onSubmit={handleSubmit} className="space-y-5">
						<AnimatePresence mode="popLayout">
							{mode === 'register' && (
								<motion.div
									key="register"
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20 }}
									className="space-y-5"
								>
									<div className="relative">
										<User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
										<input
											name="name"
											value={form.name}
											onChange={handleChange}
											required
											placeholder="FULL NAME"
											className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl px-12 py-4 text-sm font-bold placeholder-gray-400 text-gray-900 outline-none transition-all shadow-inner"
										/>
									</div>
									<div className="relative">
										<School className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
										<input
											name="college"
											value={form.college}
											onChange={handleChange}
											placeholder="COLLEGE / UNIVERSITY"
											className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl px-12 py-4 text-sm font-bold placeholder-gray-400 text-gray-900 outline-none transition-all shadow-inner"
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="relative">
							<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								required
								placeholder="EMAIL ADDRESS"
								className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl px-12 py-4 text-sm font-bold placeholder-gray-400 text-gray-900 outline-none transition-all shadow-inner"
							/>
						</div>

						<div className="relative">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
							<input
								name="password"
								type="password"
								value={form.password}
								onChange={handleChange}
								required
								placeholder="PASSWORD"
								className="w-full bg-gray-50 border border-gray-200 focus:border-gray-900 rounded-xl px-12 py-4 text-sm font-bold placeholder-gray-400 text-gray-900 outline-none transition-all shadow-inner"
							/>
						</div>

						<motion.button
							whileHover={{ scale: 1.02, y: -2 }}
							whileTap={{ scale: 0.98 }}
							type="submit"
							disabled={loading}
							className="w-full bg-gray-900 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-black hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mt-4"
						>
							{loading ? (
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									{mode === 'login' ? 'Establish Access' : 'Create Identity'}
									<ArrowRight size={18} />
								</>
							)}
						</motion.button>
					</form>

					{/* DIVIDER */}
					<div className="relative flex items-center justify-center my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-100"></div>
						</div>
						<div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
							<span className="px-4 bg-white text-gray-400">Secure Gateway</span>
						</div>
					</div>

					{/* SOCIAL AUTH */}
					<motion.button
						whileHover={{ scale: 1.02, backgroundColor: "#f9fafb" }}
						whileTap={{ scale: 0.98 }}
						type="button"
						onClick={handleGoogleLogin}
						disabled={loading}
						className="w-full bg-white text-gray-900 border border-gray-200 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-sm active:scale-95"
					>
						<Chrome size={18} />
						Continue with Google
					</motion.button>

					<div className="mt-8 text-center">
						<motion.div whileHover={{ x: -5 }}>
							<Link to="/" className="text-gray-400 text-[10px] font-bold uppercase tracking-widest hover:text-gray-900 transition-colors">
								← Return to Main Archive
							</Link>
						</motion.div>
					</div>
				</motion.div>

				{/* FOOTER NOTE */}
				<motion.p variants={fadeUp} className="text-center mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-widest italic">
					By entering, you agree to our collective intelligence protocols.
				</motion.p>
			</motion.div>
		</div>
	)
}
