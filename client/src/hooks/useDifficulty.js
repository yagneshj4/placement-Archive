import { useMutation } from '@tanstack/react-query'
import { aiApi } from '../api/ai.js'

/**
 * useDifficulty Hook
 *
 * Predicts question difficulty with SHAP explainability.
 *
 * Usage:
 *   const { mutate, data, isPending, error } = useDifficulty()
 *
 *   mutate({
 *     company: 'Amazon',
 *     round_type: 'technical',
 *     topics: ['arrays', 'strings'],
 *     skip_rate: 0.15,
 *     avg_time_seconds: 180,
 *     self_rated_difficulty: 3.5,
 *     attempt_count: 25,
 *   })
 *
 * Returns:
 *   - difficulty: int (1-5)
 *   - difficulty_label: string (Easy, Medium, Hard, Expert)
 *   - probability: float (confidence 0-1)
 *   - probabilities: float[] (distribution across 5 classes)
 *   - shap_values: { feature, description, raw_value, shap_value, direction, magnitude }[]
 *   - model_used: 'xgboost' or 'rule_based'
 *   - top_driver: string (plain language top influence)
 */

export const useDifficulty = (options = {}) => {
  return useMutation({
    mutationFn: async (request) => {
      const response = await aiApi.predictDifficulty(request)
      return response.data
    },
    onError: (error) => {
      console.error('Difficulty prediction error:', error)
      if (options.onError) {
        options.onError(error)
      }
    },
    onSuccess: (data) => {
      if (options.onSuccess) {
        options.onSuccess(data)
      }
    },
    ...options,
  })
}
