import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SmartImage } from '@/components/ui/SmartImage'

const AUTOPLAY_MS = 2800
const SWIPE_THRESHOLD = 48
const GAP_PX = 16
const TRANSITION_MS = 500

const LOGO_WIDTH = 200
const LOGO_HEIGHT = 96

function visibleCountForWidth(width) {
  if (width >= 1024) return 5
  if (width >= 640) return 3
  return 2
}

function BrandSlide({ brand, slideWidth }) {
  const imageClass = cn(
    'h-16 w-auto max-w-[90%] object-contain object-center',
    'transition-[filter] duration-300',
    'md:h-20 lg:h-24',
  )

  const image = brand.isSvg ? (
    <img
      src={brand.src}
      alt={brand.alt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={imageClass}
      loading="lazy"
      decoding="async"
    />
  ) : (
    <SmartImage
      src={brand.src}
      webpSrc={brand.webpSrc}
      alt={brand.alt}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      className={imageClass}
      loading="lazy"
      decoding="async"
    />
  )

  const card = (
    <div
      className={cn(
        'group flex h-[120px] items-center justify-center rounded-lg border border-border/80 bg-white px-3',
        'shadow-[0_1px_3px_rgba(47,47,47,0.04)] transition-[filter,box-shadow] duration-300',
        'hover:shadow-[0_4px_16px_rgba(47,47,47,0.08)]',
        'md:h-[130px] lg:h-[140px]',
      )}
      style={{ width: slideWidth || undefined }}
    >
      <div className="flex h-full w-full items-center justify-center grayscale transition-[filter] duration-300 group-hover:grayscale-0">
        {image}
      </div>
    </div>
  )

  if (brand.website) {
    return (
      <a
        href={brand.website}
        target="_blank"
        rel="noopener noreferrer"
        className="block shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={`${brand.name} — sitio web`}
      >
        {card}
      </a>
    )
  }

  return <div className="shrink-0">{card}</div>
}

export function BrandLogoCarousel({ brands, className }) {
  const containerRef = useRef(null)
  const touchStartX = useRef(null)
  const [paused, setPaused] = useState(false)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const [visibleCount, setVisibleCount] = useState(5)
  const [slideWidth, setSlideWidth] = useState(0)

  const count = brands.length
  const extendedBrands = useMemo(() => {
    if (!count) return []
    return [...brands, ...brands, ...brands]
  }, [brands, count])

  const [position, setPosition] = useState(count)

  useEffect(() => {
    setPosition(count)
  }, [count])

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const nextVisible = visibleCountForWidth(container.offsetWidth)
    const width = container.offsetWidth
    const nextSlide =
      width > 0
        ? (width - GAP_PX * Math.max(0, nextVisible - 1)) / nextVisible
        : 0
    setVisibleCount(nextVisible)
    setSlideWidth(nextSlide)
  }, [])

  useEffect(() => {
    measure()
    const container = containerRef.current
    if (!container) return undefined
    const observer = new ResizeObserver(() => measure())
    observer.observe(container)
    return () => observer.disconnect()
  }, [measure])

  const activeIndex = count ? ((position % count) + count) % count : 0
  const step = slideWidth + GAP_PX
  const translateX = step ? -position * step : 0

  const goNext = useCallback(() => {
    if (!count) return
    setTransitionEnabled(true)
    setPosition((p) => p + 1)
  }, [count])

  const goPrev = useCallback(() => {
    if (!count) return
    setTransitionEnabled(true)
    setPosition((p) => p - 1)
  }, [count])

  const goTo = useCallback(
    (index) => {
      if (!count) return
      setTransitionEnabled(true)
      const base = Math.floor(position / count) * count
      setPosition(base + index)
    },
    [count, position],
  )

  const handleTransitionEnd = useCallback(() => {
    if (!count) return
    if (position >= count * 2) {
      setTransitionEnabled(false)
      setPosition((p) => p - count)
    } else if (position < count) {
      setTransitionEnabled(false)
      setPosition((p) => p + count)
    }
  }, [count, position])

  useEffect(() => {
    if (!count || count < 2 || paused) return undefined
    const timer = window.setInterval(() => {
      setTransitionEnabled(true)
      setPosition((p) => p + 1)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [count, paused])

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null
    setPaused(true)
  }

  const onTouchEnd = (e) => {
    const start = touchStartX.current
    const end = e.changedTouches[0]?.clientX
    if (start != null && end != null) {
      const delta = end - start
      if (Math.abs(delta) >= SWIPE_THRESHOLD) {
        if (delta < 0) goNext()
        else goPrev()
      }
    }
    touchStartX.current = null
    setPaused(false)
  }

  if (!count) return null

  const canNavigate = count > visibleCount

  const navButtonClass = cn(
    'absolute top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center',
    'h-10 w-10 rounded-full bg-ink text-white shadow-md transition-opacity',
    'hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
    'sm:flex lg:h-11 lg:w-11',
  )

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Marcas que confían en nosotros"
    >
      <div className="relative">
        {canNavigate ? (
          <button
            type="button"
            onClick={goPrev}
            className={cn(
              navButtonClass,
              '-left-4 md:-left-8 lg:-left-14',
            )}
            aria-label="Marca anterior"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
          </button>
        ) : null}

        <div
          ref={containerRef}
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchCancel={() => setPaused(false)}
        >
          <div
            className="flex"
            style={{
              gap: GAP_PX,
              transform: `translateX(${translateX}px)`,
              transition: transitionEnabled
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.25, 0.1, 0.25, 1)`
                : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedBrands.map((brand, index) => (
              <BrandSlide
                key={`${brand.id}-${index}`}
                brand={brand}
                slideWidth={slideWidth}
              />
            ))}
          </div>
        </div>

        {canNavigate ? (
          <button
            type="button"
            onClick={goNext}
            className={cn(
              navButtonClass,
              '-right-4 md:-right-8 lg:-right-14',
            )}
            aria-label="Siguiente marca"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Posición del carrusel">
            {brands.map((brand, index) => (
              <button
                key={brand.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`Ir a ${brand.name}`}
                onClick={() => goTo(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-colors duration-300',
                  index === activeIndex ? 'bg-ink' : 'bg-border hover:bg-ink-subtle',
                )}
              />
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-ink-subtle">
            <Pause className="h-3.5 w-3.5" aria-hidden />
            {paused ? 'Pausado' : 'Desliza automáticamente'}
          </p>
        </div>
      ) : null}
    </div>
  )
}
