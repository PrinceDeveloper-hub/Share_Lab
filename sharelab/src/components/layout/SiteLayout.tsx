import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export interface SiteLayoutProps {
  children: React.ReactNode
}

export const SiteLayout = ({ children }: SiteLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
