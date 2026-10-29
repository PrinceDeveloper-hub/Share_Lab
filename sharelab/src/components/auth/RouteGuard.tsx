import { useEffect, useRef } from 'react'
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
<<<<<<< HEAD
    className="flex min-h-[60vh] items-center justify-center px-4"
    role="status"
    aria-live="polite"
  >
    <div className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] px-4 py-2.5 text-[0.8125rem] font-medium text-[var(--muted)]">
=======
    className="flex min-h-[55vh] items-center justify-center px-4"
    role="status"
    aria-live="polite"
  >
<<<<<<< HEAD
    <div className="flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.72)] px-5 py-3 text-sm font-medium text-[var(--muted)] backdrop-blur">
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
=======
    <div className="flex items-center gap-3 rounded-full border border-(--border-subtle) bg-(--surface) px-5 py-3 text-sm font-medium text-(--muted) backdrop-blur">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
      <Loader2
        className="h-4 w-4 animate-spin text-(--espresso)"
        aria-hidden="true"
      />
<<<<<<< HEAD
      Checking your session…
=======
      Checking your session...
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
    </div>
  </div>
)

const AccessDenied = () => (
  <div className="page-shell py-16 sm:py-20">
<<<<<<< HEAD
<<<<<<< HEAD
    <div className="mx-auto max-w-lg rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-8 text-center">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--error-soft)]">
=======
    <div className="mx-auto max-w-lg rounded-[1.5rem] border border-[rgba(180,77,66,0.2)] bg-[rgba(255,252,247,0.72)] p-8 text-center shadow-[var(--shadow-sm)]">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(180,77,66,0.08)]">
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
=======
    <div className="mx-auto max-w-lg rounded-3xl border border-[rgba(169,72,60,0.2)] bg-(--surface) p-8 text-center shadow-soft">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(169,72,60,0.08)]">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
        <ShieldAlert
          className="h-5 w-5 text-(--error)"
          aria-hidden="true"
        />
      </span>
<<<<<<< HEAD
<<<<<<< HEAD
      <h1 className="mt-4 font-display text-[1.5rem] font-semibold text-[var(--charcoal)]">
        Access not available
      </h1>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-[var(--muted)]">
=======
      <h1 className="mt-4 text-2xl font-semibold text-[var(--charcoal)]">
        Access not available
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
=======
      <h1 className="mt-4 text-2xl font-semibold text-(--charcoal)">
        Access not available
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-(--muted)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
  // Remember where the visitor was headed: after the first redirect the
  // location becomes /login, and re-reading it would replace the intended
  // destination with the login page itself.
  const intendedPath = useRef(pathname)

  useEffect(() => {
    if (status !== 'anonymous') return
<<<<<<< HEAD

    // The guard can still be mounted for one render after the redirect lands
    // on /login. Never point the redirect at the auth pages themselves.
    if (pathname === '/login' || pathname === '/register') return

    router.history.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
=======
    if (pathname.startsWith('/login') || pathname.startsWith('/register')) return

    router.history.replace(
      `/login?redirect=${encodeURIComponent(intendedPath.current)}`,
    )
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  }, [pathname, router, status])

  if (status === 'loading') return <AuthLoading />
  if (!user) return null

  if (roles && !roles.includes(user.role)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

export default RouteGuard
