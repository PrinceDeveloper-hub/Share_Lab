import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { AuthField } from './AuthField'

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

  return (
    <AuthField
      id={id}
      label={label}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete={autoComplete}
      placeholder={placeholder}
      error={error}
      hint={hint}
      disabled={disabled}
      icon={Lock}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-(--muted) transition-colors hover:bg-[rgba(75,47,31,0.06)] hover:text-(--espresso) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring)"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? (
            <EyeOff className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          ) : (
            <Eye className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
          )}
        </button>
      }
    />
  )
}
