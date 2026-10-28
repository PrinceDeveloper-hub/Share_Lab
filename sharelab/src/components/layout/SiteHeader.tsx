import { useEffect, useState } from 'react'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  ArrowUpRight,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'

const primaryNav = [
  { to: '/', label: 'Home', exact: true },
  { to: '/resources', label: 'Resources', exact: false },
  { to: '/how-it-works', label: 'How It Works', exact: false },
  { to: '/about', label: 'About', exact: false },
] as const

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const router = useRouter()
  const { user, status, logout } = useAuth()

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    setMenuOpen(false)
    await logout()
    router.history.push('/')
    setLoggingOut(false)
  }

  const firstName = user?.name.trim().split(/\s+/)[0]

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(255,249,241,0.86)] backdrop-blur-xl">
      <div className="page-shell flex h-[var(--header-height)] items-center justify-between gap-4">
        <Link
          to="/"
          aria-label="ShareLab home"
          className="group flex shrink-0 items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ivory)]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--espresso)] shadow-[0_10px_24px_-12px_rgba(75,47,31,0.8)] transition-transform duration-200 group-hover:-rotate-6">
            <FlaskConical className="h-[1.15rem] w-[1.15rem] text-[var(--cream)]" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.05rem] font-bold tracking-tight text-[var(--charcoal)]">
              ShareLab
            </span>
            <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Campus Commons
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((item) => {
            const active = isActive(item.to, item.exact)

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[rgba(75,47,31,0.08)] text-[var(--espresso)]'
                    : 'text-[rgba(40,37,34,0.72)] hover:bg-[rgba(75,47,31,0.05)] hover:text-[var(--espresso)]',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {status === 'loading' ? (
            <span
              aria-hidden="true"
              className="h-9 w-36 animate-pulse rounded-full bg-[rgba(75,47,31,0.07)]"
            />
          ) : user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5" aria-hidden="true" />
                  {firstName ? `${firstName}'s dashboard` : 'Dashboard'}
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => void handleLogout()} disabled={loggingOut}>
                {loggingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {loggingOut ? 'Signing out...' : 'Sign out'}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/resources">
                  Browse resources
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--espresso)] transition-colors hover:bg-white lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="border-t border-[var(--border-subtle)] bg-[var(--cream)] lg:hidden"
      >
        <nav aria-label="Mobile" className="page-shell flex max-h-[calc(100dvh-var(--header-height))] flex-col gap-1 overflow-y-auto py-4">
          {primaryNav.map((item) => {
            const active = isActive(item.to, item.exact)

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                  active
                    ? 'bg-[rgba(75,47,31,0.08)] text-[var(--espresso)]'
                    : 'text-[var(--charcoal)] hover:bg-[rgba(75,47,31,0.05)]',
                )}
              >
                {item.label}
              </Link>
            )
          })}

          <div className="mt-3 grid gap-2 border-t border-[var(--border-subtle)] pt-4">
            <Button asChild size="lg">
              <Link to="/resources">
                Browse resources
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            {user ? (
              <>
                <Button asChild variant="secondary" size="lg">
                  <Link to="/dashboard">
                    <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                    {firstName ? `${firstName}'s dashboard` : 'Dashboard'}
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                  )}
                  {loggingOut ? 'Signing out...' : 'Sign out'}
                </Button>
              </>
            ) : status === 'anonymous' ? (
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Sign in</Link>
              </Button>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
