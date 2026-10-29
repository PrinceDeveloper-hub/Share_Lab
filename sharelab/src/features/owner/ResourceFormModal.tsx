import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ImagePlus, Save, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  ErrorNotice,
  Field,
  InlineLoader,
  Modal,
  inputClass,
  selectClass,
  textareaClass,
} from '../../components/ui/workspace'
import { useCreateResource, useUpdateResource } from '../../hooks/useWorkspace'
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/api-client'
import type { Resource, ResourcePayload } from '../../lib/resources'
import { cn } from '../../lib/utils'

const weekdays = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 7, label: 'Sun' },
] as const

const resourceSchema = z.object({
  name: z.string().trim().min(2, 'Enter a resource name.').max(255),
  category: z.string().trim().min(2, 'Enter a category.').max(120),
  location: z.string().trim().min(2, 'Enter where the resource lives.').max(255),
  description: z.string().trim().max(5000).optional(),
  rules: z.string().trim().max(5000).optional(),
  max_hours_per_booking: z
    .number({ message: 'Enter a number of hours.' })
    .int('Use whole hours.')
    .min(1, 'At least 1 hour.')
    .max(24, 'At most 24 hours.'),
  weekly_cap_hours: z
    .number({ message: 'Enter a weekly cap.' })
    .int('Use whole hours.')
    .min(1, 'At least 1 hour.')
    .max(168, 'At most 168 hours.'),
  status: z.enum(['active', 'inactive']),
  weekdays: z.array(z.number().int().min(1).max(7)).min(1, 'Choose at least one day.'),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, 'Choose an opening time.'),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, 'Choose a closing time.'),
  requirements_text: z.string().max(4000).optional(),
  image: z
    .custom<FileList>((value) => typeof FileList !== 'undefined' && value instanceof FileList)
    .optional(),
}).refine((values) => values.close_time > values.open_time, {
  path: ['close_time'],
  message: 'Closing time must be after opening time.',
})

type ResourceValues = z.infer<typeof resourceSchema>

const defaultValues = (resource?: Resource | null): ResourceValues => {
  const windows = resource?.availability_windows ?? [
    { weekday: 1, start: '09:00', end: '17:00' },
    { weekday: 2, start: '09:00', end: '17:00' },
    { weekday: 3, start: '09:00', end: '17:00' },
    { weekday: 4, start: '09:00', end: '17:00' },
    { weekday: 5, start: '09:00', end: '17:00' },
  ]

  return {
    name: resource?.name ?? '',
    category: resource?.category ?? '',
    location: resource?.location ?? '',
    description: resource?.description ?? '',
    rules: resource?.rules ?? '',
    max_hours_per_booking: resource?.max_hours_per_booking ?? 2,
    weekly_cap_hours: resource?.weekly_cap_hours ?? 12,
    status: resource?.status ?? 'active',
    weekdays: Array.from(new Set(windows.map((window) => window.weekday))).sort(
      (a, b) => a - b,
    ),
    open_time: windows[0]?.start ?? '09:00',
    close_time: windows[0]?.end ?? '17:00',
    requirements_text: (resource?.requirements ?? [])
      .map((requirement) => requirement.name)
      .join('\n'),
    image: undefined,
  }
}

