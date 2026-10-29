import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { ProfilePage } from '../features/profile/ProfilePage'

export const Route = createFileRoute('/profile')({
  component: ProfileRoute,
})

function ProfileRoute() {
  return (
    <SiteLayout>
      <RouteGuard>
        <div className="page-shell py-10 sm:py-14">
          <ProfilePage />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
