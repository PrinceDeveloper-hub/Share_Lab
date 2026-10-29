import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  Compass,
  GraduationCap,
  Microscope,
  Scale,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/ui/PageHeader'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { usePageMeta } from '../../hooks/usePageMeta'

const problems = [
  {
    number: '01',
    icon: Compass,
    title: 'Discovery depends on who you know',
    description:
      'Useful equipment can sit in a department, studio, or lab with no shared way to see what exists, where it lives, or who maintains it.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    title: 'Requirements are discovered too late',
    description:
      'Training, certification, and room rules are often clarified after someone has already planned around a resource — or not at all.',
  },
  {
    number: '03',
    icon: BookOpenCheck,
    title: 'The handover is hard to reconstruct',
    description:
      'When condition, decisions, and returns are spread across messages and memory, accountability depends on people remembering the details.',
  },
]

const approach = [
  {
    icon: ShieldCheck,
    title: 'Eligibility before access',
    description:
      'Requirements belong on the listing, not in a side conversation. The platform checks credentials again when a request is submitted.',
  },
  {
    icon: Scale,
    title: 'Decisions with reasons',
    description:
      'Approvals, rejections, and waitlist movement are recorded with context so requesters can understand the outcome.',
  },
  {
    icon: BookOpenCheck,
    title: 'Records that follow the resource',
    description:
      'Check-in, condition, return, and incident history stay attached to the booking instead of disappearing with the handover.',
  },
]

const audiences = [
  {
    icon: GraduationCap,
    title: 'Students',
    description:
      'A clearer way to find the equipment a project needs and understand what is required before asking for time with it.',
  },
  {
    icon: Microscope,
    title: 'Researchers',
    description:
      'Visibility into shared lab equipment, booking limits, and the condition history that matters when a result depends on the tools.',
  },
  {
    icon: Building2,
    title: 'Resource owners',
    description:
      'A structured request queue with eligibility context, capacity rules, and a record of who has the resource now.',
  },
  {
    icon: Settings2,
    title: 'Campus administrators',
    description:
      'An auditable view of access decisions and usage patterns without replacing the policies a department already runs.',
  },
]

const principles = [
  {
    title: 'Transparent by default',
    description:
      'Rules, limits, status, and decisions are visible to the people they affect. Nothing important lives only in an inbox.',
  },
  {
    title: 'Eligibility is earned, not bypassed',
    description:
      'Required training and credentials are treated as part of the resource, not an optional checkbox on a form.',
  },
  {
    title: 'Fair access over fast access',
    description:
      'Weekly caps, ranked waitlists, and manager review exist so demand does not quietly favour the loudest request.',
  },
  {
    title: 'Accountability after the booking',
    description:
      'The value of a shared resource depends on what happens between check-in and return. The record should survive both.',
  },
]

