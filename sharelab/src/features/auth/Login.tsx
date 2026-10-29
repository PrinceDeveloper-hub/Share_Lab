<<<<<<< HEAD
import { useEffect, useState } from 'react'
import { Link, useRouter } from '@tanstack/react-router'
import { ArrowRight, Loader2 } from 'lucide-react'
=======
import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, ChevronDown, KeyRound, Loader2, Mail } from 'lucide-react'
import { AuthField } from '../../components/auth/AuthField'
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
import { AuthLayout } from '../../components/auth/AuthLayout'
import { FormAlert } from '../../components/auth/FormAlert'
import { PasswordField } from '../../components/auth/PasswordField'
import { Button } from '../../components/ui/button'
import { Field, Input } from '../../components/ui/Field'
import { useAuth } from '../../hooks/useAuth'
import { usePageMeta } from '../../hooks/usePageMeta'

export interface LoginProps {
  redirect?: string
}

interface LoginErrors {
  email?: string
  password?: string
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const demoAccounts = [
  { role: 'Student', email: 'user1@sharelab.test' },
  { role: 'Manager', email: 'manager@sharelab.test' },
  { role: 'Owner', email: 'owner@sharelab.test' },
  { role: 'Admin', email: 'admin@sharelab.test' },
] as const

export const Login = ({ redirect }: LoginProps) => {
  const { login } = useAuth()

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

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('password')
    setErrors({})
    setServerError(null)
  }

  return (
    <AuthLayout mode="login">
      <div>
<<<<<<< HEAD
        <span className="eyebrow">Welcome back</span>
        <h1 className="mt-2.5 font-display text-[clamp(1.85rem,3.6vw,2.3rem)] font-semibold leading-[1.08] tracking-[-0.032em] text-[var(--charcoal)]">
          Sign in to ShareLab
        </h1>
        <p className="mt-2.5 text-[0.875rem] leading-relaxed text-[var(--muted)]">
          Continue to your resource requests, approvals, and handover records.
=======
        <h1 className="font-editorial text-[clamp(2rem,4.6vw,2.65rem)] font-semibold leading-[1.04] tracking-[-0.035em] text-[var(--charcoal)]">
          Welcome back.
        </h1>
        <p className="mt-3 max-w-[25rem] text-sm leading-relaxed text-[var(--muted)]">
          Sign in to pick up where your last request left off — approvals,
          handovers, and lab time in one place.
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
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
<<<<<<< HEAD
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
=======
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
          placeholder="you@campus.edu"
          icon={Mail}
          error={errors.email}
          disabled={submitting}
          autoFocus
        />
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d

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

<<<<<<< HEAD
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
=======
      <details className="group mt-5 rounded-xl border border-[rgba(82,59,45,0.12)] bg-[rgba(75,47,31,0.028)]">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-[0.72rem] font-semibold text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--ring)] [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-2">
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            Reviewer demo accounts
          </span>
          <ChevronDown
            className="h-3.5 w-3.5 text-[var(--muted)] transition-transform group-open:rotate-180"
            aria-hidden="true"
          />
        </summary>
        <div className="grid grid-cols-2 gap-1.5 border-t border-[rgba(82,59,45,0.08)] p-2">
          {demoAccounts.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account.email)}
              className="rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[rgba(75,47,31,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
            >
              <span className="block text-[0.7rem] font-semibold text-[var(--charcoal)]">
                {account.role}
              </span>
              <span className="mt-0.5 block truncate text-[0.64rem] text-[var(--muted)]">
                {account.email}
              </span>
            </button>
          ))}
        </div>
        <p className="border-t border-[rgba(82,59,45,0.08)] px-3.5 py-2 text-[0.64rem] leading-relaxed text-[var(--muted)]">
          Demo password:{' '}
          <span className="font-semibold text-[var(--charcoal)]">password</span>
        </p>
      </details>

      <div className="mt-6 border-t border-[rgba(82,59,45,0.1)] pt-5">
        <p className="text-center text-sm text-[var(--muted)]">
          New to ShareLab?{' '}
          <Link
            to="/register"
            search={{ redirect }}
            className="inline-flex min-h-11 items-center rounded-sm px-1 font-semibold text-[var(--espresso)] underline decoration-[rgba(75,47,31,0.28)] underline-offset-4 transition-colors hover:text-[var(--deep-brown)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            Create an account
          </Link>
        </p>
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
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
