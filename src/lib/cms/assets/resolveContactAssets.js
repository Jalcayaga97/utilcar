import { IMAGES } from '@/assets/images'
import { normalizeImageAsset } from '@/lib/cms/assets/resolveImage'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

export function resolveContactHero(heroSection, legacyHero) {
  const resolved = normalizeImageAsset(
    {
      cmsImage: heroSection?.image,
      legacyUrl: IMAGES.talleres.hero,
      legacyAlt: legacyHero?.imageAlt || '',
      fallbackAlt: legacyHero?.title || 'Contacto Utilcar',
    },
    { domain: 'contact-hero', id: 'contact' },
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

export function resolveContactMap(mapSection, legacyMap, siteMapsQuery) {
  const embedQuery = mapSection?.embedQuery || siteMapsQuery
  logAssetsDomain('contact-map', { hasCustomQuery: Boolean(mapSection?.embedQuery) })
  return {
    eyebrow: mapSection?.eyebrow ?? legacyMap?.eyebrow,
    title: mapSection?.title ?? legacyMap?.title,
    iframeTitle: mapSection?.iframeTitle ?? legacyMap?.iframeTitle,
    embedQuery,
  }
}
