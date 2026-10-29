import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  ListChecks,
  Search,
  ShieldCheck,
  Undo2,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { ResourceCard } from '../../components/resources/ResourceCard'
import { ResourceCardSkeleton } from '../../components/resources/ResourceCardSkeleton'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Reveal, Stagger, StaggerItem } from '../../components/ui/Reveal'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResources } from '../../hooks/useResources'

const workflow = [
  {
    step: '01',
    icon: Search,
    title: 'Discover',
<<<<<<< HEAD
    description:
      'Browse the live catalogue by name, category, and listing status.',
=======
    description: 'Browse the live catalogue and compare locations, rules and booking limits.',
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Check requirements',
<<<<<<< HEAD
    description:
      'See the credentials, rules, and limits attached to a resource.',
=======
    description: 'See exactly which credentials and conditions apply before you request.',
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  },
  {
    step: '03',
    icon: CalendarCheck,
    title: 'Request a slot',
    description: 'Submit a time window and purpose for a manager to review.',
  },
  {
    step: '04',
    icon: Undo2,
    title: 'Use and return',
    description: 'Complete the handover with condition and return records.',
  },
]

const safeguards = [
  {
    icon: BadgeCheck,
    title: 'Verified credentials',
    description:
      'Training and certification requirements are attached to the listing and checked against your account.',
  },
  {
    icon: ClipboardCheck,
    title: 'Decisions with reasons',
    description:
      'Managers record why a request was approved, rejected, or waitlisted. The reason stays visible.',
  },
  {
    icon: Gauge,
    title: 'Fair weekly limits',
    description:
      'Per-booking limits and weekly caps keep shared equipment moving across the campus.',
  },
  {
    icon: ShieldCheck,
    title: 'Accountable handling',
    description:
      'Check-in and return condition reports stay attached to the booking, not to memory.',
  },
  {
    icon: Clock3,
    title: 'A complete record',
    description:
      'Every state change is written to an append-only audit trail for the people who need it.',
  },
]

const trustPoints = [
  {
    icon: ShieldCheck,
    title: 'Verified credentials',
    description:
      'Training and safety requirements are checked server-side before a booking can be approved.',
  },
  {
    icon: ListChecks,
    title: 'Transparent decisions',
    description:
      'Every approval, rejection and waitlist placement carries a written reason you can read.',
  },
  {
    icon: Gauge,
    title: 'Weekly usage limits',
    description:
      'Per-booking limits and weekly caps keep shared equipment moving across the community.',
  },
  {
    icon: ClipboardCheck,
    title: 'Responsible handling',
    description:
      'Safety instructions and condition records travel with the resource, not a separate inbox.',
  },
  {
    icon: Undo2,
    title: 'Returns and incidents',
    description:
      'Check-in and return records build one auditable timeline for every handover.',
  },
]

const heroFade = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

export const Home = () => {
  usePageMeta({
    title: 'ShareLab — Campus Resource Commons',
    description:
      'Discover certified campus equipment and shared facilities with transparent requirements, manager-reviewed bookings, and accountable check-in and return.',
  })

<<<<<<< HEAD
  const [heroImageFailed, setHeroImageFailed] = useState(false)
=======
  const shouldReduceMotion = Boolean(useReducedMotion())
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
  const featured = useResources({ perPage: 3, status: 'active' })
  const featuredResources = featured.data?.data ?? []
  const totalResources = featured.data?.meta?.total

  return (
    <SiteLayout>
<<<<<<< HEAD
      <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--ivory)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[var(--soft-beige)] opacity-45 lg:block"
        />
        <div className="page-shell relative grid items-center gap-10 pb-14 pt-10 sm:pt-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-14 lg:pb-20 lg:pt-16">
          <div className="flex flex-col">
            <span className="eyebrow">Campus Resource Commons</span>

            <h1 className="display-1 mt-5 max-w-[34rem]">
              Better access.
              <br />
              Shared possibilities.
            </h1>

            <p className="lead mt-5">
              Discover shared laboratories, instruments, studios, and
              makerspaces across campus. Check what access requires, request a
              time window, and follow every handover through to a clean return.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-2.5">
=======
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--border-subtle)">
        <div className="page-shell grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="flex flex-col"
          >
            <motion.span variants={heroFade} transition={{ duration: 0.5 }} className="eyebrow">
              <span aria-hidden="true" className="h-px w-6 bg-(--bronze)" />
              Campus resource commons
            </motion.span>

            <motion.h1
              variants={heroFade}
              transition={{ duration: 0.55 }}
              className="display-xl mt-5 max-w-[19ch]"
            >
              Better access.
              <br />
              Shared possibilities.
            </motion.h1>

            <motion.p
              variants={heroFade}
              transition={{ duration: 0.55 }}
              className="lede mt-5"
            >
              ShareLab connects students, researchers and creators with the equipment, studios and
              facilities their work needs — with clear eligibility, manager-reviewed bookings, and a
              record that keeps every handover accountable.
            </motion.p>

            <motion.div
              variants={heroFade}
              transition={{ duration: 0.55 }}
              className="mt-7 flex flex-wrap items-center gap-2.5"
            >
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
              <Button asChild size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link to="/how-it-works">How it works</Link>
              </Button>
            </motion.div>

