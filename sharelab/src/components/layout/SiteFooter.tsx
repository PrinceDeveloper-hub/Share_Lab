import { Link } from '@tanstack/react-router'
import { ArrowUpRight, FlaskConical } from 'lucide-react'

const exploreLinks = [
  { to: '/resources', label: 'Resource catalogue' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About ShareLab' },
] as const

const accountLinks = [
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
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
