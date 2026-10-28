import { useEffect, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, FlaskConical } from 'lucide-react'
import { heroSlides } from '../../config/heroSlides'
import type { HeroSlide } from '../../config/heroSlides'
import { cn } from '../../lib/utils'

const AUTOPLAY_MS = 5000

export interface HeroCarouselProps {
  slides?: HeroSlide[]
  className?: string
}

export const HeroCarousel = ({ slides, className }: HeroCarouselProps) => {
  const configuredSlides = useMemo(() => {
    const source = slides ?? heroSlides
    return source.filter((slide) => slide.src.trim().length > 0)
  }, [slides])

  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplayKey, setAutoplayKey] = useState(0)
  const [hoverPaused, setHoverPaused] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const shouldReduceMotion = Boolean(useReducedMotion())

  useEffect(() => {
    if (configuredSlides.length === 0) {
      setActiveIndex(0)
      return
    }

    if (activeIndex >= configuredSlides.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, configuredSlides.length])

  useEffect(() => {
    const updateVisibility = () => setDocumentVisible(document.visibilityState === 'visible')
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)

    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  const paused = hoverPaused || focusPaused

  useEffect(() => {
    if (
      shouldReduceMotion ||
      paused ||
      !documentVisible ||
      configuredSlides.length <= 1
    ) {
      return
    }

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % configuredSlides.length)
    }, AUTOPLAY_MS)

    return () => window.clearTimeout(timeout)
  }, [
    activeIndex,
    autoplayKey,
    configuredSlides.length,
    documentVisible,
    paused,
    shouldReduceMotion,
  ])

  const activeSlide = configuredSlides[activeIndex]

  const goToSlide = (index: number) => {
    if (configuredSlides.length === 0) return

    setActiveIndex(((index % configuredSlides.length) + configuredSlides.length) % configuredSlides.length)
    setAutoplayKey((key) => key + 1)
  }

  const showPrevious = () => goToSlide(activeIndex - 1)
  const showNext = () => goToSlide(activeIndex + 1)

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showPrevious()
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      showNext()
    }
  }

  if (configuredSlides.length === 0) {
    return (
      <div
        role="region"
        aria-label="Featured campus resources"
        className={cn(
          'flex min-h-[420px] items-center justify-center rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--cream)] p-8 text-center shadow-[var(--shadow-md)]',
          className,
        )}
      >
        <div>
          <FlaskConical className="mx-auto h-9 w-9 text-[var(--taupe)]" aria-hidden="true" />
          <p className="mt-4 font-semibold text-[var(--charcoal)]">Hero images are being prepared</p>
          <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
            Add a slide to <code>src/config/heroSlides.ts</code> to populate this gallery.
          </p>
        </div>
      </div>
    )
  }

  const slideTransition = {
    duration: shouldReduceMotion ? 0 : 0.8,
    ease: 'easeInOut' as const,
  }

  const contentTransition = {
    duration: shouldReduceMotion ? 0 : 0.45,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  const hasContent = Boolean(activeSlide.badge || activeSlide.title || activeSlide.description)

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured campus resources"
      className={cn('relative mx-auto w-full max-w-xl lg:max-w-none', className)}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={() => setFocusPaused(false)}
      onKeyDown={handleKeyDown}
    >
      <div
        aria-hidden="true"
        className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(198,165,138,0.3),transparent_70%)] blur-2xl"
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(255,255,255,0.65)] bg-[rgba(255,252,247,0.6)] p-2.5 shadow-[var(--shadow-lg)] backdrop-blur-xl">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[1.55rem] bg-[var(--deep-brown)] sm:aspect-[4/3] lg:aspect-[4/5]">
          {configuredSlides.map((slide, index) => {
            const isActive = index === activeIndex
            const imageFailed = failedImages[slide.id]

            return (
              <motion.div
                key={slide.id}
                className={cn(
                  'absolute inset-0',
                  isActive ? 'pointer-events-auto' : 'pointer-events-none',
                )}
                initial={false}
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={slideTransition}
                aria-hidden={!isActive}
              >
                {imageFailed ? (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,#4b2f1f,#241a16)] px-6 text-center">
                    <FlaskConical className="h-9 w-9 text-[rgba(255,249,241,0.6)]" aria-hidden="true" />
                    <p className="text-sm font-semibold text-[var(--cream)]">Image unavailable</p>
                    <p className="max-w-xs text-xs leading-relaxed text-[rgba(255,249,241,0.58)]">
                      Add or replace the file at{' '}
                      <code className="break-all text-[rgba(255,249,241,0.78)]">{slide.src}</code>.
                    </p>
                  </div>
                ) : (
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    width={1600}
                    height={1200}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    className="h-full w-full object-cover"
                    style={{ objectPosition: slide.objectPosition ?? 'center' }}
                    onError={() =>
                      setFailedImages((current) => ({
                        ...current,
                        [slide.id]: true,
                      }))
                    }
                  />
                )}

                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,17,13,0.34)_0%,rgba(24,17,13,0.02)_38%,rgba(24,17,13,0.72)_100%)]" />
              </motion.div>
            )
          })}

          <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3 sm:inset-x-4 sm:top-4">
            <div
              className="flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.24)] bg-[rgba(24,17,13,0.28)] px-2 py-1 backdrop-blur-md"
              aria-label="Choose a hero slide"
            >
              {configuredSlides.map((slide, index) => {
                const isActive = index === activeIndex

                return (
                  <button
                    key={slide.id}
                    type="button"
                    className="flex h-8 min-w-8 items-center justify-center rounded-full px-1.5 transition-colors hover:bg-[rgba(255,255,255,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                    aria-label={`Show slide ${index + 1} of ${configuredSlides.length}: ${
                      slide.title ?? slide.alt
                    }`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => goToSlide(index)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'block h-1.5 rounded-full transition-all duration-300',
                        isActive
                          ? 'w-6 bg-[var(--cream)]'
                          : 'w-1.5 bg-[rgba(255,249,241,0.55)] hover:bg-[rgba(255,249,241,0.85)]',
                      )}
                    />
                  </button>
                )
              })}
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={showPrevious}
                aria-label="Previous slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(24,17,13,0.28)] text-[var(--cream)] backdrop-blur-md transition-colors hover:bg-[rgba(24,17,13,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next slide"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(255,255,255,0.28)] bg-[rgba(24,17,13,0.28)] text-[var(--cream)] backdrop-blur-md transition-colors hover:bg-[rgba(24,17,13,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {hasContent ? (
            <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-4 sm:bottom-4">
              <motion.div
                key={activeSlide.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={contentTransition}
                className="rounded-2xl border border-[rgba(255,255,255,0.52)] bg-[rgba(255,249,241,0.9)] p-4 shadow-[var(--shadow-md)] backdrop-blur-xl sm:p-5"
              >
                {activeSlide.badge ? (
                  <span className="inline-flex items-center rounded-full bg-[rgba(75,47,31,0.08)] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--espresso)]">
                    {activeSlide.badge}
                  </span>
                ) : null}

                {activeSlide.title ? (
                  <h2 className="mt-2 text-lg font-semibold leading-tight text-[var(--charcoal)] sm:text-xl">
                    {activeSlide.title}
                  </h2>
                ) : null}

                {activeSlide.description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                    {activeSlide.description}
                  </p>
                ) : null}

                {activeSlide.href ? (
                  <a
                    href={activeSlide.href}
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--espresso)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
                  >
                    Learn more
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : null}
              </motion.div>
            </div>
          ) : null}

          <p className="sr-only" aria-live={paused ? 'polite' : 'off'} aria-atomic="true">
            Slide {activeIndex + 1} of {configuredSlides.length}: {activeSlide.alt}
          </p>
        </div>
      </div>
    </div>
  )
}

export default HeroCarousel
