import { useState } from 'react'
import { Check, ShieldCheck, X } from 'lucide-react'
import { Button } from '../ui/button'
import { EmptyState } from '../ui/EmptyState'
import { FormAlert } from '../auth/FormAlert'
import { ConfirmDialog, Modal } from '../ui/Modal'
import { useDecideCredential } from '../../hooks/useWorkspace'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Credential } from '../../lib/credentials'
import { formatDateTime } from '../../lib/format'
import { CredentialBadge } from './CredentialBadge'

export interface CredentialQueueProps {
  credentials: Credential[]
  emptyTitle?: string
  emptyDescription?: string
}

export const CredentialQueue = ({
  credentials,
  emptyTitle = 'No credentials waiting for review',
  emptyDescription = 'Pending submissions for your resources will appear here.',
}: CredentialQueueProps) => {
  const decision = useDecideCredential()
  const [verifyTarget, setVerifyTarget] = useState<Credential | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Credential | null>(null)
  const [note, setNote] = useState('')
  const [feedback, setFeedback] = useState<{
    tone: 'success' | 'error'
    message: string
  } | null>(null)

  const decide = async (
    credential: Credential,
    next: 'verify' | 'reject',
    reviewNote?: string,
  ) => {
    try {
      await decision.mutateAsync({
        credentialId: credential.id,
        decision: next,
        note: reviewNote,
      })
      setFeedback({
        tone: 'success',
        message:
          next === 'verify'
            ? `${credential.requirement_name} verified.`
            : `${credential.requirement_name} rejected.`,
      })
      setVerifyTarget(null)
      setRejectTarget(null)
      setNote('')
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: getApiErrorMessage(
          error,
          'The credential decision could not be recorded.',
        ),
      })
    }
  }

  if (credentials.length === 0) {
    return (
      <EmptyState
        icon={ShieldCheck}
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  return (
    <div className="space-y-3">
      {feedback ? (
        <FormAlert variant={feedback.tone === 'success' ? 'success' : 'error'}>
          <div className="flex items-start justify-between gap-3">
            <span>{feedback.message}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </FormAlert>
      ) : null}

      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]">
        <ul className="divide-y divide-[var(--border-subtle)]">
          {credentials.map((credential) => (
            <li
              key={credential.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3.5 sm:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[0.8125rem] font-semibold text-[var(--charcoal)]">
                  {credential.requirement_name}
                </p>
                <p className="mt-0.5 text-[0.72rem] text-[var(--muted)]">
                  {credential.user?.name ? `${credential.user.name} · ` : ''}
                  {credential.created_at
                    ? formatDateTime(credential.created_at)
                    : 'Submitted'}
                </p>
                {credential.review_note ? (
                  <p className="mt-1 text-[0.72rem] leading-relaxed text-[var(--muted)]">
                    Note: {credential.review_note}
                  </p>
                ) : null}
              </div>

              <CredentialBadge status={credential.status} />

              {credential.status === 'pending' ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setVerifyTarget(credential)}
                    disabled={decision.isPending}
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    Verify
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[var(--error)] hover:bg-[var(--error-soft)]"
                    onClick={() => {
                      setRejectTarget(credential)
                      setNote('')
                    }}
                    disabled={decision.isPending}
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(verifyTarget)}
        onClose={() => setVerifyTarget(null)}
        onConfirm={() => verifyTarget && void decide(verifyTarget, 'verify')}
        title="Verify this credential?"
        description={
          verifyTarget
            ? `${verifyTarget.requirement_name}${verifyTarget.user?.name ? ` for ${verifyTarget.user.name}` : ''}. The requester will be notified and become eligible for resources that require it.`
            : ''
        }
        confirmLabel="Verify credential"
        loading={decision.isPending}
      />

      <Modal
        open={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject this credential"
        description="A reason helps the requester correct the submission."
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRejectTarget(null)}
              disabled={decision.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                rejectTarget && void decide(rejectTarget, 'reject', note)
              }
              disabled={decision.isPending}
            >
              {decision.isPending ? 'Saving…' : 'Reject credential'}
            </Button>
          </>
        }
      >
        <label
          htmlFor="credential-reject-note"
          className="block text-[0.75rem] font-semibold text-[var(--charcoal)]"
        >
          Review note
          <span className="ml-1 font-normal text-[var(--muted)]">
            (optional)
          </span>
        </label>
        <textarea
          id="credential-reject-note"
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Explain what is missing or incorrect."
          className="mt-1.5 w-full resize-none rounded-[0.5rem] border border-[var(--border-subtle)] bg-white px-3 py-2 text-[0.8125rem] text-[var(--charcoal)] outline-none placeholder:text-[rgba(113,104,95,0.7)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)]"
        />
      </Modal>
    </div>
  )
}

export default CredentialQueue
