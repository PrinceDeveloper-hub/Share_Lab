// API layer for booking-related operations. Requests go through the shared
// ApiClient so the stored auth token is always attached.

import { api } from './api-client'
import { fetchResource } from './resources'
import type { Resource } from './resources'

export type BookingDecision = 'approve' | 'reject' | 'waitlist'

export type ConditionLevel = 'excellent' | 'good' | 'fair' | 'damaged'

export interface BookingRequester {
  id: number
  name: string
  email?: string
  role?: string
}

export interface BookingConditionReport {
  id: number
  booking_id: number
  type: 'checkin' | 'return'
  condition: ConditionLevel
  notes: string | null
  checklist: { name: string; status: string }[] | null
  reported_by: number | null
  reporter?: BookingRequester | null
  reported_at: string | null
}

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
  resource?: Resource | null
  user?: BookingRequester | null
  check_in_report?: BookingConditionReport | null
  return_report?: BookingConditionReport | null
}

export interface CreateBookingParams {
  resource_id: number
  start_at: string
  end_at: string
  purpose?: string
}

export interface BookingQueueFilters {
  status?: Booking['status']
  q?: string
  page?: number
  perPage?: number
  sort?: 'priority' | 'schedule'
}

export interface BookingQueueResult {
  items: Booking[]
  total: number
  page: number
  lastPage: number
}

export interface ConditionReportPayload {
  condition: ConditionLevel
  notes?: string
  checklist?: { name: string; status: string }[]
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
    message:
      'Eligibility is verified again when a booking request is submitted.',
  }
}

export const createBooking = async (
  data: CreateBookingParams,
): Promise<Booking> => {
  const response = await api.post<CreateBookingParams, Booking>(
    '/bookings',
    data,
  )
  return response.data
}

export const getBookings = async (): Promise<Booking[]> => {
  const response = await api.get<BookingEnvelope>('/bookings')
  return unwrapBookings(response.data)
}

export const cancelBooking = async (bookingId: number): Promise<void> => {
  await api.post(`/bookings/${bookingId}/cancel`)
}

export const getBookingQueue = async (
  filters: BookingQueueFilters = {},
): Promise<BookingQueueResult> => {
  const params: Record<string, string | number> = {
    per_page: filters.perPage ?? 20,
  }

  if (filters.status) params.status = filters.status
  if (filters.q?.trim()) params.q = filters.q.trim()
  if (filters.page) params.page = filters.page
  if (filters.sort) params.sort = filters.sort

  const response = await api.get<BookingEnvelope>('/manager/bookings', {
    params,
  })
  const items = unwrapBookings(response.data)
  const meta = response.meta

  return {
    items,
    total: meta?.total ?? items.length,
    page: meta?.page ?? filters.page ?? 1,
    lastPage: meta?.last_page ?? 1,
  }
}

export const decideBooking = async (
  bookingId: number,
  decision: BookingDecision,
  reason: string,
): Promise<Booking> => {
  const response = await api.patch<
    { decision: BookingDecision; reason: string },
    Booking
  >(`/bookings/${bookingId}/decision`, { decision, reason })
  return response.data
}

export const checkIn = async (
  bookingId: number,
  report: ConditionReportPayload,
): Promise<Booking> => {
  const response = await api.post<ConditionReportPayload, Booking>(
    `/bookings/${bookingId}/checkin`,
    report,
  )
  return response.data
}

export const returnItems = async (
  bookingId: number,
  report: ConditionReportPayload,
): Promise<Booking> => {
  const response = await api.post<ConditionReportPayload, Booking>(
    `/bookings/${bookingId}/return`,
    report,
  )
  return response.data
}

export const reportIncident = async (
  bookingId: number,
  type: 'damage' | 'delay' | 'other',
  description: string,
): Promise<void> => {
  await api.post(`/bookings/${bookingId}/incidents`, { type, description })
}

export const getAvailability = async (
  resourceId: number,
  date: string,
): Promise<unknown> => {
  const response = await api.get<unknown>(
    `/resources/${resourceId}/availability`,
    {
      params: { date },
    },
  )
  return response.data
}

export const verifyCredential = async (credentialId: number): Promise<void> => {
  await api.patch(`/credentials/${credentialId}/verify`)
}
