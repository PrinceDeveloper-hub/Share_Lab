import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  fetchResource,
  fetchResourceAvailability,
  fetchResourceEligibility,
  fetchResources,
} from '../lib/resources'
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

export const useResourceAvailability = (resourceId: number, date: string) => {
  return useQuery({
    queryKey: ['resource', resourceId, 'availability', date],
    queryFn: () => fetchResourceAvailability(resourceId, date),
    enabled: Number.isFinite(resourceId) && resourceId > 0 && Boolean(date),
    staleTime: 15_000,
  })
}

export const useResourceEligibility = (resourceId: number, enabled = true) => {
  return useQuery({
    queryKey: ['resource', resourceId, 'eligibility'],
    queryFn: () => fetchResourceEligibility(resourceId),
    enabled: enabled && Number.isFinite(resourceId) && resourceId > 0,
    staleTime: 15_000,
  })
}
