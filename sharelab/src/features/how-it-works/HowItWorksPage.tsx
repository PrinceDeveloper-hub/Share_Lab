import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarPlus,
  ClipboardCheck,
  ClipboardList,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Undo2,
  UserCheck,
} from 'lucide-react'
import { SiteLayout } from '../../components/layout/SiteLayout'
import { Button } from '../../components/ui/button'
import { PageHeader } from '../../components/ui/PageHeader'
import { Reveal } from '../../components/ui/Reveal'
import { SectionHeading } from '../../components/ui/SectionHeading'
import { usePageMeta } from '../../hooks/usePageMeta'

const steps = [
  {
    number: '01',
    icon: Search,
    phase: 'Discover',
    title: 'Find a resource that fits the work',
    description:
      'Browse the live catalogue by category or name. Each listing shows its location, description, booking limit, weekly cap, and the rules attached to it.',
    detail:
      'No request is created at this stage — you are only reviewing what is published.',
  },
  {
    number: '02',
    icon: ShieldCheck,
    phase: 'Review requirements',
    title: 'Check eligibility before you ask for a slot',
    description:
      'Some resources require verified training or certification. Review the listed requirements and make sure the credentials on your account are in order before submitting a request.',
    detail:
      'Eligibility is checked again by the server. Required credentials cannot be skipped by submitting a booking.',
  },
  {
    number: '03',
    icon: CalendarPlus,
    phase: 'Request a booking',
    title: 'Choose a time window and explain the purpose',
    description:
      'Pick a start and end time and add the purpose of your booking. The system checks the requested duration, your weekly usage, and whether another approved or checked-in booking already holds that slot.',
    detail:
      'A conflicting request is placed on the waitlist instead of being approved. Booking limits and weekly caps still apply.',
  },
  {
    number: '04',
    icon: ClipboardCheck,
    phase: 'Await a decision',
    title: 'A manager reviews the request',
    description:
      'A new request starts as pending. The resource owner or manager reviews it and records an approve or reject decision with a reason, so the outcome is visible and auditable.',
    detail:
      'Approval is not automatic. If a slot opens, waitlist promotion follows the platform’s ranking and confirmation rules.',
  },
  {
    number: '05',
    icon: KeyRound,
    phase: 'Check in and use',
    title: 'Complete check-in before using the resource',
    description:
      'Check-in is available for an approved booking and includes a condition report. Use the resource within the booked window and follow the rules shown on its listing.',
    detail:
      'Check-in has a defined window around the booking. The condition report becomes part of the resource’s history.',
  },
  {
    number: '06',
    icon: Undo2,
    phase: 'Return and close the loop',
    title: 'Return the resource and record its condition',
    description:
      'When you are finished, complete the return step for the checked-in booking. The return records condition, notes, and lateness so the next person inherits a clear handover.',
    detail:
      'A return condition worse than check-in can raise a system-suggested damage incident. A manager confirms or resolves it.',
  },
]

const safeguards = [
  {
    icon: ShieldCheck,
    title: 'Eligibility is not a formality',
    description:
      'Required training, certification, and account credentials are part of the booking contract. They are verified against the signed-in user, not trusted from the browser.',
  },
  {
    icon: UserCheck,
    title: 'Approval is deliberately human',
    description:
      'Pending requests wait for a manager decision. Approvals and rejections carry a reason, and conflicts move to a ranked waitlist rather than silently overwriting another booking.',
  },
  {
    icon: ClipboardList,
    title: 'Accountability continues after pickup',
    description:
      'Check-in and return condition reports, late flags, incident records, and the append-only audit log keep the full lifecycle traceable.',
  },
]

const faqs = [
  {
    question: 'Does every booking request get approved automatically?',
    answer:
      'No. A request is created as pending and waits for a resource owner or manager decision. Approval depends on eligibility, the requested time window, booking limits, weekly caps, and availability.',
  },
  {
    question: 'What happens if someone else already has my preferred time?',
    answer:
      'The request is placed on the waitlist instead of being approved. If an approved booking is cancelled, the platform can promote the next eligible waitlisted request, subject to its confirmation window.',
  },
  {
    question: 'Can I book longer than the limit shown on a listing?',
    answer:
      'No. Each resource has a maximum duration per booking and a weekly cap. The server checks both before creating the booking, and the usage counted toward the cap includes approved, checked-in, and returned hours.',
  },
  {
    question: 'What do I need before checking in?',
    answer:
      'Check-in is only available for an approved booking, within the check-in window, and it requires a condition report. The resource’s own rules still apply while you use it.',
  },
  {
    question: 'Does “Published” mean the resource is free right now?',
    answer:
      'No. Listing status shows whether the resource is visible in the catalogue. Exact time-slot availability is checked when you submit a request, and a conflict becomes a waitlisted request.',
  },
  {
    question: 'What if a resource comes back late or damaged?',
    answer:
      'Returns are compared with the booking window and the check-in condition. A late return is flagged. If the return condition is worse, the system suggests a damage incident for a manager to confirm and resolve.',
  },
]

