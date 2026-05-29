import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useAdjacentImagePreload } from '@/hooks/useAdjacentImagePreload'
import { SmartImage } from '@/components/ui/SmartImage'

const ease = [0.25, 0.1, 0.25, 1]

const getItemSrc = (item) => item?.image

/**
 * Lightbox para listas de imágenes con título/alt (portfolio, galerías).
 */
export function GalleryLightbox({ items, index, onClose, onChangeIndex }) {
  const open = index !== null && index >= 0 && index < items.length
  const current = open ? items[index] : null

  useAdjacentImagePreload(open ? index : null, items, getItemSrc)

  const goPrev = useCallback(() => {
    onChangeIndex((i) => (i === null ? null : (i - 1 + items.length) % items.length))
  }, [items.length, onChangeIndex])

  const goNext = useCallback(() => {
    onChangeIndex((i) => (i === null ? null : (i + 1) % items.length))
  }, [items.length, onChangeIndex])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, goPrev, goNext])

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/85 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          onClick={onClose}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {items.length > 1 && (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                aria-label="Imagen anterior"
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
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
                  goNext()
                }}
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </>
          )}

          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease }}
            className="relative max-h-[85vh] max-w-5xl overflow-hidden rounded-card"
            onClick={(e) => e.stopPropagation()}
          >
            <SmartImage
              src={current.image}
              alt={current.imageAlt ?? current.title ?? ''}
              className="max-h-[85vh] w-full object-contain"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-ink/85 to-transparent px-4 py-4 sm:px-6">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/70">
                {current.category}
              </p>
              <p className="mt-1 text-sm font-medium text-white sm:text-base">
                {current.title}
              </p>
              {current.description && (
                <p className="mt-1 text-sm text-white/80">{current.description}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
