import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  decideCredential,
  fetchCredentials,
  submitCredential,
} from '../lib/credentials'
import { fetchIncidents, resolveIncident } from '../lib/incidents'
import { fetchAdminUsers, fetchAuditLog, updateUserRole } from '../lib/admin'
import { decideBooking, getBookingQueue } from '../lib/booking-service'
import type {
  BookingDecision,
  BookingQueueFilters,
} from '../lib/booking-service'
import { createResource } from '../lib/resources'
import type { ResourceCreatePayload } from '../lib/resources'
import type { User } from '../lib/api-client'
import { useAuth } from './useAuth'

export const useCredentialsQuery = () => {
  const { status } = useAuth()

  return useQuery({
    queryKey: ['credentials'],
    queryFn: fetchCredentials,
    enabled: status === 'authenticated',
    staleTime: 30_000,
  })
}

export const useSubmitCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      requirementName,
      file,
    }: {
      requirementName: string
      file: File
    }) => await submitCredential(requirementName, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

export const useDecideCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      credentialId,
      decision,
      note,
    }: {
      credentialId: number
      decision: 'verify' | 'reject'
      note?: string
    }) => await decideCredential(credentialId, decision, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

export const useIncidentsQuery = () => {
  const { status } = useAuth()

  return useQuery({
    queryKey: ['incidents'],
    queryFn: fetchIncidents,
    enabled: status === 'authenticated',
    staleTime: 30_000,
  })
}

export const useResolveIncident = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      incidentId,
      note,
    }: {
      incidentId: number
      note?: string
    }) => await resolveIncident(incidentId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}

export const useAdminUsersQuery = (enabled = true) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchAdminUsers,
    enabled: enabled && user?.role === 'admin',
    staleTime: 30_000,
  })
}

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: number
      role: User['role']
    }) => await updateUserRole(userId, role),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })
}

export const useAuditLogQuery = (enabled = true) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['admin', 'audit'],
    queryFn: fetchAuditLog,
    enabled: enabled && user?.role === 'admin',
    staleTime: 30_000,
  })
}

export const useBookingQueueQuery = (filters: BookingQueueFilters) => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['booking-queue', filters],
    queryFn: () => getBookingQueue(filters),
    enabled: Boolean(
      user && (user.role === 'manager' || user.role === 'admin'),
    ),
    staleTime: 15_000,
  })
}

export const useDecideBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      bookingId,
      decision,
      reason,
    }: {
      bookingId: number
      decision: BookingDecision
      reason: string
    }) => await decideBooking(bookingId, decision, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['booking-queue'] })
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })
}

export const useCreateResource = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ResourceCreatePayload) =>
      await createResource(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
