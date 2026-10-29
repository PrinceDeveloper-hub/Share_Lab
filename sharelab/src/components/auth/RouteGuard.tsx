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
    className="flex min-h-[60vh] items-center justify-center px-4"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-2.5 text-[0.8125rem] font-medium text-[var(--muted)]">
      <Loader2
        className="h-4 w-4 animate-spin text-[var(--espresso)]"
        aria-hidden="true"
      />
      Checking your session…
    </div>
  </div>
)

const AccessDenied = () => (
  <div className="page-shell py-16 sm:py-20">
    <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-8 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--error-soft)]">
        <ShieldAlert
          className="h-5 w-5 text-[var(--error)]"
          aria-hidden="true"
        />
      </span>
      <h1 className="mt-4 font-display text-[1.5rem] font-semibold text-[var(--charcoal)]">
        Access not available
      </h1>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--muted)]">
        Your account does not have the role required for this page.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to="/dashboard">Go to workspace</Link>
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
    if (status !== 'anonymous') return

    // The guard can still be mounted for one render after the redirect lands
    // on /login. Never point the redirect at the auth pages themselves.
    if (pathname === '/login' || pathname === '/register') return

    router.history.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
  }, [pathname, router, status])

  if (status === 'loading') return <AuthLoading />
  if (!user) return null

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

export default RouteGuard
