import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuth } from './useAuth'

export function useBookmarks() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch bookmarks — only when user is logged in
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const { data } = await authApi.getBookmarks()
      return data.data
    },
    enabled: !!user,          // only fetch when logged in
    staleTime: 1000 * 60 * 2, // fresh for 2 minutes
  })

  // Remove bookmark mutation with optimistic update
  const removeMutation = useMutation({
    mutationFn: (experienceId) => authApi.removeBookmark(experienceId),
    onMutate: async (experienceId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] })

      // Snapshot current data
      const previous = queryClient.getQueryData(['bookmarks'])

      // Optimistically remove from cache
      queryClient.setQueryData(['bookmarks'], (old) => {
        if (!old) return old
        return {
          ...old,
          bookmarks: old.bookmarks.filter(b => b._id !== experienceId),
          total: old.total - 1,
        }
      })

      return { previous }
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      queryClient.setQueryData(['bookmarks'], context.previous)
    },
    onSettled: () => {
      // Always refetch after mutation to sync with server
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
  })

  return {
    bookmarks: data?.bookmarks || [],
    total:     data?.total     || 0,
    isLoading,
    isError,
    removeBookmark: removeMutation.mutate,
    isRemoving:     removeMutation.isPending,
  }
}
