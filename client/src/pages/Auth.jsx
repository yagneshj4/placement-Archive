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
		<div className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-[#F97316] selection:text-white">
			
			{/* BACKGROUND GLOWS */}
			<motion.div 
				animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
				transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
				className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#F97316] blur-[150px] -z-10"
			/>
			<motion.div 
				animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.07, 0.03] }}
				transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
				className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#EF4444] blur-[150px] -z-10"
			/>

			{/* GRID OVERLAY */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#F97316_1px,transparent_1px),linear-gradient(to_bottom,#F97316_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.02] -z-10" />

			<motion.div 
				initial="hidden" animate="visible" variants={{
					visible: { transition: { staggerChildren: 0.1 } }
				}}
				className="w-full max-w-md relative z-10"
			>
				{/* LOGO AREA */}
				<motion.div variants={fadeUp} className="flex flex-col items-center mb-10">
					<Link to="/" className="flex items-center gap-3 mb-4 group">
						<div className="w-12 h-12 bg-[#1C0F0A] border border-[#F97316]/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
							<Flame className="text-[#F97316] fill-[#F97316]" size={28} />
						</div>
					</Link>
					<h1 className="text-3xl font-black italic tracking-tighter uppercase mb-2">The Archive</h1>
					<p className="text-[#A1A1AA] text-sm font-medium">Placement Intelligence Platform</p>
				</motion.div>

				{/* AUTH CARD */}
				<motion.div 
					variants={fadeUp}
					className="bg-[#1C0F0A] border border-[#F97316]/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
				>
					{/* TOP ACCENT LINE */}
					<div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#F97316]/40 to-transparent" />

					{/* MODE TOGGLE */}
					<div className="flex bg-[#0B0B0F] p-1.5 rounded-2xl mb-8 border border-white/5">
						{['login', 'register'].map((m) => (
							<button
								key={m}
								onClick={() => {
									setMode(m)
									setError('')
								}}
								className={`flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
									mode === m 
										? 'bg-[#F97316] text-white shadow-lg' 
										: 'text-[#71717A] hover:text-white'
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
								<div className="bg-red-500/10 border border-red-200 text-red-500 text-xs font-bold rounded-xl px-4 py-3 mb-6 text-center italic">
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
										<User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={18} />
										<input
											name="name"
											value={form.name}
											onChange={handleChange}
											required
											placeholder="FULL NAME"
											className="w-full bg-[#0B0B0F] border border-white/5 focus:border-[#F97316]/50 rounded-xl px-12 py-4 text-sm font-bold placeholder-[#3F3F46] outline-none transition-all"
										/>
									</div>
									<div className="relative">
										<School className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={18} />
										<input
											name="college"
											value={form.college}
											onChange={handleChange}
											placeholder="COLGE / UNIVERSITY"
											className="w-full bg-[#0B0B0F] border border-white/5 focus:border-[#F97316]/50 rounded-xl px-12 py-4 text-sm font-bold placeholder-[#3F3F46] outline-none transition-all"
										/>
									</div>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="relative">
							<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={18} />
							<input
								name="email"
								type="email"
								value={form.email}
								onChange={handleChange}
								required
								placeholder="EMAIL ADDRESS"
								className="w-full bg-[#0B0B0F] border border-white/5 focus:border-[#F97316]/50 rounded-xl px-12 py-4 text-sm font-bold placeholder-[#3F3F46] outline-none transition-all"
							/>
						</div>

						<div className="relative">
							<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" size={18} />
							<input
								name="password"
								type="password"
								value={form.password}
								onChange={handleChange}
								required
								placeholder="PASSWORD"
								className="w-full bg-[#0B0B0F] border border-white/5 focus:border-[#F97316]/50 rounded-xl px-12 py-4 text-sm font-bold placeholder-[#3F3F46] outline-none transition-all"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-[#F97316] text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] hover:bg-[#FB923C] hover:shadow-xl hover:shadow-[#F97316]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 mt-4"
						>
							{loading ? (
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
							) : (
								<>
									{mode === 'login' ? 'Establish Access' : 'Create Identity'}
									<ArrowRight size={18} />
								</>
							)}
						</button>
					</form>

					{/* DIVIDER */}
					<div className="relative flex items-center justify-center my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-white/5"></div>
						</div>
						<div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
							<span className="px-4 bg-[#1C0F0A] text-[#71717A]">Secure Gateway</span>
						</div>
					</div>

					{/* SOCIAL AUTH */}
					<button
						type="button"
						onClick={handleGoogleLogin}
						disabled={loading}
						className="w-full bg-white text-black py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all shadow-lg active:scale-95"
					>
						<Chrome size={18} />
						Continue with Google
					</button>

					<div className="mt-8 text-center">
						<Link to="/" className="text-[#71717A] text-[10px] font-bold uppercase tracking-widest hover:text-[#F97316] transition-colors">
							← Return to Main Archive
						</Link>
					</div>
				</motion.div>

				{/* FOOTER NOTE */}
				<motion.p variants={fadeUp} className="text-center mt-8 text-[#71717A] text-[10px] font-bold uppercase tracking-widest italic">
					By entering, you agree to our collective intelligence protocols.
				</motion.p>
			</motion.div>
		</div>
	)
}
