import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { SmartImage } from '@/components/ui/SmartImage'
import { useAdjacentImagePreload } from '@/hooks/useAdjacentImagePreload'
import { pickImageUrl } from '@/lib/cms/assets/resolveImage'

const ease = [0.25, 0.1, 0.25, 1]

function resolveGalleryImageSrc(img) {
  if (!img) return null
  return img.src || img.url || pickImageUrl(img.image) || pickImageUrl(img.asset) || pickImageUrl(img) || null
}

const getGallerySrc = (img) => resolveGalleryImageSrc(img)

/**
 * Galería editorial por marca: imagen principal, thumbnails y lightbox opcional.
 */
export function BrandImageGallery({ images, brandName, className }) {
  const [selected, setSelected] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const lightboxOpen = lightboxIndex !== null

  const safeImages = (images ?? [])
    .map((img) => {
      const src = resolveGalleryImageSrc(img)
      if (!src) return null
      return { ...img, src }
    })
    .filter(Boolean)
  useAdjacentImagePreload(lightboxOpen ? lightboxIndex : null, safeImages, getGallerySrc)
  const current = safeImages[selected] ?? safeImages[0]

  const openLightbox = useCallback(() => setLightboxIndex(selected), [selected])
  const closeLightbox = useCallback(() => setLightboxIndex(null), [])

  const goPrevLightbox = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + safeImages.length) % safeImages.length,
    )
  }, [safeImages.length])

  const goNextLightbox = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % safeImages.length,
    )
  }, [safeImages.length])

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

  if (!current) {
    return (
      <div
        className={cn(
          'flex aspect-[4/3] items-center justify-center rounded-card border border-border bg-surface text-sm text-ink-subtle',
          className,
        )}
      >
        {brandName}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden rounded-card border border-border bg-white shadow-card">
        <button
          type="button"
          onClick={openLightbox}
          className="group relative block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={`Ampliar registro visual ${brandName}`}
        >
          <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface">
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
                  className="h-full w-full object-contain object-center"
                  loading="lazy"
                  decoding="async"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-white/95 text-ink opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:bottom-4 sm:right-4 sm:h-9 sm:w-9">
            <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </button>
      </div>

      {safeImages.length > 1 && (
        <div
          className="mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mt-4"
          role="tablist"
          aria-label={`Galería ${brandName}`}
        >
          {safeImages.map((img, index) => {
            const isActive = selected === index
            return (
              <button
                key={img.src}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={img.alt || `Vista ${index + 1}`}
                onClick={() => setSelected(index)}
                className={cn(
                  'relative flex h-14 w-[4.5rem] shrink-0 snap-start items-center justify-center overflow-hidden rounded-md border-2 bg-surface transition-all duration-300 sm:h-16 sm:w-24',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  isActive
                    ? 'border-ink opacity-100 ring-1 ring-ink/15'
                    : 'border-border opacity-65 hover:border-ink/25 hover:opacity-100',
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
            aria-label={`Galería ${brandName}`}
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

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
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
                  className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
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
              className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-card"
              onClick={(e) => e.stopPropagation()}
            >
              <SmartImage
                src={safeImages[lightboxIndex].src}
                webpSrc={safeImages[lightboxIndex].webpSrc}
                alt={safeImages[lightboxIndex].alt || ''}
                className="max-h-[85vh] w-full object-contain"
                loading="lazy"
                decoding="async"
              />
              {safeImages[lightboxIndex].alt && (
                <p className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/80 to-transparent px-4 py-3 text-sm text-white">
                  {safeImages[lightboxIndex].alt}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
