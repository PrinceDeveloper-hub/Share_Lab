import { forwardRef } from 'react'
import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'

const controlStyles =
  'w-full rounded-[0.625rem] border border-[var(--border-subtle)] bg-[var(--cream)] px-3.5 text-sm text-[var(--charcoal)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] outline-none transition-[border-color,box-shadow] placeholder:text-[rgba(113,104,95,0.72)] focus:border-[rgba(81,53,34,0.5)] focus:ring-4 focus:ring-[rgba(81,53,34,0.08)] disabled:bg-[var(--soft-beige)] disabled:text-[var(--muted)] aria-[invalid=true]:border-[rgba(164,69,59,0.55)] aria-[invalid=true]:bg-[rgba(164,69,59,0.03)]'

export interface FieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  optional?: boolean
  className?: string
  children: ReactNode
}

export const Field = ({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: FieldProps) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <label
      htmlFor={id}
      className="flex items-baseline justify-between gap-2 text-[0.8125rem] font-semibold text-[var(--charcoal)]"
    >
      <span>
        {label}
        {required ? (
          <span className="ml-1 text-[var(--error)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>
      {optional ? (
        <span className="text-[0.7rem] font-normal text-[var(--muted)]">
          Optional
        </span>
      ) : null}
    </label>
    {children}
    {hint ? (
      <p
        id={`${id}-hint`}
        className="text-[0.75rem] leading-relaxed text-[var(--muted)]"
      >
        {hint}
      </p>
    ) : null}
    {error ? (
      <p
        id={`${id}-error`}
        className="flex items-start gap-1.5 text-[0.75rem] font-medium leading-relaxed text-[var(--error)]"
      >
        <AlertCircle
          className="mt-0.5 h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        />
        {error}
      </p>
    ) : null}
  </div>
)

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(controlStyles, 'h-10', className)}
    {...props}
  />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(controlStyles, 'min-h-[5.5rem] resize-y py-2.5', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(controlStyles, 'h-10 cursor-pointer pr-8', className)}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export const inputStyles = controlStyles
