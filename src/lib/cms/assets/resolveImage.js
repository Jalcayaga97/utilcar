/**
 * Utilidades compartidas — Asset Resolution Layer.
 * Prioridad: CMS → legacy → placeholder
 */
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'
import { warnRuntime } from '@/lib/cms/runtimeLog'

const PLACEHOLDER_DATA_URI =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f4f4f5" width="400" height="300"/%3E%3C/svg%3E'

export function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false
  if (url.startsWith('data:image/')) return true
  if (url.startsWith('/')) return true
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function pickImageUrl(imageField) {
  if (!imageField) return null
  if (typeof imageField === 'string') return isValidImageUrl(imageField) ? imageField : null
  const url = imageField?.url ?? imageField?.asset?.url ?? null
  return isValidImageUrl(url) ? url : null
}

export function pickImageAlt(imageField, fallback = '') {
  if (!imageField || typeof imageField === 'string') return fallback
  return imageField?.alt ?? fallback
}

/**
 * @param {object} options
 * @param {object | null | undefined} options.cmsImage — { url, alt } contractual
 * @param {string | null | undefined} options.legacyUrl
 * @param {string} [options.legacyAlt]
 * @param {string} [options.fallbackAlt]
 * @param {string} [options.domain] — log domain
 * @param {string} [options.id] — entity id for logs
 */
export function resolveImageAsset({
  cmsImage,
  legacyUrl,
  legacyAlt = '',
  fallbackAlt = '',
  domain = 'image',
  id = '',
}) {
  const cmsUrl = pickImageUrl(cmsImage)
  let source = 'placeholder'
  let url = null
  let alt = fallbackAlt || legacyAlt

  if (cmsUrl) {
    url = cmsUrl
    source = 'cms'
    alt = pickImageAlt(cmsImage, alt)
  } else if (legacyUrl) {
    url = legacyUrl
    source = 'legacy'
    alt = legacyAlt || fallbackAlt
  }

  logAssetsDomain(domain, { id, source, hasUrl: Boolean(url) })

  return { url, alt, source }
}

/**
 * Normaliza asset con validación de URL/alt e integridad.
 */
export function normalizeImageAsset(input = {}, context = {}) {
  const resolved = resolveImageAsset({
    cmsImage: input.cmsImage,
    legacyUrl: input.legacyUrl,
    legacyAlt: input.legacyAlt,
    fallbackAlt: input.fallbackAlt,
    domain: context.domain ?? 'image',
    id: context.id ?? '',
  })

  const warnings = []

  if (!resolved.url) {
    warnings.push('missing-image')
    resolved.url = PLACEHOLDER_DATA_URI
    resolved.source = 'placeholder'
  } else if (!isValidImageUrl(resolved.url)) {
    warnings.push('invalid-url')
    resolved.url = input.legacyUrl && isValidImageUrl(input.legacyUrl) ? input.legacyUrl : PLACEHOLDER_DATA_URI
    resolved.source = 'placeholder'
  }

  if (!resolved.alt?.trim()) {
    warnings.push('empty-alt')
    resolved.alt = input.fallbackAlt || context.id || 'Imagen Utilcar'
  }

  if (import.meta.env.DEV && warnings.length) {
    warnRuntime('assets-integrity', warnings.join(','), {
      id: context.id,
      domain: context.domain,
    })
  }

  return { ...resolved, warnings }
}

/**
 * Audita galería — entradas corruptas, duplicados, alt vacío.
 */
export function auditGalleryIntegrity(gallery = [], context = {}) {
  const warnings = []
  const urls = new Set()

  for (const [index, item] of gallery.entries()) {
    const src = item?.src ?? item?.url
    if (!src || !isValidImageUrl(src)) {
      warnings.push({ code: 'gallery-corrupt', index, id: context.id })
    } else if (urls.has(src)) {
      warnings.push({ code: 'gallery-duplicate', index, id: context.id })
    } else {
      urls.add(src)
    }
    if (!item?.alt?.trim()) {
      warnings.push({ code: 'gallery-empty-alt', index, id: context.id })
    }
  }

  if (import.meta.env.DEV && warnings.length) {
    warnRuntime('assets-gallery', 'integrity', { count: warnings.length, ...context })
  }

  return warnings
}

/**
 * Normaliza galería contractual o legacy a shape ImageGallery.
 * @param {object[]} cmsGallery — { image, alt, caption, featured }
 * @param {object[]} legacyGallery — { src, alt }
 */
export function normalizeGalleryImages(cmsGallery = [], legacyGallery = []) {
  const fromCms = cmsGallery
    .map((item, index) => {
      const url = pickImageUrl(item?.image ?? item)
      if (!url) return null
      return {
        src: url,
        alt: pickImageAlt(item?.image ?? item, item?.caption || item?.alt || ''),
        id: item?.id || item?._key || `cms-gallery-${index}`,
        featured: Boolean(item?.featured),
      }
    })
    .filter(Boolean)

  const gallery = fromCms.length
    ? fromCms
    : legacyGallery.map((item, index) => ({
        src: item.src,
        alt: item.alt || '',
        id: item.id || `legacy-gallery-${index}`,
        featured: false,
      }))

  auditGalleryIntegrity(gallery)
  return gallery
}

export function warnMissingAsset(type, id, detail = {}) {
  if (!import.meta.env.DEV) return
  console.warn(`[utilcar assets:${type}] missing-image`, { id, ...detail })
}
