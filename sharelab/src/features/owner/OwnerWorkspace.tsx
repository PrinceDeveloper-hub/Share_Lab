import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  FlaskConical,
  MapPin,
  Plus,
  Settings2,
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Field, Input, Select, Textarea } from '../../components/ui/Field'
import { FormAlert } from '../../components/auth/FormAlert'
import { Modal } from '../../components/ui/Modal'
import { PageHeader } from '../../components/ui/PageHeader'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatCard } from '../../components/ui/StatCard'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useResources } from '../../hooks/useResources'
import { useCreateResource } from '../../hooks/useWorkspace'
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/api-client'
import { getResourceImage } from '../../lib/resources'
import type { Resource } from '../../lib/resources'
import { cn } from '../../lib/utils'

interface ResourceFormState {
  name: string
  category: string
  location: string
  description: string
  rules: string
  maxHours: string
  weeklyCap: string
  status: 'active' | 'inactive'
}

const emptyForm: ResourceFormState = {
  name: '',
  category: '',
  location: '',
  description: '',
  rules: '',
  maxHours: '2',
  weeklyCap: '6',
  status: 'active',
}

export const OwnerWorkspace = () => {
  usePageMeta({
    title: 'My resources — ShareLab',
    description:
      'Review the listings you own and publish new shared resources.',
  })

  const { user } = useAuth()
  const resourcesQuery = useResources({ perPage: 100 })
  const createMutation = useCreateResource()

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ResourceFormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!user) return null

  const allResources = resourcesQuery.data?.data ?? []
  const ownedResources = allResources.filter(
    (resource) => resource.owner?.id === user.id,
  )
  const published = ownedResources.filter(
    (resource) => resource.status === 'active',
  )

  const update = (field: keyof ResourceFormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
    setFormError(null)
  }

  const validate = () => {
    const next: Record<string, string> = {}

    if (!form.name.trim()) next.name = 'Enter a resource name.'
    if (!form.category.trim()) next.category = 'Enter a category.'
    if (!form.location.trim()) next.location = 'Enter a location.'
    if (!form.maxHours || Number(form.maxHours) < 1)
      next.maxHours = 'Use at least 1 hour.'
    if (!form.weeklyCap || Number(form.weeklyCap) < 1)
      next.weeklyCap = 'Use at least 1 hour.'

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!validate()) return

    try {
      await createMutation.mutateAsync({
        name: form.name.trim(),
        category: form.category.trim(),
        location: form.location.trim(),
        description: form.description.trim() || undefined,
        rules: form.rules.trim() || undefined,
        max_hours_per_booking: Number(form.maxHours),
        weekly_cap_hours: Number(form.weeklyCap),
        status: form.status,
      })
      setFormOpen(false)
      setForm(emptyForm)
      setFeedback(`${form.name.trim()} was published to the catalogue.`)
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error)
      if (Object.keys(fieldErrors).length > 0) setErrors(fieldErrors)
      setFormError(
        getApiErrorMessage(error, 'The resource could not be created.'),
      )
    }
  }

  const totalHours = ownedResources.reduce(
    (sum, resource) => sum + resource.max_hours_per_booking,
    0,
  )

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: '/dashboard' },
          { label: 'My resources' },
        ]}
        eyebrow="Ownership"
        title="My resources"
        description="The listings you own, their publication status, and the limits attached to each one."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/resources">Public catalogue</Link>
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add resource
            </Button>
          </>
        }
      />

      {feedback ? (
        <FormAlert className="mt-5" variant="success">
          <div className="flex items-start justify-between gap-3">
            <span>{feedback}</span>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="shrink-0 opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </FormAlert>
      ) : null}

      <section
        aria-label="Ownership summary"
        className="mt-7 grid gap-3 sm:grid-cols-3"
      >
        {resourcesQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-28 w-full rounded-[var(--radius-lg)]"
            />
          ))
        ) : (
          <>
            <StatCard
              label="Resources owned"
              value={ownedResources.length}
              hint="Listings attached to your account"
              icon={Boxes}
            />
            <StatCard
              label="Published"
              value={published.length}
              hint="Visible in the public catalogue"
              icon={Settings2}
            />
            <StatCard
              label="Longest booking"
              value={
                totalHours > 0
                  ? `${Math.max(...ownedResources.map((item) => item.max_hours_per_booking))}h`
                  : '—'
              }
              hint="Maximum single booking across your listings"
              icon={FlaskConical}
            />
          </>
        )}
      </section>

      <div className="mt-6">
        {resourcesQuery.isLoading ? (
          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)] p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full" />
            ))}
          </div>
        ) : resourcesQuery.isError ? (
          <EmptyState
            icon={AlertTriangle}
            tone="error"
            title="Your resources could not be loaded"
            description="The catalogue API did not respond. Nothing has been changed."
            action={
              <Button
                variant="secondary"
                onClick={() => void resourcesQuery.refetch()}
              >
                Try again
              </Button>
            }
          />
        ) : ownedResources.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="You do not own any listings yet"
            description="Create a resource to make it available through the catalogue. Eligibility and booking limits are part of the listing."
            action={
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add your first resource
              </Button>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--cream)]">
            <div className="hidden grid-cols-[2fr_1fr_1fr_0.8fr_auto] gap-4 border-b border-[var(--border-subtle)] px-5 py-3 md:grid">
              {['Resource', 'Category', 'Limits', 'Status', ''].map(
                (heading) => (
                  <span
                    key={heading}
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]"
                  >
                    {heading}
                  </span>
                ),
              )}
            </div>

            <ul className="divide-y divide-[var(--border-subtle)]">
              {ownedResources.map((resource: Resource) => (
                <li
                  key={resource.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[2fr_1fr_1fr_0.8fr_auto] md:items-center md:gap-4 md:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={getResourceImage(resource)}
                      alt=""
                      className="h-11 w-14 shrink-0 rounded-[0.375rem] object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[0.8125rem] font-semibold text-[var(--charcoal)]">
                        {resource.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 truncate text-[0.7rem] text-[var(--muted)]">
                        <MapPin
                          className="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                        {resource.location}
                      </p>
                    </div>
                  </div>

                  <span className="text-[0.75rem] text-[var(--muted)] md:text-[0.78rem]">
                    {resource.category}
                  </span>

                  <span className="font-mono text-[0.7rem] text-[var(--muted)]">
                    {resource.max_hours_per_booking}h /{' '}
                    {resource.weekly_cap_hours}h wk
                  </span>

                  <Badge
                    tone={resource.status === 'active' ? 'success' : 'neutral'}
                    dot
                  >
                    {resource.status === 'active' ? 'Published' : 'Inactive'}
                  </Badge>

                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="justify-self-start md:justify-self-end"
                  >
                    <Link
                      to="/resources/$resourceId"
                      params={{ resourceId: String(resource.id) }}
                    >
                      View
                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="mt-5 text-[0.75rem] leading-relaxed text-[var(--muted)]">
        Updating requirements or deactivating a listing changes what students
        can request. Every booking decision still goes through the manager
        review process.
      </p>

      <Modal
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setFormError(null)
          setErrors({})
        }}
        title="Add a resource"
        description="Published listings appear in the catalogue immediately."
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setFormOpen(false)
                setFormError(null)
                setErrors({})
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="resource-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Publishing…' : 'Publish resource'}
            </Button>
          </>
        }
      >
        <form
          id="resource-form"
          className="space-y-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              id="resource-name"
              label="Resource name"
              error={errors.name}
              required
              className="sm:col-span-2"
            >
              <Input
                id="resource-name"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="e.g. Ultimaker S5 3D Printer"
                aria-invalid={errors.name ? 'true' : undefined}
              />
            </Field>

            <Field
              id="resource-category"
              label="Category"
              error={errors.category}
              required
            >
              <Input
                id="resource-category"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
                placeholder="e.g. 3D Printing & Fab"
                aria-invalid={errors.category ? 'true' : undefined}
              />
            </Field>

            <Field
              id="resource-location"
              label="Location"
              error={errors.location}
              required
            >
              <Input
                id="resource-location"
                value={form.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="e.g. Lab A"
                aria-invalid={errors.location ? 'true' : undefined}
              />
            </Field>

            <Field
              id="resource-max-hours"
              label="Max hours per booking"
              error={errors.maxHours}
              required
            >
              <Input
                id="resource-max-hours"
                type="number"
                min={1}
                value={form.maxHours}
                onChange={(event) => update('maxHours', event.target.value)}
                aria-invalid={errors.maxHours ? 'true' : undefined}
              />
            </Field>

            <Field
              id="resource-weekly-cap"
              label="Weekly cap (hours)"
              error={errors.weeklyCap}
              required
            >
              <Input
                id="resource-weekly-cap"
                type="number"
                min={1}
                value={form.weeklyCap}
                onChange={(event) => update('weeklyCap', event.target.value)}
                aria-invalid={errors.weeklyCap ? 'true' : undefined}
              />
            </Field>
          </div>

          <Field id="resource-description" label="Description" optional>
            <Textarea
              id="resource-description"
              rows={3}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              placeholder="What is this resource used for?"
            />
          </Field>

          <Field
            id="resource-rules"
            label="Requirements and safety"
            hint="Credentials, training, or handling rules attached to this resource."
            optional
          >
            <Textarea
              id="resource-rules"
              rows={3}
              value={form.rules}
              onChange={(event) => update('rules', event.target.value)}
              placeholder="e.g. 3D Printer Training required"
            />
          </Field>

          <Field id="resource-status" label="Publication status">
            <Select
              id="resource-status"
              value={form.status}
              onChange={(event) => update('status', event.target.value)}
            >
              <option value="active">
                Published — visible in the catalogue
              </option>
              <option value="inactive">Inactive — hidden from requests</option>
            </Select>
          </Field>

          {formError ? (
            <p
              className={cn(
                'rounded-[0.5rem] bg-[var(--error-soft)] px-3 py-2 text-[0.75rem] leading-relaxed text-[var(--error)]',
              )}
            >
              {formError}
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  )
}

export default OwnerWorkspace
