// Booking API contracts, mutations, and the shared response shapes used by
// the user, manager, and owner workspaces.

import { api } from './api-client'
import type { ApiResponse, User } from './api-client'
import type { Resource } from './resources'

export type BookingStatus =
  | 'pending'
  | 'waitlisted'
  | 'approved'
  | 'rejected'
  | 'checked_in'
  | 'returned'
  | 'cancelled'

export interface ConditionReport {
  id: number
  condition: 'excellent' | 'good' | 'fair' | 'damaged'
  notes: string | null
  checklist?: string[] | null
  reported_by?: number
  at: string | null
}

export interface Incident {
  id: number
  booking_id: number
  reported_by: number
  type: 'damage' | 'delay' | 'other'
  description: string
  status: 'open' | 'confirmed' | 'resolved'
  suggested_by_system: boolean
  confirmed_by: number | null
  resolved_by: number | null
  resolution_note: string | null
  booking?: Booking
  resource?: Resource
  reporter?: User
  confirmer?: User | null
  resolver?: User | null
  created_at: string
}

export interface BookingRecommendation {
  decision: 'approve' | 'waitlist' | 'reject'
  reason: string
  priority_score: number
}

export interface BookingPermissions {
  decide: boolean
  cancel: boolean
  check_in: boolean
  return: boolean
  extend: boolean
}

export interface Booking {
  id: number
  resource_id: number
  user_id: number
  start_at: string
  end_at: string
  purpose: string | null
  status: BookingStatus
  decision_reason: string | null
  decided_by: number | null
  priority_score: number | null
  priority_explanation: string | null
  waitlist_position: number | null
  confirm_by: string | null
  is_late: boolean
  is_offer: boolean
  resource?: Resource
  user?: User
  recommendation?: BookingRecommendation
  reports?: {
    check_in: ConditionReport | null
    return: ConditionReport | null
  }
  incidents?: Incident[]
  permissions?: BookingPermissions
  created_at: string
}

export interface CreateBookingParams {
  resource_id: number
  start_at: string
  end_at: string
  purpose?: string
}

export type BookingDecision = 'approve' | 'reject' | 'waitlist'

export interface BookingDecisionPayload {
  decision: BookingDecision
  reason: string
}

export interface EligibilityCheck {
  qualifies: boolean
  missing: string[]
  checklist: { name: string; status: string }[]
  message: string
}

export interface TimelineEntry {
  id: number
  action: string
  label: string
  actor?: User | null
  reason: string | null
  meta?: Record<string, unknown> | null
  at: string | null
}

export interface BookingListFilters {
  status?: BookingStatus | 'all'
  view?: 'all' | 'open' | 'history'
  resource_id?: number
  from?: string
  to?: string
  page?: number
  perPage?: number
}

export interface ConditionReportPayload {
  condition: 'excellent' | 'good' | 'fair' | 'damaged'
  notes?: string
  checklist?: string[]
  photo?: File | null
}

const compactParams = (filters: BookingListFilters) => {
  const params: Record<string, string | number> = {}
  if (filters.status && filters.status !== 'all') params.status = filters.status
  if (filters.view && filters.view !== 'all') params.view = filters.view
  if (filters.resource_id) params.resource_id = filters.resource_id
  if (filters.from) params.from = filters.from
  if (filters.to) params.to = filters.to
  if (filters.page) params.page = filters.page
  if (filters.perPage) params.per_page = filters.perPage
  return params
}

const toFormData = (payload: ConditionReportPayload) => {
  const form = new FormData()
  form.append('condition', payload.condition)
  if (payload.notes?.trim()) form.append('notes', payload.notes.trim())
  payload.checklist?.forEach((item) => form.append('checklist[]', item))
  if (payload.photo) form.append('photo', payload.photo)
  return form
}

export const fetchBookings = async (
  filters: BookingListFilters = {},
  endpoint = '/bookings',
): Promise<ApiResponse<Booking[]>> => {
  return api.get<Booking[]>(endpoint, { params: compactParams(filters) })
}

export const getBookings = async (): Promise<Booking[]> => {
  const response = await fetchBookings({ perPage: 100 })
  return response.data
}

export const fetchBooking = async (
  bookingId: number,
): Promise<ApiResponse<Booking>> => {
  return api.get<Booking>(`/bookings/${bookingId}`)
}

export const fetchBookingTimeline = async (
  bookingId: number,
): Promise<ApiResponse<TimelineEntry[]>> => {
  return api.get<TimelineEntry[]>(`/bookings/${bookingId}/timeline`)
}

export const createBooking = async (
  data: CreateBookingParams,
): Promise<ApiResponse<Booking>> => {
  return api.post<CreateBookingParams, Booking>('/bookings', data)
}

export const decideBooking = async (
  bookingId: number,
  payload: BookingDecisionPayload,
): Promise<ApiResponse<Booking>> => {
  return api.patch<BookingDecisionPayload, Booking>(
    `/bookings/${bookingId}/decision`,
    payload,
  )
}

export const cancelBooking = async (
  bookingId: number,
  reason?: string,
): Promise<ApiResponse<Booking>> => {
  return api.post<{ reason?: string }, Booking>(
    `/bookings/${bookingId}/cancel`,
    {
      reason,
    },
  )
}

export const extendBooking = async (
  bookingId: number,
  endAt: string,
): Promise<ApiResponse<Booking>> => {
  return api.patch<{ end_at: string }, Booking>(
    `/bookings/${bookingId}/extend`,
    {
      end_at: endAt,
    },
  )
}

export const confirmWaitlistOffer = async (
  bookingId: number,
): Promise<ApiResponse<Booking>> => {
  return api.post<undefined, Booking>(`/bookings/${bookingId}/confirm`)
}

export const checkInBooking = async (
  bookingId: number,
  payload: ConditionReportPayload,
): Promise<ApiResponse<{ report: ConditionReport; booking: Booking }>> => {
  return api.postForm<{ report: ConditionReport; booking: Booking }>(
    `/bookings/${bookingId}/checkin`,
    toFormData(payload),
  )
}

export const returnBooking = async (
  bookingId: number,
  payload: ConditionReportPayload,
): Promise<ApiResponse<{ report: ConditionReport; booking: Booking }>> => {
  return api.postForm<{ report: ConditionReport; booking: Booking }>(
    `/bookings/${bookingId}/return`,
    toFormData(payload),
  )
}

export const reportBookingIncident = async (
  bookingId: number,
  type: 'damage' | 'delay' | 'other',
  description: string,
): Promise<ApiResponse<Incident>> => {
  return api.post<{ type: string; description: string }, Incident>(
    `/bookings/${bookingId}/incidents`,
    { type, description },
  )
}
