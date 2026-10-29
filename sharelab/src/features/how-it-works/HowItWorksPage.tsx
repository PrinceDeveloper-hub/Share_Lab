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
<<<<<<< HEAD
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
=======
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

            <div className="relative overflow-hidden rounded-(--radius-panel) border border-(--border-subtle) bg-(--cream) p-6 shadow-(--shadow-md) sm:p-8">
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
              <div className="relative flex justify-start">
                <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--cream)] font-mono text-[0.75rem] font-medium text-[var(--espresso)]">
=======
              <div className="relative flex justify-center">
                <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(81,53,34,0.16)] bg-(--cream) font-display text-sm font-bold text-(--espresso) shadow-(--shadow-xs) sm:h-14 sm:w-14 sm:text-base">
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                  {step.number}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden="true"
<<<<<<< HEAD
                    className="absolute left-5 top-10 h-[calc(100%-1.5rem)] w-px bg-[var(--border-subtle)]"
=======
                    className="absolute -bottom-4 top-11 w-px bg-[rgba(81,53,34,0.18)] sm:-bottom-6 sm:top-14"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                  />
                ) : null}
              </div>

<<<<<<< HEAD
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
=======
              <div className="rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-5 shadow-(--shadow-xs) sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(81,53,34,0.075)]">
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
                  {step.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
<<<<<<< HEAD
        aria-labelledby="safeguards-heading"
        className="border-y border-[var(--border-subtle)] bg-[rgba(239,230,217,0.45)] py-[var(--section-y)]"
=======
        aria-labelledby="important-notes"
        className="border-y border-(--border-subtle) bg-[rgba(255,249,241,0.62)] py-16 sm:py-20"
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
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
=======
                key={note.title}
                className="flex h-full flex-col gap-4 rounded-(--radius-lg) border border-(--border-subtle) bg-(--cream) p-6"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(81,53,34,0.075)]">
                  <note.icon className="h-5 w-5 text-(--espresso)" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-(--charcoal)">{note.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-(--muted)">
                    {note.description}
                  </p>
                </div>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
              </div>
            ))}
          </div>

<<<<<<< HEAD
          <p className="mt-5 rounded-[var(--radius-md)] border border-[rgba(156,107,36,0.22)] bg-[rgba(248,240,225,0.6)] px-4 py-3 text-[0.8125rem] leading-relaxed text-[var(--muted)]">
            <strong className="font-semibold text-[var(--charcoal)]">
              A note on availability:
            </strong>{' '}
            a listing’s “Published” status means it is visible — it does not
            guarantee an open slot. The server evaluates conflicts, eligibility,
            duration, and weekly caps when a request is submitted.
          </p>
=======
          <div className="mt-5 rounded-(--radius-lg) border border-[rgba(154,107,34,0.22)] bg-[rgba(154,107,34,0.06)] p-5 text-sm leading-relaxed text-(--muted)">
            <strong className="font-semibold text-(--charcoal)">A note on availability:</strong>{' '}
            a listing’s “Active” status means it is published — it does not guarantee an open slot.
            The server evaluates conflicts, eligibility, duration, and weekly caps when a request is
            submitted.
          </div>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
<<<<<<< HEAD
=======
            <p className="mt-6 text-sm leading-relaxed text-(--muted)">
              Still deciding whether a resource fits? Start with its catalogue listing — the rules
              and limits are shown before you request a time.
            </p>
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
            <Button asChild variant="secondary" className="mt-5">
              <Link to="/resources">Open the catalogue</Link>
            </Button>
          </div>

          <div className="divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {faqs.map((faq) => (
<<<<<<< HEAD
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
=======
              <details
                key={faq.question}
                className="group rounded-2xl border border-(--border-subtle) bg-(--surface) open:bg-(--cream)"
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
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
              </details>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <Reveal className="page-shell pb-[var(--section-y)]">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--radius-xl)] bg-[var(--deep-brown)] px-6 py-9 sm:flex-row sm:items-center sm:px-10">
          <div>
            <h2 className="font-display text-[1.5rem] font-semibold tracking-[-0.02em] text-[var(--cream)] sm:text-[1.9rem]">
              Ready to start with a real listing?
            </h2>
            <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-[rgba(248,245,239,0.64)]">
              Search the catalogue, review the requirements, and submit a
              request for a time that works for you.
=======
      <section className="page-shell pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-(--radius-panel) border border-(--border-subtle) bg-[rgba(233,217,198,0.34)] px-6 py-8 sm:flex-row sm:items-center sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-(--charcoal) sm:text-3xl">
              Ready to start with a real listing?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-(--muted)">
              Search the catalogue, review the requirements, and submit a request for a time that
              works for you.
>>>>>>> 43b1f52d824350fc2b0aec2318922a7c11a585ec
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
