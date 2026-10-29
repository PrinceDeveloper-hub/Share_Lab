import { createFileRoute } from '@tanstack/react-router'
import { RouteGuard } from '../components/auth/RouteGuard'
<<<<<<< HEAD
import { AppShell } from '../components/layout/AppShell'
import { Credentials } from '../features/credentials/Credentials'

const CredentialsRoute = () => (
  <RouteGuard>
    <AppShell>
      <Credentials />
    </AppShell>
  </RouteGuard>
)

export const Route = createFileRoute('/credentials')({
  component: CredentialsRoute,
})
=======
import { SiteLayout } from '../components/layout/SiteLayout'
import { CredentialsPage } from '../features/credentials/CredentialsPage'

type CredentialsSearch = {
  tab?: 'mine' | 'review'
}

export const Route = createFileRoute('/credentials')({
  validateSearch: (search: Record<string, unknown>): CredentialsSearch => ({
    tab: search.tab === 'review' ? 'review' : undefined,
  }),
  component: CredentialsRoute,
})

function CredentialsRoute() {
  const { tab } = Route.useSearch()

  return (
    <SiteLayout>
      <RouteGuard>
        <div className="page-shell py-10 sm:py-14">
          <CredentialsPage initialTab={tab} />
        </div>
      </RouteGuard>
    </SiteLayout>
  )
}
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
