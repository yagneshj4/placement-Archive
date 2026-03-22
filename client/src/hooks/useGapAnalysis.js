import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { useAuth } from './useAuth'

export function useGapAnalysis() {
	const { user } = useAuth()
	const queryClient = useQueryClient()

	const gapQuery = useQuery({
		queryKey: ['gap-analysis', user?.id],
		queryFn: async () => {
			const { data } = await usersApi.getGapAnalysis()
			return data.data
		},
		enabled: !!user,
		staleTime: 1000 * 60 * 5,
	})

	const profileMutation = useMutation({
		mutationFn: (updates) => usersApi.updateProfile(updates),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['gap-analysis'] })
			queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
		},
	})

	const data = gapQuery.data || {}

	return {
		gapData: data,
		isLoading: gapQuery.isLoading,
		isError: gapQuery.isError,
		refetch: gapQuery.refetch,
		updateProfile: profileMutation.mutate,
		isSaving: profileMutation.isPending,
		gaps: data.gaps || [],
		radarData: data.radarData || [],
		companyCoverage: data.companyCoverage || [],
		readinessScore: data.readinessScore ?? 0,
		targetCompanies: data.targetCompanies || [],
		targetRole: data.targetRole || '',
	}
}