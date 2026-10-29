import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Pause,
  Play,
} from 'lucide-react'
import { heroSlides } from '../../config/heroSlides'
import type { HeroSlide } from '../../config/heroSlides'
import { cn } from '../../lib/utils'

const AUTOPLAY_MS = 6000

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
  const [userPaused, setUserPaused] = useState(false)
  const [documentVisible, setDocumentVisible] = useState(true)
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})
  const shouldReduceMotion = Boolean(useReducedMotion())
  const tiltX = useSpring(0, { stiffness: 180, damping: 24 })
  const tiltY = useSpring(0, { stiffness: 180, damping: 24 })
  const imageX = useSpring(0, { stiffness: 140, damping: 24 })
  const imageY = useSpring(0, { stiffness: 140, damping: 24 })
  const spotlightX = useMotionValue(50)
  const spotlightY = useMotionValue(50)
  const spotlight = useMotionTemplate`radial-gradient(circle at ${spotlightX}% ${spotlightY}%, rgba(255,255,255,0.2), transparent 34%)`

  const slideCount = configuredSlides.length

  useEffect(() => {
    if (slideCount === 0) {
      setActiveIndex(0)
      return
    }

    if (activeIndex >= slideCount) setActiveIndex(0)
  }, [activeIndex, slideCount])

  useEffect(() => {
    const updateVisibility = () =>
      setDocumentVisible(document.visibilityState === 'visible')
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)

    return () =>
      document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  const paused = hoverPaused || focusPaused || userPaused

  useEffect(() => {
    if (shouldReduceMotion || paused || !documentVisible || slideCount <= 1)
      return

    const timeout = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slideCount)
    }, AUTOPLAY_MS)

    return () => window.clearTimeout(timeout)
  }, [
    activeIndex,
    autoplayKey,
    slideCount,
    documentVisible,
    paused,
    shouldReduceMotion,
  ])

  const goToSlide = useCallback(
    (index: number) => {
      if (slideCount === 0) return

      setActiveIndex(((index % slideCount) + slideCount) % slideCount)
      setAutoplayKey((key) => key + 1)
    },
    [slideCount],
  )

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goToSlide(activeIndex - 1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goToSlide(activeIndex + 1)
    }
  }

  const handlePointerMove = (
    pointerEvent: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (pointerEvent.pointerType !== 'mouse' || shouldReduceMotion) return

    const bounds = pointerEvent.currentTarget.getBoundingClientRect()
    const x = (pointerEvent.clientX - bounds.left) / bounds.width
    const y = (pointerEvent.clientY - bounds.top) / bounds.height

    tiltX.set((0.5 - y) * 5)
    tiltY.set((x - 0.5) * 5)
    imageX.set((x - 0.5) * -8)
    imageY.set((y - 0.5) * -8)
    spotlightX.set(x * 100)
    spotlightY.set(y * 100)
  }

  const resetPointer = () => {
    tiltX.set(0)
    tiltY.set(0)
    imageX.set(0)
    imageY.set(0)
    spotlightX.set(50)
    spotlightY.set(50)
  }

  if (slideCount === 0) {
    return (
      <div
        role="region"
        aria-label="Featured campus resources"
        className={cn(
          'flex aspect-[4/5] max-h-136 items-center justify-center rounded-(--radius-lg) border border-(--border-subtle) bg-(--surface) p-8 text-center',
          className,
        )}
      >
        <div>
          <FlaskConical
            className="mx-auto h-8 w-8 text-(--taupe)"
            aria-hidden="true"
          />
          <p className="mt-4 text-sm font-semibold text-(--charcoal)">
            Hero images are being prepared
          </p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-(--muted)">
            Add a slide to <code>src/config/heroSlides.ts</code> to populate
            this gallery.
          </p>
        </div>
      </div>
    )
  }

  const currentIndex = activeIndex % slideCount
  const activeSlide = configuredSlides[currentIndex]
  const hasContent = Boolean(
    activeSlide.badge || activeSlide.title || activeSlide.description,
  )
  const fade = {
    duration: shouldReduceMotion ? 0 : 0.5,
    ease: [0.22, 1, 0.36, 1] as const,
  }

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured campus resources"
      className={cn('relative w-full [perspective:1200px]', className)}
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocusCapture={() => setFocusPaused(true)}
      onBlurCapture={() => setFocusPaused(false)}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      onKeyDown={handleKeyDown}
    >
      {/* Fixed media frame: identical size and ratio on every slide, so the
          hero and the page never shift while the carousel advances. */}
      <motion.div
        style={{
          rotateX: shouldReduceMotion ? 0 : tiltX,
          rotateY: shouldReduceMotion ? 0 : tiltY,
          transformStyle: 'preserve-3d',
        }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-(--radius-lg) border border-(--border-subtle) bg-(--deep-brown) shadow-[0_32px_70px_-30px_rgba(48,34,25,0.55)] sm:aspect-[16/11]"
      >
        {configuredSlides.map((slide, index) => {
          const isActive = index === currentIndex
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
              transition={fade}
              aria-hidden={!isActive}
            >
              {imageFailed ? (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(150deg,#2f2119,#1a120e)] px-6 text-center">
                  <div>
                    <FlaskConical
                      className="mx-auto h-8 w-8 text-[rgba(255,252,247,0.5)]"
                      aria-hidden="true"
                    />
                    <p className="mt-3 text-sm font-semibold text-(--cream)">
                      Image unavailable
                    </p>
                    <p className="mx-auto mt-1.5 max-w-60 text-xs leading-relaxed text-[rgba(255,252,247,0.55)]">
                      Replace the file at{' '}
                      <code className="break-all">{slide.src}</code>.
                    </p>
                  </div>
                </div>
              ) : (
                <motion.img
                  src={slide.src}
                  alt={slide.alt}
                  initial={false}
                  animate={{ scale: isActive ? 1.05 : 1.12 }}
                  transition={fade}
                  width={1200}
                  height={1500}
                  sizes="(min-width: 1024px) 44vw, (min-width: 640px) 90vw, 100vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="h-full w-full object-cover"
                  style={{
                    objectPosition: slide.objectPosition ?? 'center',
                    x: shouldReduceMotion ? 0 : imageX,
                    y: shouldReduceMotion ? 0 : imageY,
                  }}
                  onError={() =>
                    setFailedImages((current) => ({
                      ...current,
                      [slide.id]: true,
                    }))
                  }
                />
              )}

              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(26,18,14,0.22)_0%,rgba(26,18,14,0)_34%,rgba(26,18,14,0.68)_100%)]" />
            </motion.div>
          )
        })}

        {/* Slide controls */}
        {slideCount > 1 ? (
          <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5 sm:right-4 sm:top-4">
            {!shouldReduceMotion ? (
              <button
                type="button"
                onClick={() => setUserPaused((current) => !current)}
                aria-label={
                  userPaused ? 'Resume slide rotation' : 'Pause slide rotation'
                }
                aria-pressed={userPaused}
                className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-[rgba(255,252,247,0.22)] bg-[rgba(26,18,14,0.32)] text-(--cream) backdrop-blur-md transition-colors hover:bg-[rgba(26,18,14,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                {userPaused ? (
                  <Play className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Pause className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => goToSlide(currentIndex - 1)}
              aria-label="Previous slide"
              className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-[rgba(255,252,247,0.22)] bg-[rgba(26,18,14,0.32)] text-(--cream) backdrop-blur-md transition-colors hover:bg-[rgba(26,18,14,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(currentIndex + 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-[0.5rem] border border-[rgba(255,252,247,0.22)] bg-[rgba(26,18,14,0.32)] text-(--cream) backdrop-blur-md transition-colors hover:bg-[rgba(26,18,14,0.52)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}

        {/* Overlay caption */}
        {hasContent ? (
          <div className="absolute inset-x-3 bottom-3 z-20 sm:inset-x-4 sm:bottom-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeSlide.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
                }
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.28,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="rounded-(--radius-md) border border-[rgba(255,252,247,0.4)] bg-(--surface) p-4 backdrop-blur-xl sm:p-5"
              >
                {activeSlide.badge ? (
                  <span className="inline-flex items-center gap-1.5 text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-(--bronze-deep)">
                    <span
                      className="h-1 w-1 rounded-full bg-(--bronze)"
                      aria-hidden="true"
                    />
                    {activeSlide.badge}
                  </span>
                ) : null}

                {activeSlide.title ? (
                  <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug tracking-[-0.02em] text-(--charcoal)">
                    {activeSlide.title}
                  </h2>
                ) : null}

                {activeSlide.description ? (
                  <p className="mt-1 text-[0.8125rem] leading-relaxed text-(--muted)">
                    {activeSlide.description}
                  </p>
                ) : null}

                {activeSlide.href ? (
                  <a
                    href={activeSlide.href}
                    className="mt-2.5 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-(--espresso) underline decoration-transparent underline-offset-4 transition-colors hover:decoration-(--bronze)"
                  >
                    Learn more
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : null}

        {/* Autoplay progress */}
        {slideCount > 1 ? (
          <div className="absolute inset-x-0 bottom-0 z-20 h-[3px] bg-[rgba(255,252,247,0.16)]">
            <motion.div
              key={`${currentIndex}-${autoplayKey}-${paused}-${documentVisible}`}
              className="h-full origin-left bg-[rgba(255,252,247,0.85)]"
              initial={{ scaleX: 0 }}
              animate={{
                scaleX:
                  shouldReduceMotion || paused || !documentVisible ? 0 : 1,
              }}
              transition={{
                duration:
                  shouldReduceMotion || paused || !documentVisible
                    ? 0
                    : AUTOPLAY_MS / 1000,
                ease: 'linear',
              }}
            />
          </div>
        ) : null}

        <p
          className="sr-only"
          aria-live={paused ? 'polite' : 'off'}
          aria-atomic="true"
        >
          Slide {currentIndex + 1} of {slideCount}: {activeSlide.alt}
        </p>
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 rounded-(--radius-lg)"
          style={{
            background: spotlight,
            opacity: shouldReduceMotion ? 0 : 1,
          }}
        />
      </motion.div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label="Choose a hero slide"
        >
          {configuredSlides.map((slide, index) => {
            const isActive = index === currentIndex

            return (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Show slide ${index + 1} of ${slideCount}: ${slide.title ?? slide.alt}`}
                onClick={() => goToSlide(index)}
                className="group flex h-6 items-center px-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--ring) focus-visible:ring-offset-2"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'block h-[3px] rounded-full transition-[width,background-color] duration-300',
                    isActive
                      ? 'w-8 bg-(--espresso)'
                      : 'w-4 bg-[rgba(81,53,34,0.22)] group-hover:bg-[rgba(81,53,34,0.4)]',
                  )}
                />
              </button>
            )
          })}
        </div>
        <span className="font-mono text-[0.6875rem] tracking-[0.04em] text-(--muted)">
          {String(currentIndex + 1).padStart(2, '0')} /{' '}
          {String(slideCount).padStart(2, '0')}
        </span>
      </div>
    </div>
  )
}

export default HeroCarousel
