import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { MyBookings } from '../features/bookings/MyBookings'

const MyBookingsRoute = () => (
  <SiteLayout>
    <RouteGuard>
      <div className="page-shell py-10 sm:py-14">
        <MyBookings />
      </div>
    </RouteGuard>
  </SiteLayout>
)

export const Route = createFileRoute('/my-bookings/')({
  component: MyBookingsRoute,
})
