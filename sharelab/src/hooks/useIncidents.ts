import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import { confirmIncident, fetchIncidents, resolveIncident } from '../lib/incidents'
import type { IncidentFilters } from '../lib/incidents'

export const useIncidents = (filters: IncidentFilters) => {
  const { status } = useAuth()
  return useQuery({
    queryKey: ['incidents', filters],
    queryFn: () => fetchIncidents(filters),
    enabled: status === 'authenticated',
    placeholderData: (previous) => previous,
  })
}

export const useConfirmIncident = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: confirmIncident,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
      void queryClient.invalidateQueries({ queryKey: ['booking'] })
      void queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })
}

export const useResolveIncident = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      incidentId,
      note,
    }: {
      incidentId: number
      note: string
    }) => resolveIncident(incidentId, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
      void queryClient.invalidateQueries({ queryKey: ['booking'] })
      void queryClient.invalidateQueries({ queryKey: ['workspace'] })
    },
  })
}
