import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAdjacentImagePreload } from '@/hooks/useAdjacentImagePreload'

const ease = [0.25, 0.1, 0.25, 1]
const AUTOPLAY_MS = 3500
const SWIPE_THRESHOLD = 48
const getSlideSrc = (img) => img?.src

const SLIDE_HEIGHT = {
  service: 'h-[240px] sm:h-[320px] lg:h-[420px]',
  home: 'h-[270px] sm:h-[400px] lg:h-[550px]',
}

export function ServiceShowcaseCarousel({
  images,
  className,
  size = 'service',
  showCaption = true,
}) {
  const [index, setIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [paused, setPaused] = useState(false)
  const touchStartX = useRef(null)
  const lightboxOpen = lightboxIndex !== null
  const count = images.length

  useAdjacentImagePreload(index, images, getSlideSrc)
  useAdjacentImagePreload(lightboxOpen ? lightboxIndex : null, images, getSlideSrc)

  const goTo = useCallback(
    (next) => {
      if (!count) return
      setIndex(((next % count) + count) % count)
    },
    [count],
  )

  const goNext = useCallback(() => goTo(index + 1), [goTo, index])
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index])

  const openLightbox = useCallback(() => setLightboxIndex(index), [index])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goPrevLightbox = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i - 1 + count) % count))
  }, [count])

  const goNextLightbox = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % count))
  }, [count])

  useEffect(() => {
    if (!count || count < 2 || paused || lightboxOpen) return
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, AUTOPLAY_MS)
    return () => window.clearInterval(timer)
  }, [count, paused, lightboxOpen])

  useEffect(() => {
    if (!lightboxOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') goPrevLightbox()
      if (e.key === 'ArrowRight') goNextLightbox()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightboxOpen, closeLightbox, goPrevLightbox, goNextLightbox])

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null
  }

  const onTouchEnd = (e) => {
    const start = touchStartX.current
    const end = e.changedTouches[0]?.clientX
    if (start == null || end == null) return
    const delta = end - start
    if (Math.abs(delta) < SWIPE_THRESHOLD) return
    if (delta < 0) goNext()
    else goPrev()
    touchStartX.current = null
  }

  if (!count) return null

  const current = images[index]
  const caption = current.caption || current.title || current.alt

  return (
    <div
      className={cn('relative mx-auto max-w-5xl', className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative overflow-hidden rounded-card border border-border bg-white shadow-card"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          onClick={openLightbox}
          className="group relative block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Ampliar imagen del carrusel"
        >
          <div
            className={cn(
              'relative w-full overflow-hidden bg-surface',
              SLIDE_HEIGHT[size] ?? SLIDE_HEIGHT.service,
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id ?? current.src}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.4, ease }}
                className="h-full w-full"
              >
                <SmartImage
                  src={current.src}
                  webpSrc={current.webpSrc}
                  alt={current.alt}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-md border border-border/80 bg-white/95 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </button>

        {showCaption && caption ? (
          <p className="border-t border-border px-4 py-3 text-sm text-ink-muted">{caption}</p>
        ) : null}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-border/80 bg-white/95 text-ink shadow-sm transition-colors hover:bg-white"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-border/80 bg-white/95 text-ink shadow-sm transition-colors hover:bg-white"
              aria-label="Imagen siguiente"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div
          className="mt-2 flex justify-center gap-2"
          role="tablist"
          aria-label="Indicadores del carrusel"
        >
          {images.map((img, i) => (
            <button
              key={img.id ?? img.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Ir a imagen ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                i === index ? 'w-8 bg-ink' : 'w-2.5 bg-border hover:bg-ink/30',
              )}
            />
          ))}
        </div>
      ) : null}

      <AnimatePresence>
        {lightboxOpen && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Vista ampliada"
            onClick={closeLightbox}
          >
            <button
              type="button"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Cerrar"
              onClick={closeLightbox}
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {count > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                  aria-label="Imagen anterior"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrevLightbox()
                  }}
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                  aria-label="Imagen siguiente"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNextLightbox()
                  }}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </>
            ) : null}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease }}
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-card"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartImage
                src={images[lightboxIndex].src}
                webpSrc={images[lightboxIndex].webpSrc}
                alt={images[lightboxIndex].alt}
                className="max-h-[85vh] w-full object-contain"
                loading="lazy"
                decoding="async"
              />
              {(images[lightboxIndex].caption ||
                images[lightboxIndex].title ||
                images[lightboxIndex].alt) && (
                <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/80 to-transparent px-4 py-3 text-sm text-white">
                  {images[lightboxIndex].caption ||
                    images[lightboxIndex].title ||
                    images[lightboxIndex].alt}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
