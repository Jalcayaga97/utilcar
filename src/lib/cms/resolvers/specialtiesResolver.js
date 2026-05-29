import { USE_BLOCK_RESOLVER, USE_SPECIALTIES_V2 } from '@/lib/cms/config'
import {
  mapSpecialtiesBlockToContract,
  categoryContractToLegacyShape,
  getValidSpecialtyCategories,
} from '@/lib/cms/contracts/specialtiesContract'
import {
  resolveCategoryHeroImage,
  resolveCategoryGalleryImages,
  resolveSpecialtyCta,
} from '@/lib/cms/assets/resolveSpecialtyAssets'
import { findBlock, isEmptyField, missingBlockWarning, missingFieldWarning } from './blockUtils'
import { logResolverDomain } from './resolverLog'

export const BLOCK_TYPE = 'specialtiesBlock'
export const REQUIRED_FIELDS = ['title']

export function findSpecialtiesBlock(blocks) {
  return findBlock(blocks, BLOCK_TYPE)
}

/** coalesce(categories[], items[]) → mirror legacy items. */
export function resolveSpecialtiesNew(block) {
  if (!block) return []
  const categories = block.categories
  if (Array.isArray(categories) && categories.length > 0) {
    return categories
  }
  return block.items ?? []
}

export function resolveSpecialtiesMirror(block, fallback) {
  if (!block) return undefined
  const mirror = {
    eyebrow: block.eyebrow,
    title: block.title,
    description: block.description,
    itemEyebrowPrefix:
      block.itemEyebrowPrefix ??
      fallback?.especialidades?.itemEyebrowPrefix,
  }
  logResolverDomain('specialties', {
    resolved: Boolean(block.title),
    categoryCount: block.categories?.length ?? 0,
    itemCount: block.items?.length ?? 0,
  })
  return mirror
}

/** @deprecated Usar specialtiesSection */
export function resolveSpecialtiesItems(block) {
  const items = resolveSpecialtiesNew(block)
  logResolverDomain('specialties', { extension: 'specialtiesItems', count: items.length })
  return items
}

/**
 * Parsea specialtiesBlock → contrato normalizado.
 * @param {object | null | undefined} block
 */
export function parseSpecialtiesBlock(block) {
  const { section, warnings, validCategories } = mapSpecialtiesBlockToContract(block)

  const enabledCategories = validCategories.filter((cat) => cat.enabled !== false)

  const result = {
    section: section
      ? { ...section, categories: enabledCategories }
      : null,
    warnings,
    validCategories: enabledCategories,
    source: 'cms',
  }

  logResolverDomain('specialties', {
    action: 'parseSpecialtiesBlock',
    categoryCount: section?.categories?.length ?? 0,
    validCount: enabledCategories.length,
    warningCount: warnings.length,
  })

  return result
}

/** Sección contractual completa desde specialtiesBlock. */
export function buildSpecialtiesSection(block) {
  if (!block || block.enabled === false) return null

  const { section, warnings, validCategories } = parseSpecialtiesBlock(block)
  if (!section?.categories?.length) return null

  const built = {
    ...section,
    categories: validCategories,
    warnings,
    source: 'cms',
  }

  logResolverDomain('specialties', {
    extension: 'specialtiesSection',
    categoryCount: built.categories.length,
    brandCount: built.categories.reduce((n, cat) => n + (cat.brands?.length ?? 0), 0),
  })

  return built
}

/**
 * Índice legacy por canonical id para merge de imágenes locales.
 * @param {object[]} legacyList
 */
export function indexLegacySpecialties(legacyList) {
  const map = new Map()
  for (const item of legacyList ?? []) {
    if (item?.id) map.set(item.id, item)
  }
  return map
}

/**
 * Categoría contractual → shape display EspecialidadesUtilcar (legacy-compatible).
 * @param {object} category
 * @param {Map<string, object>} legacyById
 */
export function mapCategoryToDisplayItem(category, legacyById) {
  if (!category) return null

  const legacyItem = legacyById.get(category.id)
  const hero = resolveCategoryHeroImage(category, legacyItem)
  const gallery = resolveCategoryGalleryImages(category.gallery)
  const cta = resolveSpecialtyCta(category.cta, legacyItem?.cta)

  const specGroups = (category.features ?? []).map((feature) => ({
    title: feature.groupTitle || 'Especificaciones',
    items: feature.items ?? [],
  }))

  return {
    id: category.id,
    title: category.title,
    subtitle: category.subtitle,
    intro: category.description,
    specGroups: specGroups.length ? specGroups : (legacyItem?.specGroups ?? []),
    cta,
    image: hero.url,
    imageAlt: hero.alt || legacyItem?.imageAlt || category.title,
    imageSource: hero.source,
    gallery,
    brands: category.brands ?? [],
    featured: category.featured,
    enabled: category.enabled !== false,
    layout: category.layout,
    _category: category,
  }
}

/**
 * Lista display para EspecialidadesUtilcar desde sección CMS.
 * @param {object} section specialtiesSection
 * @param {object[]} legacyList fallback imágenes locales
 */
export function mapSpecialtiesSectionToDisplayList(section, legacyList = []) {
  if (!section?.categories?.length) return []

  const legacyById = indexLegacySpecialties(legacyList)
  return section.categories
    .filter((cat) => cat.enabled !== false)
    .map((category) => mapCategoryToDisplayItem(category, legacyById))
    .filter(Boolean)
}

/**
 * Sección specialties activa (CMS-first) cuando flags ON y hay categorías válidas.
 * @returns {object | null}
 */
export function getActiveSpecialtiesSection(extensions) {
  if (!USE_BLOCK_RESOLVER || !USE_SPECIALTIES_V2) return null
  const section = extensions?.specialtiesSection
  if (!section?.categories?.length) return null
  return section
}

export function collectSpecialtiesWarnings(blocks) {
  const warnings = []
  const block = findSpecialtiesBlock(blocks)
  if (!block) {
    warnings.push(missingBlockWarning(BLOCK_TYPE))
    return warnings
  }
  if (block.enabled === false) return warnings

  for (const field of REQUIRED_FIELDS) {
    if (isEmptyField(block[field])) {
      warnings.push(missingFieldWarning(BLOCK_TYPE, field))
    }
  }

  const hasCategories = Array.isArray(block.categories) && block.categories.length > 0
  const hasItems = Array.isArray(block.items) && block.items.length > 0
  if (!hasCategories && !hasItems) {
    warnings.push(missingFieldWarning(BLOCK_TYPE, 'categories'))
  }

  return warnings
}

export function emptySpecialtiesSectionExtension() {
  return null
}

/** @deprecated Usar specialtiesSection */
export function emptySpecialtiesExtension() {
  return []
}

export { categoryContractToLegacyShape, mapSpecialtiesBlockToContract }