export const AboutPage = () => {
  usePageMeta({
    title: 'About — ShareLab',
    description:
      'ShareLab is a campus resource commons designed to make equipment discovery, eligibility, booking decisions, and accountable usage legible to everyone involved.',
  })

  return (
    <SiteLayout>
      <div className="page-shell py-8 sm:py-10 lg:py-12">
        <PageHeader
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
          eyebrow="About ShareLab"
          title="Shared resources should be easy to find — and hard to lose track of."
          description="ShareLab is a campus resource commons: a single place to discover shared equipment and facilities, understand what access requires, and follow a booking from request to return."
          actions={
            <>
              <Button asChild size="lg">
                <Link to="/resources">
                  Explore resources
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/how-it-works">See how it works</Link>
              </Button>
            </>
          }
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
          <div className="prose-editorial">
            <p className="text-[0.9375rem] leading-[1.75] text-[var(--muted)]">
              ShareLab is designed for the everyday reality of campus sharing —
              where a lab, studio, or department owns the resource, a manager
              protects it, and a student or researcher needs to use it
              responsibly.
            </p>
            <p className="mt-4 text-[0.9375rem] leading-[1.75] text-[var(--muted)]">
              The platform does not replace departmental policy. It gives those
              policies a clear surface, a consistent request process, and a
              record that survives the handover.
            </p>

            <dl className="mt-7 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-3">
              {[
                { label: 'Access', value: 'Credential-aware' },
                { label: 'Decisions', value: 'Human-reviewed' },
                { label: 'History', value: 'Fully auditable' },
              ].map((item) => (
                <div key={item.label} className="bg-[var(--cream)] px-4 py-3">
                  <dt className="label">{item.label}</dt>
                  <dd className="mt-1 text-[0.78rem] font-semibold text-[var(--charcoal)]">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--cream)] p-2">
            <div className="relative overflow-hidden rounded-[calc(var(--radius-xl)-0.4rem)]">
              <img
                src="/images/hero/scientific-equipment.webp"
                alt="Glassware and research equipment on a shared laboratory bench"
                className="aspect-[4/3] w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(43,29,20,0.62)_100%)]"
              />
              <blockquote className="absolute inset-x-4 bottom-4 rounded-[var(--radius-md)] border border-[rgba(248,245,239,0.28)] bg-[rgba(255,252,247,0.94)] p-4">
                <p className="text-[0.8125rem] font-medium leading-relaxed text-[var(--charcoal)]">
                  “The goal is not more bookings. It is a clearer, fairer
                  relationship between the people who need a resource and the
                  people who care for it.”
                </p>
              </blockquote>
            </div>
          </figure>
        </div>
      </div>

      <section
        aria-labelledby="the-problem"
        className="border-y border-[var(--border-subtle)] bg-[rgba(239,230,217,0.4)] py-[var(--section-y)]"
      >
        <div className="page-shell grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <SectionHeading
            id="the-problem"
            eyebrow="The problem"
            title="Shared in theory, fragmented in practice."
            description="The gap is rarely the equipment itself. It is the information around it: what exists, who can use it, what it requires, and what happened last time."
          />

          <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {problems.map((problem) => (
              <div
                key={problem.number}
                className="grid grid-cols-[2.5rem_1fr] gap-4 py-5"
              >
                <div className="flex flex-col items-start gap-2">
                  <span className="font-mono text-[0.7rem] text-[var(--bronze-deep)]">
                    {problem.number}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--cream)]">
                    <problem.icon
                      className="h-3.5 w-3.5 text-[var(--espresso)]"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <div>
                  <h3 className="text-[0.9375rem] font-semibold text-[var(--charcoal)]">
                    {problem.title}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="our-approach"
        className="bg-[var(--deep-brown)] py-[var(--section-y)]"
      >
        <div className="page-shell grid gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <span className="eyebrow text-[rgba(248,245,239,0.5)]">
              Our approach
            </span>
            <h2
              id="our-approach"
              className="mt-3 max-w-lg font-display text-[clamp(1.7rem,3vw,2.3rem)] font-semibold leading-tight tracking-[-0.03em] text-[var(--cream)]"
            >
              Make the rules legible, then make the handover visible.
            </h2>
            <p className="mt-3 max-w-lg text-[0.9rem] leading-relaxed text-[rgba(248,245,239,0.62)]">
              ShareLab does not replace the judgement of the people who own and
              manage campus resources. It gives their rules a clear surface and
              gives every request a traceable path.
            </p>
          </div>

          <div className="grid gap-2.5">
            {approach.map((item) => (
              <div
                key={item.title}
                className="flex gap-3.5 rounded-[var(--radius-md)] border border-[rgba(248,245,239,0.12)] bg-[rgba(248,245,239,0.05)] p-4"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[0.45rem] bg-[rgba(248,245,239,0.08)]">
                  <item.icon
                    className="h-3.5 w-3.5 text-[var(--cream)]"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <h3 className="text-[0.875rem] font-semibold text-[var(--cream)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[0.78rem] leading-relaxed text-[rgba(248,245,239,0.6)]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="who-it-serves" className="section page-shell">
        <SectionHeading
          id="who-it-serves"
          eyebrow="Who it is for"
          title="Built around the whole campus relationship"
          description="The platform is intended to make shared access more predictable for the people on every side of a booking."
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--ivory)]">
                <audience.icon
                  className="h-4 w-4 text-[var(--espresso)]"
                  aria-hidden="true"
                />
              </span>
              <h3 className="mt-3 text-[0.9375rem] font-semibold text-[var(--charcoal)]">
                {audience.title}
              </h3>
              <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                {audience.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="principles-heading"
        className="border-t border-[var(--border-subtle)] bg-[rgba(239,230,217,0.35)] py-[var(--section-y)]"
      >
        <div className="page-shell grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <div>
            <SectionHeading
              id="principles-heading"
              eyebrow="Guiding principles"
              title="Four commitments that shape the product"
            />
            <p className="mt-4 max-w-md text-[0.8125rem] leading-relaxed text-[var(--muted)]">
              These principles are deliberately practical. They guide what a
              listing exposes, how a request is decided, and what the platform
              remembers afterwards.
            </p>
          </div>

          <ol className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {principles.map((principle, index) => (
              <li
                key={principle.title}
                className="grid grid-cols-[2.25rem_1fr] gap-4 py-4"
              >
                <span className="font-mono text-[0.72rem] text-[var(--bronze-deep)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-[0.875rem] font-semibold text-[var(--charcoal)]">
                    {principle.title}
                  </h3>
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                    {principle.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="page-shell py-[var(--section-y)]">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--cream)] px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--charcoal)] sm:text-[1.8rem]">
              Start with what your work needs.
            </h2>
            <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-[var(--muted)]">
              Browse the catalogue, open a listing, and review its requirements
              before you request a slot.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="lg">
              <Link to="/resources">
                Explore resources
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </SiteLayout>
  )
}

export default AboutPage
