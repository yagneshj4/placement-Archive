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
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          Unable to load gap analysis right now.
        </div>
      </div>
    )
  }

  const uncoveredGaps = gaps.filter((gap) => !gap.isCovered)
  const coveredTopics = gaps.filter((gap) => gap.isCovered)

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Preparation gap dashboard</h1>
          {targetCompanies.length > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">
              Targeting: {targetCompanies.slice(0, 3).join(', ')}
              {targetCompanies.length > 3 && ` +${targetCompanies.length - 3} more`}
              {targetRole && ` | ${targetRole}`}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowSetup((prev) => !prev)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          {showSetup ? 'Hide setup' : 'Edit targets'}
        </button>
      </div>

      {(needsSetup || showSetup) && (
        <div className="mb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <ReadinessScore
              score={readinessScore}
              coveredCount={gapData.coveredCount}
              totalTopics={gapData.totalTopics}
            />
            <TopicRadar radarData={radarData} />
          </div>

          <div className="mb-4">
            <CompanyCoverage coverage={companyCoverage} />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">Priority skill gaps</h2>
              <span className="text-xs text-gray-400">{uncoveredGaps.length} gaps identified</span>
            </div>

            {uncoveredGaps.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700">
                No major gaps detected. You have covered key topics for your selected companies.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {uncoveredGaps.slice(0, 6).map((gap, index) => (
                  <GapCard key={gap.topic} gap={gap} rank={index + 1} />
                ))}
              </div>
            )}
          </div>

          {coveredTopics.length > 0 && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <p className="text-xs font-medium text-green-700 mb-2">Topics you have covered</p>
              <div className="flex flex-wrap gap-2">
                {coveredTopics.map((gap) => (
                  <span
                    key={gap.topic}
                    className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full"
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
