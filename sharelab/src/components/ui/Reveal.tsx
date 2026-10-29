import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '../../lib/utils'

const EASE = [0.22, 1, 0.36, 1] as const

export interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}

export const Reveal = ({
  children,
  className,
  delay = 0,
  y = 14,
}: RevealProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.45,
        delay,
        ease: EASE,
      }}
    >
      {children}
    </motion.div>
  )
}

export interface StaggerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export const Stagger = ({ children, className, delay = 0 }: StaggerProps) => {
  const shouldReduceMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      className={cn(className)}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: shouldReduceMotion ? 0 : 0.06,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const shouldReduceMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      className={cn(className)}
      variants={{
        hidden: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: shouldReduceMotion ? 0 : 0.4, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export const PageFade = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const shouldReduceMotion = Boolean(useReducedMotion())

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
