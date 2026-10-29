import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import type {
  Booking,
  ConditionLevel,
  CreateBookingParams,
  EligibilityCheck,
} from '../lib/booking-service'
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

export const useBookings = () => {
  const queryClient = useQueryClient()
  const { status } = useAuth()

  const {
    data: bookings,
    isLoading,
    isError,
  } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => await getBookings(),
    enabled: status === 'authenticated',
    refetchInterval: 30_000,
  })

  const createMutation = useMutation({
    mutationKey: ['create-booking'],
    mutationFn: async (params: CreateBookingParams) =>
      await createBooking(params),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error: unknown) => {
      console.error('Booking creation error:', error)
    },
  })

  const checkEligibilityForResource = async (
    resourceId: number,
  ): Promise<EligibilityCheck> => {
    return await checkEligibility(resourceId)
  }

  const cancelMutation = useMutation({
    mutationKey: ['cancel-booking'],
    mutationFn: async (bookingId: number) => {
      await cancelBooking(bookingId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const checkInMutation = useMutation({
    mutationKey: ['check-in'],
    mutationFn: async ({
      bookingId,
      condition,
      notes,
    }: {
      bookingId: number
      condition: ConditionLevel
      notes?: string
    }) => await checkIn(bookingId, { condition, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['booking-queue'] })
    },
  })

  const returnMutation = useMutation({
    mutationKey: ['return-items'],
    mutationFn: async ({
      bookingId,
      condition,
      notes,
    }: {
      bookingId: number
      condition: ConditionLevel
      notes?: string
    }) => await returnItems(bookingId, { condition, notes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void queryClient.invalidateQueries({ queryKey: ['booking-queue'] })
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })

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
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  const verifyCredentialMutation = useMutation({
    mutationKey: ['verify-credential'],
    mutationFn: async (credentialId: number) => {
      await verifyCredential(credentialId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
  })

  return {
    bookings,
    isLoading,
    isError,
    createMutation,
    checkEligibility: checkEligibilityForResource,
    cancelMutation,
    checkInMutation,
    returnMutation,
    reportIncidentMutation,
    getAvailability,
    verifyCredentialMutation,
  }
}
