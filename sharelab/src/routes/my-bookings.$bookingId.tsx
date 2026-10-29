import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { BookingDetail } from '../features/bookings/BookingDetail'

const MyBookingDetailRoute = () => {
  const { bookingId } = Route.useParams()

  return (
    <RouteGuard>
      <AppShell>
        <BookingDetail bookingId={bookingId} />
      </AppShell>
    </RouteGuard>
  )
}

export const Route = createFileRoute('/my-bookings/$bookingId')({
  component: MyBookingDetailRoute,
})
