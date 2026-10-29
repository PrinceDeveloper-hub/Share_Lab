import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, FlaskConical, ShieldCheck } from 'lucide-react'

export interface AuthLayoutProps {
  children: ReactNode
  mode: 'login' | 'register'
}

const copy = {
  login: {
    eyebrow: 'Member access',
    headline: 'Your next discovery starts here.',
    description:
      'Sign in to request shared campus equipment, review eligibility requirements, and keep every handover in one accountable place.',
    points: [
      'Browse the live catalogue and its requirements',
      'Follow each request from review to return',
      'Keep condition and booking records together',
    ],
    asideLabel: 'Already a member?',
    asideTitle: 'Everything in one workspace',
    asideText:
      'Your bookings, credentials, and decisions stay connected to your account.',
  },
  register: {
    eyebrow: 'Join the commons',
    headline: 'Bring your next idea to life.',
    description:
      'Create an account to request laboratory equipment, studios, and shared facilities across campus — with clear requirements at every step.',
    points: [
      'Check eligibility before you request a slot',
      'Keep a clear record of every handover',
      'Use one account across campus resources',
    ],
    asideLabel: 'New to ShareLab?',
    asideTitle: 'Access made understandable',
    asideText:
      'See what a resource requires before you ask for it, then follow the outcome.',
  },
} as const

export const AuthLayout = ({ children, mode }: AuthLayoutProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const content = copy[mode]

  return (
    <div className="min-h-dvh bg-[var(--ivory)]">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="relative hidden overflow-hidden bg-[var(--deep-brown)] lg:flex lg:flex-col lg:justify-between">
          <img
            src="/images/hero/scientific-equipment.webp"
            alt="Scientific instruments arranged on a laboratory bench"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,29,20,0.72)_0%,rgba(43,29,20,0.36)_45%,rgba(43,29,20,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(43,29,20,0.45),transparent_70%)]" />

          <div className="relative p-10 xl:p-12">
            <Link
              to="/"
              aria-label="ShareLab home"
              className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(248,245,239,0.8)] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-white/20 bg-white/10 backdrop-blur-md">
                <FlaskConical
                  className="h-4 w-4 text-[var(--cream)]"
                  aria-hidden="true"
                />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-[1.05rem] font-bold tracking-[-0.02em] text-white">
                  ShareLab
                </span>
                <span className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.2em] text-white/55">
                  Campus Resource Commons
                </span>
              </span>
            </Link>
          </div>

          <div className="relative p-10 xl:p-12">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-3 py-1.5 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {content.eyebrow}
            </span>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-5 max-w-xl font-display text-[clamp(2.1rem,3.2vw,3.1rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-white"
            >
              {content.headline}
            </motion.h1>

            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-white/68">
              {content.description}
            </p>

            <ul className="mt-7 space-y-2.5">
              {content.points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-[0.8125rem] text-white/78"
                >
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/12">
                    <Check
                      className="h-2.5 w-2.5"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 max-w-sm rounded-[var(--radius-md)] border border-white/16 bg-[rgba(248,245,239,0.08)] p-4 backdrop-blur-md">
              <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                {content.asideLabel}
              </p>
              <p className="mt-1 text-[0.8125rem] font-semibold text-white">
                {content.asideTitle}
              </p>
              <p className="mt-1 text-[0.72rem] leading-relaxed text-white/58">
                {content.asideText}
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-h-dvh flex-col px-4 py-5 sm:px-8 lg:px-12 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="inline-flex items-center gap-2.5 lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center rounded-[0.45rem] bg-[var(--espresso)]">
                <FlaskConical
                  className="h-4 w-4 text-[var(--cream)]"
                  aria-hidden="true"
                />
              </span>
              <span className="font-display text-[1rem] font-bold tracking-[-0.02em] text-[var(--charcoal)]">
                ShareLab
              </span>
            </Link>

            <Link
              to="/"
              className="ml-auto inline-flex items-center gap-1.5 rounded-[0.375rem] px-2 py-1 text-[0.78rem] font-medium text-[var(--muted)] transition-colors hover:text-[var(--espresso)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to site
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-center py-8 sm:py-10">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.4,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="w-full max-w-[27rem]"
            >
              {children}
            </motion.div>
          </div>

          <p className="mx-auto max-w-[27rem] text-center text-[0.68rem] leading-relaxed text-[var(--muted)]">
            Server-managed sessions · Credential-aware access · ShareLab Campus
            Resource Commons
          </p>
        </section>
      </div>
    </div>
  )
}
