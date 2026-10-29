import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { BookingDetail } from '../features/bookings/BookingDetail'

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
