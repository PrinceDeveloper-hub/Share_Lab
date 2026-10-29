import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'text'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children: React.ReactNode
}

const Badge = ({ variant = 'default', size = 'default', className, children }: BadgeProps) => {
  const baseClasses = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium'

  const variantClasses = {
    default: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    destructive: 'bg-destructive-100 text-destructive-800',
    outline: 'border border-input bg-background',
    text: 'bg-transparent text-primary-600',
  }[variant]

  const sizeClasses = {
    default: '',
    sm: 'px-1.5 py-0.5',
    lg: 'px-3 py-1',
    icon: 'px-2 py-1',
  }[size]

  return (
    <span className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}>
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps }