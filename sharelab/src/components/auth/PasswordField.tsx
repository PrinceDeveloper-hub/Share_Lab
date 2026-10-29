import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Field, Input } from '../ui/Field'

export interface PasswordFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
}

export const PasswordField = ({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  placeholder = 'Enter your password',
  error,
  hint,
  disabled,
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false)
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ')

  return (
    <Field id={id} label={label} error={error} hint={hint} required>
      <div className="relative">
        <Input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          className="pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
<<<<<<< HEAD
          className="absolute inset-y-0 right-1.5 my-auto flex h-7 w-7 items-center justify-center rounded-[0.375rem] text-[var(--muted)] transition-colors hover:bg-[var(--soft-beige)] hover:text-[var(--charcoal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
=======
          className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:bg-[rgba(75,47,31,0.06)] hover:text-[var(--espresso)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
>>>>>>> b141025564dd3364106212a52ca5484ec458a43d
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  )
}

export default PasswordField
