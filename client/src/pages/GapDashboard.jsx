import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle2, ChevronDown, Activity, Settings2, Sparkles } from 'lucide-react'
import { useGapAnalysis } from '../hooks/useGapAnalysis'
import ReadinessScore from '../components/dashboard/ReadinessScore'
import TopicRadar from '../components/dashboard/TopicRadar'
import GapCard from '../components/dashboard/GapCard'
import CompanyCoverage from '../components/dashboard/CompanyCoverage'
import ProfileSetup from '../components/dashboard/ProfileSetup'

export default function GapDashboard() {
  const {
    gapData,
    isLoading,
    isError,
    gaps,
    radarData,
    companyCoverage,
    readinessScore,
    targetCompanies,
    targetRole,
    updateProfile,
    isSaving,
  } = useGapAnalysis()

  const [showSetup, setShowSetup] = useState(false)
  const needsSetup = !isLoading && targetCompanies.length === 0

  const handleSave = (updates) => {
    updateProfile(updates, {
      onSuccess: () => setShowSetup(false),
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 font-sans">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="h-64 bg-white border border-gray-100 rounded-3xl animate-pulse shadow-sm" />
          <div className="h-64 bg-white border border-gray-100 rounded-3xl animate-pulse shadow-sm" />
        </div>
        <div className="h-40 bg-white border border-gray-100 rounded-3xl animate-pulse shadow-sm mb-6" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center flex flex-col items-center shadow-sm"
        >
           <AlertTriangle size={48} className="text-red-400 mb-4" />
           <h3 className="text-xl font-black text-red-900 mb-2">Analysis Failed</h3>
           <p className="text-sm font-semibold text-red-700">Unable to load your AI gap analysis right now. Please try again later.</p>
        </motion.div>
      </div>
    )
  }

  const uncoveredGaps = gaps.filter((gap) => !gap.isCovered)
  const coveredTopics = gaps.filter((gap) => gap.isCovered)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative z-10 font-sans">
      
      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-4 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0 sm:border sm:rounded-2xl sm:p-5 sm:shadow-sm sm:shadow-gray-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Sparkles className="text-indigo-500" size={24} />
             <h1 className="text-2xl font-black text-gray-900 tracking-tight">AI Preparation Gap</h1>
          </div>
          {targetCompanies.length > 0 ? (
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex flex-wrap gap-2 items-center mt-2">
              <span className="bg-gray-100 px-2 py-1.5 rounded text-gray-700">
                {targetCompanies.slice(0, 3).join(', ')}
                {targetCompanies.length > 3 && ` +${targetCompanies.length - 3}`}
              </span>
              {targetRole && <span className="text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded border border-indigo-100">{targetRole}</span>}
            </p>
          ) : (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Identify your weaknesses</p>
          )}
        </div>
        
        <button
          onClick={() => setShowSetup((prev) => !prev)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-sm ${
            showSetup 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:shadow-md hover:-translate-y-0.5'
          }`}
        >
          {showSetup ? <ChevronDown size={18} /> : <Settings2 size={18} />}
          {showSetup ? 'Hide Settings' : 'Configure Targets'}
        </button>
      </div>

      <AnimatePresence>
        {(needsSetup || showSetup) && (
          <motion.div 
            initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ height: 'auto', opacity: 1, overflow: 'visible' }}
            exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
            className="mb-8"
          >
            <ProfileSetup
              onSave={handleSave}
              isSaving={isSaving}
              initialCompanies={targetCompanies}
              initialRole={targetRole}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!needsSetup && gapData && (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Top Grid: Score & Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <motion.div variants={itemVariants} className="h-full">
              <ReadinessScore
                score={readinessScore}
                coveredCount={gapData.coveredCount}
                totalTopics={gapData.totalTopics}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="h-full">
              <TopicRadar radarData={radarData} />
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="mb-8">
            <CompanyCoverage coverage={companyCoverage} />
          </motion.div>

          {/* Priority Gaps */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm border border-orange-100">
                    <Activity size={20} />
                 </div>
                 <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Priority Skill Gaps</h2>
              </div>
              {uncoveredGaps.length > 0 && (
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full shadow-sm">
                  {uncoveredGaps.length} Alert{uncoveredGaps.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {uncoveredGaps.length === 0 ? (
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm"
              >
                <CheckCircle2 size={56} className="text-emerald-400 mb-4 drop-shadow-sm" />
                <h3 className="text-xl font-black text-emerald-900 mb-2">You're Fully Prepared!</h3>
                <p className="text-sm font-semibold text-emerald-700 max-w-sm">
                  No major gaps detected. You have covered all key topics perfectly for these specified companies.
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {uncoveredGaps.slice(0, 6).map((gap, index) => (
                  <motion.div 
                    key={gap.topic} 
                    variants={itemVariants}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="h-full"
                  >
                    <GapCard gap={gap} rank={index + 1} />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Covered Topics */}
          {coveredTopics.length > 0 && (
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-3xl p-6 shadow-sm mb-10 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-5 relative z-10">
                <CheckCircle2 size={18} className="text-teal-600" />
                <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-800">Strengths & Covered Topics</p>
              </div>
              <div className="flex flex-wrap gap-2 relative z-10">
                {coveredTopics.map((gap) => (
                  <motion.span
                    key={gap.topic}
                    whileHover={{ scale: 1.05 }}
                    className="text-xs font-bold px-4 py-2 bg-white border border-teal-200 text-teal-800 rounded-xl shadow-sm hover:shadow hover:border-teal-300 transition-all cursor-default"
                  >
                    {gap.topic}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
