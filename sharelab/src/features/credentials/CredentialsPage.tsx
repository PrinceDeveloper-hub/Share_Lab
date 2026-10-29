import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  BadgeCheck,
  Clock3,
  Download,
  FileCheck2,
  FilePlus2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  EmptyState,
  ErrorNotice,
  Field,
  InlineLoader,
  LoadingRows,
  Modal,
  PageHeader,
  SectionCard,
  Tabs,
  selectClass,
  textareaClass,
} from '../../components/ui/workspace'
import { useAuth } from '../../hooks/useAuth'
import {
  useCredentialQueue,
  useMyCredentials,
  useReviewCredential,
  useSubmitCredential,
} from '../../hooks/useCredentials'
import { useResources } from '../../hooks/useResources'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Credential } from '../../lib/credentials'
import { cn } from '../../lib/utils'

const submitSchema = z.object({
  requirement_name: z.string().min(1, 'Choose a requirement.'),
  file: z
    .custom<FileList>((value) => typeof FileList !== 'undefined' && value instanceof FileList, {
      message: 'Choose a certificate file.',
    })
    .refine((files) => files.length > 0, 'Choose a certificate file.')
    .refine((files) => files[0].size <= 5 * 1024 * 1024, 'The file must be 5 MB or smaller.'),
})

type SubmitValues = z.infer<typeof submitSchema>

const reviewSchema = z.object({
  decision: z.enum(['verify', 'reject']),
  note: z
    .string()
    .trim()
    .min(3, 'Write a short reason so the student understands the decision.')
    .max(2000),
})

type ReviewValues = z.infer<typeof reviewSchema>

const statusTone = {
  pending: 'bg-(--warning-tint) text-(--warning)',
  verified: 'bg-(--success-tint) text-(--success)',
  rejected: 'bg-(--error-tint) text-(--error)',
} as const

const CredentialStatusPill = ({ status }: { status: Credential['status'] }) => (
  <span className={cn('inline-flex rounded-full px-2.5 py-1 text-[0.66rem] font-semibold', statusTone[status])}>
    {status === 'pending' ? 'Pending review' : status === 'verified' ? 'Verified' : 'Rejected'}
  </span>
)

const requirementStatusCopy = (credential: Credential | undefined) => {
  if (!credential) return 'Not submitted'
  if (credential.status === 'verified') return 'Verified — requirement met'
  if (credential.status === 'pending') return 'Submitted — waiting for review'
  return `Rejected — ${credential.review_note ?? 'see the review note'}`
}

export interface CredentialsPageProps {
  initialTab?: 'mine' | 'review'
}

