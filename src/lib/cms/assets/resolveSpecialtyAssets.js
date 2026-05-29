/**
 * Asset resolution — specialties categories (CMS → legacy local → placeholder).
 */
import { logSpecialtyAssets } from '@/lib/cms/assets/assetsLog'

function pickUrl(imageField) {
  if (!imageField) return null
  if (typeof imageField === 'string') return imageField
  return imageField?.url ?? imageField?.asset?.url ?? null
}

function pickAlt(imageField, fallback = '') {
  if (!imageField || typeof imageField === 'string') return fallback
  return imageField?.alt ?? fallback
}

/**
 * Imagen principal de categoría con prioridad CMS → galería featured → legacy local.
 * @param {object} category — categoría contractual normalizada
 * @param {object | null | undefined} legacyItem — ítem legacy mergeado (imagen local)
 */
export function resolveCategoryHeroImage(category, legacyItem) {
  const heroUrl = pickUrl(category?.heroImage)
  if (heroUrl) {
    const resolved = {
      url: heroUrl,
      alt: category.heroImage?.alt || category.title || '',
      source: 'cms',
    }
    logSpecialtyAssets({ kind: 'category-hero', id: category.id, source: resolved.source })
    return resolved
  }

  const featuredGallery = (category?.gallery ?? []).find((item) => item?.featured)
  const galleryUrl = pickUrl(featuredGallery?.image)
  if (galleryUrl) {
    const resolved = {
      url: galleryUrl,
      alt: featuredGallery?.image?.alt || featuredGallery?.caption || category?.title || '',
      source: 'cms-gallery',
    }
    logSpecialtyAssets({ kind: 'category-hero', id: category.id, source: resolved.source })
    return resolved
  }

  if (legacyItem?.image) {
    const resolved = {
      url: legacyItem.image,
      alt: legacyItem.imageAlt || legacyItem.title || '',
      source: 'legacy',
    }
    logSpecialtyAssets({ kind: 'category-hero', id: category.id, source: resolved.source })
    return resolved
  }

  logSpecialtyAssets({ kind: 'category-hero', id: category?.id, source: 'placeholder' })
  return { url: null, alt: category?.title || '', source: 'placeholder' }
}

/**
 * Galería contractual → URLs resueltas para grid runtime.
 * @param {object[]} gallery
 */
export function resolveCategoryGalleryImages(gallery = []) {
  return gallery
    .map((item, index) => {
      const url = pickUrl(item?.image)
      if (!url) return null
      return {
        id: item.id || `gallery-${index}`,
        url,
        alt: pickAlt(item.image, item.caption || ''),
        caption: item.caption || '',
        role: item.role || 'gallery',
        featured: Boolean(item.featured),
      }
    })
    .filter(Boolean)
}

/**
 * CTA efectivo — categoría o marca activa.
 */
export function resolveSpecialtyCta(cta, fallback = { label: '', path: '' }) {
  const label = String(cta?.label ?? '').trim() || fallback.label || ''
  const path = String(cta?.to ?? cta?.path ?? '').trim() || fallback.path || ''
  if (!label && !path) return fallback
  return { label, path }
}
