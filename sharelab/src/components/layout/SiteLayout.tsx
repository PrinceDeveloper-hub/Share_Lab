import { motion, useReducedMotion } from 'framer-motion'
import { useRouterState } from '@tanstack/react-router'
import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export interface SiteLayoutProps {
  children: React.ReactNode
}

export const SiteLayout = ({ children }: SiteLayoutProps) => {
  const reduceMotion = Boolean(useReducedMotion())
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <div className="flex min-h-screen flex-col bg-(--ivory)">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <motion.main
        id="main-content"
        key={pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 12, rotateX: 0.35 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.32,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{ transformPerspective: 1400 }}
        className="flex-1"
      >
        {children}
      </motion.main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
