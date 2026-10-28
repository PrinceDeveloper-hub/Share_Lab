import { GlassPanel } from '../../components/glass/GlassPanel'
import { cn } from '../../lib/utils'

export const Home = () => {
  return (
    <GlassPanel>
      <section className="min-h-screen p-6 md:p-12">
        {/* Header */}
        <header className="mb-12">
          <nav className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-espresso flex items-center justify-center">
                <svg className="w-5 h-5 text-cream" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-espresso">ShareLab</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#resources" className="text-charcoal hover:text-espresso transition-colors text-sm">Resources</a>
              <a href="#how-it-works" className="text-charcoal hover:text-espresso transition-colors text-sm">How It Works</a>
              <a href="#about" className="text-charcoal hover:text-espresso transition-colors text-sm">About</a>
            </div>
          </nav>

          {/* Hero CTA */}
          <div className="mt-6">
            <button className="bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[#5a3d2c] transition-colors">
              Explore Resources &rarr;
            </button>
            <button className="bg-transparent border-2 border-espresso text-espresso px-6 py-3 rounded-full font-medium hover:bg-espresso hover:text-white transition-colors mr-4">
              How It Works
            </button>
          </div>
        </header>

        {/* Hero section */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 items-center max-w-7xl mx-auto">
          {/* Left hero content */}
          <div>
            <p className="text-[--taupe] text-sm font-medium uppercase tracking-wider mb-4">
              CAMPUS RESOURCE COMMONS
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-charcoal mb-6">
              Unlock idle labs &amp; equipment, safely and fairly.
            </h1>
            <p className="text-lg text-muted mb-8 max-w-lg">
              "Book certified equipment from university departments, makerspaces, and research facilities. Every booking supports verified credentials, fair weekly hour limits, and transparent records."
            </p>
            <div className="flex gap-3">
              <button className="bg-espresso text-white px-6 py-3 rounded-full font-medium hover:bg-[#5a3d2c] transition-colors">
                Explore Resources &rarr;
              </button>
              <button className="bg-transparent border-2 border-espresso text-espresso px-6 py-3 rounded-full font-medium hover:bg-espresso hover:text-white transition-colors">
                How It Works
              </button>
            </div>
          </div>

          {/* Right: microscope image */}
          <div className="order-2 md:order-1 justify-center">
            <GlassPanel className="p-6 md:p-8 rounded-[20px] max-w-md">
              <img
                src="/microscope-hero.jpg"
                alt="Researcher using a microscope in a laboratory setting"
                className="w-full h-[300px] object-cover rounded-[12px] mb-4"
                style={{ filter: 'saturate(1.1)' }}
              />
              <p className="text-[--taupe] text-sm italic text-center line-through">
                "Better access. Bigger possibilities."
              </p>
            </GlassPanel>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-12 grid max-w-7xl mx-auto grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="6+ Active"
            subtitle="Certified Instruments"
            description="Certified and operational lab equipment available for booking across campus departments."
          />
          <FeatureCard
            title="100%" subtitle="Verified Operators"
            description="All operators must complete required training and credential verification before booking."
          />
          <FeatureCard
            title="Weekly" subtitle="Hour Caps"
            description="Fair distribution limits prevent overuse, ensuring equitable access for all campus users."
          />
          <FeatureCard
            title="Immutable" subtitle="Audit Trail"
            description="Every state change is recorded in an append-only audit trail for complete transparency."
          />
        </section>
      </section>
    </GlassPanel>
  )
}

interface FeatureCardProps {
  title: string
  subtitle: string
  description: string
}

const FeatureCard = ({ title, subtitle, description }: FeatureCardProps) => {
  return (
    <GlassPanel className="p-6 rounded-[16px] text-center">
      <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-lg bg-[--ivory]">
        {/* Icon would render here */}
      </div>
      <h3 className="text-xl font-semibold text-charcoal mb-1">{title}</h3>
      <p className="text-[--taupe] text-sm">{subtitle}</p>
      <p className="text-[--muted] text-xs mt-1">{description}</p>
    </GlassPanel>
  )
}

export default Home