export const HowItWorksPage = () => {
  usePageMeta({
    title: 'How It Works — ShareLab',
    description:
      'Follow the ShareLab process from resource discovery and eligibility checks through booking requests, approval, check-in, use, and return.',
  })

  return (
    <SiteLayout>
      <div className="border-b border-[var(--border-subtle)]">
        <div className="page-shell py-8 sm:py-10 lg:py-12">
          <PageHeader
            breadcrumbs={[
              { label: 'Home', to: '/' },
              { label: 'How it works' },
            ]}
            eyebrow="The ShareLab process"
            title="From first search to a clean return."
            description="ShareLab is built around a six-step resource lifecycle. Every step has a visible owner, a clear checkpoint, and a reason — so access stays fair and the handover stays accountable."
            actions={
              <Button asChild size="lg">
                <Link to="/resources">
                  Browse the catalogue
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            }
            meta={
              <ol className="mt-7 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--border-subtle)] sm:grid-cols-2 lg:grid-cols-3">
                {steps.map((step) => (
                  <li
                    key={step.number}
                    className="flex items-center gap-3 bg-[var(--cream)] px-4 py-3"
                  >
                    <span className="font-mono text-[0.7rem] text-[var(--bronze-deep)]">
                      {step.number}
                    </span>
                    <step.icon
                      className="h-4 w-4 text-[var(--espresso)]"
                      aria-hidden="true"
                    />
                    <span className="text-[0.78rem] font-medium text-[var(--charcoal)]">
                      {step.phase}
                    </span>
                  </li>
                ))}
              </ol>
            }
          />
        </div>
      </div>

      <section
        aria-labelledby="workflow-heading"
        className="section page-shell"
      >
        <SectionHeading
          id="workflow-heading"
          eyebrow="Step by step"
          title="The full resource lifecycle"
          description="Read this as the contract between the person requesting a resource and the people responsible for it."
        />

        <ol className="mt-9 space-y-4">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6"
            >
              <div className="relative flex justify-start">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--cream)] font-mono text-[0.75rem] font-medium text-[var(--espresso)]">
                  {step.number}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px bg-[var(--border-subtle)]"
                  />
                ) : null}
              </div>

              <div className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-[0.375rem] bg-[rgba(81,53,34,0.06)]">
                    <step.icon
                      className="h-3.5 w-3.5 text-[var(--espresso)]"
                      aria-hidden="true"
                    />
                  </span>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {step.phase}
                  </span>
                </div>
                <h3 className="mt-2.5 font-display text-[1.0625rem] font-semibold text-[var(--charcoal)]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)] sm:text-[0.875rem]">
                  {step.description}
                </p>
                <p className="mt-3 rounded-[0.375rem] bg-[rgba(239,230,217,0.45)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="safeguards-heading"
        className="border-y border-[var(--border-subtle)] bg-[rgba(239,230,217,0.45)] py-[var(--section-y)]"
      >
        <div className="page-shell">
          <SectionHeading
            id="safeguards-heading"
            eyebrow="Important notes"
            title="What the process protects"
            description="These are the safeguards that make a shared resource trustworthy — for the person using it and the team responsible for it."
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {safeguards.map((item) => (
              <div
                key={item.title}
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[0.45rem] border border-[var(--border-subtle)] bg-[var(--ivory)]">
                  <item.icon
                    className="h-4 w-4 text-[var(--espresso)]"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="mt-3 text-[0.9375rem] font-semibold text-[var(--charcoal)]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-[var(--radius-md)] border border-[rgba(156,107,36,0.22)] bg-[rgba(248,240,225,0.6)] px-4 py-3 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            <strong className="font-semibold text-[var(--charcoal)]">
              A note on availability:
            </strong>{' '}
            a listing’s “Published” status means it is visible — it does not
            guarantee an open slot. The server evaluates conflicts, eligibility,
            duration, and weekly caps when a request is submitted.
          </p>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="section page-shell">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14">
          <div>
            <SectionHeading
              id="faq-heading"
              eyebrow="Questions"
              title="Answers to the practical ones"
              description="Based on the behaviour implemented in the ShareLab booking flow."
            />
            <Button asChild variant="secondary" className="mt-5">
              <Link to="/resources">Open the catalogue</Link>
            </Button>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {faqs.map((faq) => (
              <details key={faq.question} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
                  <span className="text-[0.875rem] font-medium text-[var(--charcoal)]">
                    {faq.question}
                  </span>
                  <Plus
                    className="h-4 w-4 shrink-0 text-[var(--bronze-deep)] transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pb-4 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Reveal className="page-shell pb-[var(--section-y)]">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--radius-xl)] bg-[var(--deep-brown)] px-6 py-9 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--cream)] sm:text-[1.9rem]">
              Ready to start with a real listing?
            </h2>
            <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-[rgba(248,245,239,0.64)]">
              Search the catalogue, review the requirements, and submit a
              request for a time that works for you.
            </p>
          </div>
          <Button asChild variant="inverse" size="lg" className="shrink-0">
            <Link to="/resources">
              Explore resources
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </Reveal>
    </SiteLayout>
  )
}

export default HowItWorksPage
