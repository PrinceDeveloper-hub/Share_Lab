import { Link, Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ArrowLeft, FlaskConical } from 'lucide-react'
import { SiteLayout } from '../components/layout/SiteLayout'
import { Button } from '../components/ui/button'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </>
  )
}

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="page-shell flex min-h-[55vh] items-center justify-center py-16">
        <div className="max-w-lg text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-(--tint-2)">
            <FlaskConical className="h-6 w-6 text-(--espresso)" aria-hidden="true" />
          </span>
          <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--muted)">
            404
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-(--charcoal)">
            This page isn’t in the catalogue.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-(--muted)">
            The link may be out of date, or the page may have moved. Head back to the homepage or
            browse the live resource catalogue.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back home
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/resources">Browse resources</Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}
