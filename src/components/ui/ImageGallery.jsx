import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SmartImage } from '@/components/ui/SmartImage'
import {
  LIGHTBOX_CAPTION_CLASS,
  LIGHTBOX_FRAME_CLASS,
  LIGHTBOX_IMAGE_CLASS,
} from '@/components/ui/lightboxLayout'
import { useAdjacentImagePreload } from '@/hooks/useAdjacentImagePreload'

const ease = [0.25, 0.1, 0.25, 1]
const GALLERY_HEIGHT = 'h-[240px] sm:h-[360px] lg:h-[480px]'
const getGallerySrc = (img) => img?.src

export function ImageGallery({ images, className }) {
  const [selected, setSelected] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lightboxOpen = lightboxIndex !== null

  useAdjacentImagePreload(lightboxOpen ? lightboxIndex : null, images, getGallerySrc)

  const current = images[selected]

  const openLightbox = useCallback(() => setLightboxIndex(selected), [selected])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goPrevLightbox = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + images.length) % images.length,
    )
  }, [images.length])

  const goNextLightbox = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % images.length,
    )
  }, [images.length])

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

  if (!images.length) return null

  return (
    <div className={cn('mx-auto max-w-5xl', className)}>
      <div className="relative">
        <button
          type="button"
          onClick={openLightbox}
          className="group relative block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Ampliar imagen"
        >
          <div className={cn('flex w-full items-center justify-center', GALLERY_HEIGHT)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.src}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease }}
                className="h-full w-full"
              >
                <SmartImage
                  src={current.src}
                  webpSrc={current.webpSrc}
                  alt={current.alt || ''}
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
        {current.alt && (
          <p className="mt-3 text-center text-sm text-ink-muted">
            {current.alt}
          </p>
        )}
      </div>

      {images.length > 1 && (
        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Miniaturas de galería"
        >
          {images.map((img, index) => {
            const isActive = selected === index
            return (
              <button
                key={img.src}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={img.alt || `Imagen ${index + 1}`}
                onClick={() => setSelected(index)}
                className={cn(
                  'relative flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border-2 bg-surface transition-all duration-300',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  isActive
                    ? 'border-ink opacity-100 ring-1 ring-ink/15'
                    : 'border-border opacity-60 hover:border-ink/25 hover:opacity-100',
                )}
              >
                <SmartImage
                  src={img.src}
                  webpSrc={img.webpSrc}
                  alt=""
                  className="h-full w-full object-contain object-center"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            )
          })}
        </div>
      )}

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
            aria-label="Galería ampliada"
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

            {images.length > 1 && (
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
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease }}
              className={LIGHTBOX_FRAME_CLASS}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[lightboxIndex].src}
                alt={images[lightboxIndex].alt || ''}
                className={LIGHTBOX_IMAGE_CLASS}
                loading="lazy"
                decoding="async"
              />
              {images[lightboxIndex].alt && (
                <p className={LIGHTBOX_CAPTION_CLASS}>
                  {images[lightboxIndex].alt}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
