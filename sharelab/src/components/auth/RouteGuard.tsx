import { useEffect } from 'react'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import { Loader2, ShieldAlert } from 'lucide-react'
import type { User } from '../../lib/api-client'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'

export interface RouteGuardProps {
  children: React.ReactNode
  roles?: User['role'][]
}

const AuthLoading = () => (
  <div
    className="flex min-h-[55vh] items-center justify-center px-4"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-3 rounded-full border border-(--border-subtle) bg-[rgba(255,252,247,0.72)] px-5 py-3 text-sm font-medium text-(--muted) backdrop-blur">
      <Loader2
        className="h-4 w-4 animate-spin text-(--espresso)"
        aria-hidden="true"
      />
      Checking your session...
    </div>
  </div>
)

const AccessDenied = () => (
  <div className="page-shell py-16 sm:py-20">
    <div className="mx-auto max-w-lg rounded-3xl border border-[rgba(180,77,66,0.2)] bg-[rgba(255,252,247,0.72)] p-8 text-center shadow-soft">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(180,77,66,0.08)]">
        <ShieldAlert
          className="h-5 w-5 text-(--error)"
          aria-hidden="true"
        />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-(--charcoal)">
        Access not available
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
        Your account does not have the role required for this page.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/resources">Browse resources</Link>
        </Button>
      </div>
    </div>
  </div>
)

export const RouteGuard = ({ children, roles }: RouteGuardProps) => {
  const { user, status } = useAuth()
  const router = useRouter()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  useEffect(() => {
    if (status === 'anonymous') {
      router.history.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, router, status])

  if (status === 'loading') return <AuthLoading />
  if (!user) return null

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

export default RouteGuard
