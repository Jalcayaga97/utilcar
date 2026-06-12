import { ServiceShowcaseCarousel } from '@/components/sections/ServiceShowcaseCarousel'
import { Section } from '@/components/ui/Section'

/**
 * Carrusel destacado Home — solo imágenes, sin cabecera editorial.
 */
export function HomeShowcaseSection({ images }) {
  if (!images?.length) return null

  return (
    <Section className="bg-surface/40 py-6 md:py-8">
      <ServiceShowcaseCarousel images={images} size="home" showCaption={false} />
    </Section>
  )
}
