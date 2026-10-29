import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useRouter, useRouterState } from '@tanstack/react-router'
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import type { User } from '../../lib/api-client'
import { Button } from '../ui/button'
import { PageFade } from '../ui/Reveal'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

interface NavSection {
  label: string
  items: NavItem[]
  roles?: User['role'][]
}

const sections: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/my-bookings', label: 'My bookings', icon: CalendarCheck },
      { to: '/resources', label: 'Browse resources', icon: ClipboardList },
      { to: '/credentials', label: 'Credentials', icon: ShieldCheck },
    ],
  },
  {
    label: 'Operations',
    roles: ['manager', 'admin'],
    items: [{ to: '/manager', label: 'Manager tools', icon: Wrench }],
  },
  {
    label: 'Ownership',
    roles: ['owner', 'admin'],
    items: [{ to: '/owner', label: 'My resources', icon: Settings2 }],
  },
  {
    label: 'Administration',
    roles: ['admin'],
    items: [
      { to: '/admin', label: 'Platform admin', icon: Users, exact: true },
      {
        to: '/admin/audit',
        label: 'Audit log',
        icon: ClipboardList,
        exact: true,
      },
    ],
  },
]

const roleLabel: Record<User['role'], string> = {
  user: 'Member',
  owner: 'Resource owner',
  manager: 'Resource manager',
  admin: 'Administrator',
}

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')

const Brand = ({ compact }: { compact?: boolean }) => (
  <Link
    to="/"
    aria-label="ShareLab home"
    className={cn(
      'inline-flex items-center gap-2.5 rounded-sm',
      compact && 'justify-center',
    )}
  >
    <span className="flex h-8 w-8 items-center justify-center rounded-[0.45rem] bg-[var(--espresso)]">
      <FlaskConical
        className="h-4 w-4 text-[var(--cream)]"
        aria-hidden="true"
      />
    </span>
    <span className="flex flex-col leading-none">
      <span className="font-display text-[1rem] font-bold tracking-[-0.02em] text-[var(--charcoal)]">
        ShareLab
      </span>
      <span className="mt-0.5 text-[0.52rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
        Workspace
      </span>
    </span>
  </Link>
)

const SidebarNav = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user } = useAuth()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const role = user?.role ?? 'user'

  return (
    <nav
      aria-label="Workspace"
      className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-5"
    >
      {sections
        .filter((section) => !section.roles || section.roles.includes(role))
        .map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = item.exact
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(`${item.to}/`)

                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-2.5 rounded-[0.45rem] px-3 py-2 text-[0.8125rem] font-medium transition-colors',
                        active
                          ? 'bg-[var(--espresso)] text-white'
                          : 'text-[var(--muted)] hover:bg-[rgba(81,53,34,0.06)] hover:text-[var(--charcoal)]',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active
                            ? 'text-white/85'
                            : 'text-[var(--bronze-deep)]',
                        )}
                        aria-hidden="true"
                      />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

      <div className="mt-auto rounded-[0.5rem] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.4)] p-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[var(--bronze-deep)]">
          Public site
        </p>
        <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">
          Return to the catalogue landing page.
        </p>
        <Link
          to="/"
          onClick={onNavigate}
          className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-[var(--espresso)] hover:underline"
        >
          ShareLab home
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </nav>
  )
}

export interface AppShellProps {
  children: ReactNode
}

export const AppShell = ({ children }: AppShellProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [drawerOpen])

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    await logout()
    router.history.push('/')
    setLoggingOut(false)
  }

  return (
    <div className="min-h-screen bg-[var(--ivory)]">
      <a href="#workspace-content" className="skip-link">
        Skip to workspace content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] flex-col border-r border-[var(--border-subtle)] bg-[var(--cream)] lg:flex">
        <div className="flex h-16 items-center border-b border-[var(--border-subtle)] px-5">
          <Brand />
        </div>
        <SidebarNav />
        <div className="border-t border-[var(--border-subtle)] p-3">
          <div className="flex items-center gap-2.5 rounded-[0.45rem] px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--soft-beige)] font-mono text-[0.65rem] font-semibold text-[var(--espresso)]">
              {user ? initialsFor(user.name) : '—'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.78rem] font-semibold text-[var(--charcoal)]">
                {user?.name ?? 'Signed out'}
              </p>
              <p className="truncate text-[0.68rem] text-[var(--muted)]">
                {user ? roleLabel[user.role] : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              aria-label="Sign out"
              className="flex h-8 w-8 items-center justify-center rounded-[0.375rem] text-[var(--muted)] transition-colors hover:bg-[var(--soft-beige)] hover:text-[var(--charcoal)]"
            >
              {loggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[var(--sidebar-width)]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[rgba(248,245,239,0.9)] px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--charcoal)]"
              aria-label="Open workspace navigation"
              aria-expanded={drawerOpen}
              aria-controls="workspace-drawer"
            >
              <Menu className="h-4 w-4" aria-hidden="true" />
            </button>
            <Brand />
          </div>

          <div className="hidden items-center gap-2 text-[0.75rem] text-[var(--muted)] lg:flex">
            <span className="font-medium text-[var(--charcoal)]">
              Workspace
            </span>
            <span aria-hidden="true" className="text-[var(--border-strong)]">
              /
            </span>
            <span className="truncate">
              {pathname === '/dashboard'
                ? 'Overview'
                : pathname.replace(/^\//, '')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/resources"
              className="hidden items-center gap-1.5 text-[0.78rem] font-medium text-[var(--muted)] transition-colors hover:text-[var(--espresso)] sm:inline-flex"
            >
              Catalogue
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <span
              className="hidden h-5 w-px bg-[var(--border-subtle)] sm:block"
              aria-hidden="true"
            />
            <Link
              to="/"
              className="text-[0.78rem] font-medium text-[var(--muted)] transition-colors hover:text-[var(--espresso)]"
            >
              Public site
            </Link>
          </div>
        </header>{' '}
        <main
          id="workspace-content"
          className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        >
          <PageFade className="mx-auto w-full max-w-6xl">{children}</PageFade>
        </main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-[rgba(43,29,20,0.44)] backdrop-blur-[2px]"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            id="workspace-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Workspace navigation"
            className="absolute inset-y-0 left-0 flex w-[min(18rem,84vw)] flex-col border-r border-[var(--border-subtle)] bg-[var(--cream)] shadow-[var(--shadow-lg)]"
          >
            <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-4">
              <Brand />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            <div className="border-t border-[var(--border-subtle)] p-3">
              <Button
                variant="secondary"
                className="w-full"
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
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default AppShell
