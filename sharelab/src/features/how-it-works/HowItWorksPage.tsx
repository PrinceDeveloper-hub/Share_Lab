import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  ChevronRight as CrumbChevron,
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
    detail: 'No request is created at this stage — you are only reviewing what is published.',
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

const notes = [
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
    question: 'Does “Active” mean the resource is free right now?',
    answer:
      'No. Listing status shows whether the resource is published in the catalogue. Exact time-slot availability is checked when you submit a request, and a conflict becomes a waitlisted request.',
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
      <section className="relative overflow-hidden border-b border-(--border-subtle) bg-[rgba(255,252,247,0.46)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-40 -top-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(198,165,138,0.22),transparent_70%)] blur-3xl"
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
                How It Works
              </li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16">
            <div>
              <span className="eyebrow">The ShareLab process</span>
              <h1 className="mt-3 max-w-2xl text-[clamp(2.3rem,5vw,3.8rem)] font-semibold leading-[1.02] tracking-[-0.038em] text-(--charcoal)">
                From first search to a clean return.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-(--muted) sm:text-lg">
                ShareLab is built around a six-step resource lifecycle. Every step has a visible
                owner, a clear checkpoint, and a reason — so access stays fair and the handover
                stays accountable.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Button asChild size="lg">
                  <Link to="/resources">
                    Browse the catalogue
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <span className="text-sm text-(--muted)">
                  Requirements are verified, not assumed.
                </span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-(--border-subtle) bg-(--cream) p-6 shadow-(--shadow-md) sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-(--muted)">
                    Process at a glance
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-(--charcoal)">
                    Six checkpoints
                  </p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--espresso) text-(--cream)">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>

              <ol className="mt-6 space-y-3">
                {steps.map((step) => (
                  <li
                    key={step.number}
                    className="flex items-center gap-3 border-b border-(--border-subtle) pb-3 last:border-0 last:pb-0"
                  >
                    <span className="font-display text-xs font-bold tracking-[0.14em] text-(--taupe)">
                      {step.number}
                    </span>
                    <step.icon className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                    <span className="text-sm font-medium text-(--charcoal)">{step.phase}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-heading" className="page-shell py-16 sm:py-20">
        <SectionHeading
          id="workflow-heading"
          eyebrow="Step by step"
          title="The full resource lifecycle"
          description="Read this as the contract between the person requesting a resource and the people responsible for it."
        />

        <ol className="mt-10 space-y-4 sm:space-y-6">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 sm:grid-cols-[4rem_minmax(0,1fr)] sm:gap-6"
            >
              <div className="relative flex justify-center">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(75,47,31,0.16)] bg-(--cream) font-display text-sm font-bold text-(--espresso) shadow-(--shadow-xs) sm:h-14 sm:w-14 sm:text-base">
                  {step.number}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-4 top-11 w-px bg-[rgba(82,59,45,0.18)] sm:-bottom-6 sm:top-14"
                  />
                ) : null}
              </div>

              <div className="rounded-[1.35rem] border border-(--border-subtle) bg-[rgba(255,252,247,0.66)] p-5 shadow-(--shadow-xs) sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(75,47,31,0.075)]">
                    <step.icon className="h-4 w-4 text-(--espresso)" aria-hidden="true" />
                  </span>
                  <span className="text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-(--muted)">
                    {step.phase}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-(--charcoal) sm:text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-(--muted) sm:text-base">
                  {step.description}
                </p>
                <p className="mt-3 rounded-xl bg-[rgba(233,217,198,0.32)] px-3.5 py-2.5 text-xs leading-relaxed text-(--muted) sm:text-sm">
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="important-notes"
        className="border-y border-(--border-subtle) bg-[rgba(255,249,241,0.62)] py-16 sm:py-20"
      >
        <div className="page-shell">
          <SectionHeading
            id="important-notes"
            eyebrow="Important notes"
            title="What the process protects"
            description="These are the safeguards that make a shared resource trustworthy — for the person using it and the team responsible for it."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {notes.map((note) => (
              <div
                key={note.title}
                className="flex h-full flex-col gap-4 rounded-[1.35rem] border border-(--border-subtle) bg-(--cream) p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(75,47,31,0.075)]">
                  <note.icon className="h-5 w-5 text-(--espresso)" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-(--charcoal)">{note.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    {note.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-[rgba(183,121,50,0.22)] bg-[rgba(183,121,50,0.06)] p-5 text-sm leading-relaxed text-(--muted)">
            <strong className="font-semibold text-(--charcoal)">A note on availability:</strong>{' '}
            a listing’s “Active” status means it is published — it does not guarantee an open slot.
            The server evaluates conflicts, eligibility, duration, and weekly caps when a request is
            submitted.
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="page-shell py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <SectionHeading
              id="faq-heading"
              eyebrow="Questions"
              title="Answers to the practical ones"
              description="Based on the behaviour implemented in the ShareLab booking flow."
            />
            <p className="mt-6 text-sm leading-relaxed text-(--muted)">
              Still deciding whether a resource fits? Start with its catalogue listing — the rules
              and limits are shown before you request a time.
            </p>
            <Button asChild variant="secondary" className="mt-5">
              <Link to="/resources">Open the catalogue</Link>
            </Button>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-(--border-subtle) bg-[rgba(255,252,247,0.66)] open:bg-(--cream)"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 [&::-webkit-details-marker]:hidden">
                  <span className="text-sm font-semibold text-(--charcoal) sm:text-base">
                    {faq.question}
                  </span>
                  <Plus
                    className="h-4 w-4 shrink-0 text-(--espresso) transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  />
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed text-(--muted)">{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[2rem] border border-(--border-subtle) bg-[rgba(233,217,198,0.34)] px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-(--charcoal) sm:text-3xl">
              Ready to start with a real listing?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--muted)">
              Search the catalogue, review the requirements, and submit a request for a time that
              works for you.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/resources">
              Explore resources
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  )
}

export default HowItWorksPage
