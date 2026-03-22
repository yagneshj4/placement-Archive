import React, { useState } from 'react'
import PropTypes from 'prop-types'

// ─────────────────────────────────────────────────────────────────
// DifficultyBadgeWithSHAP Component
// ─────────────────────────────────────────────────────────────────
/**
 * Interactive difficulty badge with SHAP explainability.
 *
 * Props:
 *   - difficulty: int (1-5)
 *   - difficulty_label: string (Easy, Medium, Hard, Expert)
 *   - probability: float (0-1, confidence)
 *   - shap_values: array of { feature, description, raw_value, shap_value, direction, magnitude }
 *   - model_used: string ('xgboost' or 'rule_based')
 *   - top_driver: string (human-readable top factor)
 *   - className: optional CSS classes
 *
 * UI:
 *   - Badge shows difficulty level (1-5) with color coding:
 *       1 = green (Easy)
 *       2 = blue (Easy-Medium)
 *       3 = yellow (Medium)
 *       4 = orange (Hard)
 *       5 = red (Expert)
 *   - Hover shows SHAP explainability tooltip with:
 *       - Confidence percentage
 *       - Top 3 influential features
 *       - Direction (up/down) + magnitude for each
 *       - Model used (XGBoost or fallback rule-based)
 */

const DifficultyBadgeWithSHAP = React.memo(
  ({
    difficulty,
    difficulty_label,
    probability = 0.0,
    shap_values = [],
    model_used = 'unknown',
    top_driver = '',
    className = '',
  }) => {
    const [showTooltip, setShowTooltip] = useState(false)

    // ─ Color mapping for difficulty levels ──────────────────────
    const getDifficultyColor = () => {
      switch (difficulty) {
        case 1:
          return 'bg-green-100 text-green-800 border-green-300'
        case 2:
          return 'bg-blue-100 text-blue-800 border-blue-300'
        case 3:
          return 'bg-yellow-100 text-yellow-800 border-yellow-300'
        case 4:
          return 'bg-orange-100 text-orange-800 border-orange-300'
        case 5:
          return 'bg-red-100 text-red-800 border-red-300'
        default:
          return 'bg-gray-100 text-gray-800 border-gray-300'
      }
    }

    // ─ Get top 3 SHAP features by magnitude ────────────────────
    const topFeatures = shap_values.slice(0, 3)

    return (
      <div className={`relative inline-block ${className}`}>
        {/* Main Badge */}
        <div
          className={`
            px-3 py-1.5 rounded-full border font-semibold text-sm cursor-help
            transition-all duration-200
            ${getDifficultyColor()}
            ${showTooltip ? 'ring-2 ring-offset-1' : ''}
          `}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          title={`${difficulty_label} (${(probability * 100).toFixed(0)}% confidence)`}
        >
          <span className="flex items-center gap-1">
            {/* Difficulty icon/emoji */}
            <span className="text-lg">
              {difficulty === 1 && '🟢'}
              {difficulty === 2 && '🔵'}
              {difficulty === 3 && '🟡'}
              {difficulty === 4 && '🟠'}
              {difficulty === 5 && '🔴'}
            </span>
            {/* Label */}
            <span>{difficulty_label}</span>
          </span>
        </div>

        {/* SHAP Explainability Tooltip */}
        {showTooltip && (
          <div
            className={`
              absolute z-50 left-0 top-full mt-2 p-4 rounded-lg shadow-xl
              bg-white border border-gray-200 min-w-fit
              ${topFeatures.length > 0 ? 'w-80' : 'w-64'}
            `}
          >
            {/* Header */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-gray-800">
                  Difficulty Explanation
                </span>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {model_used === 'xgboost' ? '🤖 ML Model' : '⚙️ Rule-Based'}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Confidence: <span className="font-semibold">{(probability * 100).toFixed(1)}%</span>
              </div>
            </div>

            {/* Top Driver Summary */}
            {top_driver && (
              <div className="mb-3 p-2 bg-blue-50 border-l-2 border-blue-300 rounded">
                <p className="text-xs text-gray-700 italic">{top_driver}</p>
              </div>
            )}

            {/* Top 3 Influential Features */}
            {topFeatures.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                  Top Factors
                </p>
                <div className="space-y-2">
                  {topFeatures.map((feature, idx) => (
                    <SHAPFeatureRow key={idx} feature={feature} rank={idx + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* No SHAP values fallback */}
            {topFeatures.length === 0 && (
              <p className="text-xs text-gray-500 italic">
                No detailed explanations available (model data not yet loaded)
              </p>
            )}

            {/* Footer info */}
            <div className="mt-3 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {shap_values.length > 3
                  ? `+${shap_values.length - 3} more factors`
                  : 'All factors shown'}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

DifficultyBadgeWithSHAP.displayName = 'DifficultyBadgeWithSHAP'

DifficultyBadgeWithSHAP.propTypes = {
  difficulty: PropTypes.number.isRequired,
  difficulty_label: PropTypes.string.isRequired,
  probability: PropTypes.number,
  shap_values: PropTypes.arrayOf(
    PropTypes.shape({
      feature: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      raw_value: PropTypes.number.isRequired,
      shap_value: PropTypes.number.isRequired,
      direction: PropTypes.oneOf(['up', 'down']).isRequired,
      magnitude: PropTypes.number.isRequired,
    })
  ),
  model_used: PropTypes.string,
  top_driver: PropTypes.string,
  className: PropTypes.string,
}

// ─────────────────────────────────────────────────────────────────
// SHAPFeatureRow Component
// ─────────────────────────────────────────────────────────────────

const SHAPFeatureRow = ({ feature, rank }) => {
  const isUp = feature.direction === 'up'

  return (
    <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200">
      {/* Feature name + direction badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-gray-800">
          <span className="text-gray-500 mr-1">#{rank}</span>
          {feature.feature}
        </span>
        <span
          className={`
            text-xs font-semibold px-2 py-0.5 rounded
            ${isUp ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}
          `}
        >
          {isUp ? '↑ Harder' : '↓ Easier'}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-1">{feature.description}</p>

      {/* SHAP value bar */}
      <div className="flex items-center gap-1 mb-1">
        <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
          <div
            className={`h-full ${isUp ? 'bg-red-400' : 'bg-green-400'}`}
            style={{
              width: `${Math.min(feature.magnitude * 100, 100)}%`,
            }}
          />
        </div>
        <span className="text-gray-500 font-mono w-10 text-right">
          {feature.magnitude.toFixed(3)}
        </span>
      </div>

      {/* Raw value */}
      <p className="text-gray-500 text-xs">
        Value: <span className="font-mono">{feature.raw_value.toFixed(2)}</span>
      </p>
    </div>
  )
}

SHAPFeatureRow.propTypes = {
  feature: PropTypes.shape({
    feature: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    raw_value: PropTypes.number.isRequired,
    shap_value: PropTypes.number.isRequired,
    direction: PropTypes.oneOf(['up', 'down']).isRequired,
    magnitude: PropTypes.number.isRequired,
  }).isRequired,
  rank: PropTypes.number.isRequired,
}

export default DifficultyBadgeWithSHAP
