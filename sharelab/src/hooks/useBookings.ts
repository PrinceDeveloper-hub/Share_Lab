import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import type {
  Booking,
<<<<<<< HEAD
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
=======
  BookingDecisionPayload,
  ConditionReportPayload,
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
} from '../lib/booking-service'
import {
  cancelBooking,
  checkInBooking,
  confirmWaitlistOffer,
  decideBooking,
  extendBooking,
  fetchBooking,
  fetchBookingTimeline,
  fetchBookings,
  getBookings,
  reportBookingIncident,
  returnBooking,
} from '../lib/booking-service'

const invalidateBookingViews = (
  queryClient: ReturnType<typeof useQueryClient>,
  bookingId?: number,
) => {
  void queryClient.invalidateQueries({ queryKey: ['bookings'] })
  void queryClient.invalidateQueries({ queryKey: ['booking'] })
  void queryClient.invalidateQueries({ queryKey: ['workspace'] })
  void queryClient.invalidateQueries({ queryKey: ['notifications'] })
  if (bookingId) {
    void queryClient.invalidateQueries({ queryKey: ['booking', bookingId] })
    void queryClient.invalidateQueries({
      queryKey: ['booking', bookingId, 'timeline'],
    })
  }
}

export const useBookings = () => {
  const queryClient = useQueryClient()
  const { status } = useAuth()

  const query = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: getBookings,
    enabled: status === 'authenticated',
    refetchInterval: 30_000,
  })

<<<<<<< HEAD
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

=======
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  const cancelMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number
      reason?: string
    }) => cancelBooking(bookingId, reason),
    onSuccess: (_, variables) =>
      invalidateBookingViews(queryClient, variables.bookingId),
  })

  const checkInMutation = useMutation({
<<<<<<< HEAD
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
=======
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: number
      payload: ConditionReportPayload
    }) => checkInBooking(bookingId, payload),
    onSuccess: (_, variables) =>
      invalidateBookingViews(queryClient, variables.bookingId),
  })

  const returnMutation = useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: number
      payload: ConditionReportPayload
    }) => returnBooking(bookingId, payload),
<<<<<<< HEAD
    onSuccess: (_, variables) =>
      invalidateBookingViews(queryClient, variables.bookingId),
=======
    onSuccess: (_, variables) => invalidateBookingViews(queryClient, variables.bookingId),
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
>>>>>>> fcfa9474b26cbba7edc4b7c28053baa745d93073
  })

  const reportIncidentMutation = useMutation({
    mutationFn: ({
      bookingId,
      type,
      description,
    }: {
      bookingId: number
      type: 'damage' | 'delay' | 'other'
      description: string
    }) => reportBookingIncident(bookingId, type, description),
    onSuccess: (_, variables) => {
      invalidateBookingViews(queryClient, variables.bookingId)
      void queryClient.invalidateQueries({ queryKey: ['incidents'] })
    },
  })

  const decideMutation = useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: number
      payload: BookingDecisionPayload
    }) => decideBooking(bookingId, payload),
    onSuccess: (_, variables) =>
      invalidateBookingViews(queryClient, variables.bookingId),
  })

  const confirmOfferMutation = useMutation({
    mutationFn: (bookingId: number) => confirmWaitlistOffer(bookingId),
    onSuccess: (_, bookingId) => invalidateBookingViews(queryClient, bookingId),
  })

  const extendMutation = useMutation({
    mutationFn: ({ bookingId, endAt }: { bookingId: number; endAt: string }) =>
      extendBooking(bookingId, endAt),
    onSuccess: (_, variables) =>
      invalidateBookingViews(queryClient, variables.bookingId),
  })

  return {
    ...query,
    bookings: query.data,
    cancelMutation,
    checkInMutation,
    returnMutation,
    reportIncidentMutation,
    decideMutation,
    confirmOfferMutation,
    extendMutation,
  }
}

export const useBooking = (bookingId: number) => {
  return useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => fetchBooking(bookingId),
    enabled: Number.isFinite(bookingId) && bookingId > 0,
    refetchInterval: 30_000,
  })
}

export const useBookingTimeline = (bookingId: number) => {
  return useQuery({
    queryKey: ['booking', bookingId, 'timeline'],
    queryFn: () => fetchBookingTimeline(bookingId),
    enabled: Number.isFinite(bookingId) && bookingId > 0,
  })
}

export const useBookingList = (
  filters: Parameters<typeof fetchBookings>[0],
  endpoint?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ['bookings', endpoint ?? '/bookings', filters],
    queryFn: () => fetchBookings(filters, endpoint),
    enabled,
    // Paginated lists keep the previous page on screen while the next loads.
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    gcTime: 30 * 60_000,
  })
}

/** Warm the cache for the next page before the user commits to it. */
export const usePrefetchBookings = () => {
  const queryClient = useQueryClient()

  return (
    filters: Parameters<typeof fetchBookings>[0],
    endpoint = '/bookings',
  ) =>
    queryClient.prefetchQuery({
      queryKey: ['bookings', endpoint, filters],
      queryFn: () => fetchBookings(filters, endpoint),
      staleTime: 30_000,
    })
}

export const useCancelBooking = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: number
      reason?: string
    }) => cancelBooking(bookingId, reason),
    onSuccess: (_, variables) =>
      invalidateBookingViews(queryClient, variables.bookingId),
  })
}
