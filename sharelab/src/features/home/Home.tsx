import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ClipboardCheck,
  FlaskConical,
  Gauge,
  ListChecks,
  Search,
  ShieldCheck,
  Undo2,
} from 'lucide-react'
import { HeroCarousel } from '../../components/home/HeroCarousel'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { ResourceCard } from '../../components/resources/ResourceCard'
import { ResourceCardSkeleton } from '../../components/resources/ResourceCardSkeleton'
import { Button } from '../../components/ui/button'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResources } from '../../hooks/useResources'

const workflow = [
  {
    step: '01',
    icon: Search,
    title: 'Discover',
    description:
      'Browse the live catalogue and compare locations, rules and booking limits.',
  },
  {
    step: '02',
    icon: ListChecks,
    title: 'Check requirements',
    description:
      'See exactly which credentials and conditions apply before you request.',
  },
  {
    step: '03',
    icon: CalendarCheck,
    title: 'Request a slot',
    description:
      'Submit a time window and purpose. Conflicts move to a ranked waitlist.',
  },
  {
    step: '04',
    icon: Undo2,
    title: 'Use and return',
    description:
      'Check in, record condition, and complete the return trail when you are done.',
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

  const shouldReduceMotion = Boolean(useReducedMotion())
  const featured = useResources({ perPage: 3, status: 'active' })
  const featuredResources = featured.data?.data ?? []
  const totalResources = featured.data?.meta?.total

  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-(--border-subtle)">
        <div className="page-shell grid items-center gap-10 py-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:py-10">
          <motion.div
            initial={shouldReduceMotion ? false : 'hidden'}
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="flex flex-col"
          >
            <motion.span
              variants={heroFade}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
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
              ShareLab connects students, researchers and creators with the
              equipment, studios and facilities their work needs — with clear
              eligibility, manager-reviewed bookings, and a record that keeps
              every handover accountable.
            </motion.p>

            <motion.div
              variants={heroFade}
              transition={{ duration: 0.55 }}
              className="mt-7 flex flex-wrap items-center gap-2.5"
            >
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
            transition={{
              duration: 0.65,
              delay: shouldReduceMotion ? 0 : 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-full lg:justify-self-end"
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </section>

      {/* Catalogue preview */}
      <section
        aria-labelledby="featured-resources"
        className="page-shell py-16 sm:py-20"
      >
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
            <div className="flex flex-col items-start gap-4 rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-(--charcoal)">
                  The live catalogue is unavailable right now.
                </p>
                <p className="mt-1 max-w-md text-[0.8125rem] leading-relaxed text-(--muted)">
                  Featured listings could not be loaded. Retry, or open the
                  catalogue to see its current state.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void featured.refetch()}
                >
                  Retry
                </Button>
                <Button asChild size="sm">
                  <Link to="/resources">Open catalogue</Link>
                </Button>
              </div>
            </div>
          ) : featuredResources.length === 0 ? (
            <div className="rounded-(--radius-lg) border border-dashed border-(--border-strong) bg-(--surface) px-6 py-12 text-center">
              <FlaskConical
                className="mx-auto h-7 w-7 text-(--taupe)"
                aria-hidden="true"
              />
              <p className="mt-3 text-sm font-semibold text-(--charcoal)">
                No resources are published yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-[0.8125rem] leading-relaxed text-(--muted)">
                New listings will appear here as soon as they are added to the
                catalogue.
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Workflow */}
      <section
        aria-labelledby="workflow-preview"
        className="border-y border-(--border-subtle) bg-(--soft-beige)"
      >
        <div className="page-shell py-16 sm:py-20">
          <SectionHeading
            id="workflow-preview"
            eyebrow="How it works"
            title="One clear path from discovery to return"
            description="Four checkpoints keep students, resource owners and managers aligned at every stage."
          />

          <ol className="mt-10 grid gap-px overflow-hidden rounded-(--radius-lg) border border-[rgba(81,53,34,0.12)] bg-[rgba(81,53,34,0.12)] sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => (
              <motion.li
                key={item.step}
                initial={
                  shouldReduceMotion ? false : { opacity: 0, y: 18, rotateX: 4 }
                }
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                whileHover={
                  shouldReduceMotion ? undefined : { y: -4, rotateX: -2 }
                }
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{ transformPerspective: 900 }}
                className="flex flex-col gap-4 bg-(--surface) p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] bg-(--espresso)">
                    <item.icon
                      className="h-4 w-4 text-(--cream)"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="font-mono text-[0.6875rem] tracking-[0.08em] text-(--bronze-deep)">
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-[0.9875rem] font-semibold text-(--charcoal)">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-(--muted)">
                    {item.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Trust */}
      <section
        aria-labelledby="accountability"
        className="page-shell py-16 sm:py-20"
      >
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
            {trustPoints.map((point, index) => (
              <motion.li
                key={point.title}
                initial={shouldReduceMotion ? false : { opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.4,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="flex gap-4 py-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.45rem] bg-[rgba(167,130,96,0.14)] text-(--bronze-deep)">
                  <point.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-(--charcoal)">
                    {point.title}
                  </h3>
                  <p className="mt-1 max-w-xl text-[0.8125rem] leading-relaxed text-(--muted)">
                    {point.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="page-shell pb-16 sm:pb-20">
        <motion.div
          initial={
            shouldReduceMotion ? false : { opacity: 0, y: 20, scale: 0.99 }
          }
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-(--radius-panel) bg-(--deep-brown) px-6 py-12 sm:px-10 lg:px-14 lg:py-16"
        >
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
                Start with the live catalogue, check what a listing requires,
                and send a request through the same transparent process.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Button asChild variant="inverse" size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                to="/register"
                className="inline-flex h-11 items-center gap-1.5 rounded-[0.65rem] px-4 text-[0.9375rem] font-semibold text-[rgba(255,252,247,0.85)] transition-colors hover:text-white"
              >
                Create an account
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </SiteLayout>
  )
}

export default Home
