import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
<<<<<<< HEAD
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
=======
import { SiteLayout } from '../components/layout/SiteLayout'
import { BookingDetail } from '../features/bookings/BookingDetail'
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec

export const Route = createFileRoute('/my-bookings/$bookingId')({
  component: MyBookingDetailRoute,
})

function MyBookingDetailRoute() {
  const { bookingId } = Route.useParams()

  return (
    <SiteLayout>
      <RouteGuard>
        <div className="page-shell py-10 sm:py-14">
          <BookingDetail bookingId={bookingId} />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
