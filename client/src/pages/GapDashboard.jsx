import { useState } from 'react'
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

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-56 bg-white border border-gray-100 rounded-[1.5rem] animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-sm font-bold text-red-700 text-center">
          Unable to load gap analysis right now.
        </div>
      </div>
    )
  }

  const uncoveredGaps = gaps.filter((gap) => !gap.isCovered)
  const coveredTopics = gaps.filter((gap) => gap.isCovered)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative z-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Preparation gap dashboard</h1>
          {targetCompanies.length > 0 && (
            <p className="text-sm font-semibold text-gray-500 mt-1">
              Targeting: {targetCompanies.slice(0, 3).join(', ')}
              {targetCompanies.length > 3 && ` +${targetCompanies.length - 3} more`}
              {targetRole && ` | ${targetRole}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowSetup((prev) => !prev)}
          className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 shadow-sm hover:border-gray-300 hover:text-gray-900 hover:-translate-y-0.5 transition-all"
        >
          {showSetup ? 'Hide setup' : 'Edit targets'}
        </button>
      </div>

      {(needsSetup || showSetup) && (
        <div className="mb-8">
          <ProfileSetup
            onSave={handleSave}
            isSaving={isSaving}
            initialCompanies={targetCompanies}
            initialRole={targetRole}
          />
        </div>
      )}

      {!needsSetup && gapData && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <ReadinessScore
              score={readinessScore}
              coveredCount={gapData.coveredCount}
              totalTopics={gapData.totalTopics}
            />
            <TopicRadar radarData={radarData} />
          </div>

          <div className="mb-5">
            <CompanyCoverage coverage={companyCoverage} />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Priority skill gaps</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{uncoveredGaps.length} gaps identified</span>
            </div>

            {uncoveredGaps.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-sm font-bold text-green-700 text-center shadow-sm">
                No major gaps detected. You have covered all key topics for your selected companies!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {uncoveredGaps.slice(0, 6).map((gap, index) => (
                  <GapCard key={gap.topic} gap={gap} rank={index + 1} />
                ))}
              </div>
            )}
          </div>

          {coveredTopics.length > 0 && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 shadow-sm mb-10">
              <p className="text-[11px] font-black uppercase tracking-widest text-teal-700 mb-4">Topics you have covered</p>
              <div className="flex flex-wrap gap-2">
                {coveredTopics.map((gap) => (
                  <span
                    key={gap.topic}
                    className="text-[11px] font-bold px-3 py-1.5 bg-white border border-teal-200 text-teal-800 rounded-full shadow-sm"
                  >
                    {gap.topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
