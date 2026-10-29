import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchAdminAudit,
  fetchAdminOverview,
  fetchAdminUsers,
} from '../lib/admin'
import type { AdminAuditFilters, AdminUserFilters } from '../lib/admin'

export const useAdminOverview = () =>
  useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: fetchAdminOverview,
    staleTime: 45_000,
    refetchInterval: 90_000,
  })

export const useAdminUsers = (filters: AdminUserFilters) =>
  useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchAdminUsers(filters),
    placeholderData: (previous) => previous,
    staleTime: 45_000,
  })

export const useAdminAudit = (filters: AdminAuditFilters) =>
  useQuery({
    queryKey: ['admin', 'audit', filters],
    queryFn: () => fetchAdminAudit(filters),
    placeholderData: (previous) => previous,
    staleTime: 45_000,
  })

export const usePrefetchAdmin = () => {
  const queryClient = useQueryClient()

  return {
    users: (filters: AdminUserFilters) =>
      queryClient.prefetchQuery({
        queryKey: ['admin', 'users', filters],
        queryFn: () => fetchAdminUsers(filters),
        staleTime: 45_000,
      }),
    audit: (filters: AdminAuditFilters) =>
      queryClient.prefetchQuery({
        queryKey: ['admin', 'audit', filters],
        queryFn: () => fetchAdminAudit(filters),
        staleTime: 45_000,
      }),
  }
}
