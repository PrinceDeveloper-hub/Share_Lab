import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { AlertTriangle, FileUp, Lock, ShieldCheck, X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { CredentialBadge } from '../../components/credentials/CredentialBadge'
import { CredentialQueue } from '../../components/credentials/CredentialQueue'
import { EmptyState } from '../../components/ui/EmptyState'
import { Field, Input } from '../../components/ui/Field'
import { FormAlert } from '../../components/auth/FormAlert'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import {
  useCredentialsQuery,
  useSubmitCredential,
} from '../../hooks/useWorkspace'
import { getApiErrorMessage } from '../../lib/api-client'
import { formatDateTime } from '../../lib/format'

const ACCEPTED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]
const MAX_BYTES = 5 * 1024 * 1024

const statusNotes = [
  {
    label: 'Pending review',
    text: 'Submitted and waiting for a manager or administrator to check the document.',
  },
  {
    label: 'Verified',
    text: 'Confirmed by a reviewer. The credential now counts toward eligibility where it is required.',
  },
  {
    label: 'Rejected',
    text: 'Not accepted. The review note explains what needs to be corrected before resubmitting.',
  },
]

export const Credentials = () => {
  usePageMeta({
    title: 'Credentials — ShareLab',
    description:
      'Submit training and certification documents and follow their verification status.',
  })

  const { user } = useAuth()
  const credentialsQuery = useCredentialsQuery()
  const submitMutation = useSubmitCredential()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [requirementName, setRequirementName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  if (!user) return null

  const isReviewer = user.role === 'manager' || user.role === 'admin'
  const credentials = credentialsQuery.data?.items ?? []

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const trimmed = requirementName.trim()

    if (!trimmed) {
      setError(
        'Enter the requirement name exactly as it appears on the resource.',
      )
      return
    }

    if (!file) {
      setError('Attach a supporting document.')
      return
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Upload a PDF, JPG, PNG, or WebP file.')
      return
    }

    if (file.size > MAX_BYTES) {
      setError('The file must be 5 MB or smaller.')
      return
    }

    try {
      await submitMutation.mutateAsync({ requirementName: trimmed, file })
      setRequirementName('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccess('Credential submitted. It is now pending review.')
    } catch (submitError) {
      setError(
        getApiErrorMessage(
          submitError,
          'The credential could not be submitted.',
        ),
      )
    }
  }

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'Credentials' },
        ]}
        eyebrow={isReviewer ? 'Verification' : 'Eligibility'}
        title={isReviewer ? 'Credential review' : 'Your credentials'}
        description={
          isReviewer
            ? 'Submissions waiting for a decision. Verified credentials unlock the resources that require them.'
            : 'Some resources require verified training or certification. Submit the document here and track its review.'
        }
        actions={
          <Button asChild variant="secondary">
            <Link to="/resources">Browse resources</Link>
          </Button>
        }
      />

      {isReviewer ? (
        <div className="mt-7">
          {credentialsQuery.isLoading ? (
            <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : credentialsQuery.isError ? (
            <EmptyState
              icon={AlertTriangle}
              tone="error"
              title="Credentials could not be loaded"
              description="The API did not respond. Nothing has been changed."
              action={
                <Button
                  variant="secondary"
                  onClick={() => void credentialsQuery.refetch()}
                >
                  Try again
                </Button>
              }
            />
          ) : (
            <CredentialQueue
              credentials={credentials}
              emptyTitle="No credentials are waiting for review"
              emptyDescription="Pending submissions for the resources you manage will appear here."
            />
          )}
        </div>
      ) : (
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-start">
          <section aria-labelledby="credential-list">
            <h2
              id="credential-list"
              className="text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              Submissions
            </h2>

            <div className="mt-3">
              {credentialsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton
                      key={index}
                      className="h-24 w-full rounded-[var(--radius-lg)]"
                    />
                  ))}
                </div>
              ) : credentialsQuery.isError ? (
                <EmptyState
                  icon={AlertTriangle}
                  tone="error"
                  title="Your credentials could not be loaded"
                  description="The API did not respond. Try again in a moment."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => void credentialsQuery.refetch()}
                    >
                      Try again
                    </Button>
                  }
                />
              ) : credentials.length === 0 ? (
                <EmptyState
                  icon={ShieldCheck}
                  title="No credentials submitted"
                  description="If a resource requires training, its listing names the requirement. Submit the supporting document to start the review."
                />
              ) : (
                <ul className="space-y-2.5">
                  {credentials.map((credential) => (
                    <li
                      key={credential.id}
                      className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="text-[0.875rem] font-semibold text-[var(--charcoal)]">
                          {credential.requirement_name}
                        </h3>
                        <CredentialBadge status={credential.status} />
                      </div>
                      <p className="mt-1.5 font-mono text-[0.68rem] text-[var(--muted)]">
                        {credential.created_at
                          ? `Submitted ${formatDateTime(credential.created_at)}`
                          : 'Submitted'}
                      </p>
                      {credential.review_note ? (
                        <p className="mt-2.5 rounded-[0.375rem] bg-[rgba(239,230,217,0.45)] px-2.5 py-1.5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
                          {credential.review_note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-5 divide-y divide-[var(--border-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.32)] px-4 py-1">
              {statusNotes.map((note) => (
                <div key={note.label} className="py-3">
                  <p className="text-[0.72rem] font-semibold text-[var(--charcoal)]">
                    {note.label}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section
            aria-labelledby="submit-credential"
            className="rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-5 lg:sticky lg:top-24"
          >
            <h2
              id="submit-credential"
              className="flex items-center gap-2 text-[0.9375rem] font-semibold text-[var(--charcoal)]"
            >
              <FileUp
                className="h-4 w-4 text-[var(--bronze-deep)]"
                aria-hidden="true"
              />
              Submit a credential
            </h2>
            <p className="mt-1 text-[0.75rem] leading-relaxed text-[var(--muted)]">
              Use the requirement name exactly as it appears on the resource
              listing.
            </p>

            {success ? (
              <FormAlert className="mt-4" variant="success">
                <div className="flex items-start justify-between gap-3">
                  <span>{success}</span>
                  <button
                    type="button"
                    onClick={() => setSuccess(null)}
                    aria-label="Dismiss message"
                    className="shrink-0 opacity-70 hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </FormAlert>
            ) : null}

            <form className="mt-4 space-y-4" onSubmit={handleSubmit} noValidate>
              <Field
                id="credential-requirement"
                label="Requirement name"
                hint="For example: 3D Printer Training"
                required
              >
                <Input
                  id="credential-requirement"
                  value={requirementName}
                  onChange={(event) => {
                    setRequirementName(event.target.value)
                    setError(null)
                  }}
                  placeholder="Requirement as listed"
                  disabled={submitMutation.isPending}
                />
              </Field>

              <div>
                <span className="block text-[0.8125rem] font-semibold text-[var(--charcoal)]">
                  Supporting document
                </span>
                <input
                  ref={fileInputRef}
                  id="credential-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={(event) => {
                    setFile(event.target.files?.[0] ?? null)
                    setError(null)
                  }}
                  className="sr-only"
                  disabled={submitMutation.isPending}
                />
                <label
                  htmlFor="credential-file"
                  className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-[0.5rem] border border-dashed border-[var(--border-strong)] bg-[rgba(239,230,217,0.3)] px-4 py-6 text-center transition-colors hover:border-[var(--bronze)] hover:bg-[rgba(239,230,217,0.5)]"
                >
                  <FileUp
                    className="h-5 w-5 text-[var(--bronze-deep)]"
                    aria-hidden="true"
                  />
                  <span className="mt-2 text-[0.78rem] font-medium text-[var(--charcoal)]">
                    {file ? file.name : 'Choose a PDF or image'}
                  </span>
                  <span className="mt-0.5 text-[0.68rem] text-[var(--muted)]">
                    PDF, JPG, PNG or WebP · up to 5 MB
                  </span>
                </label>
                {file ? (
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="mt-1.5 text-[0.7rem] font-medium text-[var(--muted)] hover:text-[var(--error)]"
                  >
                    Remove file
                  </button>
                ) : null}
              </div>

              {error ? (
                <p className="flex items-start gap-2 rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.72rem] leading-relaxed text-[var(--error)]">
                  <AlertTriangle
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                  />
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? 'Submitting…' : 'Submit for review'}
              </Button>

              <p className="flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-[var(--muted)]">
                <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
                Documents are stored privately and are only reviewed by
                authorised staff.
              </p>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default Credentials
