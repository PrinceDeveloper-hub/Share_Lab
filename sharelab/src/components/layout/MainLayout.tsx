import NavBar from '../navigation/NavBar'
import Sidebar from '../layout/Sidebar'
import { useState } from 'react'

export interface MainLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
}

export const MainLayout = ({
  children,
  sidebar,
}: MainLayoutProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen bg-ivory dark:bg-deepBrown">
      <NavBar />

      <div className="flex min-h-screen">
        {sidebar || (
          <Sidebar
            onMobileToggle={() => setMobileNavOpen(true)}
            onClose={() => setMobileNavOpen(false)}
          />
        )}

        <div className="flex-1 overflow-y-auto">
          {mobileNavOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-cream dark:bg-darkBrown rounded-lg p-6 w-80 transform translate-x-full md:translate-x-0 shadow-xl" onClick={setMobileNavOpen}>
                <NavBar mobile={true} onClose={() => setMobileNavOpen(false)} />
                {/* Mobile sidebar content would go here */}
              </div>
            </div>
          )}

          <div className="pt-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}