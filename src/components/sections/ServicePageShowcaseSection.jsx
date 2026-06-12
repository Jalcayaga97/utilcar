import { ServiceShowcaseCarousel } from '@/components/sections/ServiceShowcaseCarousel'
import { Section } from '@/components/ui/Section'

/**
 * Galería visual CMS-first — solo carrusel, sin cabecera editorial.
 */
export function ServicePageShowcaseSection({ images }) {
  if (!images?.length) return null

  return (
    <Section className="bg-surface/40 py-6 md:py-8">
      <ServiceShowcaseCarousel images={images} />
    </Section>
  )
}
