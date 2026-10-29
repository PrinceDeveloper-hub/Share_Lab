<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
=======
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
<<<<<<< HEAD
import { fetchResource, fetchResources } from '../lib/resources'
import type { Resource, ResourceListFilters } from '../lib/resources'
=======
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
import {
  fetchResource,
  fetchResourceAvailability,
  fetchResourceEligibility,
  fetchResources,
} from '../lib/resources'
import type { ResourceListFilters } from '../lib/resources'
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

export const useDebouncedValue = <TValue>(value: TValue, delay = 300) => {
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
    // Keep the current page visible while the next one loads (no layout jump).
    placeholderData: (previous) => previous,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
  })
}

/**
 * Paginated queries are cheap to warm: hovering a page number fetches it into
 * the shared cache so clicking feels instant.
 */
export const usePrefetchResources = () => {
  const queryClient = useQueryClient()

  return (filters: ResourceListFilters) =>
    queryClient.prefetchQuery({
      queryKey: ['resources', filters],
      queryFn: () => fetchResources(filters),
      staleTime: 60_000,
    })
}

export const useResourceCategories = () => {
  return useQuery({
    queryKey: ['resources', 'categories'],
    queryFn: () => fetchResources({ perPage: 100 }),
    select: (response) =>
      Array.from(
        new Set(response.data.map((resource) => resource.category)),
      ).sort((a, b) => a.localeCompare(b)),
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

<<<<<<< HEAD
/**
 * Booking responses only carry a resource id. This hook loads the catalogue
 * once and exposes a lookup so lists can show real resource names without
 * inventing placeholder data.
 */
export const useResourceMap = () => {
  const query = useResources({ perPage: 100 })

  const resourceMap = useMemo(() => {
    const map = new Map<number, Resource>()

    for (const resource of query.data?.data ?? []) {
      map.set(resource.id, resource)
    }

    return map
  }, [query.data])

  return {
    resourceMap,
    isLoading: query.isLoading,
    isError: query.isError,
  }
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
}
