import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Check, Loader2, Mail, UserRound } from 'lucide-react'
import { AuthField } from '../../components/auth/AuthField'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { FormAlert } from '../../components/auth/FormAlert'
import { PasswordField } from '../../components/auth/PasswordField'
import { Button } from '../../components/ui/button'
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
  'bg-(--error)',
  'bg-(--warning)',
  'bg-[rgba(53,107,76,0.7)]',
  'bg-(--success)',
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
        <h1 className="font-display text-[clamp(2rem,4.6vw,2.65rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-(--charcoal)">
          Create your account.
        </h1>
        <p className="mt-3 max-w-100 text-sm leading-relaxed text-(--muted)">
          One account for the equipment, studios, and shared facilities your
          work needs.
        </p>
      </div>

      <ul className="mt-5 grid gap-1.5">
        {accountBenefits.map((benefit) => (
          <li
            key={benefit}
            className="flex items-start gap-2 text-[0.76rem] leading-relaxed text-(--muted)"
          >
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-(--success-tint) text-(--success)">
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
        <AuthField
          id="register-name"
          label="Full name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setServerError(null)
            clearError('name')
          }}
          autoComplete="name"
          placeholder="Your full name"
          icon={UserRound}
          error={errors.name}
          disabled={submitting}
          autoFocus
        />

        <AuthField
          id="register-email"
          label="Email address"
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
          error={errors.email}
          disabled={submitting}
        />

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
              className="min-w-19 text-right text-[0.66rem] font-semibold text-(--muted)"
              aria-live="polite"
            >
              {password ? strengthLabels[strength] : '8+ characters'}
            </span>
          </div>
        </div>

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

        <Button
          type="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-4 text-center text-[0.68rem] leading-relaxed text-(--muted)">
        By creating an account you agree to the campus resource-use policy.
      </p>

      <div className="mt-5 border-t border-(--tint-2) pt-5">
        <p className="text-center text-sm text-(--muted)">
          Already have an account?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="inline-flex min-h-11 items-center rounded-sm px-1 font-semibold text-(--espresso) underline decoration-(--tint-3) underline-offset-4 transition-colors hover:text-(--espresso-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Register
