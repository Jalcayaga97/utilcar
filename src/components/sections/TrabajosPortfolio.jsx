import { memo, useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { GalleryLightbox } from '@/components/ui/GalleryLightbox'
import {
  TRABAJOS_FILTERS,
  TRABAJOS_PORTFOLIO,
} from '@/data/trabajosPortfolio'

const ease = [0.25, 0.1, 0.25, 1]
const PAGE_SIZE = 12

function FilterTabDesktop({ filter, isActive, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(filter.id)}
      className={cn(
        'relative shrink-0 whitespace-nowrap px-4 py-3.5 text-sm font-medium transition-colors sm:px-5',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
      )}
    >
      {filter.label}
      {isActive && (
        <motion.span
          layoutId="trabajos-filter-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
          transition={{ duration: 0.25, ease }}
        />
      )}
    </button>
  )
}

function FilterTabMobile({ filter, isActive, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(filter.id)}
      className={cn(
        'shrink-0 snap-start whitespace-nowrap rounded-md border px-3.5 py-2.5 text-sm font-medium transition-all duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isActive
          ? 'border-ink/20 bg-white text-ink shadow-sm'
          : 'border-transparent text-ink-muted hover:text-ink',
      )}
    >
      {filter.label}
    </button>
  )
}

const PortfolioCard = memo(function PortfolioCard({ item, index, onOpen }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.28), ease }}
      className="h-full"
    >
      <button
        type="button"
        onClick={() => onOpen(item.id)}
        className={cn(
          'group flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-white text-left shadow-card',
          'transition-shadow duration-300 hover:shadow-elevated',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        )}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface">
          <SmartImage
            src={item.image}
            alt={item.imageAlt || ''}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
            decoding="async"
          />
          <span
            className={cn(
              'absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-md',
              'border border-border/80 bg-white/95 text-ink',
              'opacity-0 transition-opacity duration-300 group-hover:opacity-100',
            )}
            aria-hidden
          >
            <ZoomIn className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </div>
        <div className="flex flex-1 flex-col border-t border-border p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            {item.category}
          </p>
          <h3 className="mt-1.5 text-base font-semibold text-ink">{item.title}</h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink-muted">
            {item.description}
          </p>
        </div>
      </button>
    </motion.article>
  )
})

export function TrabajosPortfolio() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return TRABAJOS_PORTFOLIO
    return TRABAJOS_PORTFOLIO.filter((p) => p.categoryId === activeFilter)
  }, [activeFilter])

  const visibleItems = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  )

  const hasMore = visibleCount < filtered.length

  const handleSelectFilter = useCallback((filterId) => {
    setActiveFilter(filterId)
    setVisibleCount(PAGE_SIZE)
  }, [])

  const openLightbox = useCallback(
    (id) => {
      const idx = filtered.findIndex((p) => p.id === id)
      if (idx >= 0) setLightboxIndex(idx)
    },
    [filtered],
  )

  const loadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + PAGE_SIZE, filtered.length))
  }, [filtered.length])

  return (
    <div>
      <div
        className="hidden border-b border-border lg:flex lg:flex-wrap lg:gap-1"
        role="tablist"
        aria-label="Filtrar trabajos por categoría"
      >
        {TRABAJOS_FILTERS.map((filter) => (
          <FilterTabDesktop
            key={filter.id}
            filter={filter}
            isActive={activeFilter === filter.id}
            onSelect={handleSelectFilter}
          />
        ))}
      </div>

      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-card border border-border bg-surface p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Filtrar trabajos por categoría"
      >
        {TRABAJOS_FILTERS.map((filter) => (
          <FilterTabMobile
            key={filter.id}
            filter={filter}
            isActive={activeFilter === filter.id}
            onSelect={handleSelectFilter}
          />
        ))}
      </div>

      <div className="mt-10" role="tabpanel">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-muted">
            No hay trabajos en esta categoría.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {visibleItems.map((item, i) => (
                <PortfolioCard
                  key={item.id}
                  item={item}
                  index={i}
                  onOpen={openLightbox}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 flex justify-center">
                <Button type="button" variant="secondary" onClick={loadMore}>
                  Cargar más
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <GalleryLightbox
        items={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </div>
  )
}
