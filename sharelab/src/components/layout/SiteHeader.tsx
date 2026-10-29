import { useEffect, useRef, useState } from 'react'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  ChevronDown,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../lib/api-client'
import { Button } from '../ui/button'

const primaryNav = [
  { to: '/', label: 'Home', exact: true },
  { to: '/resources', label: 'Resources', exact: false },
  { to: '/how-it-works', label: 'How It Works', exact: false },
  { to: '/about', label: 'About', exact: false },
] as const

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

const roleLabel: Record<User['role'], string> = {
  user: 'Member',
  owner: 'Resource owner',
  manager: 'Resource manager',
  admin: 'Administrator',
}

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const router = useRouter()
  const { user, status, logout } = useAuth()

  const isActive = (to: string, exact: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)

  const closeMenus = () => {
    setMenuOpen(false)
    setAccountOpen(false)
  }

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    closeMenus()
    await logout()
    router.history.push('/')
    setLoggingOut(false)
  }

  useEffect(() => {
    closeMenus()
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

  useEffect(() => {
    if (!accountOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node))
        setAccountOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [accountOpen])

  const workspaceLink = user
    ? user.role === 'admin'
      ? '/admin'
      : user.role === 'owner'
        ? '/owner'
        : user.role === 'manager'
          ? '/manager'
          : '/dashboard'
    : '/dashboard'

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[rgba(248,245,239,0.9)] backdrop-blur-md">
      <div className="page-shell flex h-[var(--header-height)] items-center justify-between gap-5">
        <Link
          to="/"
          aria-label="ShareLab home"
          className="flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--ivory)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] bg-[var(--espresso)]">
            <FlaskConical
              className="h-[1.05rem] w-[1.05rem] text-[var(--cream)]"
              aria-hidden="true"
            />
          </span>
          <span className="flex flex-col">
            <span className="font-display text-[1.0625rem] font-bold leading-none tracking-[-0.02em] text-[var(--charcoal)]">
              ShareLab
            </span>
            <span className="mt-1 text-[0.55rem] font-semibold uppercase leading-none tracking-[0.22em] text-[var(--muted)]">
              Campus Resource Commons
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {primaryNav.map((item) => {
            const active = isActive(item.to, item.exact)

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative py-2 text-[0.8125rem] font-medium transition-colors',
                  active
                    ? 'text-[var(--espresso)]'
                    : 'text-[var(--muted)] hover:text-[var(--charcoal)]',
                )}
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 -bottom-[0.35rem] h-[2px] rounded-full bg-[var(--bronze)] transition-opacity',
                    active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          {status === 'loading' ? (
            <span
              aria-hidden="true"
              className="h-8 w-28 animate-pulse rounded-[0.5rem] bg-[rgba(81,53,34,0.07)]"
            />
          ) : user ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((open) => !open)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-[0.5rem] border border-transparent py-1 pl-1 pr-2 transition-colors hover:border-[var(--border-subtle)] hover:bg-[var(--cream)]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--soft-beige)] font-mono text-[0.65rem] font-semibold text-[var(--espresso)]">
                  {initialsFor(user.name)}
                </span>
                <span className="max-w-[8rem] truncate text-[0.8125rem] font-medium text-[var(--charcoal)]">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 text-[var(--muted)] transition-transform',
                    accountOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {accountOpen ? (
                <div
                  role="menu"
                  aria-label="Account"
                  className="absolute right-0 top-[calc(100%+0.55rem)] w-64 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-lg)]"
                >
                  <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                    <p className="truncate text-[0.8125rem] font-semibold text-[var(--charcoal)]">
                      {user.name}
                    </p>
                    <p className="mt-0.5 truncate text-[0.7rem] text-[var(--muted)]">
                      {user.email}
                    </p>
                    <p className="mt-1.5 inline-flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[var(--bronze-deep)]">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      {roleLabel[user.role]}
                    </p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to={workspaceLink}
                      role="menuitem"
                      className="flex items-center gap-2 rounded-[0.375rem] px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] transition-colors hover:bg-[var(--soft-beige)]"
                    >
                      <LayoutDashboard
                        className="h-3.5 w-3.5 text-[var(--muted)]"
                        aria-hidden="true"
                      />
                      Workspace
                    </Link>
                    <Link
                      to="/my-bookings"
                      role="menuitem"
                      className="flex items-center gap-2 rounded-[0.375rem] px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] transition-colors hover:bg-[var(--soft-beige)]"
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-[2px] border border-[var(--muted)]"
                        aria-hidden="true"
                      />
                      My bookings
                    </Link>
                    <Link
                      to="/credentials"
                      role="menuitem"
                      className="flex items-center gap-2 rounded-[0.375rem] px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] transition-colors hover:bg-[var(--soft-beige)]"
                    >
                      <ShieldCheck
                        className="h-3.5 w-3.5 text-[var(--muted)]"
                        aria-hidden="true"
                      />
                      Credentials
                    </Link>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => void handleLogout()}
                      disabled={loggingOut}
                      className="flex w-full items-center gap-2 rounded-[0.375rem] px-3 py-2 text-left text-[0.8125rem] text-[var(--muted)] transition-colors hover:bg-[var(--soft-beige)] hover:text-[var(--charcoal)]"
                    >
                      {loggingOut ? (
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--charcoal)] transition-colors hover:border-[var(--border-strong)] lg:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={
            menuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Menu className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="mobile-navigation"
        hidden={!menuOpen}
        className="border-t border-[var(--border-subtle)] bg-[var(--ivory)] lg:hidden"
      >
        <nav
          aria-label="Mobile"
          className="page-shell flex max-h-[calc(100dvh-var(--header-height))] flex-col overflow-y-auto py-4"
        >
          {primaryNav.map((item) => {
            const active = isActive(item.to, item.exact)

            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'border-b border-[var(--border-subtle)] px-1 py-3 text-[0.9375rem] font-medium transition-colors',
                  active ? 'text-[var(--espresso)]' : 'text-[var(--charcoal)]',
                )}
              >
                {item.label}
              </Link>
            )
          })}

          {user ? (
            <div className="mt-4 grid gap-2">
              <div className="mb-1 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--soft-beige)] font-mono text-[0.65rem] font-semibold text-[var(--espresso)]">
                  {initialsFor(user.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.8125rem] font-semibold text-[var(--charcoal)]">
                    {user.name}
                  </p>
                  <p className="truncate text-[0.7rem] text-[var(--muted)]">
                    {roleLabel[user.role]}
                  </p>
                </div>
              </div>
              <Button asChild variant="secondary">
                <Link to={workspaceLink}>Open workspace</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/my-bookings">My bookings</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/credentials">Credentials</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => void handleLogout()}
                disabled={loggingOut}
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid gap-2">
              <Button asChild variant="secondary">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Create an account</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
