import { normalizeImageAsset, normalizeGalleryImages } from '@/lib/cms/assets/resolveImage'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

const SERVICE_LEGACY_HERO = {
  'talleres-moviles': (images) => images?.talleres?.hero,
  'ventanas-lunetas': (images) => images?.ventanas?.hero,
  'equipamiento-escolar': (images) => images?.escolar?.hero,
  banquetas: (images) => images?.banquetas?.hero,
  butacas: (images) => images?.butacas?.hero,
  accesorios: (images) => images?.accesorios?.hero,
}

const SERVICE_LEGACY_GALLERY = {
  'talleres-moviles': (images) => images?.talleres?.gallery ?? [],
  'ventanas-lunetas': (images) => images?.ventanas?.gallery ?? [],
  'equipamiento-escolar': (images) => images?.escolar?.gallery ?? [],
  banquetas: (images) => images?.banquetas?.gallery ?? [],
  butacas: (images) => images?.butacas?.gallery ?? [],
  accesorios: (images) => images?.accesorios?.gallery ?? [],
}

export function resolveServicePageHero(heroSection, legacyHero, legacyImages, pageKey) {
  const legacyUrlFn = SERVICE_LEGACY_HERO[pageKey]
  const legacyUrl = legacyUrlFn?.(legacyImages) ?? null

  const resolved = normalizeImageAsset(
    {
      cmsImage: heroSection?.image,
      legacyUrl,
      legacyAlt: legacyHero?.imageAlt || '',
      fallbackAlt: legacyHero?.title || '',
    },
    { domain: 'service-hero', id: pageKey },
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

export function resolveServicePageGallery(portfolioSection, legacyImages, pageKey) {
  const legacyFn = SERVICE_LEGACY_GALLERY[pageKey]
  const legacyGallery = legacyFn?.(legacyImages) ?? []

  const cmsItems = (portfolioSection?.items ?? []).map((item) => ({
    image: { url: item.imageUrl, alt: item.imageAlt },
    caption: item.title,
    id: item.id,
  }))

  const gallery = normalizeGalleryImages(cmsItems, legacyGallery)
  logAssetsDomain('service-gallery', { pageKey, count: gallery.length })
  return gallery
}

export function resolveServicePageFeatures(featuresSection, legacyScope) {
  if (!featuresSection?.groups?.length) return legacyScope

  const groups = featuresSection.groups
  const soluciones = groups[0]
  const caracteristicas = groups[1]

  return {
    ...legacyScope,
    eyebrow: featuresSection.eyebrow || legacyScope?.eyebrow,
    title: featuresSection.title || legacyScope?.title,
    description: featuresSection.description || legacyScope?.description,
    lists: {
      soluciones: soluciones
        ? { title: soluciones.title, items: soluciones.items }
        : legacyScope?.lists?.soluciones,
      caracteristicas: caracteristicas
        ? { title: caracteristicas.title, items: caracteristicas.items }
        : legacyScope?.lists?.caracteristicas,
    },
  }
}
