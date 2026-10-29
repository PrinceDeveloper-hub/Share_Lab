import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MailPlus, UserMinus, UsersRound } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  ErrorNotice,
  Field,
  InlineLoader,
  LoadingRows,
  Modal,
  inputClass,
} from '../../components/ui/workspace'
import {
  useAssignOwnerManager,
  useOwnerManagers,
  useRemoveOwnerManager,
} from '../../hooks/useWorkspace'
import { getApiErrorMessage } from '../../lib/api-client'
import type { Resource } from '../../lib/resources'

const managerSchema = z.object({
  email: z.string().trim().email('Enter the manager’s account email.'),
})

type ManagerValues = z.infer<typeof managerSchema>

export const OwnerManagerModal = ({
  resource,
  onClose,
}: {
  resource: Resource | null
  onClose: () => void
}) => {
  const managersQuery = useOwnerManagers(resource?.id ?? null)
  const assignMutation = useAssignOwnerManager()
  const removeMutation = useRemoveOwnerManager()
  const form = useForm<ManagerValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: { email: '' },
  })

  const managers = managersQuery.data?.data ?? []
  const actionError = assignMutation.error ?? removeMutation.error

  const onSubmit = form.handleSubmit((values) => {
    if (!resource) return
    assignMutation.mutate(
      { resourceId: resource.id, email: values.email.trim().toLowerCase() },
      {
        onSuccess: () => {
          form.reset({ email: '' })
          void managersQuery.refetch()
        },
      },
    )
  })

  return (
    <Modal
      open={resource !== null}
      title={resource ? `Managers for ${resource.name}` : 'Resource managers'}
      description="Managers can decide bookings and review credentials only for resources assigned to them. They cannot edit rules or assign other managers."
      onClose={onClose}
    >
      <div className="space-y-5">
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field
            label="Assign by email"
            htmlFor="manager-email"
            error={form.formState.errors.email?.message}
            className="flex-1"
          >
            <input
              id="manager-email"
              type="email"
              autoComplete="email"
              className={inputClass}
              placeholder="manager@sharelab.test"
              {...form.register('email')}
            />
          </Field>
          <Button type="submit" disabled={assignMutation.isPending || !resource}>
            {assignMutation.isPending ? (
              <InlineLoader label="Assigning" />
            ) : (
              <>
                <MailPlus className="h-4 w-4" aria-hidden="true" />
                Assign
              </>
            )}
          </Button>
        </form>

        {actionError ? (
          <ErrorNotice
            title="The manager list could not be updated"
            message={getApiErrorMessage(actionError, 'Check the email and try again.')}
          />
        ) : null}

        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-(--charcoal)">Assigned managers</h3>
            <span className="rounded-full bg-[rgba(81,53,34,0.07)] px-2 py-0.5 text-[0.65rem] font-semibold text-(--espresso)">
              {managers.length}
            </span>
          </div>

          {managersQuery.isLoading ? (
            <div className="mt-3">
              <LoadingRows rows={2} label="Loading managers" />
            </div>
          ) : managersQuery.isError ? (
            <div className="mt-3">
              <ErrorNotice
                title="Managers could not be loaded"
                message="Refresh the dialog to try again."
                onRetry={() => void managersQuery.refetch()}
              />
            </div>
          ) : managers.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-(--border-subtle) px-4 py-6 text-center">
              <UsersRound className="mx-auto h-5 w-5 text-(--taupe)" aria-hidden="true" />
              <p className="mt-2 text-sm text-(--muted)">
                No managers are assigned to this resource yet.
              </p>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-(--border-subtle)">
              {managers.map((manager) => (
                <li
                  key={manager.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-semibold text-(--charcoal)">{manager.name}</p>
                    <p className="text-xs text-(--muted)">{manager.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-(--error) hover:bg-[rgba(169,72,60,0.07)] hover:text-(--error)"
                    disabled={removeMutation.isPending}
                    onClick={() => {
                      if (!resource) return
                      if (window.confirm(`Remove ${manager.name} from this resource?`)) {
                        removeMutation.mutate(
                          { resourceId: resource.id, managerId: manager.id },
                          { onSuccess: () => void managersQuery.refetch() },
                        )
                      }
                    }}
                  >
                    <UserMinus className="h-3.5 w-3.5" aria-hidden="true" />
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-(--border-subtle) pt-4">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default OwnerManagerModal
