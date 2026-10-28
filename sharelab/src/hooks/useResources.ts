import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchResource, fetchResources } from '../lib/resources'
import type { ResourceListFilters } from '../lib/resources'

export const useDebouncedValue = <TValue,>(value: TValue, delay = 300) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timeout)
  }, [value, delay])

  return debounced
}

export const useResources = (filters: ResourceListFilters) => {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: () => fetchResources(filters),
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  })
}

export const useResourceCategories = () => {
  return useQuery({
    queryKey: ['resources', 'categories'],
    queryFn: () => fetchResources({ perPage: 100 }),
    select: (response) =>
      Array.from(new Set(response.data.map((resource) => resource.category))).sort((a, b) =>
        a.localeCompare(b),
      ),
    staleTime: 5 * 60_000,
  })
}

export const useResource = (resourceId: number) => {
  return useQuery({
    queryKey: ['resource', resourceId],
    queryFn: () => fetchResource(resourceId),
    enabled: Number.isFinite(resourceId) && resourceId > 0,
    staleTime: 60_000,
  })
}
