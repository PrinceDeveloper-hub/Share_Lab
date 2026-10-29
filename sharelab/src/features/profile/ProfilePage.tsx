import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react'
import { Button } from '../../components/ui/button'
import {
  ErrorNotice,
  Field,
  InlineLoader,
  LoadingRows,
  PageHeader,
  SectionCard,
  inputClass,
} from '../../components/ui/workspace'
import { useAuth } from '../../hooks/useAuth'
import { useProfile, useUpdatePassword, useUpdateProfile } from '../../hooks/useProfile'
import { getApiErrorMessage, getApiFieldErrors } from '../../lib/api-client'
import { cn } from '../../lib/utils'

const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(120),
  email: z.string().trim().email('Enter a valid email address.').max(255),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Enter your current password.'),
    password: z.string().min(8, 'Use at least 8 characters.').max(255),
    password_confirmation: z.string().min(1, 'Confirm the new password.'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The passwords do not match.',
  })

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

const roleLabel: Record<string, string> = {
  user: 'Student / researcher',
  manager: 'Resource manager',
  owner: 'Resource owner',
  admin: 'Administrator',
}

export const ProfilePage = () => {
  const { user, refreshSession } = useAuth()
  const profileQuery = useProfile()
  const updateProfileMutation = useUpdateProfile()
  const updatePasswordMutation = useUpdatePassword()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', email: '' },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  const profile = profileQuery.data?.data ?? user

  useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name, email: profile.email })
    }
  }, [profile, profileForm])

  const onProfile = profileForm.handleSubmit((values) => {
    setProfileSaved(false)
    updateProfileMutation.mutate(
      { name: values.name.trim(), email: values.email.trim().toLowerCase() },
      {
        onSuccess: async () => {
          await refreshSession()
          setProfileSaved(true)
        },
        onError: (error) => {
          const fieldErrors = getApiFieldErrors(error)
          if (fieldErrors.name) profileForm.setError('name', { message: fieldErrors.name })
          if (fieldErrors.email) profileForm.setError('email', { message: fieldErrors.email })
        },
      },
    )
  })

  const onPassword = passwordForm.handleSubmit((values) => {
    setPasswordSaved(false)
    updatePasswordMutation.mutate(values, {
      onSuccess: () => {
        passwordForm.reset()
        setPasswordSaved(true)
      },
      onError: (error) => {
        const fieldErrors = getApiFieldErrors(error)
        if (fieldErrors.current_password) {
          passwordForm.setError('current_password', { message: fieldErrors.current_password })
        }
        if (fieldErrors.password) {
          passwordForm.setError('password', { message: fieldErrors.password })
        }
      },
    })
  })

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Account"
        title="Profile and security"
        description="Keep your contact details current. Your role is assigned by the lab and cannot be changed here."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-5">
          <SectionCard>
            <div className="flex items-center gap-2">
              <UserRound className="h-5 w-5 text-(--taupe)" aria-hidden="true" />
              <h2 className="font-display text-[1.55rem] font-semibold text-(--charcoal)">
                Personal details
              </h2>
            </div>

            {profileQuery.isLoading ? (
              <div className="mt-5">
                <LoadingRows rows={2} label="Loading profile" />
              </div>
            ) : profileQuery.isError ? (
              <div className="mt-5">
                <ErrorNotice
                  title="Profile could not be loaded"
                  message="Refresh the page to try again."
                  onRetry={() => void profileQuery.refetch()}
                />
              </div>
            ) : (
              <form onSubmit={onProfile} className="mt-5 space-y-4">
                <Field
                  label="Full name"
                  htmlFor="profile-name"
                  error={profileForm.formState.errors.name?.message}
                >
                  <input
                    id="profile-name"
                    autoComplete="name"
                    className={inputClass}
                    {...profileForm.register('name')}
                  />
                </Field>

                <Field
                  label="Email address"
                  htmlFor="profile-email"
                  error={profileForm.formState.errors.email?.message}
                >
                  <input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    className={inputClass}
                    {...profileForm.register('email')}
                  />
                </Field>

                {updateProfileMutation.isError ? (
                  <ErrorNotice
                    title="Profile was not saved"
                    message={getApiErrorMessage(updateProfileMutation.error, 'Try again.')}
                  />
                ) : null}

                {profileSaved ? (
                  <p className="flex items-center gap-2 rounded-xl bg-(--success-tint-soft) px-3 py-2 text-sm font-medium text-(--success)">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Profile updated.
                  </p>
                ) : null}

                <div className="pt-1">
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? (
                      <InlineLoader label="Saving" />
                    ) : (
                      'Save profile'
                    )}
                  </Button>
                </div>
              </form>
            )}
          </SectionCard>

          <SectionCard>
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-(--taupe)" aria-hidden="true" />
              <h2 className="font-display text-[1.55rem] font-semibold text-(--charcoal)">
                Change password
              </h2>
            </div>
            <p className="mt-1 text-sm text-(--muted)">
              Changing your password is audited. You stay signed in on this device.
            </p>

            <form onSubmit={onPassword} className="mt-5 space-y-4">
              <Field
                label="Current password"
                htmlFor="current-password"
                error={passwordForm.formState.errors.current_password?.message}
              >
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  className={inputClass}
                  {...passwordForm.register('current_password')}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="New password"
                  htmlFor="new-password"
                  hint="At least 8 characters."
                  error={passwordForm.formState.errors.password?.message}
                >
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                    {...passwordForm.register('password')}
                  />
                </Field>

                <Field
                  label="Confirm new password"
                  htmlFor="confirm-password"
                  error={passwordForm.formState.errors.password_confirmation?.message}
                >
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className={inputClass}
                    {...passwordForm.register('password_confirmation')}
                  />
                </Field>
              </div>

              {updatePasswordMutation.isError ? (
                <ErrorNotice
                  title="Password was not changed"
                  message={getApiErrorMessage(updatePasswordMutation.error, 'Try again.')}
                />
              ) : null}

              {passwordSaved ? (
                <p className="flex items-center gap-2 rounded-xl bg-(--success-tint-soft) px-3 py-2 text-sm font-medium text-(--success)">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Password updated.
                </p>
              ) : null}

              <div className="pt-1">
                <Button type="submit" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? (
                    <InlineLoader label="Updating" />
                  ) : (
                    'Update password'
                  )}
                </Button>
              </div>
            </form>
          </SectionCard>
        </div>

        <aside className="space-y-4">
          <SectionCard>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--espresso) font-display text-xl font-semibold text-(--accent-contrast)">
              {profile?.name.split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <p className="mt-3 font-display text-xl font-semibold text-(--charcoal)">
              {profile?.name ?? 'Your account'}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-(--muted)">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {profile?.email}
            </p>
            <p
              className={cn(
                'mt-3 inline-flex items-center gap-1.5 rounded-full bg-(--tint-2) px-2.5 py-1 text-[0.68rem] font-semibold text-(--espresso)',
              )}
            >
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {profile ? (roleLabel[profile.role] ?? profile.role) : 'Member'}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-(--muted)">
              Role changes and resource assignments are made by the lab. Contact an owner if your
              access looks wrong.
            </p>
          </SectionCard>
        </aside>
      </div>
    </div>
  )
}

export default ProfilePage
