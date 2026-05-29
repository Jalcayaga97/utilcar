import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getAccesoriosCategoryGallery } from '@/assets/images'
import { BrandImageGallery } from '@/components/ui/BrandImageGallery'
import { ACCESORIOS_CATEGORIES } from '@/data/accesorios'

const ease = [0.25, 0.1, 0.25, 1]

function SpecBlock({ title, items }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
              <Check className="h-3 w-3 text-ink" strokeWidth={2} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CategoryContent({ category }) {
  const gallery = getAccesoriosCategoryGallery(category.id)

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease }}
      className="space-y-8"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {category.intro.map((paragraph) => (
          <p
            key={paragraph}
            className="text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            {paragraph}
          </p>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,480px)_1fr]">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Registro visual
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Producto y terminación — {category.name}
            </p>
          </div>
          <BrandImageGallery
            key={category.id}
            images={gallery}
            brandName={category.name}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {category.sections.map((block) => (
            <SpecBlock key={block.title} title={block.title} items={block.items} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function CategoryTabDesktop({ category, isActive, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(category.id)}
      className={cn(
        'relative shrink-0 whitespace-nowrap px-5 py-3.5 text-sm font-medium transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
      )}
    >
      {category.name}
      {isActive && (
        <motion.span
          layoutId="accesorios-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
          transition={{ duration: 0.25, ease }}
        />
      )}
    </button>
  )
}

function CategoryTabMobile({ category, isActive, onSelect }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => onSelect(category.id)}
      className={cn(
        'shrink-0 snap-start whitespace-nowrap rounded-md border px-4 py-2.5 text-sm font-medium transition-all duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        isActive
          ? 'border-ink/20 bg-white text-ink shadow-sm'
          : 'border-transparent text-ink-muted hover:text-ink',
      )}
    >
      {category.name}
    </button>
  )
}

export function AccesoriosCategoryPanel() {
  const [activeId, setActiveId] = useState(ACCESORIOS_CATEGORIES[0].id)
  const active =
    ACCESORIOS_CATEGORIES.find((c) => c.id === activeId) ?? ACCESORIOS_CATEGORIES[0]

  return (
    <div>
      <div
        className="hidden border-b border-border lg:flex lg:gap-1"
        role="tablist"
        aria-label="Categorías de accesorios"
      >
        {ACCESORIOS_CATEGORIES.map((category) => (
          <CategoryTabDesktop
            key={category.id}
            category={category}
            isActive={activeId === category.id}
            onSelect={setActiveId}
          />
        ))}
      </div>

      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-card border border-border bg-surface p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Categorías de accesorios"
      >
        {ACCESORIOS_CATEGORIES.map((category) => (
          <CategoryTabMobile
            key={category.id}
            category={category}
            isActive={activeId === category.id}
            onSelect={setActiveId}
          />
        ))}
      </div>

      <div className="mt-10" role="tabpanel">
        <AnimatePresence mode="wait">
          <CategoryContent category={active} />
        </AnimatePresence>
      </div>
    </div>
  )
}
