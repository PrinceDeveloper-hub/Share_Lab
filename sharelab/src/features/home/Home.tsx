import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  ClipboardCheck,
  Clock3,
  FlaskConical,
  Gauge,
  ListChecks,
  Search,
  ShieldCheck,
  Sparkles,
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

const features = [
  {
    icon: ShieldCheck,
    title: 'Eligibility stays visible',
    description:
      'Required credentials and resource rules are shown before a request is made, so expectations are clear on both sides.',
  },
  {
    icon: CalendarCheck,
    title: 'Requests with context',
    description:
      'Bookings carry a purpose, a time window, and the eligibility details a manager needs to make a fair decision.',
  },
  {
    icon: Gauge,
    title: 'Fair usage built in',
    description:
      'Per-booking limits and weekly caps keep shared equipment moving instead of quietly disappearing into one lab.',
  },
  {
    icon: ClipboardCheck,
    title: 'Accountability after pickup',
    description:
      'Check-in, condition reports, returns, and incidents create a complete, auditable record for every handover.',
  },
]

const workflow = [
  {
    icon: Search,
    step: '01',
    title: 'Discover',
    description: 'Browse the live catalogue and compare locations, rules, and booking limits.',
  },
  {
    icon: ListChecks,
    step: '02',
    title: 'Check requirements',
    description: 'Review the credentials and conditions that apply to the resource you need.',
  },
  {
    icon: CalendarCheck,
    step: '03',
    title: 'Request a slot',
    description: 'Submit a time window and purpose. Conflicts move to a ranked waitlist.',
  },
  {
    icon: Undo2,
    step: '04',
    title: 'Use and return',
    description: 'Check in, record condition, and complete the return trail when you are done.',
  },
]

