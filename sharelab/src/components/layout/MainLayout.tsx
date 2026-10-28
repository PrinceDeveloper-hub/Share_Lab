import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export interface MainLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

/**
 * Shared application shell. The public marketing pages use SiteLayout; this
 * wrapper remains available for authenticated views that need an optional
 * sidebar while reusing the same header and footer.
 */
export const MainLayout = ({ children, sidebar }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ivory)]">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {sidebar ? (
          <div className="page-shell grid gap-8 py-8 lg:grid-cols-[16rem_1fr]">
            <aside className="min-w-0">{sidebar}</aside>
            <div className="min-w-0">{children}</div>
          </div>
        ) : (
          children
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export default MainLayout
