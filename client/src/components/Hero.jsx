import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ACCENT_VIOLET = '#7C3AED'
const ACCENT_TEAL = '#0D9488'

const TYPEWRITER_PHRASES = [
  'Find interview experiences',
  'Ask the archive',
  'Close your skill gaps',
  'Predict your difficulty',
  'Ace your placement',
]

function Typewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx]

    if (!isDeleting && displayed === phrase) {
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200)
      return
    }

    if (isDeleting && displayed === '') {
      setIsDeleting(false)
      setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length)
      return
    }

    const delay = isDeleting ? 30 : 45
    timeoutRef.current = setTimeout(() => {
      setDisplayed(prev =>
        isDeleting ? prev.slice(0, -1) : phrase.slice(0, prev.length + 1)
      )
    }, delay)

    return () => clearTimeout(timeoutRef.current)
  }, [displayed, isDeleting, phraseIdx])

  return (
    <span className="inline">
      <span
        style={{
          background: `linear-gradient(90deg, ${ACCENT_VIOLET}, ${ACCENT_TEAL})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {displayed || '\u00A0'}
      </span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
        style={{ color: ACCENT_VIOLET, marginLeft: '4px', fontWeight: 300 }}
      >
        |
      </motion.span>
    </span>
  )
}

function HeroBadge({ label, color }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase border bg-white shadow-sm"
      style={{ color: color, borderColor: `${color}33` }}
    >
      {label}
    </span>
  )
}

export default function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const goToSearch = () => navigate(user ? '/search' : '/auth')
  const goToQA     = () => navigate(user ? '/qa'     : '/auth')

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } },
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white font-sans pt-20 pb-20">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-50 rounded-full blur-[120px] pointer-events-none opacity-60" />
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col items-center text-center gap-10">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl flex flex-col items-center">
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2 mb-8">
            <HeroBadge label="AI-Powered" color={ACCENT_VIOLET} />
            <HeroBadge label="RAG + Gemini" color={ACCENT_TEAL} />
            <HeroBadge label="XGBoost" color="#F59E0B" />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-[clamp(2.4rem,5vw,4.5rem)] font-black tracking-tight leading-[1.05] text-gray-900 mb-2">
            The placement archive
            <br />
            <span className="text-gray-400 font-medium text-[80%]">that lets you</span>
          </motion.h1>

          <motion.div variants={itemVariants} className="justify-center text-[clamp(1.8rem,4vw,3.2rem)] font-black tracking-tight leading-[1.2] mb-8 min-h-[1.4em] flex items-center">
            <Typewriter />
          </motion.div>

          <motion.p variants={itemVariants} className="text-lg text-gray-500 leading-relaxed max-w-[620px] mx-auto mb-10">
            Real interview experiences from VRSEC students — auto-tagged by AI,
            semantically searchable, with a RAG chatbot grounded in your peers' stories.
            Know exactly where your gaps are before the placement season begins.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={goToQA} className="flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold tracking-wide hover:bg-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              Ask the Archive
            </button>
            <button onClick={goToSearch} className="flex items-center gap-2 px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold tracking-wide hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              Browse Experiences
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
