import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
  })
}

export const useCreateResource = () => {
  const queryClient = useQueryClient()
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
      void queryClient.invalidateQueries({ queryKey: ['resources'] })
    },
  })
}
