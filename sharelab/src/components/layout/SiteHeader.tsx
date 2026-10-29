import { useEffect, useRef, useState } from 'react'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronDown,
  Gauge,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { useUnreadNotificationCount } from '../../hooks/useNotifications'
import { Button } from '../ui/button'
import { BrandMark } from './BrandMark'
import { ThemeToggle } from './ThemeToggle'

const primaryNav = [
  { to: '/', label: 'Home', exact: true },
  { to: '/resources', label: 'Resources', exact: false },
  { to: '/how-it-works', label: 'How it works', exact: false },
  { to: '/about', label: 'About', exact: false },
] as const

const accountLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/my-bookings', label: 'My bookings', icon: CalendarDays },
  { to: '/credentials', label: 'Credentials', icon: ShieldCheck },
  { to: '/incidents', label: 'Incidents', icon: ShieldAlert },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile & security', icon: UserRound },
] as const

const workspaceLinks = {
  owner: { to: '/owner', label: 'Owner workspace', icon: Gauge },
  manager: { to: '/manager', label: 'Manager workspace', icon: Settings2 },
  admin: { to: '/admin', label: 'Admin console', icon: ShieldCheck },
} as const

const NavLink = ({
  to,
  label,
  exact,
  onNavigate,
}: {
  to: string
  label: string
  exact: boolean
  onNavigate?: () => void
}) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const active = exact
    ? pathname === to
    : pathname === to || pathname.startsWith(`${to}/`)

  return (
    <Link
      to={to}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative inline-flex h-(--header-height) items-center px-1 text-[0.8125rem] font-medium tracking-[-0.005em] transition-colors',
        active ? 'text-(--charcoal)' : 'text-(--muted) hover:text-(--charcoal)',
      )}
    >
      {label}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-x-1 bottom-0 h-[2px] rounded-full transition-opacity duration-200',
          active ? 'bg-(--espresso) opacity-100' : 'opacity-0',
        )}
      />
    </Link>
  )
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
  const shouldReduceMotion = Boolean(useReducedMotion())
  const { user, status, logout } = useAuth()
  const unreadQuery = useUnreadNotificationCount()
  const unread = unreadQuery.data?.data.unread ?? 0

  const handleLogout = async () => {
    if (loggingOut) return

    setLoggingOut(true)
    setMenuOpen(false)
    setAccountOpen(false)
    await logout()
    router.history.push('/')
    setLoggingOut(false)
  }

  const initials = user
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  const workspace =
    user && user.role in workspaceLinks
      ? workspaceLinks[user.role as keyof typeof workspaceLinks]
      : null

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!accountOpen) return

    const onPointerDown = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false)
      }
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
    <header className="sticky top-0 z-50 border-b border-(--border-subtle) bg-(--header-bg) shadow-[0_1px_0_var(--glass-border)] backdrop-blur-xl backdrop-saturate-150">
      <div className="page-shell flex h-(--header-height) items-center justify-between gap-6">
        <Link
          to="/"
          aria-label="ShareLab — campus resource commons, home"
          className="group flex shrink-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-4"
        >
          <BrandMark
            className="h-9 w-9 rounded-[0.6rem] bg-(--surface) p-1 ring-1 ring-(--border-subtle)"
            iconClassName="text-(--espresso)"
          />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[1.0625rem] font-bold tracking-[-0.03em] text-(--charcoal)">
              ShareLab
            </span>
            <span className="mt-[0.2rem] text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-(--muted)">
              Campus resource commons
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {primaryNav.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {status === 'loading' ? (
            <span
              aria-hidden="true"
              className="h-9 w-32 animate-pulse rounded-md bg-(--soft-beige)"
            />
          ) : user ? (
            <>
              <Link
                to="/notifications"
                aria-label={
                  unread > 0
                    ? `Notifications, ${unread} unread`
                    : 'Notifications'
                }
                className="relative flex h-9 w-9 items-center justify-center rounded-md text-(--muted-strong) transition-colors hover:bg-(--surface-sunken) hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
              >
                <Bell className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
                {unread > 0 ? (
                  <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-(--warning) ring-2 ring-(--ivory)" />
                ) : null}
              </Link>

              <div ref={accountRef} className="relative">
                <button
                  type="button"
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-(--border-subtle) bg-(--surface) pl-1 pr-2 text-[0.8125rem] font-semibold text-(--charcoal) transition-colors hover:border-(--border-strong) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-[0.35rem] bg-(--espresso) text-[0.625rem] font-semibold tracking-wide text-(--accent-contrast)">
                    {initials}
                  </span>
                  <span className="max-w-24 truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-(--muted) transition-transform',
                      accountOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {accountOpen ? (
                    <motion.div
                      role="menu"
                      aria-label="Account navigation"
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: -4 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -4 }
                      }
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute right-0 top-[calc(100%+0.5rem)] w-64 overflow-hidden rounded-(--radius-md) border border-(--glass-border) bg-(--glass-light) p-1.5 shadow-(--shadow-lg) backdrop-blur-2xl backdrop-saturate-150"
                    >
                      <div className="border-b border-(--border-subtle) px-2.5 pb-2.5 pt-1.5">
                        <p className="truncate text-[0.8125rem] font-semibold text-(--charcoal)">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-(--muted)">
                          {user.email}
                        </p>
                        <span className="mt-1.5 inline-flex items-center rounded-[0.3rem] bg-(--soft-beige) px-1.5 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] text-(--muted-strong)">
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-0.5 pt-1.5">
                        {accountLinks.slice(0, 4).map((link) => (
                          <Link
                            key={link.to}
                            role="menuitem"
                            to={link.to}
                            className="flex min-h-9 items-center gap-2.5 rounded-[0.4rem] px-2.5 text-[0.8125rem] font-medium text-(--charcoal) transition-colors hover:bg-(--surface-sunken)"
                          >
                            <link.icon
                              className="h-4 w-4 text-(--bronze)"
                              aria-hidden="true"
                            />
                            {link.label}
                          </Link>
                        ))}
                        {workspace ? (
                          <Link
                            role="menuitem"
                            to={workspace.to}
                            className="flex min-h-9 items-center gap-2.5 rounded-[0.4rem] px-2.5 text-[0.8125rem] font-medium text-(--charcoal) transition-colors hover:bg-(--surface-sunken)"
                          >
                            <workspace.icon
                              className="h-4 w-4 text-(--bronze)"
                              aria-hidden="true"
                            />
                            {workspace.label}
                          </Link>
                        ) : null}
                      </div>

                      <div className="mt-1.5 space-y-0.5 border-t border-(--border-subtle) pt-1.5">
                        {accountLinks.slice(4).map((link) => (
                          <Link
                            key={link.to}
                            role="menuitem"
                            to={link.to}
                            className="flex min-h-9 items-center gap-2.5 rounded-[0.4rem] px-2.5 text-[0.8125rem] font-medium text-(--charcoal) transition-colors hover:bg-(--surface-sunken)"
                          >
                            <link.icon
                              className="h-4 w-4 text-(--bronze)"
                              aria-hidden="true"
                            />
                            {link.label}
                            {link.to === '/notifications' && unread > 0 ? (
                              <span className="ml-auto rounded-[0.3rem] bg-(--badge-pending) px-1.5 py-0.5 text-[0.625rem] font-semibold text-(--warning)">
                                {unread}
                              </span>
                            ) : null}
                          </Link>
                        ))}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => void handleLogout()}
                          disabled={loggingOut}
                          className="flex min-h-9 w-full items-center gap-2.5 rounded-[0.4rem] px-2.5 text-[0.8125rem] font-medium text-(--error) transition-colors hover:bg-(--error-tint-soft) disabled:opacity-60"
                        >
                          {loggingOut ? (
                            <Loader2
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <LogOut className="h-4 w-4" aria-hidden="true" />
                          )}
                          {loggingOut ? 'Signing out…' : 'Sign out'}
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex h-9 items-center px-2 text-[0.8125rem] font-semibold text-(--muted-strong) transition-colors hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
              >
                Sign in
              </Link>
              <Button asChild size="sm">
                <Link to="/register">
                  Get started
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-(--border-subtle) text-(--espresso) transition-colors hover:bg-(--surface-sunken) md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          aria-label={
            menuOpen ? 'Close navigation menu' : 'Open navigation menu'
          }
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }
            }
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-(--border-subtle) bg-(--glass-light) backdrop-blur-2xl md:hidden"
          >
            <nav
              aria-label="Mobile"
              className="page-shell flex max-h-[calc(100dvh-var(--header-height))] flex-col gap-1 overflow-y-auto py-4"
            >
              {primaryNav.map((item) => {
                const active = item.exact
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(`${item.to}/`)

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-[0.5rem] px-3 text-[0.9375rem] font-medium transition-colors',
                      active
                        ? 'bg-(--surface) text-(--charcoal) shadow-(--shadow-xs)'
                        : 'text-(--muted-strong) hover:bg-(--surface)',
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}

              <div className="mt-3 grid gap-2 border-t border-(--border-subtle) pt-4">
                {user ? (
                  <>
                    <p className="px-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-(--muted)">
                      {user.name}
                    </p>
                    {accountLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 text-sm font-medium text-(--charcoal)"
                      >
                        <link.icon
                          className="h-4 w-4 text-(--bronze)"
                          aria-hidden="true"
                        />
                        {link.label}
                        {link.to === '/notifications' && unread > 0 ? (
                          <span className="ml-auto text-xs font-semibold text-(--warning)">
                            {unread}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                    {workspace ? (
                      <Link
                        to={workspace.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex min-h-11 items-center gap-3 rounded-[0.5rem] border border-(--border-subtle) bg-(--surface) px-3 text-sm font-medium text-(--charcoal)"
                      >
                        <workspace.icon
                          className="h-4 w-4 text-(--bronze)"
                          aria-hidden="true"
                        />
                        {workspace.label}
                      </Link>
                    ) : null}
                    <ThemeToggle withLabel />
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => void handleLogout()}
                      disabled={loggingOut}
                    >
                      {loggingOut ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                      )}
                      {loggingOut ? 'Signing out…' : 'Sign out'}
                    </Button>
                  </>
                ) : (
                  <>
                    <ThemeToggle withLabel />
                    <Button asChild size="lg">
                      <Link to="/register" onClick={() => setMenuOpen(false)}>
                        Get started
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/login" onClick={() => setMenuOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}

export default SiteHeader
