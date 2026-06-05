import { normalizeImageAsset, pickImageUrl, pickImageAlt } from '@/lib/cms/assets/resolveImage'
import { logServiceHeroAudit } from '@/lib/cms/servicePageAuditLog'

/**
 * Hero de sub-página de servicio — solo CMS cuando legacy es null.
 */
export function resolveServicePageHero(heroSection, legacyHero, _legacyImages, pageKey) {
  const cmsImage = heroSection?.image
  const cmsUrl =
    pickImageUrl(cmsImage) ||
    (typeof cmsImage?.asset?.url === 'string' ? cmsImage.asset.url : null) ||
    (typeof heroSection?.image?.url === 'string' ? heroSection.image.url : null) ||
    heroSection?.imageUrl ||
    null

  const hasHeroImage = Boolean(
    cmsUrl ||
      cmsImage?.asset?._ref ||
      cmsImage?.asset?._id ||
      legacyHero?.imageUrl,
  )

  const resolved = normalizeImageAsset(
    {
      cmsImage: cmsUrl ? { url: cmsUrl, alt: pickImageAlt(cmsImage, heroSection?.imageAlt) } : cmsImage,
      legacyUrl: legacyHero?.imageUrl ?? legacyHero?.image ?? null,
      legacyAlt: legacyHero?.imageAlt || '',
      fallbackAlt: heroSection?.title || legacyHero?.title || pageKey,
    },
    { domain: 'service-hero', id: pageKey },
  )

  const highlightList = Array.isArray(heroSection?.highlights)
    ? heroSection.highlights.map((item) => String(item ?? '').trim()).filter(Boolean)
    : []

  if (import.meta.env.DEV) {
    const assetUrl =
      cmsImage?.asset?.url ??
      heroSection?.image?.asset?.url ??
      heroSection?.image?.url ??
      cmsUrl ??
      null
    console.info('[service-hero]', {
      pageKey,
      hasHeroImage,
      highlightsCount: highlightList.length,
      highlights: highlightList,
      hasCmsBlock: Boolean(heroSection),
      imageSource: resolved.source,
      resolvedUrl: resolved.url?.startsWith('data:') ? '(placeholder)' : resolved.url,
      assetUrl: assetUrl?.startsWith('data:') ? '(placeholder)' : assetUrl,
      cmsUrlFound: Boolean(cmsUrl),
    })
    if (resolved.source === 'placeholder') {
      console.warn(
        `[service-hero] ${pageKey}: sin imagen CMS — verifique heroBlock.image en Sanity y flags VITE_USE_PAGE_RESOLVER + VITE_USE_SERVICES_V2`,
      )
    }
  }

  const highlightsResolver = heroSection?.highlights ?? legacyHero?.highlights ?? []

  logServiceHeroAudit({
    pageKey,
    highlightsCms: highlightList,
    highlightsResolver,
    highlightsComponent: highlightsResolver,
    imageCms: Boolean(cmsUrl || cmsImage?.asset?.url || heroSection?.image?.url),
    imageResolver: resolved.url?.startsWith('data:') ? null : resolved.url,
    imageComponent: resolved.url?.startsWith('data:') ? null : resolved.url,
    hasCmsBlock: Boolean(heroSection),
    imageSource: resolved.source,
  })

  return {
    src: resolved.url,
    alt: resolved.alt,
    source: resolved.source,
    eyebrow: heroSection?.eyebrow ?? legacyHero?.eyebrow ?? 'Servicios',
    title: heroSection?.title || legacyHero?.title,
    subtitle: heroSection?.subtitle || legacyHero?.subtitle,
    highlights: highlightsResolver,
    imageAlt: resolved.alt || legacyHero?.imageAlt,
  }
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
