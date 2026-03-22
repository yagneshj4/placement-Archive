import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { experiencesApi } from '../api/experiences'

// Debounce helper — waits ms milliseconds after last call before invoking fn
function useDebounce(value, ms = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(t)
  }, [value, ms])
  return debounced
}

export function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read initial state from URL so search results are shareable/bookmarkable
  const [query,     setQuery]     = useState(searchParams.get('q')         || '')
  const [company,   setCompany]   = useState(searchParams.get('company')   || '')
  const [roundType, setRoundType] = useState(searchParams.get('roundType') || '')
  const [year,      setYear]      = useState(searchParams.get('year')      || '')
  const [sort,      setSort]      = useState(searchParams.get('sort')      || 'relevance')
  const [page,      setPage]      = useState(Number(searchParams.get('page')) || 1)

  const debouncedQuery = useDebounce(query, 400)

  // Sync state → URL whenever filters change
  useEffect(() => {
    const params = {}
    if (debouncedQuery) params.q         = debouncedQuery
    if (company)        params.company   = company
    if (roundType)      params.roundType = roundType
    if (year)           params.year      = year
    if (sort !== 'relevance') params.sort = sort
    if (page > 1)       params.page      = page
    setSearchParams(params, { replace: true })
  }, [debouncedQuery, company, roundType, year, sort, page, setSearchParams])

  // React Query fetch — re-runs whenever debounced query or filters change
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['search', debouncedQuery, company, roundType, year, sort, page],
    queryFn: async () => {
      const params = { page, limit: 10, sort }
      if (debouncedQuery) params.q         = debouncedQuery
      if (company)        params.company   = company
      if (roundType)      params.roundType = roundType
      if (year)           params.year      = year
      const { data } = await experiencesApi.search(params)
      return data.data
    },
    keepPreviousData: true,   // keep old results while new ones load
    staleTime: 1000 * 30,    // cache for 30 seconds
  })

  // Reset to page 1 when any filter changes
  const handleQueryChange     = useCallback((v) => { setQuery(v);     setPage(1) }, [])
  const handleCompanyChange   = useCallback((v) => { setCompany(v);   setPage(1) }, [])
  const handleRoundTypeChange = useCallback((v) => { setRoundType(v); setPage(1) }, [])
  const handleYearChange      = useCallback((v) => { setYear(v);      setPage(1) }, [])
  const handleSortChange      = useCallback((v) => { setSort(v);      setPage(1) }, [])

  const clearFilters = useCallback(() => {
    setQuery(''); setCompany(''); setRoundType(''); setYear(''); setSort('relevance'); setPage(1)
  }, [])

  const hasActiveFilters = !!(query || company || roundType || year)

  return {
    // State
    query, company, roundType, year, sort, page,
    debouncedQuery,
    hasActiveFilters,

    // Setters
    setQuery: handleQueryChange,
    setCompany: handleCompanyChange,
    setRoundType: handleRoundTypeChange,
    setYear: handleYearChange,
    setSort: handleSortChange,
    setPage,
    clearFilters,

    // Query results
    experiences:  data?.experiences  || [],
    filterCounts: data?.filterCounts || null,
    pagination:   data?.pagination   || null,
    searchType:   data?.searchType   || 'browse',
    isLoading,
    isFetching,
    isError,
    error,
  }
}
