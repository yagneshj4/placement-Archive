import { motion, useInView, useAnimation, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search, MessageSquare, Tag, BarChart, Target, Mail,
  Zap, Users, Upload, Menu, X, Star, ArrowRight,
  ChevronRight, Flame, Github, Linkedin, Twitter
} from 'lucide-react'

// --- HELPER COMPONENTS ---

const CountUp = ({ title, target, suffix = "" }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      let start = 0
      const duration = 2000
      const increment = Math.ceil(target / (duration / 16))
      const timer = setInterval(() => {
        start += increment
        if (start >= target) {
          setCount(target)
          clearInterval(timer)
        } else {
          setCount(start)
        }
      }, 16)
      return () => clearInterval(timer)
    }
  }, [isInView, target])

  return (
    <div ref={ref} className="text-center px-8 md:border-r border-[#F97316] border-opacity-20 last:border-0 py-6 md:py-0">
      <div className="text-5xl font-black text-[#F97316] mb-2">{count}{suffix}</div>
      <div className="text-white text-sm font-medium tracking-widest uppercase opacity-70">{title}</div>
    </div>
  )
}

const TypewriterDemo = () => {
  const [query, setQuery] = useState("")
  const [answerVisible, setAnswerVisible] = useState(false)
  const fullQuery = "What did Amazon ask in Technical rounds 2024?"
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView) {
      let i = 0
      const timer = setInterval(() => {
        setQuery(fullQuery.slice(0, i))
        i++
        if (i > fullQuery.length) {
          clearInterval(timer)
          setTimeout(() => setAnswerVisible(true), 500)
        }
      }, 50)
      return () => clearInterval(timer)
    }
  }, [isInView])

  return (
    <div ref={ref} className="w-full max-w-3xl mx-auto bg-[#1A0F07] rounded-xl border border-[#F97316] border-opacity-30 overflow-hidden shadow-2xl">
      <div className="bg-[#1C0F0A] px-4 py-3 border-b border-[#F97316] border-opacity-10 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/30" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
          <div className="w-3 h-3 rounded-full bg-green-500/30" />
        </div>
        <div className="text-[#F97316] text-xs font-mono ml-4 opacity-70 uppercase tracking-widest flex items-center gap-2">
          <Search size={12} /> Ask the Archive
        </div>
      </div>
      <div className="p-8 font-mono text-sm sm:text-base">
        <div className="flex gap-3 text-white mb-8">
          <span className="text-[#F97316] shrink-0">Query:</span>
          <span className="border-r-2 border-[#F97316] pr-1">{query}</span>
        </div>

        <AnimatePresence>
          {answerVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0B0B0F] p-6 rounded-lg border border-[#F97316] border-opacity-10"
            >
              <div className="text-[#F97316] text-xs mb-3 font-bold uppercase tracking-tighter">AI Answer:</div>
              <div className="text-white space-y-4 leading-relaxed opacity-90">
                <p>Amazon's 2024 technical rounds focused heavily on <span className="text-[#FB923C] font-bold underline decoration-[#F97316]/30">LRU Cache</span> [Amazon·SDE-1] and graph algorithms including BFS/DFS traversal [Amazon·SDE-1].</p>
                <p>System design rounds typically featured <span className="text-[#FB923C]">URL shortener</span> or <span className="text-[#FB923C]">Rate Limiter</span> design in round 3.</p>
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-6 flex items-center gap-2 text-[#F97316] text-xs font-bold"
              >
                <ChevronRight size={14} /> Sources: [Amazon·SDE-1·Technical·2024] 94.2% match
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// --- ANIMATION VARIANTS ---

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const cardHover = {
  whileHover: { y: -6, boxShadow: "0 20px 60px rgba(249,115,22,0.2)" }
}

// --- MAIN COMPONENT ---

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white selection:bg-[#F97316] selection:text-white overflow-x-hidden">

      {/* SECTION 1 — NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0B0B0F]/80 backdrop-blur-xl border-b border-[#F97316]/10 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform active:scale-95">
            <Flame className="text-[#F97316] fill-[#F97316]" size={28} />
            <span className="text-xl font-black tracking-tighter uppercase">Placement Archive</span>
          </Link>



          <div className="hidden md:flex items-center gap-6">
            <Link to="/auth" className="text-sm font-bold text-white hover:opacity-80 transition-opacity">Sign In</Link>
            <Link to="/auth?mode=register" className="bg-[#F97316] text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-[#FB923C] transition-all shadow-lg shadow-[#F97316]/20">Get Access</Link>
          </div>

          <button className="md:hidden text-[#F97316]" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={32} />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[60] bg-[#0B0B0F] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <Flame className="text-[#F97316]" size={32} />
              <button onClick={() => setMobileMenuOpen(false)}><X size={32} /></button>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Link to="/auth" className="w-full text-center py-4 text-xl font-bold border border-white/10 rounded-xl">Sign In</Link>
              <Link to="/auth?mode=register" className="w-full text-center py-4 text-xl font-bold bg-[#F97316] rounded-xl">Get Access</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2 — HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-40 px-6 overflow-hidden">
        {/* Animated Background Glows behind headline */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#F97316] blur-[120px] -z-10"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] left-[60%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#EF4444] blur-[100px] -z-10"
        />

        {/* Existing Background Orbs (Base Layer) */}
        <motion.div
          animate={{ x: [0, 40, -20, 0], y: [0, -40, 20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#F97316]/10 blur-[120px] -z-20"
        />
        <motion.div
          animate={{ x: [0, -60, 30, 0], y: [0, 60, -30, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[0%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#EF4444]/10 blur-[120px] -z-20"
        />

        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#F97316_1px,transparent_1px),linear-gradient(to_bottom,#F97316_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] -z-10" />

        <motion.div
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-5xl mx-auto text-center z-10"
        >
          {/* 1. Improved Badge */}
          <motion.div 
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F97316]/30 bg-[#F97316]/10 text-[#FB923C] text-sm font-medium mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-[#F97316] animate-ping" />
            The Peer-to-Peer Learning Revolution
          </motion.div>

          {/* 2. New Headline with Separate Audience Styles */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter leading-none mb-2"
            >
              Got Placed? Give Back.
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-[#F97316] via-[#EF4444] to-[#FB923C] bg-clip-text text-transparent tracking-tighter leading-none italic"
            >
              Still Preparing? Level Up.
            </motion.div>
          </div>

          {/* 3. Subtext Block */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <p className="text-xl md:text-2xl text-[#A1A1AA] font-medium leading-tight">
              The Placement Archive is built on one idea —
            </p>
            <p className="text-xl md:text-2xl text-[#A1A1AA] font-medium leading-tight">
              every student's experience makes the next student stronger.
            </p>
          </motion.div>

          {/* 4. Spaced out Tagline Pills */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center justify-center gap-4 text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-12"
          >
            <span className="text-[#F97316]">AI-powered</span>
            <span className="text-[#71717A] text-lg">·</span>
            <span className="text-[#FFFFFF]">Community-driven</span>
            <span className="text-[#71717A] text-lg">·</span>
            <span className="text-[#F97316]">Always growing.</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <Link to="/auth" className="w-full sm:w-auto px-10 py-5 bg-[#F97316] text-white rounded-full text-lg font-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#F97316]/40 flex items-center justify-center gap-3">
              Ask the Archive <ArrowRight size={20} />
            </Link>
            <Link to="/browse" className="w-full sm:w-auto px-10 py-5 border-2 border-[#F97316] border-opacity-30 text-white rounded-full text-lg font-bold hover:bg-[#F97316]/10 transition-all flex items-center justify-center gap-3">
              Browse Experiences
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0B0B0F] bg-zinc-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 242}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#71717A]">Joined by 500+ Dreamers this week</p>
          </motion.div>
        </motion.div>

        {/* Floating Cards (Existing layout preserved) */}
        <div className="mt-20 w-full max-w-6xl hidden lg:flex justify-between relative px-10">
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ delay: 0.9 }}
            className="w-64 bg-[#1C0F0A] border border-[#F97316]/20 p-5 rounded-2xl shadow-xl backdrop-blur-md"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase text-[#F97316]">Amazon</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-tighter">Offer ✓</span>
            </div>
            <p className="text-sm font-bold text-white mb-2 italic">"LRU Cache + System Design"</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-[#0B0B0F] px-2 py-1 rounded text-[#71717A]">SDE-1</span>
              <span className="text-[10px] bg-[#0B0B0F] px-2 py-1 rounded text-[#71717A]">Technical</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-64 bg-[#1C0F0A] border border-[#EF4444]/20 p-5 rounded-2xl shadow-xl backdrop-blur-md translate-y-10"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase text-[#EF4444]">Google</span>
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold uppercase text-[#EF4444]">Hard</span>
              </div>
            </div>
            <p className="text-sm font-bold text-white mb-2 italic">"Graph algorithms + DP"</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-[#0B0B0F] px-2 py-1 rounded text-[#71717A]">SWE</span>
              <span className="text-[10px] bg-[#0B0B0F] px-2 py-1 rounded text-[#71717A]">DSA</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ delay: 1.3 }}
            className="w-64 bg-[#1C0F0A] border border-[#FB923C]/20 p-5 rounded-2xl shadow-xl backdrop-blur-md"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase text-[#FB923C]">JP Morgan</span>
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-tighter">Offer ✓</span>
            </div>
            <p className="text-sm font-bold text-white mb-2 italic">"Java concurrency + SQL"</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-[#0B0B0F] px-2 py-1 rounded text-[#71717A]">SDE</span>
              <span className="text-[10px] bg-[#0B0B0F] px-2 py-1 rounded text-[#71717A]">2024</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — STATS BAR */}
      <section className="bg-[#1A0F07] border-t border-[#F97316]/10 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 items-center">
          <CountUp title="Experiences" target={500} suffix="+" />
          <CountUp title="Companies" target={50} suffix="+" />
          <CountUp title="AI Models" target={4} />
          <CountUp title="Active Students" target={100} suffix="+" />
        </div>
      </section>

      {/* SECTION 4 — FEATURE SHOWCASE */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black mb-6 italic">PRECISION ENGINEERING.</h2>
            <p className="text-xl text-[#71717A] max-w-2xl mx-auto font-medium">Every tool built to cut your preparation time in half. Professional grade intelligence for students who don't settle.</p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: MessageSquare, color: "text-[#F97316]", bg: "bg-[#F97316]/10", title: "Ask Anything", text: "Natural language Q&A powered by LangChain + GPT-4o-mini. Every answer cited to a real student experience.", tag: "GPT-4o-mini + ChromaDB" },
              { icon: Search, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", title: "Semantic Search", text: "Find experiences by meaning using sentence-transformers. Searches 500+ experiences in under 200ms.", tag: "all-MiniLM-L6-v2" },
              { icon: Tag, color: "text-[#FB923C]", bg: "bg-[#FB923C]/10", title: "AI Auto-Tagging", text: "Every submission tagged by fine-tuned distilBERT in under 2 seconds. Topics, difficulty, round — automatic.", tag: "distilBERT" },
              { icon: BarChart, color: "text-[#F97316]", bg: "bg-[#F97316]/10", title: "Difficulty Predictor", text: "XGBoost model trained on 200 samples predicts difficulty 1-5. SHAP values explain every prediction.", tag: "XGBoost + SHAP" },
              { icon: Target, color: "text-[#EF4444]", bg: "bg-[#EF4444]/10", title: "Gap Dashboard", text: "Set your target companies. See exactly which topics appear in their interviews vs what you have covered.", tag: "Personalised" },
              { icon: Mail, color: "text-[#FB923C]", bg: "bg-[#FB923C]/10", title: "Weekly Digest", text: "Every Sunday 8am IST — personalised email with top questions for your target companies. Bull.js cron.", tag: "Bull.js + Nodemailer" },
            ].map((f, i) => (
              <motion.div
                key={i} variants={fadeUpVariant} whileHover={cardHover.whileHover}
                className="bg-[#1C0F0A] border border-[#F97316]/15 p-10 rounded-3xl group transition-all"
              >
                <div className={`w-14 h-14 ${f.bg} flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className={f.color} size={28} />
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-[#F97316] transition-colors uppercase italic">{f.title}</h3>
                <p className="text-[#A1A1AA] leading-relaxed mb-8">{f.text}</p>
                <div className="inline-block px-3 py-1 rounded bg-[#0B0B0F] border border-white/5 text-[10px] font-black uppercase text-[#71717A] tracking-wider">
                  {f.tag}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="py-32 bg-[#1A0F07] px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic">From Submission to Intelligence</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#F97316] to-[#EF4444] mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Desktop Timeline Line */}
            <div className="hidden md:block absolute top-[18%] left-1/4 right-1/4 h-px border-t-2 border-dashed border-[#F97316]/20 -z-0" />

            {[
              { step: 1, icon: Upload, title: "Submit", desc: "A student submits their interview experience covering company, role, year and details.", color: "text-[#F97316]" },
              { step: 2, icon: Zap, title: "AI Processes", desc: "distilBERT auto-tags while sentence-transformers creates a 384-dimension vector embedding.", color: "text-[#EF4444]" },
              { step: 3, icon: Users, title: "Everyone Benefits", desc: "The community searches semantically, asks Q&A, and closes their prep gaps.", color: "text-[#FB923C]" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-[#F97316] flex items-center justify-center bg-[#1A0F07] text-[#F97316] font-black text-2xl mb-8 shadow-2xl shadow-[#F97316]/20">
                  {s.step}
                </div>
                <div className={`p-6 bg-[#0B0B0F] rounded-2xl border border-white/5 mb-6 ${s.color}`}>
                  <s.icon size={32} />
                </div>
                <h4 className="text-2xl font-black mb-4">{s.title}</h4>
                <p className="text-[#A1A1AA] font-medium leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — LIVE DEMO */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic">See it in action</h2>
            <p className="text-[#71717A] text-lg">Real questions. Real answers. Real citations.</p>
          </div>
          <TypewriterDemo />
        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-20 text-center uppercase italic tracking-tighter">What Students Say</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "The RAG Q&A told me exactly what JP Morgan asks in system design. I walked in knowing the exact topics and prepared them well.",
                author: "Priya Sharma",
                college: "VRSEC 2024",
                placedAt: "JP Morgan"
              },
              {
                text: "The gap dashboard showed me I was missing Graphs and DP for Amazon. Focused 2 weeks there specifically. Got the offer.",
                author: "Rahul Kumar",
                college: "NIT Warangal 2024",
                placedAt: "Amazon"
              },
              {
                text: "The SHAP difficulty tooltip is something I showed in my interview as my own side project. The panel was genuinely impressed.",
                author: "Ananya Reddy",
                college: "VRSEC 2024",
                placedAt: "Microsoft"
              }
            ].map((t, i) => (
              <motion.div
                key={i} variants={fadeUpVariant}
                className="bg-[#1C0F0A] p-10 rounded-3xl border border-[#F97316]/10 relative"
              >
                <div className="text-6xl font-serif text-[#F97316] opacity-30 absolute top-4 left-6">“</div>
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} className="text-[#F97316] fill-[#F97316]" />)}
                </div>
                <p className="text-white text-lg font-medium leading-relaxed mb-8 italic z-10 relative">"{t.text}"</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div>
                    <div className="font-black text-white text-sm uppercase italic">{t.author}</div>
                    <div className="text-[10px] uppercase text-[#71717A] font-bold tracking-widest">{t.college}</div>
                  </div>
                  <div className="bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20 text-[#FB923C] text-[10px] font-black uppercase">
                    {t.placedAt}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0F07] to-[#0B0B0F] -z-10" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter"
          >
            READY TO PREPARE<br />SMARTER?
          </motion.h2>
          <p className="text-xl text-[#A1A1AA] mb-12 font-medium max-w-xl mx-auto">Join 500+ students who stopped guessing and started winning interviews with data.</p>

          <Link to="/auth?mode=register" className="inline-flex items-center gap-4 bg-[#F97316] text-white px-12 py-6 rounded-full text-2xl font-black hover:scale-105 transition-all shadow-2xl shadow-[#F97316]/40 mb-10">
            Get Started Free <ArrowRight size={28} />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-8 text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2 italic">✓ No signup required</span>
            <span className="flex items-center gap-2 italic">✓ 500+ real experiences</span>
            <span className="flex items-center gap-2 italic">✓ AI-powered insights</span>
          </div>

          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#F97316]/5 blur-[100px] -z-10 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#EF4444]/5 blur-[100px] -z-10 rounded-full" />
        </div>
      </section>

      {/* SECTION 9 — FOOTER */}
      <footer className="pt-32 pb-12 px-6 bg-[#0B0B0F] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="text-[#F97316]" size={24} />
                <span className="text-lg font-black uppercase italic tracking-tighter">Placement Archive</span>
              </div>
              <p className="text-[#71717A] leading-relaxed text-sm font-medium">AI-powered placement intelligence platform for Indian engineering students. Built with accuracy and efficiency in mind.</p>
            </div>

            {[
              { title: "Product", links: ["Ask AI", "Search", "Gap Dashboard", "Submit Experience"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Resources", links: ["Documentation", "API", "GitHub", "LinkedIn"] }
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-white font-black uppercase text-xs tracking-widest mb-8">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}><Link to="#" className="text-[#71717A] text-sm font-medium hover:text-[#F97316] transition-colors">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:row items-center justify-between pt-12 border-t border-white/5 gap-8">
            <p className="text-[#71717A] text-xs font-bold uppercase tracking-widest">© 2026 PLACEMENT ARCHIVE. BUILT AT VRSEC, VIJAYAWADA.</p>
            <div className="flex items-center gap-8 text-[#71717A]">
              <Link to="#" className="hover:text-white transition-colors"><Github size={20} /></Link>
              <Link to="#" className="hover:text-white transition-colors"><Linkedin size={20} /></Link>
              <Link to="#" className="hover:text-white transition-colors"><Twitter size={20} /></Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
