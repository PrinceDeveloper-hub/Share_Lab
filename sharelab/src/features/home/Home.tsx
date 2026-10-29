import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck,
  ClipboardCheck,
  Clock3,
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
    icon: Search,
    step: '01',
    title: 'Discover',
    description:
      'Browse the live catalogue by name, category, and listing status.',
  },
  {
    icon: ListChecks,
    step: '02',
    title: 'Check requirements',
    description:
      'See the credentials, rules, and limits attached to a resource.',
  },
  {
    icon: CalendarCheck,
    step: '03',
    title: 'Request a slot',
    description: 'Submit a time window and purpose for a manager to review.',
  },
  {
    icon: Undo2,
    step: '04',
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

export const Home = () => {
  usePageMeta({
    title: 'ShareLab — Campus Resource Commons',
    description:
      'Discover certified campus equipment and shared facilities with transparent requirements, manager-reviewed bookings, and accountable check-in and return.',
  })

  const [heroImageFailed, setHeroImageFailed] = useState(false)
  const featured = useResources({ perPage: 3, status: 'active' })
  const featuredResources = featured.data?.data ?? []
  const totalResources = featured.data?.meta?.total

  return (
    <SiteLayout>
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
              <Button asChild size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/how-it-works">How it works</Link>
              </Button>
            </div>

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
                </Button>
              }
              secondaryAction={
                <Button asChild>
                  <Link to="/resources">Open catalogue</Link>
                </Button>
              }
            />
          ) : featuredResources.length === 0 ? (
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
              ))}
            </Stagger>
          )}
        </div>
      </section>

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
                    {item.step}
                  </span>
                </div>
                <div>
                  <h3 className="text-[0.95rem] font-semibold text-[var(--charcoal)]">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                    {item.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
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
              <Button asChild variant="inverse" size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 rounded-[0.5rem] px-3 py-2 text-[0.875rem] font-semibold text-[rgba(248,245,239,0.82)] transition-colors hover:text-white"
              >
                Read the process
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
