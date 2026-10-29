import { Link } from '@tanstack/react-router'
import { ArrowUpRight } from 'lucide-react'
import { BrandMark } from './BrandMark'

const exploreLinks = [
  { to: '/resources', label: 'Resource catalogue' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About ShareLab' },
] as const

const accountLinks = [
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
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
