import { useRef } from 'react'
import type { ReactNode } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { cn } from '../../lib/utils'

type TiltTag = 'div' | 'article' | 'section' | 'li'

const motionTags = {
  div: motion.div,
  article: motion.article,
  section: motion.section,
  li: motion.li,
} as const

export interface TiltCardProps {
  children: ReactNode
  /** Polymorphic render target — the same behaviour works for cards, list items and sections. */
  as?: TiltTag
  className?: string
  /** Maximum rotation in degrees. */
  intensity?: number
  /** Lift applied on hover, in pixels. */
  lift?: number
}

/**
 * Pointer-reactive 3D card. Motion is skipped entirely for reduced-motion and
 * coarse pointers, so touch layouts stay flat and stable.
 */
export const TiltCard = ({
  children,
  as = 'div',
  className,
  intensity = 5,
  lift = 4,
}: TiltCardProps) => {
  const reduceMotion = Boolean(useReducedMotion())
  const ref = useRef<HTMLElement | null>(null)

  const pointerX = useMotionValue(0)
  const pointerY = useMotionValue(0)

  const spring = { stiffness: 220, damping: 24, mass: 0.6 }
  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [intensity, -intensity]),
    spring,
  )
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-intensity, intensity]),
    spring,
  )

  const Component = motionTags[as]

  return (
    <Component
      ref={ref as never}
      onPointerMove={(event) => {
        if (reduceMotion || event.pointerType !== 'mouse') return
        const rect = event.currentTarget.getBoundingClientRect()
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5)
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5)
      }}
      onPointerLeave={() => {
        pointerX.set(0)
        pointerY.set(0)
      }}
      whileHover={reduceMotion ? undefined : { y: -lift }}
      whileTap={reduceMotion ? undefined : { scale: 0.99 }}
      transition={{ type: 'spring', ...spring }}
      style={
        reduceMotion
          ? undefined
          : {
              rotateX,
              rotateY,
              transformPerspective: 1200,
              transformStyle: 'preserve-3d',
            }
      }
      className={cn('will-change-transform', className)}
    >
      {children}
    </Component>
  )
}

export default TiltCard
