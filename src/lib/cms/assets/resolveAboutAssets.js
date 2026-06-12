import { IMAGES } from '@/assets/images'
import { normalizeImageAsset } from '@/lib/cms/assets/resolveImage'

export function resolveAboutHero(heroSection, legacyHero) {
  const resolved = normalizeImageAsset(
    {
      cmsImage: heroSection?.image,
      legacyUrl: IMAGES.talleres.hero,
      legacyAlt: legacyHero?.imageAlt || '',
      fallbackAlt: legacyHero?.title || 'Sobre Nosotros — Utilcar',
    },
    { domain: 'about-hero', id: 'about' },
  )

  return {
    src: resolved.url,
    alt: resolved.alt,
    source: resolved.source,
    eyebrow: heroSection?.eyebrow ?? legacyHero?.eyebrow,
    title: heroSection?.title || legacyHero?.title,
    subtitle: heroSection?.subtitle || legacyHero?.subtitle,
    imageAlt: resolved.alt || legacyHero?.imageAlt,
  }
}