<<<<<<< HEAD
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--border-subtle)]">
              {[
                {
                  label: 'Live catalogue',
                  value:
                    featured.isSuccess && totalResources !== undefined
                      ? `${totalResources} ${totalResources === 1 ? 'resource' : 'resources'}`
                      : 'Published listings',
                },
                { label: 'Access', value: 'Credentials verified' },
                { label: 'Review', value: 'Human decisions' },
              ].map((item) => (
                <div key={item.label} className="bg-[var(--cream)] px-3.5 py-3">
                  <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-[0.78rem] font-semibold leading-snug text-[var(--charcoal)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--cream)] p-2 shadow-[var(--shadow-md)]">
              <div className="relative overflow-hidden rounded-[calc(var(--radius-xl)-0.4rem)] bg-[var(--soft-beige)]">
                {heroImageFailed ? (
                  <div className="flex aspect-[4/3] items-center justify-center bg-[linear-gradient(145deg,var(--soft-beige),var(--cream))]">
                    <FlaskConical
                      className="h-10 w-10 text-[rgba(81,53,34,0.28)]"
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  <img
                    src="/images/hero/research-lab.webp"
                    alt="Researcher working with scientific equipment in a shared campus laboratory"
                    className="aspect-[4/3] w-full object-cover lg:aspect-[5/6]"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setHeroImageFailed(true)}
                  />
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(43,29,20,0.12)_0%,transparent_40%,rgba(43,29,20,0.44)_100%)]"
                />

                <div className="absolute inset-x-3 bottom-3 rounded-[var(--radius-md)] border border-[rgba(248,245,239,0.32)] bg-[rgba(255,252,247,0.94)] p-4 shadow-[var(--shadow-md)] backdrop-blur-md sm:inset-x-4 sm:bottom-4">
                  <p className="flex items-center gap-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[var(--bronze-deep)]">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-[var(--success)]"
                      aria-hidden="true"
                    />
                    From the live catalogue
                  </p>
                  <p className="mt-1.5 font-display text-[0.95rem] font-semibold leading-snug text-[var(--charcoal)]">
                    Requirements are visible before you request a slot.
                  </p>
                  <Link
                    to="/resources"
                    className="mt-2 inline-flex items-center gap-1 text-[0.78rem] font-semibold text-[var(--espresso)] hover:underline"
                  >
                    Browse published equipment
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="featured-resources"
        className="section page-shell"
      >
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              id="featured-resources"
              eyebrow="From the catalogue"
              title="Resources students are using now"
              description={
                featuredResources.length > 0 && totalResources
                  ? `A live look at ${totalResources} published ${
                      totalResources === 1 ? 'resource' : 'resources'
                    } available through ShareLab.`
                  : 'Live listings from the ShareLab catalogue.'
              }
            />
            <Button asChild variant="secondary" className="shrink-0">
              <Link to="/resources">
                Browse all resources
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>

        <div className="mt-8">
=======
            <motion.dl
              variants={heroFade}
              transition={{ duration: 0.55 }}
              className="mt-9 grid gap-x-6 gap-y-4 border-t border-(--border-subtle) pt-6 sm:grid-cols-3"
            >
              {[
                { term: 'Eligibility', detail: 'Checked before you request' },
                { term: 'Decisions', detail: 'Reviewed by a person' },
                { term: 'History', detail: 'Recorded end to end' },
              ].map((item) => (
                <div key={item.term}>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-(--bronze-deep)">
                    {item.term}
                  </dt>
                  <dd className="mt-1 text-[0.8125rem] leading-snug text-(--muted-strong)">
                    {item.detail}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: shouldReduceMotion ? 0 : 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full lg:justify-self-end"
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* Catalogue preview */}
      <section aria-labelledby="featured-resources" className="page-shell py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            id="featured-resources"
            eyebrow="From the catalogue"
            title="Equipment ready for your next project"
            description={
              featuredResources.length > 0 && totalResources
                ? `A live look at ${totalResources} published ${
                    totalResources === 1 ? 'resource' : 'resources'
                  } available through ShareLab.`
                : 'Live listings from the ShareLab catalogue.'
            }
          />
          <Link
            to="/resources"
            className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-(--espresso) underline decoration-transparent underline-offset-4 transition-colors hover:decoration-(--bronze)"
          >
            Browse all resources
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-9">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
          {featured.isLoading ? (
            <div
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
              aria-label="Loading featured resources"
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <ResourceCardSkeleton key={index} />
              ))}
            </div>
          ) : featured.isError ? (
<<<<<<< HEAD
            <EmptyState
              icon={FlaskConical}
              title="The live catalogue is unavailable right now"
              description="Featured listings could not be loaded from the ShareLab API. Retry, or open the catalogue to see its current state."
              action={
                <Button
                  variant="secondary"
                  onClick={() => void featured.refetch()}
                >
                  Try again
=======
            <div className="flex flex-col items-start gap-4 rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-(--charcoal)">
                  The live catalogue is unavailable right now.
                </p>
                <p className="mt-1 max-w-md text-[0.8125rem] leading-relaxed text-(--muted)">
                  Featured listings could not be loaded. Retry, or open the catalogue to see its
                  current state.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" onClick={() => void featured.refetch()}>
                  Retry
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                </Button>
              }
              secondaryAction={
                <Button asChild>
                  <Link to="/resources">Open catalogue</Link>
                </Button>
              }
            />
          ) : featuredResources.length === 0 ? (
<<<<<<< HEAD
            <EmptyState
              icon={FlaskConical}
              title="No resources are published yet"
              description="New listings will appear here as soon as they are added to the catalogue."
            />
          ) : (
            <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredResources.map((resource, index) => (
                <StaggerItem key={resource.id} className="h-full">
                  <ResourceCard resource={resource} eager={index === 0} />
                </StaggerItem>
=======
            <div className="rounded-(--radius-lg) border border-dashed border-(--border-strong) bg-(--surface) px-6 py-12 text-center">
              <FlaskConical className="mx-auto h-7 w-7 text-(--taupe)" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold text-(--charcoal)">No resources are published yet</p>
              <p className="mx-auto mt-1 max-w-sm text-[0.8125rem] leading-relaxed text-(--muted)">
                New listings will appear here as soon as they are added to the catalogue.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredResources.map((resource, index) => (
                <motion.div
                  key={resource.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.4,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <ResourceCard resource={resource} />
                </motion.div>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
              ))}
            </Stagger>
          )}
        </div>
      </section>

<<<<<<< HEAD
      <section
        aria-labelledby="workflow-heading"
        className="border-y border-[var(--border-subtle)] bg-[rgba(239,230,217,0.45)] py-[var(--section-y)]"
      >
        <div className="page-shell">
          <Reveal className="flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              id="workflow-heading"
              eyebrow="How it works"
              title="One clear path from discovery to return"
              description="Four checkpoints keep students, resource owners, and managers aligned at every stage."
            />
            <Button asChild variant="ghost" className="shrink-0">
              <Link to="/how-it-works">
                See the full process
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </Reveal>

          <ol className="mt-9 grid gap-px overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item) => (
              <li
                key={item.step}
                className="flex flex-col gap-4 bg-[var(--cream)] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-[var(--border-subtle)] bg-[var(--ivory)] text-[var(--espresso)]">
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[0.7rem] text-[var(--bronze-deep)]">
=======
      {/* Workflow */}
      <section aria-labelledby="workflow-preview" className="border-y border-(--border-subtle) bg-(--soft-beige)">
        <div className="page-shell py-16 sm:py-20">
          <SectionHeading
            id="workflow-preview"
            eyebrow="How it works"
            title="One clear path from discovery to return"
            description="Four checkpoints keep students, resource owners and managers aligned at every stage."
          />

          <ol className="mt-10 grid gap-px overflow-hidden rounded-(--radius-lg) border border-[rgba(81,53,34,0.12)] bg-[rgba(81,53,34,0.12)] sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item) => (
              <li key={item.step} className="flex flex-col gap-4 bg-(--surface) p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] bg-(--espresso)">
                    <item.icon className="h-4 w-4 text-(--cream)" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-(--bronze-deep)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                    {item.step}
                  </span>
                </div>
                <div>
<<<<<<< HEAD
                  <h3 className="text-[0.95rem] font-semibold text-[var(--charcoal)]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
=======
                  <h3 className="font-display text-[0.9875rem] font-semibold text-(--charcoal)">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-(--muted)">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
<<<<<<< HEAD
        </div>
      </section>

      <section aria-labelledby="trust-heading" className="section page-shell">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-24">
              <SectionHeading
                id="trust-heading"
                eyebrow="Trust and accountability"
                title="Shared equipment works when the rules are legible."
                description="ShareLab does not replace the judgement of the people who own and manage campus resources. It gives their rules a clear surface and every request a traceable path."
              />
              <div className="mt-7 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)]">
                <img
                  src="/images/hero/collaborative-workspace.webp"
                  alt="Students collaborating around a table in a campus makerspace"
                  className="aspect-[16/10] w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </Reveal>

          <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {safeguards.map((item) => (
              <div key={item.title} className="flex gap-4 py-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--cream)]">
                  <item.icon
                    className="h-4 w-4 text-[var(--espresso)]"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h3 className="text-[0.95rem] font-semibold text-[var(--charcoal)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-[var(--section-y)]">
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-[var(--deep-brown)] px-6 py-12 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-14 lg:py-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(167,130,96,0.24),transparent_68%)] blur-2xl"
            />
            <div className="relative max-w-xl">
              <span className="eyebrow text-[rgba(248,245,239,0.55)]">
                Ready when you are
              </span>
              <h2 className="mt-3 font-display text-[clamp(1.75rem,3.4vw,2.6rem)] font-semibold leading-tight tracking-[-0.03em] text-[var(--cream)]">
                Find the resource your work needs next.
              </h2>
              <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-[rgba(248,245,239,0.66)]">
                Start with the live catalogue, review what a listing requires,
                and send a request through the same transparent process.
              </p>
            </div>
            <div className="relative mt-7 flex flex-wrap items-center gap-2.5 lg:mt-0 lg:shrink-0">
=======
        </div>
      </section>

      {/* Trust */}
      <section aria-labelledby="accountability" className="page-shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <SectionHeading
              id="accountability"
              eyebrow="Trust and accountability"
              title="Sharing works when the rules are visible"
              description="Access is more than a calendar. ShareLab makes requirements, limits and decisions legible to everyone involved."
            />
            <Button asChild variant="secondary" className="mt-6">
              <Link to="/how-it-works">
                Read the full process
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="divide-y divide-(--border-subtle) border-y border-(--border-subtle)">
            {trustPoints.map((point) => (
              <li key={point.title} className="flex gap-4 py-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.45rem] bg-[rgba(167,130,96,0.14)] text-(--bronze-deep)">
                  <point.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-(--charcoal)">{point.title}</h3>
                  <p className="mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-(--muted)">
                    {point.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="page-shell pb-16 sm:pb-20">
        <div className="relative overflow-hidden rounded-(--radius-panel) bg-(--deep-brown) px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(120deg,transparent,rgba(167,130,96,0.16))] lg:block"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <span className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-[rgba(255,252,247,0.55)]">
                Ready when you are
              </span>
              <h2 className="display-lg mt-3 text-(--cream)">
                Find the resource your work needs next.
              </h2>
              <p className="mt-3 max-w-lg text-[0.9375rem] leading-relaxed text-[rgba(255,252,247,0.7)]">
                Start with the live catalogue, check what a listing requires, and send a request
                through the same transparent process.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
              <Button asChild variant="inverse" size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
<<<<<<< HEAD
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 rounded-[0.5rem] px-3 py-2 text-[0.875rem] font-semibold text-[rgba(248,245,239,0.82)] transition-colors hover:text-white"
              >
                Read the process
=======
                to="/register"
                className="inline-flex h-11 items-center gap-1.5 rounded-[0.65rem] px-4 text-[0.9375rem] font-semibold text-[rgba(255,252,247,0.85)] transition-colors hover:text-white"
              >
                Create an account
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </SiteLayout>
  )
}

export default Home
