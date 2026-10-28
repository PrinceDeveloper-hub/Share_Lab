import { cn } from '@/lib/utils'

export interface NavBarProps {
  mobile?: boolean
  children?: React.ReactNode
  onMenuToggle?: () => void
  onClose?: () => void
}

export const NavBar = ({
  mobile,
  children,
  onMenuToggle,
  onClose,
}: NavBarProps) => {
  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/62 dark:bg-[rgba(48,34,25,0.8)] dark:border-white/40',
      mobile ? 'h-20' : 'h-16',
      'flex items-center justify-between px-6',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-espresso flex items-center justify-center">
          <svg className="w-5 h-5 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <span className="text-xl font-bold text-espresso">ShareLab</span>
      </div>

      {/* Desktop nav links */}
      {!mobile && (
        <div className="hidden md:block items-center gap-8">
          <a href="#resources" className="text-charcoal hover:text-espresso transition-colors">Resources</a>
          <a href="#how-it-works" className="text-charcoal hover:text-espresso transition-colors">How It Works</a>
          <a href="#about" className="text-charcoal hover:text-espresso transition-colors">About</a>
          <a href="#contact" className="text-charcoal hover:text-espresso transition-colors">Contact</a>
        </div>
      )}

      {/* Right side: search, avatar, notifications */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search 3D printers, oscilloscopes, camera rigs, rooms..."
            className="pl-10 pr-4 py-2 px-3 w-64 bg-softBeige dark:bg-[--deep-brown] border border-sand rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-espresso transition-colors"
          />
        </div>

        {/* Avatar dropdown */}
        <div className="relative group">
          <button
            aria-label="User menu"
            className="flex items-center gap-2 text-sm font-medium text-charcoal hover:text-espresso transition-colors"
          >
            <img
              src="/placeholder-avatar.png"
              alt="User"
              className="w-8 h-8 rounded-full object-cover"
            />
            <svg className="w-4 h-4 transform rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <ul
            aria-labelledby="user-menu"
            className="absolute right-0 mt-2 w-56 bg-cream rounded-md shadow-lg py-1 left-auto md:right-0 md:mt-0 z-10 dark:bg-[--deep-brown] start-0"
          >
            <li>
              <a href="#profile" className="block px-4 py-2 text-sm text-charcoal hover:bg-softBeige dark:hover:bg-[--deep-brown]">Profile</a>
            </li>
            <li>
              <a href="#settings" className="block px-4 py-2 text-sm text-charcoal hover:bg-softBeige dark:hover:bg-[--deep-brown]">Settings</a>
            </li>
            <li>
              <button
                onClick={() => onMenuToggle?.()}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}