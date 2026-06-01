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
      url: raw.ogImage?.asset?.url ?? raw.ogImage?.url ?? null,
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
    ogImage: cmsSeo.ogImage?.url || base.ogImage,
  }
}
