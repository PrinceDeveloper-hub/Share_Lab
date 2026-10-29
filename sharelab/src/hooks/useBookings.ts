import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './useAuth'
import type {
  Booking,
  BookingDecisionPayload,
  ConditionReportPayload,
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
    void queryClient.invalidateQueries({ queryKey: ['booking', bookingId, 'timeline'] })
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

  const cancelMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: number; reason?: string }) =>
      cancelBooking(bookingId, reason),
    onSuccess: (_, variables) => invalidateBookingViews(queryClient, variables.bookingId),
  })

  const checkInMutation = useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: number
      payload: ConditionReportPayload
    }) => checkInBooking(bookingId, payload),
    onSuccess: (_, variables) => invalidateBookingViews(queryClient, variables.bookingId),
  })

  const returnMutation = useMutation({
    mutationFn: ({
      bookingId,
      payload,
    }: {
      bookingId: number
      payload: ConditionReportPayload
    }) => returnBooking(bookingId, payload),
    onSuccess: (_, variables) => invalidateBookingViews(queryClient, variables.bookingId),
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
    onSuccess: (_, variables) => invalidateBookingViews(queryClient, variables.bookingId),
  })

  const confirmOfferMutation = useMutation({
    mutationFn: (bookingId: number) => confirmWaitlistOffer(bookingId),
    onSuccess: (_, bookingId) => invalidateBookingViews(queryClient, bookingId),
  })

  const extendMutation = useMutation({
    mutationFn: ({ bookingId, endAt }: { bookingId: number; endAt: string }) =>
      extendBooking(bookingId, endAt),
    onSuccess: (_, variables) => invalidateBookingViews(queryClient, variables.bookingId),
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
    placeholderData: (previous) => previous,
  })
}
