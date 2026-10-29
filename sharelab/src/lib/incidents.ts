import { api } from './api-client'

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
}

export const resolveIncident = async (
  incidentId: number,
  note?: string,
): Promise<void> => {
  await api.patch(`/incidents/${incidentId}/resolve`, {
    resolution_note: note?.trim() ? note.trim() : undefined,
  })
}
