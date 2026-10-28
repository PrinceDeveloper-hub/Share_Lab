import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Slot } from './slot'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ivory)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--espresso)] text-white shadow-[0_14px_34px_-18px_rgba(75,47,31,0.7)] hover:-translate-y-0.5 hover:bg-[#5a3d2c] hover:shadow-[0_18px_40px_-18px_rgba(75,47,31,0.75)]',
        secondary:
          'border border-[rgba(82,59,45,0.16)] bg-[rgba(255,252,247,0.82)] text-[var(--espresso)] backdrop-blur-lg hover:-translate-y-0.5 hover:bg-white',
        outline:
          'border border-[rgba(75,47,31,0.32)] bg-transparent text-[var(--espresso)] hover:border-[var(--espresso)] hover:bg-[var(--espresso)] hover:text-white',
        ghost: 'text-[var(--charcoal)] hover:bg-[rgba(75,47,31,0.07)]',
        inverse:
          'bg-[var(--cream)] text-[var(--espresso)] shadow-[0_16px_34px_-22px_rgba(0,0,0,0.55)] hover:-translate-y-0.5 hover:bg-white',
        link: 'text-[var(--espresso)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-12 px-7 text-[0.95rem]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
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
