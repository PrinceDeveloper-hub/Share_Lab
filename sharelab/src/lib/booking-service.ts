// API layer for booking-related operations. Requests go through the shared
// ApiClient so the stored auth token is always attached.

import { api } from './api-client'
import { fetchResource } from './resources'

export interface Booking {
  id: number
  resource_id: number
  user_id: number
  start_at: string
  end_at: string
  purpose: string | null
  status:
    | 'pending'
    | 'waitlisted'
    | 'approved'
    | 'rejected'
    | 'checked_in'
    | 'returned'
    | 'cancelled'
  decision_reason: string | null
  priority_score: number | null
  priority_explanation: string | null
  waitlist_position: number | null
  confirm_by: string | null
  is_late: boolean
}

export interface CreateBookingParams {
  resource_id: number
  start_at: string
  end_at: string
  purpose?: string
}

export interface EligibilityCheck {
  qualifies: boolean
  missing: string[]
  checklist: { name: string; status: string }[]
  message: string
}

interface BookingEnvelope {
  data?: Booking[] | { data?: Booking[] }
  meta?: Record<string, number>
}

const unwrapBookings = (payload: unknown): Booking[] => {
  if (Array.isArray(payload)) return payload as Booking[]

  if (typeof payload === 'object' && payload !== null && 'data' in payload) {
    const outer = (payload as { data?: unknown }).data
    if (Array.isArray(outer)) return outer as Booking[]
    if (typeof outer === 'object' && outer !== null && 'data' in outer) {
      const inner = (outer as { data?: unknown }).data
      if (Array.isArray(inner)) return inner as Booking[]
    }
  }

  return []
}

// Check eligibility through the resource endpoint. The API returns an
// eligibility payload for signed-in users when the resource is loaded.
export const checkEligibility = async (
  resourceId: number,
): Promise<EligibilityCheck> => {
  const response = await fetchResource(resourceId)

  if (response.eligibility) {
    return response.eligibility
  }

  return {
    qualifies: false,
    missing: [],
    checklist: [],
    message: 'Eligibility is verified again when a booking request is submitted.',
  }
}

export const createBooking = async (data: CreateBookingParams): Promise<Booking> => {
  const response = await api.post<CreateBookingParams, Booking>('/bookings', data)
  return response.data
}

export const getBookings = async (): Promise<Booking[]> => {
  const response = await api.get<BookingEnvelope>('/bookings')
  return unwrapBookings(response.data)
}

export const cancelBooking = async (bookingId: number): Promise<void> => {
  await api.post(`/bookings/${bookingId}/cancel`)
}

export const checkIn = async (bookingId: number): Promise<void> => {
  await api.post(`/bookings/${bookingId}/checkin`)
}

export const returnItems = async (bookingId: number): Promise<void> => {
  await api.post(`/bookings/${bookingId}/return`)
}

export const reportIncident = async (
  bookingId: number,
  type: 'damage' | 'delay' | 'other',
  description: string,
): Promise<void> => {
  await api.post(`/bookings/${bookingId}/incidents`, { type, description })
}

export const getAvailability = async (resourceId: number, date: string): Promise<unknown> => {
  const response = await api.get<unknown>(`/resources/${resourceId}/availability`, {
    params: { date },
  })
  return response.data
}

export const verifyCredential = async (credentialId: number): Promise<void> => {
  await api.patch(`/credentials/${credentialId}/verify`)
}
