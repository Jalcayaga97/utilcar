import { pickImageUrl } from '@/lib/cms/assets/resolveImage'
import { SITE } from '@/constants/site'

function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function seoSectionContract(raw = {}) {
  return {
    enabled: raw.enabled !== false,
    title: sanitizeString(raw.title),
    description: sanitizeString(raw.description),
    keywords: sanitizeString(raw.keywords),
    canonicalPath: sanitizeString(raw.canonicalPath),
    noindex: Boolean(raw.noindex),
    ogImage: {
      url: pickImageUrl(raw.ogImage) ?? null,
      alt: sanitizeString(raw.ogImage?.alt),
    },
    warnings: [],
    source: 'cms',
  }
}

export function validateSeoSection(section) {
  const warnings = []
  if (section.title && section.title.length < 3) warnings.push('seo-title-short')
  if (section.description && section.description.length > 160) {
    warnings.push('seo-description-long')
  }
  if (section.canonicalPath && !section.canonicalPath.startsWith('/')) {
    warnings.push('seo-canonical-invalid')
  }
  return { valid: warnings.length === 0 || section.title, warnings }
}

export function mapSeoBlockToContract(raw) {
  const section = seoSectionContract(raw)
  const { valid, warnings } = validateSeoSection(section)
  section.warnings = warnings
  return { section: valid || section.title ? section : null, warnings }
}

/**
 * Resuelve imagen social: seoBlock.ogImage → hero.image → SITE.ogImage
 */
export function resolveSocialImageUrl({
  seoOgImageUrl = null,
  heroImageUrl = null,
  defaultOgImage = SITE.ogImage,
} = {}) {
  return seoOgImageUrl || heroImageUrl || defaultOgImage || null
}

/**
 * Enriquece seoSection con ogImage resuelto en runtime (sin mutar editorial).
 */
export function enrichSeoSectionForRuntime(seoSection, heroSection) {
  if (!seoSection) return null
  const heroUrl = pickImageUrl(heroSection?.image)
  const seoOgUrl = seoSection.ogImage?.url ?? null
  const resolvedUrl = resolveSocialImageUrl({
    seoOgImageUrl: seoOgUrl,
    heroImageUrl: heroUrl,
  })
  return {
    ...seoSection,
    ogImage: {
      url: resolvedUrl,
      alt:
        seoSection.ogImage?.alt ||
        heroSection?.imageAlt ||
        heroSection?.image?.alt ||
        '',
    },
  }
}

/**
 * Merge SEO CMS sobre baseline local (constants/seo.js).
 * @param {object} base — { title, description, keywords, path }
 * @param {object | null} cmsSeo
 */
export function mergePageSeo(base, cmsSeo) {
  if (!cmsSeo?.title && !cmsSeo?.description) return base

  return {
    ...base,
    title: cmsSeo.title || base.title,
    description: cmsSeo.description || base.description,
    keywords: cmsSeo.keywords || base.keywords,
    path: cmsSeo.canonicalPath || base.path,
    noindex: cmsSeo.noindex ?? false,
    ogImage: resolveSocialImageUrl({
      seoOgImageUrl: cmsSeo.ogImage?.url ?? null,
      defaultOgImage: base.ogImage || SITE.ogImage,
    }),
  }
}
