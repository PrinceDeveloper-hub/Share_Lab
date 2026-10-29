import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import {
  fetchCredentialQueue,
  fetchMyCredentials,
  reviewCredential,
  submitCredential,
} from '../lib/credentials'
import type { CredentialDecision } from '../lib/credentials'

const invalidateCredentials = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: ['credentials'] })
  void queryClient.invalidateQueries({ queryKey: ['workspace'] })
  void queryClient.invalidateQueries({ queryKey: ['resource'] })
}

export const useMyCredentials = () => {
  const { status } = useAuth()

  return useQuery({
    queryKey: ['credentials', 'mine'],
    queryFn: () => fetchMyCredentials(),
    enabled: status === 'authenticated',
  })
}

export const useCredentialQueue = (scope: 'manager' | 'owner') => {
  const { user, status } = useAuth()
  const allowed = status === 'authenticated' && user?.role === scope

  return useQuery({
    queryKey: ['credentials', 'queue', scope],
    queryFn: () => fetchCredentialQueue(scope),
    enabled: allowed,
  })
}

export const useSubmitCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: submitCredential,
    onSuccess: () => invalidateCredentials(queryClient),
  })
}

export const useReviewCredential = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      credentialId,
      decision,
      note,
    }: {
      credentialId: number
      decision: CredentialDecision
      note: string
    }) => reviewCredential(credentialId, decision, note),
    onSuccess: () => invalidateCredentials(queryClient),
  })
}
