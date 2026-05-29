/**
 * Validación de categorías migradas (pre-patch).
 */
import { logMigrateValidate, logMigrateWarning } from './specialtiesMigrationLog.js'

function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

function hasImageAsset(image) {
  return Boolean(image?.asset?._ref || image?.asset?._id)
}

function isValidSlug(slug) {
  const current = sanitizeString(slug?.current ?? slug)
  if (!current) return false
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)
}

function isValidCtaPath(path) {
  const value = sanitizeString(path)
  if (!value) return false
  return (
    value.startsWith('/') ||
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('#')
  )
}

/**
 * @param {object} category
 * @returns {{ valid: boolean, blocking: object[], warnings: object[], category: object }}
 */
export function validateMigratedCategory(category) {
  const blocking = []
  const warnings = []
  const id = category?._key ?? category?.slug?.current ?? 'unknown'

  if (!sanitizeString(category?.title)) {
    blocking.push({
      type: 'missing-title',
      id,
      message: 'title vacío — categoría bloqueante',
    })
  }

  const slugCurrent = category?.slug?.current
  if (slugCurrent && !isValidSlug(slugCurrent)) {
    blocking.push({
      type: 'invalid-slug',
      id,
      slug: slugCurrent,
      message: 'slug inválido',
    })
  }

  if (!hasImageAsset(category?.heroImage)) {
    warnings.push({
      type: 'category-without-image',
      id,
      message: 'sin imagen hero',
    })
  }

  if (!category?.features?.length) {
    warnings.push({
      type: 'empty-features',
      id,
      message: 'sin features',
    })
  }

  const ctaLabel = sanitizeString(category?.cta?.label)
  const ctaPath = sanitizeString(category?.cta?.to)
  if (ctaLabel && !ctaPath) {
    warnings.push({ type: 'invalid-cta', id, reason: 'missing-path', message: 'CTA incompleto' })
  }
  if (!ctaLabel && ctaPath) {
    warnings.push({ type: 'invalid-cta', id, reason: 'missing-label', message: 'CTA incompleto' })
  }
  if (ctaPath && !isValidCtaPath(ctaPath)) {
    warnings.push({ type: 'invalid-cta', id, reason: 'invalid-path', path: ctaPath })
  }

  const valid = blocking.length === 0

  for (const w of warnings) {
    logMigrateWarning(w.type, w)
  }

  if (!valid) {
    logMigrateValidate('blocking', { id, blocking })
  }

  return { valid, blocking, warnings, category }
}

/**
 * Filtra categorías válidas y reporta bloqueantes.
 * @param {object[]} categories
 */
export function validateMigratedCategories(categories) {
  const results = (categories ?? []).map((category) => validateMigratedCategory(category))

  const slugSeen = new Map()
  for (const { category, warnings } of results) {
    const slug = sanitizeString(category?.slug?.current)
    if (!slug) continue
    if (slugSeen.has(slug)) {
      warnings.push({
        type: 'duplicate-slug',
        id: category._key,
        slug,
        message: 'slug duplicado',
      })
      logMigrateWarning('duplicate-slug', { slug, id: category._key })
    } else {
      slugSeen.set(slug, category._key)
    }
  }

  return {
    validCategories: results.filter((r) => r.valid).map((r) => r.category),
    invalidCategories: results.filter((r) => !r.valid),
    allWarnings: results.flatMap((r) => r.warnings),
  }
}

export { hasImageAsset, isValidSlug, sanitizeString }