export const ResourceFormModal = ({
  open,
  resource,
  onClose,
}: {
  open: boolean
  resource?: Resource | null
  onClose: () => void
}) => {
  const createMutation = useCreateResource()
  const updateMutation = useUpdateResource()
  const { reset: resetCreate } = createMutation
  const { reset: resetUpdate } = updateMutation
  const isEditing = Boolean(resource)
  const mutation = isEditing ? updateMutation : createMutation

  const form = useForm<ResourceValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: defaultValues(resource),
  })

  useEffect(() => {
    if (open) {
      resetCreate()
      resetUpdate()
      form.reset(defaultValues(resource))
    }
  }, [form, open, resetCreate, resetUpdate, resource])

  const onSubmit = form.handleSubmit((values) => {
    const requirementNames = (values.requirements_text ?? '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const existingVerification = new Map(
      (resource?.requirements ?? []).map((requirement) => [
        requirement.name.toLowerCase(),
        requirement.requires_verification,
      ]),
    )

    const payload: ResourcePayload = {
      name: values.name.trim(),
      category: values.category.trim(),
      location: values.location.trim(),
      description: values.description?.trim() || null,
      rules: values.rules?.trim() || null,
      max_hours_per_booking: values.max_hours_per_booking,
      weekly_cap_hours: values.weekly_cap_hours,
      status: values.status,
      availability_windows: values.weekdays.map((weekday) => ({
        weekday,
        start: values.open_time,
        end: values.close_time,
      })),
      requirements: requirementNames.map((name) => ({
        name,
        requires_verification: existingVerification.get(name.toLowerCase()) ?? true,
      })),
    }

    const image = values.image?.[0] ?? null

    if (resource) {
      updateMutation.mutate(
        { resourceId: resource.id, payload, image },
        { onSuccess: onClose },
      )
    } else {
      createMutation.mutate(
        { payload, image },
        { onSuccess: onClose },
      )
    }
  })

  useEffect(() => {
    if (!mutation.isError) return
    const fieldErrors = getApiFieldErrors(mutation.error)
    for (const [field, message] of Object.entries(fieldErrors)) {
      if (field in resourceSchema.shape) {
        form.setError(field as keyof ResourceValues, { message })
      }
    }
  }, [form, mutation.error, mutation.isError])

  return (
    <Modal
      open={open}
      size="lg"
      title={isEditing ? `Edit ${resource?.name}` : 'Add a resource'}
      description="Rules and eligibility requirements are enforced by the API for every future booking."
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name"
            htmlFor="resource-name"
            error={form.formState.errors.name?.message}
          >
            <input id="resource-name" className={inputClass} {...form.register('name')} />
          </Field>
          <Field
            label="Category"
            htmlFor="resource-category"
            error={form.formState.errors.category?.message}
          >
            <input
              id="resource-category"
              className={inputClass}
              placeholder="Fabrication, electronics, media…"
              {...form.register('category')}
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Location"
            htmlFor="resource-location"
            error={form.formState.errors.location?.message}
          >
            <input
              id="resource-location"
              className={inputClass}
              {...form.register('location')}
            />
          </Field>
          <Field label="Status" htmlFor="resource-status">
            <select id="resource-status" className={selectClass} {...form.register('status')}>
              <option value="active">Active — bookable</option>
              <option value="inactive">Inactive — hidden from booking</option>
            </select>
          </Field>
        </div>

        <Field
          label="Description"
          htmlFor="resource-description"
          error={form.formState.errors.description?.message}
        >
          <textarea
            id="resource-description"
            rows={3}
            className={textareaClass}
            {...form.register('description')}
          />
        </Field>

        <Field
          label="Rules"
          htmlFor="resource-rules"
          hint="Plain-language rules shown on the resource page."
          error={form.formState.errors.rules?.message}
        >
          <textarea
            id="resource-rules"
            rows={3}
            className={textareaClass}
            {...form.register('rules')}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Max hours per booking"
            htmlFor="resource-max-hours"
            error={form.formState.errors.max_hours_per_booking?.message}
          >
            <input
              id="resource-max-hours"
              type="number"
              min={1}
              max={24}
              className={inputClass}
              {...form.register('max_hours_per_booking', { valueAsNumber: true })}
            />
          </Field>
          <Field
            label="Weekly cap (hours)"
            htmlFor="resource-weekly-cap"
            error={form.formState.errors.weekly_cap_hours?.message}
          >
            <input
              id="resource-weekly-cap"
              type="number"
              min={1}
              max={168}
              className={inputClass}
              {...form.register('weekly_cap_hours', { valueAsNumber: true })}
            />
          </Field>
        </div>

        <Field
          label="Bookable days"
          hint="Uses the same opening hours for every selected day."
          error={form.formState.errors.weekdays?.message}
        >
          <div className="flex flex-wrap gap-2">
            {weekdays.map((day) => (
              <label
                key={day.value}
                className={cn(
                  'inline-flex min-h-10 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold transition-colors',
                  form.watch('weekdays').includes(day.value)
                    ? 'border-(--espresso) bg-(--espresso) text-(--accent-contrast)'
                    : 'border-(--border-subtle) bg-(--surface) text-(--muted)',
                )}
              >
                <input
                  type="checkbox"
                  value={day.value}
                  className="sr-only"
                  checked={form.watch('weekdays').includes(day.value)}
                  onChange={(event) => {
                    const current = form.getValues('weekdays')
                    form.setValue(
                      'weekdays',
                      event.target.checked
                        ? Array.from(new Set([...current, day.value])).sort((a, b) => a - b)
                        : current.filter((value) => value !== day.value),
                      { shouldValidate: true },
                    )
                  }}
                />
                {day.label}
              </label>
            ))}
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Opens"
            htmlFor="resource-open-time"
            error={form.formState.errors.open_time?.message}
          >
            <input
              id="resource-open-time"
              type="time"
              className={inputClass}
              {...form.register('open_time')}
            />
          </Field>
          <Field
            label="Closes"
            htmlFor="resource-close-time"
            error={form.formState.errors.close_time?.message}
          >
            <input
              id="resource-close-time"
              type="time"
              className={inputClass}
              {...form.register('close_time')}
            />
          </Field>
        </div>

        <Field
          label="Eligibility requirements"
          htmlFor="resource-requirements"
          hint="One requirement per line, for example “Laser safety induction”. Remove a line to stop requiring it."
          error={form.formState.errors.requirements_text?.message}
        >
          <textarea
            id="resource-requirements"
            rows={3}
            className={textareaClass}
            placeholder="Laser safety induction"
            {...form.register('requirements_text')}
          />
        </Field>

        <Field
          label="Resource image"
          htmlFor="resource-image"
          hint="Optional JPG, PNG, or WEBP up to 5 MB. Existing images stay unless replaced."
          error={form.formState.errors.image?.message}
        >
          <input
            id="resource-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full cursor-pointer rounded-xl border border-(--border-subtle) bg-(--surface) px-3 py-2.5 text-sm text-(--muted) file:mr-3 file:rounded-full file:border-0 file:bg-(--espresso) file:px-4 file:py-2 file:text-sm file:font-semibold file:text-(--accent-contrast)"
            {...form.register('image')}
          />
        </Field>

        {mutation.isError ? (
          <ErrorNotice
            title={isEditing ? 'The resource was not saved' : 'The resource was not created'}
            message={getApiErrorMessage(mutation.error, 'Check the fields and try again.')}
          />
        ) : null}

        <div className="flex flex-wrap justify-between gap-2 border-t border-(--border-subtle) pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset(defaultValues(resource))
              onClose()
            }}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Discard changes
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <InlineLoader label="Saving" />
            ) : (
              <>
                {isEditing ? (
                  <Save className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                )}
                {isEditing ? 'Save resource' : 'Create resource'}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ResourceFormModal
