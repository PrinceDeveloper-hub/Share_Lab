import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import { FlaskConical, ShieldCheck, Sparkles } from 'lucide-react'
import { BackButton } from '../ui/BackButton'

export interface AuthLayoutProps {
  children: ReactNode
  mode: 'login' | 'register'
}

const copy = {
  login: {
    headline: 'Your next discovery starts here.',
    description:
      'Sign in to discover shared campus equipment, review eligibility requirements, and keep every request and handover in one accountable place.',
    asideLabel: 'Member access',
    asideTitle: 'One place for campus resources',
    asideDescription:
      'Browse live listings, request a time window, and follow each decision from review to return.',
  },
  register: {
    headline: 'Bring your next idea to life.',
    description:
      'Create an account to request laboratory equipment, studios, and shared facilities across campus — with clear requirements at every step.',
    asideLabel: 'Join the commons',
    asideTitle: 'Access made understandable',
    asideDescription:
      'See what a resource requires before you ask for it, then track the outcome without chasing down messages.',
  },
} as const

export const AuthLayout = ({ children, mode }: AuthLayoutProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const content = copy[mode]

  return (
    <div className="relative min-h-dvh overflow-x-clip bg-[#f5f0e8] text-[#241a16]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_25%_0%,rgba(214,189,164,0.26),transparent_58%)]"
      />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-[100rem] lg:grid-cols-[minmax(0,1.05fr)_minmax(30rem,0.95fr)]">
        <motion.aside
          aria-label="About ShareLab"
          initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative hidden min-h-dvh overflow-hidden lg:block"
        >
          <img
            src="/images/hero/scientific-equipment.webp"
            alt="Scientific instruments arranged on a laboratory bench"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(32,21,15,0.38)_0%,rgba(32,21,15,0.08)_34%,rgba(32,21,15,0.82)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,21,15,0.38),transparent_58%)]" />

          <div className="relative flex min-h-dvh flex-col justify-between p-10 xl:p-14">
            <Link
              to="/"
              aria-label="ShareLab home"
              className="inline-flex w-fit items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.7)] backdrop-blur-md">
                <FlaskConical className="h-5 w-5 text-[var(--cream)]" aria-hidden="true" />
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

            <div className="max-w-xl pb-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[rgba(255,249,241,0.78)]" aria-hidden="true" />
                Campus resource commons
              </span>
              <h1 className="mt-5 font-editorial text-[clamp(2.5rem,4vw,4.2rem)] font-semibold leading-[1.02] tracking-[-0.03em] text-white">
                {content.headline}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/70">
                {content.description}
              </p>

              <div className="mt-8 rounded-[1.35rem] border border-white/20 bg-[rgba(255,249,241,0.12)] p-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <ShieldCheck className="h-4 w-4 text-[var(--cream)]" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white/50">
                      {content.asideLabel}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">{content.asideTitle}</p>
                    <p className="mt-1 text-xs leading-relaxed text-white/60">
                      {content.asideDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        <section className="relative flex min-h-dvh flex-col px-4 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-6 xl:px-14">
          <div className="mx-auto flex w-full max-w-[30rem] flex-1 flex-col">
            <div className="flex items-center justify-between gap-4 lg:justify-end">
              <Link
                to="/"
                aria-label="ShareLab home"
                className="inline-flex items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f0e8] lg:hidden"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--espresso)] shadow-[0_10px_24px_-12px_rgba(75,47,31,0.8)]">
                  <FlaskConical className="h-[1.15rem] w-[1.15rem] text-[var(--cream)]" aria-hidden="true" />
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-display text-[1.05rem] font-bold tracking-tight text-[var(--charcoal)]">
                    ShareLab
                  </span>
                  <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                    Campus Commons
                  </span>
                </span>
              </Link>

              <BackButton fallback="/" className="-mr-2 shrink-0" />
            </div>

            <div className="flex flex-1 items-center justify-center py-5 sm:py-8 lg:py-6">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.55,
                  delay: shouldReduceMotion ? 0 : 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full"
              >
                <div className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(255,255,255,0.78)] bg-[rgba(255,252,247,0.8)] p-5 shadow-[0_32px_80px_-42px_rgba(75,47,31,0.5),inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-2xl sm:rounded-[1.85rem] sm:p-8">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-7 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(75,47,31,0.2),transparent)]"
                  />
                  {children}
                </div>

                <p className="mx-auto mt-4 max-w-[30rem] px-2 text-center text-[0.68rem] leading-relaxed text-[var(--muted)] sm:mt-5">
                  Secure session · Server-managed authentication · ShareLab Campus Commons
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
