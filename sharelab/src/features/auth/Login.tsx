import { useEffect, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { FormAlert } from '../../components/auth/FormAlert'
import { PasswordField } from '../../components/auth/PasswordField'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/Field'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'
import { getSafeRedirect } from '../../lib/auth'

export interface LoginProps {
  redirect?: string
}

interface LoginErrors {
  email?: string
  password?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const Login = ({ redirect }: LoginProps) => {
  const { login, status } = useAuth()
  const router = useRouter()
  const destination = getSafeRedirect(redirect)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  usePageMeta({
    title: 'Sign in — ShareLab',
    description:
      'Sign in to ShareLab to request shared campus resources, review eligibility requirements, and track your bookings.',
  })

  useEffect(() => {
    if (status === 'authenticated') {
      router.history.replace(destination)
    }
  }, [destination, router, status])

  const validate = () => {
    const nextErrors: LoginErrors = {}

    if (!email.trim()) {
      nextErrors.email = 'Enter the email address linked to your account.'
    } else if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!password) {
      nextErrors.password = 'Enter your password.'
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
      const result = await login(email.trim(), password)

      if (!result.success) {
        setServerError(result.error)
        setErrors((current) => ({
          ...current,
          ...(result.fieldErrors.email
            ? { email: result.fieldErrors.email }
            : {}),
          ...(result.fieldErrors.password
            ? { password: result.fieldErrors.password }
            : {}),
        }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <div>
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-2.5 font-display text-[clamp(1.85rem,3.6vw,2.3rem)] font-semibold leading-[1.08] tracking-[-0.032em] text-[var(--charcoal)]">
          Sign in to ShareLab
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-[var(--muted)]">
          Continue to your resource requests, approvals, and handover records.
        </p>
      </div>

      {serverError ? (
        <FormAlert className="mt-6" variant="error">
          {serverError}
        </FormAlert>
      ) : null}

      <form
        className="mt-6 space-y-4"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
      >
        <Field
          id="login-email"
          label="Email address"
          error={errors.email}
          required
        >
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value)
              setServerError(null)
              if (errors.email)
                setErrors((current) => ({ ...current, email: undefined }))
            }}
            autoComplete="email"
            inputMode="email"
            placeholder="you@university.edu"
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            disabled={submitting}
          />
        </Field>

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            setServerError(null)
            if (errors.password)
              setErrors((current) => ({ ...current, password: undefined }))
          }}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password}
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
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 flex items-center gap-3">
        <span
          className="h-px flex-1 bg-[var(--border-subtle)]"
          aria-hidden="true"
        />
        <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
          New here
        </span>
        <span
          className="h-px flex-1 bg-[var(--border-subtle)]"
          aria-hidden="true"
        />
      </div>

      <p className="mt-4 text-center text-[0.8125rem] text-[var(--muted)]">
        <Link
          to="/register"
          search={{ redirect }}
          className="font-semibold text-[var(--espresso)] underline decoration-[rgba(81,53,34,0.28)] underline-offset-4 hover:text-[var(--bronze-deep)]"
        >
          Create a ShareLab account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
