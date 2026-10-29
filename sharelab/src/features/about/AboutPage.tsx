import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  ChevronRight as CrumbChevron,
  Compass,
  GraduationCap,
  Microscope,
  Quote,
  Scale,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { Button } from '../../components/ui/button'
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
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[radial-gradient(circle,rgba(198,165,138,0.24),transparent_70%)] blur-3xl"
        />
        <div className="page-shell relative py-10 sm:py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center gap-1.5 text-xs font-medium text-(--muted)">
              <li>
                <Link to="/" className="transition-colors hover:text-(--espresso)">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <CrumbChevron className="h-3.5 w-3.5" />
              </li>
              <li aria-current="page" className="text-(--charcoal)">
                About
              </li>
            </ol>
          </nav>

          <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16">
            <div>
              <span className="eyebrow">About ShareLab</span>
              <h1 className="mt-3 max-w-2xl text-[clamp(2.3rem,5.2vw,3.9rem)] font-semibold leading-[1.01] tracking-[-0.04em] text-(--charcoal)">
                Shared resources should be easy to find — and hard to lose track of.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-(--muted) sm:text-lg">
                ShareLab is a campus resource commons: a single place to discover shared equipment
                and facilities, understand what access requires, and follow a booking from request
                to return.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-(--muted)">
                It is designed for the everyday reality of campus sharing — where a lab, studio, or
                department owns the resource, a manager protects it, and a student or researcher
                needs to use it responsibly.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/resources">
                    Explore resources
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/how-it-works">See how it works</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="overflow-hidden rounded-(--radius-panel) border border-[rgba(255,255,255,0.7)] bg-(--surface-muted) p-2.5 shadow-(--shadow-lg)">
                <div className="relative overflow-hidden rounded-[1.55rem]">
                  <img
                    src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1400&q=80"
                    alt="Glassware and research equipment arranged on a shared laboratory bench"
                    className="h-[320px] w-full object-cover sm:h-[430px] lg:h-[500px]"
                    loading="eager"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(24,17,13,0.58)_100%)]" />
                  <blockquote className="absolute inset-x-4 bottom-4 rounded-2xl border border-[rgba(255,255,255,0.55)] bg-[rgba(255,249,241,0.92)] p-4 backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:p-5">
                    <Quote className="h-4 w-4 text-(--taupe)" aria-hidden="true" />
                    <p className="mt-2 text-sm font-medium leading-relaxed text-(--charcoal)">
                      The goal is not more bookings. It is a clearer, fairer relationship between
                      the people who need a resource and the people who care for it.
                    </p>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="the-problem"
        className="border-y border-(--border-subtle) bg-(--surface-band) py-16 sm:py-20"
      >
        <div className="page-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              id="the-problem"
              eyebrow="The problem"
              title="Campus resources are shared in theory, but fragmented in practice."
              description="The gap is rarely the equipment itself. It is the information around it: what exists, who can use it, what it requires, and what happened last time."
            />
          </div>

          <div className="divide-y divide-(--border-subtle) border-y border-(--border-subtle)">
            {problems.map((problem) => (
              <div key={problem.number} className="grid gap-4 py-6 sm:grid-cols-[3rem_1fr] sm:gap-5">
                <div className="flex items-start gap-3 sm:flex-col sm:gap-2">
                  <span className="font-display text-xs font-bold tracking-[0.16em] text-(--taupe)">
                    {problem.number}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-(--tint-2)">
                    <problem.icon className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-(--charcoal)">{problem.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                    {problem.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="our-approach" className="relative overflow-hidden bg-(--deep-brown) py-16 text-(--cream) sm:py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(214,189,164,0.16),transparent_70%)] blur-3xl"
        />
        <div className="page-shell relative">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[rgba(255,249,241,0.5)]">
                Our approach
              </span>
              <h2 className="mt-3 max-w-lg text-3xl font-semibold tracking-tight text-(--cream) sm:text-4xl">
                Make the rules legible, then make the handover visible.
              </h2>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-[rgba(255,249,241,0.68)]">
                ShareLab does not replace the judgement of the people who own and manage campus
                resources. It gives their rules a clear surface and gives every request a
                traceable path.
              </p>
            </div>

            <div className="grid gap-3">
              {approach.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 rounded-2xl border border-[rgba(255,249,241,0.14)] bg-[rgba(255,249,241,0.06)] p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgba(255,249,241,0.09)]">
                    <item.icon className="h-4 w-4 text-(--cream)" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-(--cream)">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[rgba(255,249,241,0.64)]">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="mt-12 border-t border-[rgba(255,249,241,0.14)] pt-8">
            <p className="max-w-4xl font-display text-xl font-medium leading-snug tracking-[-0.02em] text-[rgba(255,249,241,0.88)] sm:text-2xl lg:text-3xl">
              “A shared resource works best when everyone can see the same rules, the same decision,
              and the same history.”
            </p>
          </blockquote>
        </div>
      </section>

      <section aria-labelledby="who-it-serves" className="page-shell py-16 sm:py-20">
        <SectionHeading
          id="who-it-serves"
          eyebrow="Who it is for"
          title="Built around the whole campus relationship"
          description="The platform is intended to make shared access more predictable for the people on every side of a booking."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {audiences.map((audience) => (
            <div
              key={audience.title}
              className="flex h-full flex-col gap-4 rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-(--surface-sunken) hover:shadow-(--shadow-md)"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--tint-2)">
                <audience.icon className="h-5 w-5 text-(--espresso)" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-(--charcoal)">{audience.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                  {audience.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-(--border-subtle) bg-(--beige-tint-2) px-5 py-4 text-sm text-(--muted) sm:flex-row sm:items-center sm:justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-(--success)" aria-hidden="true" />
            ShareLab is a booking and accountability layer — not a marketplace, and not an
            automatic approval system.
          </span>
          <Link
            to="/how-it-works"
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-(--espresso) transition-colors hover:text-(--espresso-hover)"
          >
            Read the process
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section
        aria-labelledby="principles-heading"
        className="border-t border-(--border-subtle) bg-(--surface-band) py-16 sm:py-20"
      >
        <div className="page-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <SectionHeading
              id="principles-heading"
              eyebrow="Guiding principles"
              title="Four commitments that shape the product"
            />
            <p className="mt-5 max-w-md text-sm leading-relaxed text-(--muted)">
              These principles are deliberately practical. They guide what a listing exposes, how a
              request is decided, and what the platform remembers afterwards.
            </p>
          </div>

          <ol className="divide-y divide-(--border-subtle) border-y border-(--border-subtle)">
            {principles.map((principle, index) => (
              <li key={principle.title} className="grid grid-cols-[2.5rem_1fr] gap-4 py-5">
                <span className="font-display text-sm font-bold tracking-[0.14em] text-(--taupe)">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="text-base font-semibold text-(--charcoal)">
                    {principle.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-(--muted)">
                    {principle.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="page-shell py-16 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-(--radius-panel) border border-(--border-subtle) bg-(--surface) px-6 py-8 shadow-soft sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-(--charcoal) sm:text-3xl">
              Start with what your work needs.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--muted)">
              Browse the catalogue, open a listing, and review its requirements before you request
              a slot.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild size="lg">
              <Link to="/resources">
                Explore resources
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}

export default AboutPage
