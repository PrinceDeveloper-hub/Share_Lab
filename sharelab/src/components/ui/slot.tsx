import * as React from 'react'
import { cn } from '../../lib/utils'

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode
}

/**
 * Minimal slot implementation so Button can render a router Link (or any
 * single child) while keeping one visual style. We intentionally avoid pulling
 * in another dependency for this.
 */
export const Slot = React.forwardRef<HTMLElement, SlotProps>(function Slot(
  { children, className, ...props },
  forwardedRef,
) {
  if (!React.isValidElement(children)) {
    return null
  }

  const childProps = children.props as React.HTMLAttributes<HTMLElement> & {
    className?: string
  }

  return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    ...props,
    ...childProps,
    className: cn(className, childProps.className),
    ref: forwardedRef,
  })
})
