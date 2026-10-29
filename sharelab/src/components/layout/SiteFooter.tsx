import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { BrandMark } from './BrandMark'

const exploreLinks = [
  { to: '/resources', label: 'Resource catalogue' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About ShareLab' },
] as const

const accountLinks = [
<<<<<<< HEAD
  { to: '/dashboard', label: 'Workspace' },
  { to: '/my-bookings', label: 'My bookings' },
  { to: '/credentials', label: 'Credentials' },
] as const

export const SiteFooter = () => {
  return (
    <footer className="mt-auto bg-[var(--deep-brown)] text-[var(--cream)]">
      <div className="page-shell grid gap-10 py-14 md:grid-cols-[1.5fr_0.8fr_0.8fr] lg:gap-16">
        <div className="max-w-md">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(248,245,239,0.7)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--deep-brown)]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] bg-[rgba(248,245,239,0.1)] ring-1 ring-[rgba(248,245,239,0.16)]">
              <FlaskConical
                className="h-[1.05rem] w-[1.05rem] text-[var(--cream)]"
                aria-hidden="true"
              />
            </span>
            <span className="flex flex-col">
              <span className="font-display text-[1.0625rem] font-bold leading-none tracking-[-0.02em] text-[var(--cream)]">
                ShareLab
              </span>
              <span className="mt-1 text-[0.55rem] font-semibold uppercase leading-none tracking-[0.22em] text-[rgba(248,245,239,0.52)]">
                Campus Resource Commons
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-[0.875rem] leading-relaxed text-[rgba(248,245,239,0.62)]">
            A transparent way for campus communities to discover shared
            equipment, verify eligibility, and keep every booking accountable.
          </p>
          <p className="mono mt-6 text-[0.68rem] text-[rgba(248,245,239,0.4)]">
            Credential-aware access · Human decisions · Append-only audit
          </p>
        </div>

        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(248,245,239,0.48)]">
            Explore
          </h2>
          <ul className="mt-4 space-y-3">
            {exploreLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="text-[0.875rem] text-[rgba(248,245,239,0.72)] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[rgba(248,245,239,0.48)]">
            Your account
          </h2>
          <ul className="mt-4 space-y-3">
            {accountLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="inline-flex items-center gap-1.5 text-[0.875rem] text-[rgba(248,245,239,0.72)] transition-colors hover:text-white"
                >
                  {link.label}
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[rgba(248,245,239,0.1)]">
        <div className="page-shell flex flex-col gap-2 py-5 text-[0.72rem] text-[rgba(248,245,239,0.44)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[rgba(248,245,239,0.44)]">
            © {new Date().getFullYear()} ShareLab. Built for accountable access.
          </p>
          <p className="text-[rgba(248,245,239,0.44)]">
            Availability is confirmed when a request is submitted.
=======
  { to: '/login', label: 'Sign in' },
  { to: '/register', label: 'Create an account' },
  { to: '/dashboard', label: 'Your dashboard' },
  { to: '/credentials', label: 'Credentials' },
] as const

const LinkColumn = ({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<{ to: string; label: string }>
}) => (
  <nav aria-label={title}>
    <h2 className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,252,247,0.45)]">
      {title}
    </h2>
    <ul className="mt-4 space-y-2.5">
      {links.map((link) => (
        <li key={link.to + link.label}>
          <Link
            to={link.to}
            className="inline-flex items-center gap-1 text-sm text-[rgba(255,252,247,0.72)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,252,247,0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-(--deep-brown)"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </nav>
)

export const SiteFooter = () => {
  return (
    <footer className="mt-auto bg-(--deep-brown) text-(--cream)">
      <div className="page-shell py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr_0.9fr_1fr]">
          <div className="max-w-sm">
            <Link
              to="/"
              aria-label="ShareLab — campus resource commons, home"
              className="group inline-flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,252,247,0.7)] focus-visible:ring-offset-4 focus-visible:ring-offset-(--deep-brown)"
            >
              <BrandMark
                className="h-9 w-9 rounded-[0.6rem] bg-[rgba(255,252,247,0.1)] p-1 ring-1 ring-[rgba(255,252,247,0.16)]"
                iconClassName="text-(--cream)"
              />
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.0625rem] font-bold tracking-[-0.03em] text-(--cream)">
                  ShareLab
                </span>
                <span className="mt-[0.2rem] text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,252,247,0.5)]">
                  Campus resource commons
                </span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-[rgba(255,252,247,0.62)]">
              A transparent way for campus communities to discover shared
              equipment, verify eligibility, and keep every booking accountable.
            </p>
            <Link
              to="/resources"
              className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-(--cream) underline decoration-[rgba(255,252,247,0.25)] underline-offset-4 transition-colors hover:decoration-(--cream)"
            >
              Browse the catalogue
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <LinkColumn title="Explore" links={exploreLinks} />
          <LinkColumn title="Account" links={accountLinks} />

          <div>
            <h2 className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,252,247,0.45)]">
              Built on
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm text-[rgba(255,252,247,0.72)]">
              <li>Verified credentials</li>
              <li>Manager-reviewed decisions</li>
              <li>Weekly usage limits</li>
              <li>Complete audit trail</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[rgba(255,252,247,0.12)] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[rgba(255,252,247,0.5)]">
            © {new Date().getFullYear()} ShareLab. Built for accountable access.
          </p>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-[rgba(255,252,247,0.42)]">
            Campus resource commons · Est. 2026
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
