import { getTrabajoImage } from '@/assets/images'
import {
  normalizeImageAsset,
  normalizeGalleryImages,
  resolveImageAsset,
  warnMissingAsset,
} from '@/lib/cms/assets/resolveImage'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'

/**
 * Hero Trabajos — CMS heroBlock → legacy import → default.
 */
export function resolveWorkHero(heroSection, legacyHeroUrl, legacyAlt = '') {
  const resolved = resolveImageAsset({
    cmsImage: heroSection?.image,
    legacyUrl: legacyHeroUrl,
    legacyAlt,
    fallbackAlt: heroSection?.title || 'Trabajos realizados Utilcar',
    domain: 'work-hero',
    id: 'work-page',
  })
  return { src: resolved.url, alt: resolved.alt, source: resolved.source }
}

/**
 * Ítem portfolio — CMS imageUrl → legacy item.image → getTrabajoImage(imageKey).
 */
export function resolveWorkPortfolioItem(item, legacyItem) {
  const cmsUrl = item?.imageUrl ?? item?.image?.asset?.url ?? item?.image?.url ?? null
  const legacyUrl =
    legacyItem?.image ??
    (legacyItem?.imageKey != null ? getTrabajoImage(legacyItem.imageKey) : null) ??
    (item?.id ? getTrabajoImage(item.id) : null)

  const resolved = normalizeImageAsset(
    {
      cmsImage: cmsUrl ? { url: cmsUrl, alt: item?.imageAlt } : null,
      legacyUrl,
      legacyAlt: legacyItem?.imageAlt || item?.imageAlt || '',
      fallbackAlt: item?.title || '',
    },
    { domain: 'work-portfolio', id: item?.id },
  )

  if (!resolved.url) {
    warnMissingAsset('work-portfolio', item?.id, { title: item?.title })
  }

  return {
    id: item?.id || legacyItem?.id,
    title: item?.title || legacyItem?.title || '',
    category: item?.category || legacyItem?.category || '',
    categoryId: item?.categoryId || legacyItem?.categoryId || 'all',
    description: item?.description || legacyItem?.description || '',
    image: resolved.url,
    imageAlt: resolved.alt,
    _imageSource: resolved.source,
  }
}

export function normalizeWorkGallery(galleryItems = [], legacyItems = []) {
  const normalized = normalizeGalleryImages(galleryItems, legacyItems)
  logAssetsDomain('work-gallery', { count: normalized.length })
  return normalized
}
