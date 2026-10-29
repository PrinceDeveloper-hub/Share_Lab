import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowUpRight,
  FlaskConical,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { BackButton } from '../ui/BackButton'

export interface AuthLayoutProps {
  children: ReactNode
  mode: 'login' | 'register'
}

const copy = {
  login: {
    headline: 'Borrow the lab. Return the trust.',
    description:
      'ShareLab keeps every request, approval, and handover in one accountable place — from the first eligibility check to the final condition report.',
    note: 'Your session is held in secure, server-managed cookies.',
  },
  register: {
    headline: 'Make room for your next idea.',
    description:
      'One account for the equipment, studios, and shared facilities your work needs. Requirements are visible before you request, and every decision leaves a record.',
    note: 'New accounts start with student access. Managers can raise your role.',
  },
} as const

const TrustLine = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 text-[0.7rem] font-medium text-(--muted)">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(53,107,76,0.1)] text-(--success)">
      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
    </span>
    {children}
  </span>
)

export const AuthLayout = ({ children, mode }: AuthLayoutProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const content = copy[mode]

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-(--ivory) text-(--charcoal)">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-144 bg-[radial-gradient(ellipse_at_18%_0%,rgba(214,189,164,0.32),transparent_60%)]"
      />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-[104rem] lg:grid-cols-[minmax(0,1.02fr)_minmax(30rem,0.98fr)]">
        <motion.aside
          aria-label="About ShareLab"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative order-1 min-h-60 overflow-hidden sm:min-h-72 lg:min-h-dvh"
        >
          <img
            src="/images/hero/scientific-equipment.webp"
            alt="Scientific instruments arranged on a laboratory bench"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,13,0.5)_0%,rgba(28,18,13,0.16)_42%,rgba(28,18,13,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,18,13,0.46),transparent_66%)]" />

          <div className="relative flex min-h-60 flex-col justify-between p-6 sm:min-h-72 sm:p-8 lg:min-h-dvh lg:p-10 xl:p-14">
            <Link
              to="/"
              aria-label="ShareLab home"
              className="hidden w-fit items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent lg:inline-flex"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.7)] backdrop-blur-md">
                <FlaskConical
                  className="h-5 w-5 text-(--cream)"
                  aria-hidden="true"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  ShareLab
                </span>
                <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-white/60">
                  Campus Commons
                </span>
              </span>
            </Link>

            <div className="max-w-136">
              <h1 className="font-display text-[clamp(1.85rem,3.6vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white">
                {content.headline}
              </h1>
              <p className="mt-4 hidden max-w-lg text-sm leading-relaxed text-white/70 sm:block sm:text-[0.95rem]">
                {content.description}
              </p>

              <div className="mt-6 hidden items-center gap-5 border-t border-white/15 pt-5 lg:flex">
                <Link
                  to="/resources"
                  className="inline-flex min-h-11 items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                >
                  Browse the catalogue
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <span aria-hidden="true" className="h-3 w-px bg-white/20" />
                <Link
                  to="/how-it-works"
                  className="inline-flex min-h-11 items-center text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-white/55 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </motion.aside>

        <section className="relative order-2 flex flex-col px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-8 xl:px-14">
          <div className="mx-auto flex w-full max-w-116 flex-1 flex-col">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                aria-label="ShareLab home"
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-4 focus-visible:ring-offset-(--ivory) lg:hidden"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--espresso) shadow-[0_10px_24px_-12px_rgba(81,53,34,0.8)]">
                  <FlaskConical
                    className="h-4 w-4 text-(--cream)"
                    aria-hidden="true"
                  />
                </span>
                <span className="font-display text-base font-bold tracking-tight text-(--charcoal)">
                  ShareLab
                </span>
              </Link>

              <BackButton
                fallback="/"
                className="-mr-2 hidden shrink-0 lg:inline-flex"
              />
            </div>

            <div className="flex flex-1 items-center justify-center py-6 sm:py-10 lg:py-6">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : { y: -2, rotateX: 0.6, rotateY: -0.6 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.55,
                  delay: shouldReduceMotion ? 0 : 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  transformPerspective: 1100,
                  transformStyle: 'preserve-3d',
                }}
                className="w-full [transform-style:preserve-3d]"
              >
                <div className="relative overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 shadow-(--shadow-md) sm:p-8">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(81,53,34,0.24),transparent)]"
                  />
                  {children}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <TrustLine>HttpOnly session cookies</TrustLine>
                  <span
                    aria-hidden="true"
                    className="hidden h-3 w-px bg-[rgba(81,53,34,0.18)] sm:block"
                  />
                  <TrustLine>Role-aware access</TrustLine>
                </div>

                <p className="mx-auto mt-3 max-w-108 px-2 text-center text-[0.68rem] leading-relaxed text-(--muted)">
                  {content.note}
                </p>
              </motion.div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-(--border-subtle) pt-4 text-[0.68rem] text-(--muted)">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                Secure access
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/resources"
                  className="inline-flex min-h-11 items-center rounded-sm font-medium transition-colors hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-4 focus-visible:ring-offset-(--ivory)"
                >
                  Catalogue
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex min-h-11 items-center rounded-sm font-medium transition-colors hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-4 focus-visible:ring-offset-(--ivory)"
                >
                  How it works
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default AuthLayout
