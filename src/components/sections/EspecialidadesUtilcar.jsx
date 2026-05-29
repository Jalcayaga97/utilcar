import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useEspecialidades, useHomeContent } from '@/hooks/useCms'
import { Section, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import {
  getActiveSpecialtiesSection,
  mapSpecialtiesSectionToDisplayList,
} from '@/lib/cms/resolvers/specialtiesResolver'
import {
  resolveCategoryGalleryImages,
  resolveCategoryHeroImage,
  resolveSpecialtyCta,
} from '@/lib/cms/assets/resolveSpecialtyAssets'
import { logSpecialtiesV2 } from '@/lib/cms/specialtiesBlockLog'

const ease = [0.25, 0.1, 0.25, 1]

function TechnicalList({ items, className }) {
  return (
    <ul className={cn('space-y-2.5', className)}>
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-3 text-sm leading-relaxed text-ink-muted sm:text-[0.9375rem]"
        >
          <span
            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink/40"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function SpecGroup({ title, items }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 sm:p-6">
      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink">
        {title}
      </h4>
      <TechnicalList items={items} className="mt-4" />
    </div>
  )
}

function GalleryThumbnails({ gallery }) {
  if (!gallery?.length || gallery.length < 2) return null

  return (
    <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
      {gallery.slice(0, 5).map((entry) => (
        <div
          key={entry.id}
          className="aspect-square overflow-hidden rounded-md border border-border bg-surface"
        >
          <img
            src={entry.url}
            alt={entry.alt || ''}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </div>
      ))}
    </div>
  )
}

function BrandTabs({ brands, activeIndex, onChange }) {
  if (!brands?.length) return null

  return (
    <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Marcas">
      <button
        type="button"
        role="tab"
        aria-selected={activeIndex < 0}
        className={cn(
          'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
          activeIndex < 0
            ? 'border-ink bg-ink text-white'
            : 'border-border bg-white text-ink-muted hover:border-ink/30',
        )}
        onClick={() => onChange(-1)}
      >
        General
      </button>
      {brands.map((brand, index) => (
        <button
          key={brand.id || brand.name || index}
          type="button"
          role="tab"
          aria-selected={activeIndex === index}
          className={cn(
            'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            activeIndex === index
              ? 'border-ink bg-ink text-white'
              : 'border-border bg-white text-ink-muted hover:border-ink/30',
          )}
          onClick={() => onChange(index)}
        >
          {brand.name || `Marca ${index + 1}`}
        </button>
      ))}
    </div>
  )
}

function resolveBrandSlice(brand, categoryItem) {
  const hero = resolveCategoryHeroImage(
    {
      id: brand.id,
      title: brand.name,
      heroImage: brand.gallery?.[0]?.image ?? brand.logo,
      gallery: brand.gallery,
    },
    categoryItem,
  )
  const specGroups = (brand.features ?? []).map((feature) => ({
    title: feature.groupTitle || 'Especificaciones',
    items: feature.items ?? [],
  }))
  const cta = resolveSpecialtyCta(brand.cta, categoryItem.cta)
  const gallery = resolveCategoryGalleryImages(brand.gallery)

  return {
    image: hero.url || categoryItem.image,
    imageAlt: hero.alt || categoryItem.imageAlt,
    specGroups: specGroups.length ? specGroups : categoryItem.specGroups,
    cta,
    gallery: gallery.length ? gallery : categoryItem.gallery,
    subtitle: brand.description || categoryItem.subtitle,
  }
}

function EspecialidadBlock({ item, reverse, index, itemEyebrowPrefix }) {
  const [activeBrandTab, setActiveBrandTab] = useState(-1)
  const brands = item.brands ?? []
  const activeBrand = activeBrandTab >= 0 ? brands[activeBrandTab] : null
  const slice = activeBrand ? resolveBrandSlice(activeBrand, item) : item

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay: index * 0.05, ease }}
      className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20"
    >
      <div className={cn('relative lg:sticky lg:top-24', reverse ? 'lg:order-1' : 'lg:order-2')}>
        <div className="relative overflow-hidden rounded-card border border-border bg-white shadow-card">
          <div className="aspect-[4/3] sm:aspect-[5/4] lg:aspect-[4/3]">
            {slice.image ? (
              <img
                src={slice.image}
                alt={slice.imageAlt || ''}
                className="h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-surface text-sm text-ink-muted">
                Sin imagen
              </div>
            )}
          </div>
        </div>
        <GalleryThumbnails gallery={slice.gallery} />
      </div>

      <div className={cn('min-w-0', reverse ? 'lg:order-2' : 'lg:order-1')}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-subtle">
          {itemEyebrowPrefix} {String(index + 1).padStart(2, '0')}
        </p>

        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {item.title}
        </h3>

        <p className="mt-2 text-lg font-medium tracking-tight text-ink/80 sm:text-xl">
          {slice.subtitle ?? item.subtitle}
        </p>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
          {item.intro}
        </p>

        <BrandTabs
          brands={brands}
          activeIndex={activeBrandTab}
          onChange={setActiveBrandTab}
        />

        <div className="mt-6 space-y-4">
          {(slice.specGroups ?? []).map((group) => (
            <SpecGroup key={group.title} title={group.title} items={group.items} />
          ))}
        </div>

        {slice.cta?.label && slice.cta?.path ? (
          <div className="mt-8 border-t border-border pt-8">
            <Button to={slice.cta.path} variant="outline" size="md">
              {slice.cta.label}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Button>
          </div>
        ) : null}
      </div>
    </motion.article>
  )
}

/**
 * @param {{ activeSection?: object | null }} props
 */
export function EspecialidadesUtilcar({ activeSection: activeSectionProp }) {
  const { especialidades: especialidadesSection, extensions } = useHomeContent()
  const legacyList = useEspecialidades()
  const sourceRef = useRef(null)

  const activeSection =
    activeSectionProp ?? getActiveSpecialtiesSection(extensions)

  const displayList = useMemo(() => {
    if (activeSection) {
      return mapSpecialtiesSectionToDisplayList(activeSection, legacyList)
    }
    return legacyList
  }, [activeSection, legacyList])

  useEffect(() => {
    const source = activeSection ? 'cms' : 'legacy'
    if (sourceRef.current === source) return
    sourceRef.current = source

    if (activeSection) {
      logSpecialtiesV2({
        source: 'cms',
        categories: activeSection.categories?.length ?? 0,
        brands: activeSection.categories?.reduce(
          (n, cat) => n + (cat.brands?.length ?? 0),
          0,
        ),
        warnings: activeSection.warnings?.length ?? 0,
      })
    } else {
      logSpecialtiesV2({ source: 'legacy', categories: legacyList.length })
    }
  }, [activeSection, legacyList.length])

  return (
    <Section className="bg-surface">
      <SectionHeader
        eyebrow={activeSection?.eyebrow ?? especialidadesSection.eyebrow}
        title={activeSection?.title ?? especialidadesSection.title}
        description={activeSection?.description ?? especialidadesSection.description}
        align="center"
        className="mx-auto max-w-2xl"
      />

      <div className="mt-14 space-y-20 sm:mt-16 sm:space-y-24 lg:mt-20 lg:space-y-28">
        {displayList.map((item, index) => (
          <EspecialidadBlock
            key={item.id}
            item={item}
            index={index}
            reverse={index % 2 === 1}
            itemEyebrowPrefix={
              activeSection?.itemEyebrowPrefix ?? especialidadesSection.itemEyebrowPrefix
            }
          />
        ))}
      </div>
    </Section>
  )
}
