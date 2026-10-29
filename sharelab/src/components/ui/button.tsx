import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'
import { Slot } from './slot'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.65rem] text-sm font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2 focus-visible:ring-offset-(--ivory) disabled:pointer-events-none disabled:opacity-50 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-(--espresso) text-white shadow-[0_1px_2px_rgba(34,24,18,0.2)] hover:bg-(--espresso-hover)',
        secondary:
          'border border-(--border-subtle) bg-(--surface) text-(--espresso) hover:border-(--border-strong) hover:bg-(--surface-sunken)',
        outline:
          'border border-(--border-strong) bg-transparent text-(--espresso) hover:border-(--espresso) hover:bg-(--espresso) hover:text-white',
        ghost: 'text-(--muted-strong) hover:bg-(--surface-sunken) hover:text-(--espresso)',
        inverse:
          'bg-(--cream) text-(--espresso) shadow-[0_1px_2px_rgba(0,0,0,0.18)] hover:bg-white',
        danger: 'bg-(--error) text-white hover:bg-[#963f34]',
        link: 'h-auto px-0 text-(--espresso) underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3 text-[0.8125rem]',
        lg: 'h-11 px-5 text-[0.9375rem]',
        icon: 'h-9 w-9',
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
