import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
import { SiteLayout } from '../components/layout/SiteLayout'
import { IncidentsPage } from '../features/incidents/IncidentsPage'

export const Route = createFileRoute('/incidents')({
  component: IncidentsRoute,
})

function IncidentsRoute() {
  return (
    <SiteLayout>
      <RouteGuard>
        <div className="page-shell py-10 sm:py-14">
          <IncidentsPage />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
