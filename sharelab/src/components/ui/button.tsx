import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Slot } from './slot'

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-[0.625rem] text-sm font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ivory)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--espresso)] text-white shadow-[0_1px_2px_rgba(43,29,20,0.18)] hover:bg-[#5d3d27] active:translate-y-px',
        secondary:
          'border border-[var(--border-subtle)] bg-[var(--cream)] text-[var(--charcoal)] shadow-[var(--shadow-xs)] hover:border-[var(--border-strong)] hover:bg-white',
        outline:
          'border border-[rgba(81,53,34,0.32)] bg-transparent text-[var(--espresso)] hover:border-[var(--espresso)] hover:bg-[rgba(81,53,34,0.05)]',
        ghost:
          'text-[var(--charcoal)] hover:bg-[rgba(81,53,34,0.065)] hover:text-[var(--espresso)]',
        inverse:
          'bg-[var(--cream)] text-[var(--espresso)] shadow-[0_1px_2px_rgba(43,29,20,0.2)] hover:bg-white',
        danger:
          'border border-[rgba(164,69,59,0.28)] bg-[var(--error-soft)] text-[var(--error)] hover:border-[var(--error)] hover:bg-[rgba(164,69,59,0.12)]',
        link: 'h-auto rounded-none px-0 text-[var(--espresso)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-[0.8125rem]',
        lg: 'h-11 px-5 text-[0.9375rem]',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...(asChild ? {} : { type: type ?? 'button' })}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
