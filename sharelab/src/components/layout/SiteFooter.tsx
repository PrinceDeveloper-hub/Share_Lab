import { Link } from '@tanstack/react-router'
import { ArrowUpRight, FlaskConical } from 'lucide-react'

const exploreLinks = [
  { to: '/resources', label: 'Resource catalogue' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/about', label: 'About ShareLab' },
] as const

export const SiteFooter = () => {
  return (
    <footer className="relative mt-auto overflow-hidden bg-(--deep-brown) text-(--cream)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(214,189,164,0.16),transparent_68%)] blur-2xl"
      />
      <div className="page-shell relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <Link
              to="/"
              className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,249,241,0.7)] focus-visible:ring-offset-4 focus-visible:ring-offset-(--deep-brown)"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(255,249,241,0.1)] ring-1 ring-[rgba(255,249,241,0.18)]">
                <FlaskConical className="h-5 w-5 text-(--cream)" aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold tracking-tight text-(--cream)">
                  ShareLab
                </span>
                <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-[rgba(255,249,241,0.55)]">
                  Campus Commons
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[rgba(255,249,241,0.66)]">
              A transparent way for campus communities to discover shared equipment, verify
              eligibility, and keep every booking accountable.
            </p>
          </div>

          <div>
            <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[rgba(255,249,241,0.5)]">
              Explore
            </h2>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="inline-flex items-center gap-1.5 text-sm text-[rgba(255,249,241,0.75)] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[rgba(255,249,241,0.5)]">
              Your account
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-[rgba(255,249,241,0.75)] transition-colors hover:text-white"
                >
                  Sign in
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="inline-flex items-center gap-1.5 text-sm text-[rgba(255,249,241,0.75)] transition-colors hover:text-white"
                >
                  Request a booking
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-[rgba(255,249,241,0.12)] pt-6 text-xs text-[rgba(255,249,241,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[rgba(255,249,241,0.5)]">
            © {new Date().getFullYear()} ShareLab. Built for accountable access.
          </p>
          <p className="text-[rgba(255,249,241,0.5)]">
            Credential-aware booking · Transparent decisions · Complete audit trail
          </p>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
