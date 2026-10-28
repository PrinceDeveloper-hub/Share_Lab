import { useEffect, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowRight, Check, Loader2, Mail, UserRound } from 'lucide-react'
import { AuthField } from '../../components/auth/AuthField'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { FormAlert } from '../../components/auth/FormAlert'
import { PasswordField } from '../../components/auth/PasswordField'
import { Button } from '../../components/ui/button'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import { getSafeRedirect } from '../../lib/auth'

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
  'Request shared equipment and facilities',
  'Follow review decisions in one place',
  'Keep a clear record of every handover',
] as const

export const Register = ({ redirect }: RegisterProps) => {
  const { register, status } = useAuth()
  const router = useRouter()
  const destination = getSafeRedirect(redirect)

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

  useEffect(() => {
    if (status === 'authenticated') {
      router.history.replace(destination)
    }
  }, [destination, router, status])

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
          ...(result.fieldErrors.email ? { email: result.fieldErrors.email } : {}),
          ...(result.fieldErrors.password ? { password: result.fieldErrors.password } : {}),
          ...(result.fieldErrors.password_confirmation
            ? { password_confirmation: result.fieldErrors.password_confirmation }
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
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--taupe)]">
          Join the commons
        </p>
        <h1 className="mt-2.5 font-editorial text-[clamp(1.85rem,4vw,2.3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--charcoal)]">
          Create your account
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          One account for the equipment, studios, and shared facilities you need.
        </p>
      </div>

      <ul className="mt-4 hidden gap-1.5 rounded-xl border border-[rgba(75,47,31,0.1)] bg-[rgba(75,47,31,0.035)] px-3 py-2.5 sm:grid">
        {accountBenefits.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-[0.72rem] leading-relaxed text-[var(--muted)]">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[rgba(56,118,83,0.12)] text-[var(--success)]">
              <Check className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
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

      <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
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
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email}
          disabled={submitting}
        />

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
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

      <div className="mt-5 border-t border-[rgba(82,59,45,0.1)] pt-5">
        <p className="text-center text-sm text-[var(--muted)]">
          Already have an account?{' '}
          <Link
            to="/login"
            search={{ redirect }}
            className="rounded-sm font-semibold text-[var(--espresso)] underline decoration-[rgba(75,47,31,0.28)] underline-offset-4 transition-colors hover:text-[var(--deep-brown)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Register
