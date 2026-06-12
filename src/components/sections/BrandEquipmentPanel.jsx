import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getVentanasMarcaGallery } from '@/assets/images'
import { BrandImageGallery } from '@/components/ui/BrandImageGallery'
import { useEquipamientoMarcaTabs } from '@/hooks/useCms'
import { USE_SERVICES_V2 } from '@/lib/cms/config'
import { tabGalleryToDisplayImages } from '@/lib/cms/contracts/serviceTabContract'

const ease = [0.25, 0.1, 0.25, 1]

function SpecBlock({ title, items }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h4>
      <ul className="mt-4 space-y-2.5">
        {(items ?? []).map((item) => (
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

function resolveTabGallery(brand, useCmsGallery, cmsFirst) {
  const fromCms = tabGalleryToDisplayImages(brand)

  if (import.meta.env.DEV && useCmsGallery && brand?.id === 'toyota') {
    console.log('TAB GALLERY SAMPLE', {
      brandId: brand.id,
      rawGallery: brand.gallery,
      resolved: fromCms,
    })
  }

  if (fromCms.length) return fromCms
  if (cmsFirst) return fromCms
  return getVentanasMarcaGallery(brand.id)
}

function BrandContent({ brand, useCmsGallery, cmsFirst }) {
  if (!brand) return null

  const gallery = resolveTabGallery(brand, useCmsGallery, cmsFirst)

  return (
    <motion.div
      key={brand.id}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease }}
      className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start lg:gap-12 xl:grid-cols-[minmax(0,480px)_1fr]"
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
            Registro visual
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Terminaciones, instalación e interior — {brand.name}
          </p>
        </div>
        <BrandImageGallery
          key={brand.id}
          images={gallery}
          brandName={brand.name}
        />
        {brand.models?.length > 0 && (
          <div className="rounded-lg border border-border bg-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              Modelos habituales
            </p>
            <p className="mt-2 text-sm text-ink-muted">{brand.models.join(' · ')}</p>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(brand.description || brand.intro?.[0]) && (
          <div className="sm:col-span-2">
            {brand.description ? (
              <p className="text-sm leading-relaxed text-ink-muted">{brand.description}</p>
            ) : null}
            {(brand.intro ?? []).map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-3 text-sm leading-relaxed text-ink-muted">
                {paragraph}
              </p>
            ))}
          </div>
        )}
        {brand.subtitle && (
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-subtle">
              {brand.subtitle}
            </p>
          </div>
        )}
        {(brand.sections ?? []).map((section) => (
          <SpecBlock key={section.title} title={section.title} items={section.items ?? []} />
        ))}
      </div>
    </motion.div>
  )
}

export function BrandEquipmentPanel({ tabs: tabsProp, cmsFirst = false }) {
  const legacyBrands = useEquipamientoMarcaTabs()
  const useCmsGallery = cmsFirst || USE_SERVICES_V2
  const brandTabs = useCmsGallery
    ? (tabsProp ?? [])
    : tabsProp?.length
      ? tabsProp
      : legacyBrands
  const [activeId, setActiveId] = useState(() => brandTabs[0]?.id)
  const active = brandTabs.find((b) => b.id === activeId) ?? brandTabs[0]

  return (
    <div>
      {/* Tabs desktop */}
      <div
        className="hidden border-b border-border lg:flex lg:gap-1"
        role="tablist"
        aria-label="Marcas de vehículos"
      >
        {brandTabs.map((brand) => {
          const isActive = activeId === brand.id
          return (
            <button
              key={brand.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveId(brand.id)}
              className={cn(
                'relative px-5 py-3.5 text-sm font-medium transition-colors',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                isActive ? 'text-ink' : 'text-ink-muted hover:text-ink',
              )}
            >
              {brand.name}
              {isActive && (
                <motion.span
                  layoutId="brand-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink"
                  transition={{ duration: 0.25, ease }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Acordeón mobile */}
      <div className="space-y-2 lg:hidden" role="tablist" aria-label="Marcas de vehículos">
        {brandTabs.map((brand) => {
          const isOpen = activeId === brand.id
          return (
            <div
              key={brand.id}
              className="overflow-hidden rounded-card border border-border bg-white"
            >
              <button
                type="button"
                role="tab"
                aria-expanded={isOpen}
                onClick={() => setActiveId(brand.id)}
                className="flex w-full items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-ink"
              >
                {brand.name}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                  strokeWidth={1.75}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease }}
                    className="overflow-hidden border-t border-border"
                  >
                    <div className="p-4">
                      <BrandContent brand={brand} useCmsGallery={useCmsGallery} cmsFirst={cmsFirst} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Panel desktop */}
      <div className="mt-10 hidden lg:block" role="tabpanel">
        <AnimatePresence mode="wait">
          <BrandContent brand={active} useCmsGallery={useCmsGallery} cmsFirst={cmsFirst} />
        </AnimatePresence>
      </div>
    </div>
  )
}
