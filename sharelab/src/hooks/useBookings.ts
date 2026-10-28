import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiResponse } from '../lib/api-client'
import type { Booking } from '../lib/api-client'

import {
  checkEligibility,
  createBooking,
  getBookings,
  cancelBooking,
  checkIn,
  returnItems,
  reportIncident,
  getAvailability,
  verifyCredential,
} from '../lib/booking-service'

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

export const useBookings = () => {
  const queryClient = useQueryClient()

  // Get user's bookings
  const { data: bookings, isLoading, isError } = useQuery<ApiResponse<Booking[]>>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await getBookings()
      return response
    },
    enabled: !!api.getAuthToken(),
    refetchInterval: 30000,
  })

  // Create booking mutation
  const createMutation = useMutation({
    mutationKey: ['create-booking'],
    mutationFn: async (params: CreateBookingParams) => {
      return await createBooking(params)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error: any) => {
      console.error('Booking creation error:', error)
    },
  })

  // Check eligibility
  const checkEligibility = async (
    resourceId: number,
    startAt: string,
    endAt: string
  ): Promise<EligibilityCheck> => {
    return await checkEligibility(resourceId, startAt, endAt)
  }

  // Cancel booking
  const cancelMutation = useMutation({
    mutationKey: ['cancel-booking'],
    mutationFn: async (bookingId: number) => {
      await cancelBooking(bookingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  // Check in
  const checkInMutation = useMutation({
    mutationKey: ['check-in'],
    mutationFn: async (bookingId: number) => {
      await checkIn(bookingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  // Return items
  const returnMutation = useMutation({
    mutationKey: ['return-items'],
    mutationFn: async (bookingId: number) => {
      await returnItems(bookingId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  // Report incident
  const reportIncidentMutation = useMutation({
    mutationKey: ['report-incident'],
    mutationFn: async ({
      bookingId,
      type,
      description,
    }: {
      bookingId: number
      type: 'damage' | 'delay' | 'other'
      description: string
    }) => {
      await reportIncident(bookingId, type, description)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  // Get availability
  const getAvailability = async (
    resourceId: number,
    date: string
  ) => {
    return await getAvailability(resourceId, date)
  }

  // Verify credential
  const verifyCredentialMutation = useMutation({
    mutationKey: ['verify-credential'],
    mutationFn: async (credentialId: number) => {
      await verifyCredential(credentialId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  return {
    bookings,
    isLoading,
    isError,
    createMutation,
    checkEligibility,
    cancelMutation,
    checkInMutation,
    returnMutation,
    reportIncidentMutation,
    getAvailability,
    verifyCredentialMutation,
  }
}