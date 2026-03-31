import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Hero from '../components/Hero'
import Footer from '../components/Footer'

// Bento Grid Card Component - Light Theme Edition
const BentoCard = ({ title, description, icon, className, delay = 0, glowColor = 'rgba(124,58,237,0.05)' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay }}
      whileHover={{ y: -5 }}
      className={`relative group overflow-hidden bg-white rounded-3xl border border-gray-200 p-8 flex flex-col hover:shadow-xl hover:border-gray-300 transition-all ${className}`}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)` }}
      />
      <div className="relative z-10 font-mono text-[40px] mb-6 drop-shadow-sm">
        {icon}
      </div>
      <h3 className="relative z-10 text-2xl font-bold text-gray-900 tracking-wide mb-3">{title}</h3>
      <p className="relative z-10 text-gray-600 leading-relaxed text-sm flex-1">{description}</p>
      
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-x-4 group-hover:translate-x-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
          <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </motion.div>
  )
}

export default function Landing() {
  const containerRef = useRef(null)

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans overflow-x-hidden selection:bg-accent-violet/20 border-t-[0px]">
      
      {/* Header */}
      <header className="relative z-[9999] flex items-center justify-between px-6 lg:px-12 py-6 max-w-7xl mx-auto">
        <Link to="/" className="font-bold text-gray-900 text-lg tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shadow-md">
            <span className="text-white text-sm">◆</span>
          </div>
          The Placement Archive
        </Link>
        <a href="/auth" className="px-6 py-2.5 text-sm font-bold text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-xl hover:bg-gray-50 hover:shadow-sm transition-all cursor-pointer">
          Sign In
        </a>
      </header>

      {/* 1. The Incredible Clean Hero */}
      <Hero />

      <main ref={containerRef} className="relative z-10 bg-white pt-10 pb-32">
        
        {/* Floating Stats Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto -mt-16 mb-32 relative z-20"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-full py-6 px-8 flex flex-wrap items-center justify-between shadow-lg">
            {[
              { label: 'Verified Experiences', value: '250+' },
              { label: 'Top Tier Companies', value: '60+' },
              { label: 'AI Inference Engines', value: '4' },
              { label: 'Data Accuracy', value: '99%' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center px-6 border-r border-gray-100 last:border-0">
                <span className="text-3xl font-black bg-gradient-to-br from-gray-900 to-gray-600 bg-clip-text text-transparent tracking-tighter">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 2. Premium Bento Grid Features */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-20"
          >
            <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight leading-none mb-6">
              Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-violet via-accent-teal to-accent-violet bg-[length:200%_auto] animate-gradient-x hover:bg-right transition-all duration-1000">Intelligence.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We ditched primitive keyword searches. Our architecture uses four separate machine learning models to decode, rank, and predict your interview success.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Large Feature Card */}
            <BentoCard 
              className="md:col-span-2 min-h-[350px]"
              title="Semantic Similarity Search"
              icon="🧠"
              description="Stop guessing the right keywords. Type exactly what you are thinking, like 'tricky behavioral questions at fintech startups'. Our vector database parses the meaning of your query and finds experiences using 384-dimensional mathematical embeddings."
            />
            {/* Small Feature Card */}
            <BentoCard 
              className="md:col-span-1 min-h-[350px]"
              title="Predictive Difficulty"
              icon="⚡"
              delay={0.1}
              description="Our XGBoost model predicts the exact difficulty level (1-5) of your upcoming interview by analyzing the company, your role, and historical round structures."
            />
            
            {/* Small Feature Card */}
            <BentoCard 
              className="md:col-span-1 min-h-[350px]"
              title="Auto-Extraction"
              icon="🏷️"
              delay={0.2}
              description="Paste a wall of text. We use DistilBERT to automatically extract the timeline, rounds, topics, and specific algorithms mentioned."
            />
            {/* Large Feature Card */}
            <BentoCard 
              className="md:col-span-2 min-h-[350px]"
              title="Retrieval-Augmented Chatbots"
              icon="🤖"
              delay={0.3}
              description="Talk directly to the archive. Ask our AI engine any question, and it will read through every single interview experience, synthesize the advice, and cite exact peer quotes as proof."
            />
          </div>
        </div>

        {/* 3. Deep Dive CTA */}
        <div className="mt-40 mb-20 relative px-4">
          <div className="max-w-5xl mx-auto relative rounded-[2.5rem] overflow-hidden bg-gray-900 shadow-2xl p-16 text-center">
            {/* Inner glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent-violet/20 to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-violet blur-[120px] opacity-30 pointer-events-none rounded-full" />
            
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 relative z-10 text-white">Stop failing the rounds you <br/>could have prepared for.</h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto relative z-10 text-lg">
              Join the students who access the archive to spot exact patterns in companies' hiring pipelines.
            </p>
            
            <motion.div whileHover={{ scale: 1.05 }} className="relative z-10 inline-block">
              <Link to="/auth" className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-black tracking-widest text-sm uppercase shadow-xl hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all">
                Access the Archive
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
