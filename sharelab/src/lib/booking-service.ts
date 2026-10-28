// API layer for booking-related operations.
// These functions use the browser's fetch API to call the ShareLab backend.

import type { ApiResponse } from './api-client'

export interface Booking {
  id: number
  resource_id: number
  user_id: number
  start_at: string
  end_at: string
  purpose: string | null
  status: 'pending' | 'waitlisted' | 'approved' | 'rejected' | 'checked_in' | 'returned' | 'cancelled'
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

// Check eligibility endpoint
export const checkEligibility = async (
  resourceId: number,
  startAt: string,
  endAt: string
): Promise<EligibilityCheck> => {
  const response = await fetch(
    `/api/resources/${resourceId}/eligibility?startAt=${startAt}&endAt=${endAt}`,
    {
      credentials: 'include', // For Sanctum cookie-based auth
    }
  )
  if (!response.ok) throw new Error('Failed to check eligibility')
  return response.json()
}

// Create booking endpoint
export const createBooking = async (data: CreateBookingParams): Promise<Booking> => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // For Sanctum
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create booking')
  }
  return response.json()
}

// Get user's bookings
export const getBookings = async (): Promise<Booking[]> => {
  const response = await fetch('/api/bookings', {
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to fetch bookings')
  return response.json()
}

// Cancel booking
export const cancelBooking = async (bookingId: number): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to cancel booking')
}

// Check in
export const checkIn = async (bookingId: number): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/checkin`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to check in')
}

// Return items
export const returnItems = async (bookingId: number): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/return`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to return items')
}

// Report incident
export const reportIncident = async (
  bookingId: number,
  type: 'damage' | 'delay' | 'other',
  description: string
): Promise<void> => {
  const response = await fetch(`/api/bookings/${bookingId}/incidents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type, description }),
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to report incident')
}

// Get availability
export const getAvailability = async (
  resourceId: number,
  date: string
): Promise<any> => {
  const response = await fetch(
    `/api/resources/${resourceId}/availability?date=${date}`,
    { credentials: 'include' }
  )
  if (!response.ok) throw new Error('Failed to fetch availability')
  return response.json()
}

// Verify credential
export const verifyCredential = async (credentialId: number): Promise<void> => {
  const response = await fetch(`/api/credentials/${credentialId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Failed to verify credential')
}
