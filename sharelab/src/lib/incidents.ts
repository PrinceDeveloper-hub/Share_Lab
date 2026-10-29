import { api } from './api-client'
<<<<<<< HEAD

export type IncidentType = 'damage' | 'delay' | 'other'
export type IncidentStatus = 'open' | 'resolved'

export interface Incident {
  id: number
  booking_id: number
  type: IncidentType
  description: string
  status: IncidentStatus
  suggested_by_system?: boolean
  confirmed_by?: number | null
  resolved_by?: number | null
  resolution_note?: string | null
  created_at?: string | null
}

interface Paginated<T> {
  data?: T[]
  total?: number
  current_page?: number
  last_page?: number
  per_page?: number
}

export interface IncidentList {
  items: Incident[]
  total: number
}

const unwrap = (payload: unknown): IncidentList => {
  if (Array.isArray(payload))
    return { items: payload as Incident[], total: payload.length }

  if (payload && typeof payload === 'object') {
    const outer = payload as Paginated<Incident>
    if (Array.isArray(outer.data))
      return { items: outer.data, total: outer.total ?? outer.data.length }

    const nested = outer.data as unknown as Paginated<Incident> | undefined
    if (nested && Array.isArray(nested.data)) {
      return { items: nested.data, total: nested.total ?? nested.data.length }
    }
  }

  return { items: [], total: 0 }
}

export const fetchIncidents = async (): Promise<IncidentList> => {
  const response = await api.get<Paginated<Incident>>('/incidents', {
    params: { per_page: 50 },
  })
  return unwrap(response.data)
=======
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
}

export const resolveIncident = async (
  incidentId: number,
<<<<<<< HEAD
  note?: string,
): Promise<void> => {
  await api.patch(`/incidents/${incidentId}/resolve`, {
    resolution_note: note?.trim() ? note.trim() : undefined,
  })
=======
  resolutionNote: string,
): Promise<ApiResponse<Incident>> => {
  return api.patch<{ resolution_note: string }, Incident>(
    `/incidents/${incidentId}/resolve`,
    { resolution_note: resolutionNote },
  )
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
}
