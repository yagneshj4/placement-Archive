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
    <div ref={ref} className="text-center px-8 md:border-r border-gray-200 last:border-0 py-6 md:py-0">
      <div className="text-5xl font-black text-gray-900 mb-2">{count}{suffix}</div>
      <div className="text-gray-400 text-sm font-medium tracking-widest uppercase opacity-70">{title}</div>
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
    <div ref={ref} className="w-full max-w-3xl mx-auto bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xl">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/10 border border-red-500/20" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/10 border border-yellow-500/20" />
          <div className="w-3 h-3 rounded-full bg-green-500/10 border border-green-500/20" />
        </div>
        <div className="text-gray-400 text-xs font-mono ml-4 uppercase tracking-widest flex items-center gap-2">
          <Search size={12} /> Ask the Archive
        </div>
      </div>
      <div className="p-8 font-mono text-sm sm:text-base">
        <div className="flex gap-3 text-gray-900 mb-8">
          <span className="text-blue-600 shrink-0">Query:</span>
          <span className="border-r-2 border-blue-600 pr-1">{query}</span>
        </div>

        <AnimatePresence>
          {answerVisible && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-6 rounded-lg border border-gray-100"
            >
              <div className="text-blue-600 text-xs mb-3 font-bold uppercase tracking-tighter">AI Answer:</div>
              <div className="text-gray-900 space-y-4 leading-relaxed opacity-90">
                <p>Amazon's 2024 technical rounds focused heavily on <span className="text-blue-700 font-bold underline decoration-blue-600/30">LRU Cache</span> [Amazon·SDE-1] and graph algorithms including BFS/DFS traversal [Amazon·SDE-1].</p>
                <p>System design rounds typically featured <span className="text-blue-700">URL shortener</span> or <span className="text-blue-700">Rate Limiter</span> design in round 3.</p>
              </div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-6 flex items-center gap-2 text-blue-600 text-xs font-bold"
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
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-900 selection:text-white overflow-x-hidden relative">
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '40px 40px' }}
      />

      {/* SECTION 1 — NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl border-b border-gray-200 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform active:scale-95 group">
            <Flame className="text-gray-900" size={28} />
            <span className="text-xl font-black tracking-tighter uppercase text-gray-900">Placement Archive</span>
          </Link>



          <div className="hidden md:flex items-center gap-6">
            <Link to="/auth" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">Sign In</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/auth?mode=register" className="bg-gray-900 text-white px-6 py-2.5 rounded-full text-sm font-black hover:bg-black transition-all shadow-lg hover:shadow-xl">Get Access</Link>
            </motion.div>
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
            className="fixed inset-0 z-[60] bg-white p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-12">
              <Flame className="text-gray-900" size={32} />
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-900"><X size={32} /></button>
            </div>

            <div className="mt-auto flex flex-col gap-4">
              <Link to="/auth" className="w-full text-center py-4 text-xl font-bold border border-gray-200 rounded-xl text-gray-900">Sign In</Link>
              <Link to="/auth?mode=register" className="w-full text-center py-4 text-xl font-bold bg-gray-900 text-white rounded-xl">Get Access</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SECTION 2 — HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-40 px-6 overflow-hidden">
        {/* Animated Background Glows behind headline */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-blue-100 blur-[120px] -z-10"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[25%] left-[60%] -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-indigo-100 blur-[100px] -z-10"
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


        <motion.div
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-5xl mx-auto text-center z-10"
        >
          {/* 1. Improved Badge */}
          <motion.div 
            variants={fadeUpVariant}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50 text-blue-600 text-sm font-medium mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            The Peer-to-Peer Learning Revolution
          </motion.div>

          {/* 2. New Headline with Separate Audience Styles */}
          <div className="mb-8 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tighter leading-none mb-2"
            >
              Got Placed? Give Back.
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-6xl md:text-8xl font-black bg-gradient-to-r from-blue-700 to-indigo-900 bg-clip-text text-transparent tracking-tighter leading-none uppercase italic"
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
            <p className="text-xl md:text-2xl text-gray-500 font-medium leading-tight">
              The Placement Archive is built on one idea —
            </p>
            <p className="text-xl md:text-2xl text-gray-500 font-medium leading-tight">
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
            <span className="text-blue-600">AI-powered</span>
            <span className="text-gray-300 text-lg">·</span>
            <span className="text-gray-900">Community-driven</span>
            <span className="text-gray-300 text-lg">·</span>
            <span className="text-blue-600">Always growing.</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link to="/auth" className="w-full group px-10 py-5 bg-gray-900 text-white rounded-full text-lg font-black transition-all shadow-xl flex items-center justify-center gap-3">
                Ask the Archive 
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <ArrowRight size={20} />
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -4, backgroundColor: "rgba(243, 244, 246, 1)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link to="/browse" className="w-full px-10 py-5 border-2 border-gray-200 text-gray-900 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-3">
                Browse Experiences
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 242}`} alt="avatar" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Joined by 500+ Dreamers this week</p>
          </motion.div>
        </motion.div>

        {/* Floating Cards (Existing layout preserved) */}
        <div className="mt-20 w-full max-w-6xl hidden lg:flex justify-between relative px-10">
          <motion.div
            initial={{ opacity: 0, x: -50, rotate: -3 }}
            animate={{ opacity: 1, x: 0, rotate: -3 }}
            transition={{ delay: 0.9 }}
            className="w-64 bg-white border border-gray-100 p-5 rounded-2xl shadow-xl backdrop-blur-md"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase text-blue-600">Amazon</span>
              <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tighter">Offer ✓</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-2 italic">"LRU Cache + System Design"</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500">SDE-1</span>
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500">Technical</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-64 bg-white border border-gray-100 p-5 rounded-2xl shadow-xl backdrop-blur-md translate-y-10"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase text-red-600">Google</span>
              <div className="flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold uppercase text-red-600">Hard</span>
              </div>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-2 italic">"Graph algorithms + DP"</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500">SWE</span>
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500">DSA</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 2 }}
            transition={{ delay: 1.3 }}
            className="w-64 bg-white border border-gray-100 p-5 rounded-2xl shadow-xl backdrop-blur-md"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-black uppercase text-indigo-600">JP Morgan</span>
              <span className="px-2 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-tighter">Offer ✓</span>
            </div>
            <p className="text-sm font-bold text-gray-900 mb-2 italic">"Java concurrency + SQL"</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500">SDE</span>
              <span className="text-[10px] bg-gray-50 px-2 py-1 rounded text-gray-500">2024</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 3 — STATS BAR */}
      <section className="bg-white/40 backdrop-blur-sm border-y border-gray-100 py-20 px-6">
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
            <h2 className="text-4xl md:text-6xl font-black mb-6 italic text-gray-900">PRECISION ENGINEERING.</h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium">Every tool built to cut your preparation time in half. Professional grade intelligence for students who don't settle.</p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50", title: "Ask Anything", text: "Natural language Q&A powered by LangChain + GPT-4o-mini. Every answer cited to a real student experience.", tag: "GPT-4o-mini + ChromaDB" },
              { icon: Search, color: "text-indigo-600", bg: "bg-indigo-50", title: "Semantic Search", text: "Find experiences by meaning using sentence-transformers. Searches 500+ experiences in under 200ms.", tag: "all-MiniLM-L6-v2" },
              { icon: Tag, color: "text-teal-600", bg: "bg-teal-50", title: "AI Auto-Tagging", text: "Every submission tagged by fine-tuned distilBERT in under 2 seconds. Topics, difficulty, round — automatic.", tag: "distilBERT" },
              { icon: BarChart, color: "text-purple-600", bg: "bg-purple-50", title: "Difficulty Predictor", text: "XGBoost model trained on 200 samples predicts difficulty 1-5. SHAP values explain every prediction.", tag: "XGBoost + SHAP" },
              { icon: Target, color: "text-red-600", bg: "bg-red-50", title: "Gap Dashboard", text: "Set your target companies. See exactly which topics appear in their interviews vs what you have covered.", tag: "Personalised" },
              { icon: Mail, color: "text-amber-600", bg: "bg-amber-50", title: "Weekly Digest", text: "Every Sunday 8am IST — personalised email with top questions for your target companies. Bull.js cron.", tag: "Bull.js + Nodemailer" },
            ].map((f, i) => (
              <motion.div
                key={i} variants={fadeUpVariant} whileHover={{ y: -6, boxShadow: "0 20px 60px rgba(0,0,0,0.05)" }}
                className="bg-white border border-gray-100 p-10 rounded-3xl group transition-all"
              >
                <div className={`w-14 h-14 ${f.bg} flex items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className={f.color} size={28} />
                </div>
                <h3 className="text-2xl font-black mb-4 group-hover:text-gray-900 transition-colors uppercase italic text-gray-800">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-8">{f.text}</p>
                <div className="inline-block px-3 py-1 rounded bg-gray-50 border border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {f.tag}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="py-32 bg-transparent px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic text-gray-900">From Submission to Intelligence</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            {/* Desktop Timeline Line */}
            <div className="hidden md:block absolute top-[18%] left-1/4 right-1/4 h-px border-t-2 border-dashed border-gray-200 -z-0" />

            {[
              { step: 1, icon: Upload, title: "Submit", desc: "A student submits their interview experience covering company, role, year and details.", color: "text-blue-600", bg: "bg-blue-50" },
              { step: 2, icon: Zap, title: "AI Processes", desc: "distilBERT auto-tags while sentence-transformers creates a 384-dimension vector embedding.", color: "text-indigo-600", bg: "bg-indigo-50" },
              { step: 3, icon: Users, title: "Everyone Benefits", desc: "The community searches semantically, asks Q&A, and closes their prep gaps.", color: "text-teal-600", bg: "bg-teal-50" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUpVariant} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-full border-2 border-gray-900 flex items-center justify-center bg-white text-gray-900 font-black text-2xl mb-8 shadow-xl">
                  {s.step}
                </div>
                <div className={`p-6 ${s.bg} rounded-2xl border border-gray-100 mb-6 ${s.color}`}>
                  <s.icon size={32} />
                </div>
                <h4 className="text-2xl font-black mb-4 text-gray-900">{s.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — LIVE DEMO */}
      <section className="py-32 px-6 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase italic text-gray-900">See it in action</h2>
            <p className="text-gray-500 text-lg">Real questions. Real answers. Real citations.</p>
          </div>
          <TypewriterDemo />
        </div>
      </section>

      {/* SECTION 7 — TESTIMONIALS */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-20 text-center uppercase italic tracking-tighter text-gray-900">What Students Say</h2>

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
                className="bg-white p-10 rounded-3xl border border-gray-100 relative shadow-sm"
              >
                <div className="text-6xl font-serif text-blue-100 absolute top-4 left-6">“</div>
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} className="text-blue-600 fill-blue-600" />)}
                </div>
                <p className="text-gray-800 text-lg font-medium leading-relaxed mb-8 italic z-10 relative">"{t.text}"</p>
                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div>
                    <div className="font-black text-gray-900 text-sm uppercase italic">{t.author}</div>
                    <div className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">{t.college}</div>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 text-blue-700 text-[10px] font-black uppercase">
                    {t.placedAt}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — FINAL CTA */}
      <section className="py-32 px-6 relative overflow-hidden bg-transparent">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white -z-10" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-7xl font-black mb-8 italic tracking-tighter text-gray-900"
          >
            READY TO PREPARE<br />SMARTER?
          </motion.h2>
          <p className="text-xl text-gray-500 mb-12 font-medium max-w-xl mx-auto">Join 500+ students who stopped guessing and started winning interviews with data.</p>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block"
          >
            <Link to="/auth?mode=register" className="inline-flex items-center gap-4 bg-gray-900 text-white px-12 py-6 rounded-full text-2xl font-black transition-all shadow-xl mb-10 group">
              Get Started Free 
              <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2 italic">✓ No signup required</span>
            <span className="flex items-center gap-2 italic">✓ 500+ real experiences</span>
            <span className="flex items-center gap-2 italic">✓ AI-powered insights</span>
          </div>

          <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[#F97316]/5 blur-[100px] -z-10 rounded-full" />
          <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-[#EF4444]/5 blur-[100px] -z-10 rounded-full" />
        </div>
      </section>

      {/* SECTION 9 — FOOTER */}
      <footer className="pt-32 pb-12 px-6 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6 text-gray-900">
                <Flame size={24} />
                <span className="text-lg font-black uppercase italic tracking-tighter">Placement Archive</span>
              </div>
              <p className="text-gray-500 leading-relaxed text-sm font-medium">AI-powered placement intelligence platform for Indian engineering students. Built with accuracy and efficiency in mind.</p>
            </div>

            {[
              { title: "Product", links: ["Ask AI", "Search", "Gap Dashboard", "Submit Experience"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Resources", links: ["Documentation", "API", "GitHub", "LinkedIn"] }
            ].map((col, i) => (
              <div key={i}>
                <h5 className="text-gray-900 font-black uppercase text-xs tracking-widest mb-8">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}><Link to="#" className="text-gray-500 text-sm font-medium hover:text-blue-600 transition-colors">{link}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:row items-center justify-between pt-12 border-t border-gray-100 gap-8">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">© 2026 PLACEMENT ARCHIVE. BUILT AT VRSEC, VIJAYAWADA.</p>
            <div className="flex items-center gap-8 text-gray-400">
              <Link to="#" className="hover:text-gray-900 transition-colors"><Github size={20} /></Link>
              <Link to="#" className="hover:text-gray-900 transition-colors"><Linkedin size={20} /></Link>
              <Link to="#" className="hover:text-gray-900 transition-colors"><Twitter size={20} /></Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
