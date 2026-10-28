import { useEffect, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import { AuthField } from '../../components/auth/AuthField'
import { AuthLayout } from '../../components/auth/AuthLayout'
import { FormAlert } from '../../components/auth/FormAlert'
import { PasswordField } from '../../components/auth/PasswordField'
import { Button } from '../../components/ui/button'
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
          ...(result.fieldErrors.email ? { email: result.fieldErrors.email } : {}),
          ...(result.fieldErrors.password ? { password: result.fieldErrors.password } : {}),
        }))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[var(--taupe)]">
          Welcome back
        </p>
        <h1 className="mt-2.5 font-editorial text-[clamp(1.85rem,4vw,2.3rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-[var(--charcoal)]">
          Sign in to ShareLab
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
          Continue to your resource requests, approvals, and handover records.
        </p>
      </div>

      {serverError ? (
        <FormAlert className="mt-6" variant="error">
          {serverError}
        </FormAlert>
      ) : null}

      <form
        className="mt-6 space-y-5"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
      >
        <AuthField
          id="login-email"
          label="Email address"
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value)
            setServerError(null)
            if (errors.email) setErrors((current) => ({ ...current, email: undefined }))
          }}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          icon={Mail}
          error={errors.email}
          disabled={submitting}
        />

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={(value) => {
            setPassword(value)
            setServerError(null)
            if (errors.password) setErrors((current) => ({ ...current, password: undefined }))
          }}
          autoComplete="current-password"
          placeholder="Enter your password"
          error={errors.password}
          disabled={submitting}
        />

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 border-t border-[rgba(82,59,45,0.1)] pt-5">
        <p className="text-center text-sm text-[var(--muted)]">
          New to ShareLab?{' '}
          <Link
            to="/register"
            search={{ redirect }}
            className="rounded-sm font-semibold text-[var(--espresso)] underline decoration-[rgba(75,47,31,0.28)] underline-offset-4 transition-colors hover:text-[var(--deep-brown)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
