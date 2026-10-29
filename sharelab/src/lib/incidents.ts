import { api } from './api-client'
import type { ApiResponse } from './api-client'
import type { Incident } from './booking-service'

export interface IncidentFilters {
  status?: 'open' | 'confirmed' | 'resolved' | 'all'
  type?: 'damage' | 'delay' | 'other' | 'all'
  page?: number
  perPage?: number
}

export const fetchIncidents = async (
  filters: IncidentFilters = {},
): Promise<ApiResponse<Incident[]>> => {
  const params: Record<string, string | number> = {}
  if (filters.status && filters.status !== 'all') params.status = filters.status
  if (filters.type && filters.type !== 'all') params.type = filters.type
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.per_page = filters.perPage

  return api.get<Incident[]>('/incidents', { params })
}

export const confirmIncident = async (
  incidentId: number,
): Promise<ApiResponse<Incident>> => {
  return api.patch<undefined, Incident>(`/incidents/${incidentId}/confirm`)
}

export const resolveIncident = async (
  incidentId: number,
  resolutionNote: string,
): Promise<ApiResponse<Incident>> => {
  return api.patch<{ resolution_note: string }, Incident>(
    `/incidents/${incidentId}/resolve`,
    { resolution_note: resolutionNote },
  )
}
