import { LIMITS, GOVERNANCE_MESSAGES } from './constants.js'

function hasImageAsset(value) {
  return Boolean(value?.asset?._ref || value?.asset?._id)
}

function normalizeTitle(title) {
  return String(title ?? '')
    .trim()
    .toLowerCase()
}

export function specialtyCategoryTitleRules(Rule) {
  return Rule.required().min(LIMITS.TITLE_MIN).error(GOVERNANCE_MESSAGES.titleMin)
}

export function specialtyCategoryHeroWarning(Rule) {
  return Rule.custom((value) => {
    if (!hasImageAsset(value)) {
      return GOVERNANCE_MESSAGES.specialtyMissingHero
    }
    return true
  }).warning()
}

export function specialtyCtaWarning(Rule) {
  return Rule.custom((value) => {
    if (!value) return true
    const label = String(value.label ?? '').trim()
    const path = String(value.to ?? '').trim()
    if (label && !path) return GOVERNANCE_MESSAGES.specialtyInvalidCta
    if (!label && path) return GOVERNANCE_MESSAGES.specialtyInvalidCta
    return true
  }).warning()
}

export function specialtyGalleryItemAltWarning(Rule) {
  return Rule.custom((value, context) => {
    const image = context.parent?.image
    if (hasImageAsset(image) && !String(value ?? '').trim()) {
      return 'Recomendado: texto alternativo para accesibilidad.'
    }
    return true
  }).warning()
}

export function specialtyBrandGalleryWarning(Rule) {
  return Rule.custom((items) => {
    if (!Array.isArray(items) || !items.length) {
      return GOVERNANCE_MESSAGES.brandWithoutGallery
    }
    return true
  }).warning()
}

export function specialtyBrandFeaturesWarning(Rule) {
  return Rule.custom((items) => {
    if (!Array.isArray(items) || !items.length) {
      return GOVERNANCE_MESSAGES.emptyFeatures
    }
    return true
  }).warning()
}

/** Máximo de categorías en specialtiesBlock.categories[] */
export function specialtyCategoriesArrayRules(Rule) {
  return [
    Rule.custom((items) => {
      if (!Array.isArray(items)) return true
      if (items.length > LIMITS.SPECIALTY_CATEGORIES_MAX) {
        return GOVERNANCE_MESSAGES.specialtyCategoriesTooMany
      }
      return true
    }).warning(),
    Rule.custom((items) => {
      if (!Array.isArray(items) || items.length < 2) return true
      const titles = items.map((item) => normalizeTitle(item?.title)).filter(Boolean)
      const unique = new Set(titles)
      if (unique.size < titles.length) {
        return GOVERNANCE_MESSAGES.titleDuplicate
      }
      return true
    }).warning(),
  ]
}

/** Máximo de marcas por categoría */
export function specialtyBrandsArrayRules(Rule) {
  return Rule.custom((items) => {
    if (!Array.isArray(items)) return true
    if (items.length > LIMITS.SPECIALTY_BRANDS_MAX) {
      return GOVERNANCE_MESSAGES.specialtyBrandsTooMany
    }
    return true
  }).warning()
}

/** @deprecated — usar specialtyBrandsArrayRules en el array brands[] */
export function specialtyBrandsPerCategoryRules(Rule) {
  return specialtyBrandsArrayRules(Rule)
}

export function specialtyCategoryGalleryWarning(Rule) {
  return Rule.custom((items, context) => {
    const brands = context.parent?.brands
    const hasBrands = Array.isArray(brands) && brands.length > 0
    if (hasBrands) return true
    if (!Array.isArray(items) || !items.length) {
      return GOVERNANCE_MESSAGES.specialtyEmptyGallery
    }
    return true
  }).warning()
}

export { hasImageAsset }
