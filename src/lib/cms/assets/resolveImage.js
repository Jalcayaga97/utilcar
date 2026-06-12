/**
 * Utilidades compartidas — Asset Resolution Layer.
 * Prioridad: CMS → legacy → placeholder
 */
import { SANITY_CONFIG } from '@/lib/cms/config'
import { logAssetsDomain } from '@/lib/cms/assets/assetsLog'
import { warnRuntime } from '@/lib/cms/runtimeLog'

const PLACEHOLDER_DATA_URI =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23f4f4f5" width="400" height="300"/%3E%3C/svg%3E'

const SANITY_CDN_HOST = 'cdn.sanity.io'
export const SANITY_WEBP_QUALITY = 80

export function isSanityCdnUrl(url) {
  if (!url || typeof url !== 'string') return false
  try {
    return new URL(url).hostname === SANITY_CDN_HOST
  } catch {
    return false
  }
}

/**
 * Entrega WebP desde Sanity CDN (fm=webp, q=80) sin romper URLs locales ni data URIs.
 */
export function optimizeSanityCdnUrl(
  url,
  { format = 'webp', quality = SANITY_WEBP_QUALITY } = {},
) {
  if (!isSanityCdnUrl(url)) return url
  try {
    const parsed = new URL(url)
    if (parsed.searchParams.get('fm') === format) {
      if (!parsed.searchParams.has('q')) {
        parsed.searchParams.set('q', String(quality))
      }
      return parsed.toString()
    }
    parsed.searchParams.set('fm', format)
    parsed.searchParams.set('q', String(quality))
    return parsed.toString()
  } catch {
    return url
  }
}

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

/**
 * Construye URL CDN a partir de asset._ref / asset._id de Sanity (sin urlFor).
 * Formato ref: image-{hash}-{width}x{height}-{format}
 */
export function buildSanityImageUrlFromRef(ref) {
  if (!ref || typeof ref !== 'string') return null

  const normalized = ref.startsWith('image-') ? ref.slice('image-'.length) : ref
  const match = normalized.match(/^([a-f0-9]+)-(\d+x\d+)-(\w+)$/i)
  if (!match) return null

  const { projectId, dataset } = SANITY_CONFIG
  if (!projectId?.trim() || !dataset?.trim()) return null

  const [, hash, dimensions, format] = match
  const base = `https://cdn.sanity.io/images/${projectId.trim()}/${dataset.trim()}/${hash}-${dimensions}.${format}`
  return optimizeSanityCdnUrl(base)
}

export function pickImageUrl(imageField) {
  if (!imageField) return null
  if (typeof imageField === 'string') return isValidImageUrl(imageField) ? imageField : null

  const directUrl = imageField?.url ?? imageField?.asset?.url ?? null
  if (isValidImageUrl(directUrl)) return optimizeSanityCdnUrl(directUrl)

  const ref =
    imageField?.asset?._ref ??
    imageField?.asset?._id ??
    imageField?._ref ??
    null
  const builtUrl = buildSanityImageUrlFromRef(ref)
  return isValidImageUrl(builtUrl) ? builtUrl : null
}

function resolveGalleryItemUrl(item) {
  if (!item) return null
  return (
    (typeof item?.src === 'string' && isValidImageUrl(item.src) ? item.src : null) ||
    (typeof item?.url === 'string' && isValidImageUrl(item.url) ? item.url : null) ||
    pickImageUrl(item?.image) ||
    pickImageUrl(item)
  )
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
      const url = resolveGalleryItemUrl(item)
      if (!url) return null
      const imageField = item?.image ?? item
      return {
        src: url,
        url,
        alt: pickImageAlt(imageField, item?.caption || item?.alt || ''),
        id: item?.id || item?._key || `cms-gallery-${index}`,
        featured: Boolean(item?.featured),
        image: imageField?.asset || imageField?.url ? imageField : undefined,
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
