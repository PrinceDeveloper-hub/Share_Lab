<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
=======
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Loader2, Mail, UserRound } from 'lucide-react'
import { AuthField } from '../../components/auth/AuthField'
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
import { AuthLayout } from '../../components/auth/AuthLayout'
import { FormAlert } from '../../components/auth/FormAlert'
import { PasswordField } from '../../components/auth/PasswordField'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/Field'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'

export interface RegisterProps {
  redirect?: string
}

interface RegisterErrors {
  name?: string
  email?: string
  password?: string
  password_confirmation?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const accountBenefits = [
  'Request equipment, studios, and labs',
  'See eligibility before you ask',
  'Keep every handover on record',
] as const

const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const

const passwordStrength = (value: string) => {
  if (!value) return 0

  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score += 1

  return Math.min(score, 4)
}

const strengthTone = [
  'bg-[rgba(130,119,109,0.22)]',
  'bg-[var(--error)]',
  'bg-[var(--warning)]',
  'bg-[rgba(56,118,83,0.7)]',
  'bg-[var(--success)]',
] as const

export const Register = ({ redirect }: RegisterProps) => {
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  usePageMeta({
    title: 'Create an account — ShareLab',
    description:
      'Create a ShareLab account to request shared campus resources, review eligibility requirements, and track approvals.',
  })

  const strength = passwordStrength(password)

  const validate = () => {
    const nextErrors: RegisterErrors = {}
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName) {
      nextErrors.name = 'Enter your full name.'
    } else if (trimmedName.length < 2) {
      nextErrors.name = 'Enter at least 2 characters.'
    }

    if (!trimmedEmail) {
      nextErrors.email = 'Enter your email address.'
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Choose a password.'
    } else if (password.length < 8) {
      nextErrors.password = 'Use at least 8 characters.'
    }

    if (!passwordConfirmation) {
      nextErrors.password_confirmation = 'Confirm your password.'
    } else if (password !== passwordConfirmation) {
      nextErrors.password_confirmation = 'Passwords do not match.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    if (!validate()) return

    setSubmitting(true)

    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })

      if (!result.success) {
        setServerError(result.error)
        setErrors((current) => ({
          ...current,
          ...(result.fieldErrors.name ? { name: result.fieldErrors.name } : {}),
          ...(result.fieldErrors.email
            ? { email: result.fieldErrors.email }
            : {}),
          ...(result.fieldErrors.password
            ? { password: result.fieldErrors.password }
            : {}),
          ...(result.fieldErrors.password_confirmation
            ? {
                password_confirmation: result.fieldErrors.password_confirmation,
              }
            : {}),
        }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const clearError = (field: keyof RegisterErrors) => {
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }))
    }
  }

  return (
    <AuthLayout mode="register">
      <div>
<<<<<<< HEAD
        <span className="eyebrow">Join the commons</span>
        <h1 className="mt-2.5 font-display text-[clamp(1.85rem,3.6vw,2.3rem)] font-semibold leading-[1.08] tracking-[-0.032em] text-[var(--charcoal)]">
          Create your account
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-[var(--muted)]">
          One account for the equipment, studios, and shared facilities you
          need.
        </p>
      </div>

      <ul className="mt-5 space-y-1.5 rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[rgba(239,230,217,0.35)] px-3.5 py-3">
        {accountBenefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-[0.75rem] leading-relaxed text-[var(--muted)]"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(63,107,79,0.12)] text-[var(--success)]">
=======
        <h1 className="font-editorial text-[clamp(2rem,4.6vw,2.65rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[var(--charcoal)]">
          Create your account.
        </h1>
        <p className="mt-3 max-w-[25rem] text-sm leading-relaxed text-[var(--muted)]">
          One account for the equipment, studios, and shared facilities your
          work needs.
        </p>
      </div>

      <ul className="mt-5 grid gap-1.5">
        {accountBenefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-[0.76rem] leading-relaxed text-[var(--muted)]"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(56,118,83,0.12)] text-[var(--success)]">
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
              <Check
                className="h-2.5 w-2.5"
                strokeWidth={3}
                aria-hidden="true"
              />
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      {serverError ? (
        <FormAlert className="mt-5" variant="error">
          {serverError}
        </FormAlert>
      ) : null}

      <form
        className="mt-5 space-y-4"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
      >
<<<<<<< HEAD
        <Field
=======
        <AuthField
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
          id="register-name"
          label="Full name"
          error={errors.name}
<<<<<<< HEAD
          required
        >
          <Input
            id="register-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setServerError(null)
              clearError('name')
            }}
            autoComplete="name"
            placeholder="Your full name"
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? 'register-name-error' : undefined}
            disabled={submitting}
          />
        </Field>
=======
          disabled={submitting}
          autoFocus
        />
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d

        <Field
          id="register-email"
          label="Email address"
<<<<<<< HEAD
=======
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setServerError(null)
            clearError('email')
          }}
          autoComplete="email"
          inputMode="email"
          placeholder="you@campus.edu"
          icon={Mail}
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
          error={errors.email}
          required
        >
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setServerError(null)
              clearError('email')
            }}
            autoComplete="email"
            inputMode="email"
            placeholder="you@university.edu"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
            disabled={submitting}
          />
        </Field>

        <div>
          <PasswordField
            id="register-password"
            label="Password"
            value={password}
            onChange={(value) => {
              setPassword(value)
              setServerError(null)
              clearError('password')
              if (passwordConfirmation && errors.password_confirmation) {
                clearError('password_confirmation')
              }
            }}
            autoComplete="new-password"
            placeholder="8+ characters"
            hint="At least 8 characters."
            error={errors.password}
            disabled={submitting}
          />

          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index < strength
                      ? strengthTone[strength]
                      : 'bg-[rgba(130,119,109,0.16)]'
                  }`}
                />
              ))}
            </div>
            <span
              className="min-w-[4.75rem] text-right text-[0.66rem] font-semibold text-[var(--muted)]"
              aria-live="polite"
            >
              {password ? strengthLabels[strength] : '8+ characters'}
            </span>
          </div>
        </div>

<<<<<<< HEAD
=======
        <PasswordField
          id="register-password-confirmation"
          label="Confirm password"
          value={passwordConfirmation}
          onChange={(value) => {
            setPasswordConfirmation(value)
            setServerError(null)
            clearError('password_confirmation')
          }}
          autoComplete="new-password"
          placeholder="Re-enter password"
          error={errors.password_confirmation}
          disabled={submitting}
        />

>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

<<<<<<< HEAD
      <p className="mt-5 text-center text-[0.8125rem] text-[var(--muted)]">
        Already have an account?{' '}
        <Link
          to="/login"
          search={{ redirect }}
          className="font-semibold text-[var(--espresso)] underline decoration-[rgba(81,53,34,0.28)] underline-offset-4 hover:text-[var(--bronze-deep)]"
        >
          Sign in
        </Link>
      </p>
=======
      <p className="mt-4 text-center text-[0.68rem] leading-relaxed text-[var(--muted)]">
        By creating an account you agree to the campus resource-use policy.
      </p>

      <div className="mt-5 border-t border-[rgba(82,59,45,0.1)] pt-5">
        <p className="text-center text-sm text-[var(--muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="inline-flex min-h-11 items-center rounded-sm px-1 font-semibold text-[var(--espresso)] underline decoration-[rgba(75,47,31,0.28)] underline-offset-4 transition-colors hover:text-[var(--deep-brown)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Sign in
          </Link>
        </p>
      </div>
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
    </AuthLayout>
  )
}

export default Register
