import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
<<<<<<< HEAD
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
=======
import { useAuth } from './useAuth'
import {
  assignOwnerManager,
  createResource,
  deleteResource,
  fetchManagerDashboard,
  fetchManagerResources,
  fetchOwnerDashboard,
  fetchOwnerManagers,
  fetchOwnerResources,
  removeOwnerManager,
  updateResource,
} from '../lib/workspace'
import type { ResourcePayload } from '../lib/resources'

const invalidateWorkspace = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['workspace'] })
  void queryClient.invalidateQueries({ queryKey: ['resources'] })
  void queryClient.invalidateQueries({ queryKey: ['resource'] })
  void queryClient.invalidateQueries({ queryKey: ['bookings'] })
  void queryClient.invalidateQueries({ queryKey: ['credentials'] })
  void queryClient.invalidateQueries({ queryKey: ['incidents'] })
}

export const useManagerDashboard = () => {
  const { user, status } = useAuth()
  return useQuery({
    queryKey: ['workspace', 'manager', 'dashboard'],
    queryFn: fetchManagerDashboard,
    enabled: status === 'authenticated' && user?.role === 'manager',
  })
}

export const useManagerResources = () => {
  const { user, status } = useAuth()
  return useQuery({
    queryKey: ['workspace', 'manager', 'resources'],
    queryFn: fetchManagerResources,
    enabled: status === 'authenticated' && user?.role === 'manager',
  })
}

export const useOwnerDashboard = () => {
  const { user, status } = useAuth()
  return useQuery({
    queryKey: ['workspace', 'owner', 'dashboard'],
    queryFn: fetchOwnerDashboard,
    enabled: status === 'authenticated' && user?.role === 'owner',
  })
}

export const useOwnerResources = () => {
  const { user, status } = useAuth()
  return useQuery({
    queryKey: ['workspace', 'owner', 'resources'],
    queryFn: fetchOwnerResources,
    enabled: status === 'authenticated' && user?.role === 'owner',
  })
}

export const useOwnerManagers = (resourceId: number | null) => {
  return useQuery({
    queryKey: ['workspace', 'owner', 'managers', resourceId],
    queryFn: () => fetchOwnerManagers(resourceId as number),
    enabled: resourceId !== null,
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  })
}

export const useCreateResource = () => {
  const queryClient = useQueryClient()
<<<<<<< HEAD

  return useMutation({
    mutationFn: async (payload: ResourceCreatePayload) =>
      await createResource(payload),
    onSuccess: () => {
=======
  return useMutation({
    mutationFn: ({ payload, image }: { payload: ResourcePayload; image?: File | null }) =>
      createResource(payload, image),
    onSuccess: () => invalidateWorkspace(queryClient),
  })
}

export const useUpdateResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      resourceId,
      payload,
      image,
    }: {
      resourceId: number
      payload: ResourcePayload
      image?: File | null
    }) => updateResource(resourceId, payload, image),
    onSuccess: () => invalidateWorkspace(queryClient),
  })
}

export const useDeleteResource = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: number) => deleteResource(resourceId),
    onSuccess: () => invalidateWorkspace(queryClient),
  })
}

export const useAssignOwnerManager = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ resourceId, email }: { resourceId: number; email: string }) =>
      assignOwnerManager(resourceId, email),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'owner'] })
      void queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] })
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}

export const useRemoveOwnerManager = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ resourceId, managerId }: { resourceId: number; managerId: number }) =>
      removeOwnerManager(resourceId, managerId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['workspace', 'owner'] })
      void queryClient.invalidateQueries({ queryKey: ['resource', variables.resourceId] })
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