export const Home = () => {
  usePageMeta({
    title: 'ShareLab — Campus Commons',
    description:
      'Discover certified campus equipment and shared facilities with transparent requirements, manager-reviewed bookings, and accountable check-in and return.',
  })

  const featured = useResources({ perPage: 3, status: 'active' })
  const featuredResources = featured.data?.data ?? []
  const totalResources = featured.data?.meta?.total

  return (
    <SiteLayout>
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[-24rem] -z-10 flex justify-center"
        >
          <div className="h-[42rem] w-[76rem] rounded-full bg-[radial-gradient(circle_at_top,rgba(198,165,138,0.26),transparent_68%)] blur-3xl" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 top-64 -z-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(75,47,31,0.07),transparent_70%)] blur-3xl"
        />

        <section className="page-shell grid items-center gap-12 pb-16 pt-10 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div className="flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(82,59,45,0.14)] bg-[rgba(255,252,247,0.78)] px-4 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)] backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[var(--warning)]" aria-hidden="true" />
              Campus resource commons
            </span>

            <div className="flex flex-col gap-5">
              <h1 className="max-w-2xl text-[clamp(2.6rem,6.2vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-[var(--charcoal)]">
                Discover resources. Unlock possibilities.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-[var(--muted)]">
                Discover certified lab equipment, studios, and shared facilities across campus —
                with clear requirements, transparent booking decisions, and a record that keeps
                every handover accountable.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              {[
                { label: 'Credential-aware', value: 'Access rules stay visible' },
                { label: 'Manager-reviewed', value: 'Decisions with context' },
                { label: 'Fully auditable', value: 'Check-in through return' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.55)] px-4 py-3 backdrop-blur-sm"
                >
                  <span className="block text-sm font-semibold text-[var(--charcoal)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroCarousel />
        </section>
      </div>

      <section aria-labelledby="why-sharelab" className="page-shell py-16 sm:py-20">
        <div className="flex flex-col gap-10">
          <SectionHeading
            id="why-sharelab"
            eyebrow="Why ShareLab"
            title="A calmer way to share campus kit"
            description="Purpose-built around the real lifecycle of a request — not a directory that stops at a contact form."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex h-full flex-col gap-4 rounded-[1.35rem] border border-[var(--border-subtle)] bg-[rgba(255,252,247,0.62)] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-[rgba(255,252,247,0.85)] hover:shadow-[var(--shadow-md)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(75,47,31,0.075)]">
                  <feature.icon className="h-5 w-5 text-[var(--espresso)]" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--charcoal)]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="featured-resources"
        className="border-y border-[var(--border-subtle)] bg-[rgba(255,249,241,0.62)] py-16 sm:py-20"
      >
        <div className="page-shell flex flex-col gap-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              id="featured-resources"
              eyebrow="From the catalogue"
              title="Featured resources"
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

          {featured.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured resources">
              {Array.from({ length: 3 }).map((_, index) => (
                <ResourceCardSkeleton key={index} />
              ))}
            </div>
          ) : featured.isError ? (
            <div className="flex flex-col items-start gap-4 rounded-[1.35rem] border border-[rgba(180,77,66,0.24)] bg-[rgba(180,77,66,0.05)] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-[var(--charcoal)]">
                  The live catalogue is unavailable right now.
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Featured listings could not be loaded from the ShareLab API. You can retry or
                  open the catalogue to see the current state.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" size="sm" onClick={() => void featured.refetch()}>
                  Retry
                </Button>
                <Button asChild size="sm">
                  <Link to="/resources">Open catalogue</Link>
                </Button>
              </div>
            </div>
          ) : featuredResources.length === 0 ? (
            <div className="rounded-[1.35rem] border border-dashed border-[var(--border-strong)] bg-[rgba(255,252,247,0.5)] p-8 text-center">
              <FlaskConical className="mx-auto h-8 w-8 text-[var(--taupe)]" aria-hidden="true" />
              <p className="mt-3 font-semibold text-[var(--charcoal)]">
                No resources are published yet
              </p>
              <p className="mx-auto mt-1 max-w-md text-sm text-[var(--muted)]">
                New listings will appear here as soon as they are added to the catalogue.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="workflow-preview" className="page-shell py-16 sm:py-20">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              id="workflow-preview"
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
          </div>

          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((item, index) => (
              <li key={item.step} className="relative">
                {index < workflow.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-[calc(100%-0.5rem)] top-9 hidden h-px w-8 bg-[var(--border-strong)] lg:block"
                  />
                ) : null}
                <div className="flex h-full flex-col gap-4 rounded-[1.35rem] border border-[var(--border-subtle)] bg-[var(--cream)] p-5 shadow-[var(--shadow-xs)]">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--espresso)] text-[var(--cream)]">
                      <item.icon className="h-4.5 w-4.5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {item.step}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[var(--charcoal)]">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-[var(--border-subtle)] bg-[rgba(233,217,198,0.3)] px-5 py-4 text-sm text-[var(--muted)]">
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
              Weekly caps and booking limits apply
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
              Eligibility is verified by the server
            </span>
            <span className="inline-flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-[var(--espresso)]" aria-hidden="true" />
              Managers record a decision reason
            </span>
          </div>
        </div>
      </section>

      <section className="page-shell pb-20 pt-4 sm:pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--deep-brown)] px-6 py-12 text-center shadow-[var(--shadow-lg)] sm:px-12 lg:px-16 lg:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(214,189,164,0.22),transparent_68%)] blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(183,121,50,0.16),transparent_70%)] blur-2xl"
          />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
            <span className="eyebrow text-[rgba(255,249,241,0.56)]">Ready when you are</span>
            <h2 className="text-3xl font-semibold tracking-tight text-[var(--cream)] sm:text-4xl lg:text-5xl">
              Find the resource your work needs next.
            </h2>
            <p className="max-w-xl text-base leading-relaxed text-[rgba(255,249,241,0.7)] sm:text-lg">
              Start with the live catalogue, check what a listing requires, and send a booking
              request through the same transparent process.
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
              <Button asChild variant="inverse" size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Link
                to="/how-it-works"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-[rgba(255,249,241,0.82)] transition-colors hover:text-white"
              >
                Read the full process
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}

export default Home