export const CredentialsPage = ({ initialTab = 'mine' }: CredentialsPageProps) => {
  const { user } = useAuth()
  const isReviewer = user?.role === 'manager' || user?.role === 'owner'
  const [tab, setTab] = useState<'mine' | 'review'>(isReviewer ? initialTab : 'mine')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [reviewing, setReviewing] = useState<Credential | null>(null)

  const credentialsQuery = useMyCredentials()
  const resourcesQuery = useResources({ perPage: 100 })
  const queueScope = user?.role === 'manager' ? 'manager' : 'owner'
  const queueQuery = useCredentialQueue(queueScope)
  const submitMutation = useSubmitCredential()
  const reviewMutation = useReviewCredential()

  const credentials = credentialsQuery.data?.data ?? []
  const credentialsByRequirement = useMemo(
    () => new Map(credentials.map((credential) => [credential.requirement_name, credential])),
    [credentials],
  )

  const requirements = useMemo(() => {
    const map = new Map<string, { name: string; resources: string[]; verification: boolean }>()
    for (const resource of resourcesQuery.data?.data ?? []) {
      for (const requirement of resource.requirements ?? []) {
        const current = map.get(requirement.name)
        if (current) {
          current.resources.push(resource.name)
          current.verification = current.verification || requirement.requires_verification
        } else {
          map.set(requirement.name, {
            name: requirement.name,
            resources: [resource.name],
            verification: requirement.requires_verification,
          })
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [resourcesQuery.data])

  const submitForm = useForm<SubmitValues>({
    resolver: zodResolver(submitSchema),
    defaultValues: { requirement_name: '', file: undefined },
  })

  const reviewForm = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { decision: 'verify', note: '' },
  })

  const openSubmit = (requirementName?: string) => {
    submitMutation.reset()
    submitForm.reset({ requirement_name: requirementName ?? '', file: undefined })
    setSubmitOpen(true)
  }

  const openReview = (credential: Credential) => {
    reviewMutation.reset()
    reviewForm.reset({ decision: 'verify', note: '' })
    setReviewing(credential)
  }

  const onSubmit = submitForm.handleSubmit((values) => {
    const file = values.file[0]
    submitMutation.mutate(
      { requirementName: values.requirement_name, file },
      {
        onSuccess: () => {
          setSubmitOpen(false)
          submitForm.reset({ requirement_name: '', file: undefined })
        },
      },
    )
  })

  const onReview = reviewForm.handleSubmit((values) => {
    if (!reviewing) return
    reviewMutation.mutate(
      {
        credentialId: reviewing.id,
        decision: values.decision,
        note: values.note.trim(),
      },
      {
        onSuccess: () => {
          setReviewing(null)
          reviewForm.reset({ decision: 'verify', note: '' })
        },
      },
    )
  })

  const queue = queueQuery.data?.data ?? []

  return (
    <div>
      <PageHeader
        eyebrow="Credentials and eligibility"
        title="Your lab credentials"
        description="Submit evidence for the requirements attached to shared resources. A manager or resource owner reviews every submission and records a reason."
        actions={
          <Button onClick={() => openSubmit()}>
            <FilePlus2 className="h-4 w-4" aria-hidden="true" />
            Submit credential
          </Button>
        }
      />

      {isReviewer ? (
        <div className="mt-7">
          <Tabs
            label="Credential views"
            value={tab}
            onChange={setTab}
            tabs={[
              { value: 'mine', label: 'My credentials', count: credentials.length },
              { value: 'review', label: 'Review queue', count: queue.length },
            ]}
          />
        </div>
      ) : null}

      {tab === 'mine' || !isReviewer ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
          <section className="space-y-5">
            <SectionCard>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-[1.5rem] font-semibold text-(--charcoal)">
                    Requirements in the catalogue
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-(--muted)">
                    A requirement appears here when at least one resource asks for it. Verified
                    requirements satisfy every resource that lists them.
                  </p>
                </div>
                <ShieldCheck className="h-5 w-5 shrink-0 text-(--espresso)" aria-hidden="true" />
              </div>

              {resourcesQuery.isLoading ? (
                <div className="mt-5">
                  <LoadingRows rows={3} label="Loading requirements" />
                </div>
              ) : resourcesQuery.isError ? (
                <div className="mt-5">
                  <ErrorNotice
                    title="Requirements could not be loaded"
                    message="The resource catalogue did not respond. Refresh the page to try again."
                    onRetry={() => void resourcesQuery.refetch()}
                  />
                </div>
              ) : requirements.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    icon={ShieldCheck}
                    title="No credentials are required right now"
                    description="No resource in the catalogue currently lists a verification requirement."
                  />
                </div>
              ) : (
                <ul className="mt-5 divide-y divide-(--border-subtle)">
                  {requirements.map((requirement) => {
                    const credential = credentialsByRequirement.get(requirement.name)
                    const canSubmit = !credential || credential.status === 'rejected'

                    return (
                      <li key={requirement.name} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-(--charcoal)">
                              {requirement.name}
                            </h3>
                            {credential ? <CredentialStatusPill status={credential.status} /> : null}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-(--muted)">
                            {requirementStatusCopy(credential)}
                          </p>
                          <p className="mt-1 text-[0.7rem] text-(--muted)">
                            Used by {requirement.resources.slice(0, 3).join(', ')}
                            {requirement.resources.length > 3 ? ` +${requirement.resources.length - 3} more` : ''}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          {credential?.file_url ? (
                            <Button asChild variant="ghost" size="sm">
                              <a href={credential.file_url} target="_blank" rel="noreferrer">
                                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                                File
                              </a>
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant={canSubmit ? 'secondary' : 'ghost'}
                            disabled={!canSubmit}
                            onClick={() => openSubmit(requirement.name)}
                          >
                            {credential?.status === 'verified'
                              ? 'Verified'
                              : credential?.status === 'pending'
                                ? 'In review'
                                : 'Submit evidence'}
                          </Button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </SectionCard>

            <SectionCard>
              <h2 className="font-display text-[1.5rem] font-semibold text-(--charcoal)">
                Your submissions
              </h2>
              <p className="mt-1 text-sm text-(--muted)">
                Every submission, decision, and review note stays on your account.
              </p>

              {credentialsQuery.isLoading ? (
                <div className="mt-5">
                  <LoadingRows rows={2} label="Loading credentials" />
                </div>
              ) : credentialsQuery.isError ? (
                <div className="mt-5">
                  <ErrorNotice
                    title="Your credentials could not be loaded"
                    message="Refresh the page to try again."
                    onRetry={() => void credentialsQuery.refetch()}
                  />
                </div>
              ) : credentials.length === 0 ? (
                <div className="mt-5">
                  <EmptyState
                    icon={FileCheck2}
                    title="No submissions yet"
                    description="Choose a requirement above to upload your first piece of evidence."
                  />
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {credentials.map((credential) => (
                    <li
                      key={credential.id}
                      className="rounded-2xl border border-(--border-subtle) bg-(--surface) p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-(--charcoal)">
                            {credential.requirement_name}
                          </p>
                          <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-(--muted)">
                            <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                            Submitted {new Date(credential.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <CredentialStatusPill status={credential.status} />
                      </div>
                      {credential.review_note ? (
                        <p className="mt-3 rounded-xl bg-(--tint-1) px-3 py-2 text-xs leading-relaxed text-(--muted)">
                          <span className="font-semibold text-(--charcoal)">Review note:</span>{' '}
                          {credential.review_note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </section>

          <aside className="space-y-5">
            <SectionCard>
              <h2 className="text-sm font-semibold text-(--charcoal)">How review works</h2>
              <ol className="mt-3 space-y-3 text-sm leading-relaxed text-(--muted)">
                <li className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--tint-2) text-[0.68rem] font-bold text-(--espresso)">1</span>
                  Attach a certificate, card, or signed evidence file.
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--tint-2) text-[0.68rem] font-bold text-(--espresso)">2</span>
                  A manager for an assigned resource, or its owner, reviews the file.
                </li>
                <li className="flex gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--tint-2) text-[0.68rem] font-bold text-(--espresso)">3</span>
                  Verification unlocks eligibility. Rejections always include a reason.
                </li>
              </ol>
            </SectionCard>
            <div className="rounded-(--radius-md) border border-(--warning-tint) bg-(--warning-tint-soft) p-4 text-xs leading-relaxed text-(--muted)">
              <p className="font-semibold text-(--warning)">Privacy</p>
              <p className="mt-1">
                Uploaded files are stored privately. Download links are short-lived and signed, so
                they are not part of the public catalogue.
              </p>
            </div>
          </aside>
        </div>
      ) : (
        <SectionCard className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-[1.55rem] font-semibold text-(--charcoal)">
                Credential review queue
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-(--muted)">
                Only submissions tied to a requirement on a resource you manage appear here.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => void queueQuery.refetch()}>
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              Refresh
            </Button>
          </div>

          {queueQuery.isLoading ? (
            <div className="mt-5">
              <LoadingRows rows={3} label="Loading review queue" />
            </div>
          ) : queueQuery.isError ? (
            <div className="mt-5">
              <ErrorNotice
                title="The review queue could not be loaded"
                message="Check your connection and try again."
                onRetry={() => void queueQuery.refetch()}
              />
            </div>
          ) : queue.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                icon={BadgeCheck}
                title="The queue is clear"
                description="There are no pending credential submissions for your resources."
              />
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {queue.map((credential) => (
                <li
                  key={credential.id}
                  className="rounded-2xl border border-(--border-subtle) bg-(--surface) p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-(--charcoal)">
                          {credential.requirement_name}
                        </p>
                        <CredentialStatusPill status={credential.status} />
                      </div>
                      <p className="mt-1 text-xs text-(--muted)">
                        {credential.user?.name ?? `Student #${credential.user_id}`}
                        {credential.user?.email ? ` · ${credential.user.email}` : ''}
                      </p>
                      <p className="mt-1 text-[0.7rem] text-(--muted)">
                        Submitted {new Date(credential.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {credential.file_url ? (
                        <Button asChild variant="secondary" size="sm">
                          <a href={credential.file_url} target="_blank" rel="noreferrer">
                            <Download className="h-3.5 w-3.5" aria-hidden="true" />
                            Open file
                          </a>
                        </Button>
                      ) : null}
                      <Button size="sm" onClick={() => openReview(credential)}>
                        Review
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}

      <Modal
        open={submitOpen}
        title="Submit credential evidence"
        description="The file is stored privately. Only reviewers for the relevant resource can open it."
        onClose={() => setSubmitOpen(false)}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="Requirement"
            htmlFor="credential-requirement"
            error={submitForm.formState.errors.requirement_name?.message}
          >
            <select
              id="credential-requirement"
              className={selectClass}
              {...submitForm.register('requirement_name')}
            >
              <option value="">Choose a requirement</option>
              {requirements.map((requirement) => (
                <option key={requirement.name} value={requirement.name}>
                  {requirement.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Evidence file"
            htmlFor="credential-file"
            hint="PDF, JPG, PNG, or WEBP. Maximum 5 MB."
            error={submitForm.formState.errors.file?.message}
          >
            <input
              id="credential-file"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              className="block w-full cursor-pointer rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2.5 text-sm text-(--muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--espresso) file:px-4 file:py-2 file:text-sm file:font-semibold file:text-(--accent-contrast)"
              {...submitForm.register('file')}
            />
          </Field>

          {submitMutation.isError ? (
            <ErrorNotice
              title="Submission failed"
              message={getApiErrorMessage(
                submitMutation.error,
                'The credential could not be uploaded.',
              )}
            />
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setSubmitOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? (
                <InlineLoader label="Uploading" />
              ) : (
                <>
                  <FilePlus2 className="h-4 w-4" aria-hidden="true" />
                  Submit for review
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={reviewing !== null}
        title={reviewing ? `Review ${reviewing.requirement_name}` : 'Review credential'}
        description="Every decision is recorded on the student's account and triggers a notification."
        onClose={() => setReviewing(null)}
      >
        <form onSubmit={onReview} className="space-y-4">
          <Field label="Decision" htmlFor="credential-decision">
            <select
              id="credential-decision"
              className={selectClass}
              {...reviewForm.register('decision')}
            >
              <option value="verify">Verify — requirement met</option>
              <option value="reject">Reject — evidence is insufficient</option>
            </select>
          </Field>

          <Field
            label="Reason"
            htmlFor="credential-note"
            hint="This note is shown to the student and stored in the audit trail."
            error={reviewForm.formState.errors.note?.message}
          >
            <textarea
              id="credential-note"
              rows={4}
              className={textareaClass}
              placeholder="Explain what you checked and why the evidence is sufficient or not."
              {...reviewForm.register('note')}
            />
          </Field>

          {reviewMutation.isError ? (
            <ErrorNotice
              title="The review could not be saved"
              message={getApiErrorMessage(reviewMutation.error, 'Try again.')}
            />
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setReviewing(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? (
                <InlineLoader label="Saving" />
              ) : (
                <>
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  Record review
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CredentialsPage
