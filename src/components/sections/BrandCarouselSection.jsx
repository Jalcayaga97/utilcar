import { BrandLogoCarousel } from '@/components/sections/BrandLogoCarousel'
import { Section, SectionHeader } from '@/components/ui/Section'

/**
 * Marcas que confían — carrusel infinito CMS-first.
 */
export function BrandCarouselSection({ section }) {
  const brands = section?.brands ?? []
  if (!brands.length) return null

  const eyebrow = section?.eyebrow?.trim()
  const title = section?.title?.trim()
  const description = section?.description?.trim()
  const hasHeader = Boolean(eyebrow || title || description)

  return (
    <Section className="bg-white">
      {hasHeader ? (
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          align="center"
        />
      ) : null}
      <BrandLogoCarousel brands={brands} className={hasHeader ? 'mt-10 lg:mt-12' : undefined} />
    </Section>
  )
}
