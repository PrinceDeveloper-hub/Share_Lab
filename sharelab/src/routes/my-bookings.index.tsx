import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { AppShell } from '../components/layout/AppShell'
import { MyBookings } from '../features/bookings/MyBookings'

const MyBookingsRoute = () => (
  <RouteGuard>
    <AppShell>
      <MyBookings />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/my-bookings/')({
  component: MyBookingsRoute,
})
