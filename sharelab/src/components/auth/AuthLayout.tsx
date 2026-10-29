import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
<<<<<<< HEAD
import { ArrowLeft, Check, FlaskConical, ShieldCheck } from 'lucide-react'
=======
import {
  ArrowUpRight,
  FlaskConical,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { BackButton } from '../ui/BackButton'
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d

export interface AuthLayoutProps {
  children: ReactNode
  mode: 'login' | 'register'
}

const copy = {
  login: {
<<<<<<< HEAD
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
=======
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
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
  },
} as const

const TrustLine = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-2 text-[0.7rem] font-medium text-[var(--muted)]">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(56,118,83,0.1)] text-[var(--success)]">
      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
    </span>
    {children}
  </span>
)

export const AuthLayout = ({ children, mode }: AuthLayoutProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion())
  const content = copy[mode]

  return (
<<<<<<< HEAD
    <div className="min-h-dvh bg-[var(--ivory)]">
      <div className="grid min-h-dvh lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <aside className="relative hidden overflow-hidden bg-[var(--deep-brown)] lg:flex lg:flex-col lg:justify-between">
=======
    <div className="relative min-h-dvh overflow-x-clip bg-[#f4eee5] text-[var(--charcoal)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(ellipse_at_18%_0%,rgba(214,189,164,0.32),transparent_60%)]"
      />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-[104rem] lg:grid-cols-[minmax(0,1.04fr)_minmax(30rem,0.96fr)]">
        <motion.aside
          aria-label="About ShareLab"
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative order-1 min-h-[15rem] overflow-hidden sm:min-h-[18rem] lg:min-h-dvh"
        >
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
          <img
            src="/images/hero/scientific-equipment.webp"
            alt="Scientific instruments arranged on a laboratory bench"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
<<<<<<< HEAD
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,29,20,0.72)_0%,rgba(43,29,20,0.36)_45%,rgba(43,29,20,0.9)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(43,29,20,0.45),transparent_70%)]" />

          <div className="relative p-10 xl:p-12">
=======
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,13,0.5)_0%,rgba(28,18,13,0.16)_42%,rgba(28,18,13,0.88)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(28,18,13,0.46),transparent_66%)]" />

          <div className="relative flex min-h-[15rem] flex-col justify-between p-6 sm:min-h-[18rem] sm:p-8 lg:min-h-dvh lg:p-10 xl:p-14">
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
            <Link
              to="/"
              aria-label="ShareLab home"
              className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(248,245,239,0.8)] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            >
<<<<<<< HEAD
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-white/20 bg-white/10 backdrop-blur-md">
                <FlaskConical
                  className="h-4 w-4 text-[var(--cream)]"
=======
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-[0_12px_32px_-14px_rgba(0,0,0,0.7)] backdrop-blur-md">
                <FlaskConical
                  className="h-5 w-5 text-[var(--cream)]"
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
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

<<<<<<< HEAD
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
=======
            <div className="max-w-[34rem]">
              <h1 className="font-editorial text-[clamp(1.95rem,4.4vw,4.1rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-white sm:text-[clamp(2.2rem,4.4vw,4.1rem)]">
                {content.headline}
              </h1>
              <p className="mt-4 hidden max-w-[32rem] text-sm leading-relaxed text-white/70 sm:block sm:text-[0.95rem]">
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
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
            </div>
          </div>
        </aside>

<<<<<<< HEAD
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
=======
        <section className="relative order-2 flex flex-col px-4 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-8 xl:px-14">
          <div className="mx-auto flex w-full max-w-[29rem] flex-1 flex-col">
            <div className="flex items-center justify-between gap-4">
              <Link
                to="/"
                aria-label="ShareLab home"
                className="inline-flex min-h-11 items-center gap-2.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4eee5] lg:hidden"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--espresso)] shadow-[0_10px_24px_-12px_rgba(75,47,31,0.8)]">
                  <FlaskConical
                    className="h-4 w-4 text-[var(--cream)]"
                    aria-hidden="true"
                  />
                </span>
                <span className="font-display text-base font-bold tracking-tight text-[var(--charcoal)]">
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
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.55,
                  delay: shouldReduceMotion ? 0 : 0.06,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full"
              >
                <div className="relative overflow-hidden rounded-[1.4rem] border border-[rgba(255,255,255,0.82)] bg-[rgba(255,252,247,0.9)] p-6 shadow-[0_32px_90px_-48px_rgba(75,47,31,0.55),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-8">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(75,47,31,0.24),transparent)]"
                  />
                  {children}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
                  <TrustLine>HttpOnly session cookies</TrustLine>
                  <span
                    aria-hidden="true"
                    className="hidden h-3 w-px bg-[rgba(82,59,45,0.18)] sm:block"
                  />
                  <TrustLine>Role-aware access</TrustLine>
                </div>

                <p className="mx-auto mt-3 max-w-[27rem] px-2 text-center text-[0.68rem] leading-relaxed text-[var(--muted)]">
                  {content.note}
                </p>
              </motion.div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[rgba(82,59,45,0.1)] pt-4 text-[0.68rem] text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3 w-3" aria-hidden="true" />
                Secure access
              </span>
              <div className="flex items-center gap-3">
                <Link
                  to="/resources"
                  className="inline-flex min-h-11 items-center rounded-sm font-medium transition-colors hover:text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4eee5]"
                >
                  Catalogue
                </Link>
                <Link
                  to="/how-it-works"
                  className="inline-flex min-h-11 items-center rounded-sm font-medium transition-colors hover:text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#f4eee5]"
                >
                  How it works
                </Link>
              </div>
            </div>
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
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

export default AuthLayout
