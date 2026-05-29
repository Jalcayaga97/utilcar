import { LIMITS, GOVERNANCE_MESSAGES } from './constants.js'
import { resolveCanonicalId } from './identity.js'

const isStudioDev =
  typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)

function normalizeTitle(title) {
  return String(title ?? '')
    .trim()
    .toLowerCase()
}

/** Lista specialtiesNew del documento homePage. */
function getSpecialtiesNew(context) {
  return context.document?.specialtiesNew ?? []
}

export function specialtyTitleRules(Rule) {
  return Rule.required()
    .min(LIMITS.TITLE_MIN)
    .error(GOVERNANCE_MESSAGES.titleMin)
    .custom((title, context) => {
      const normalized = normalizeTitle(title)
      if (!normalized) return true

      const siblings = getSpecialtiesNew(context)
      const duplicates = siblings.filter(
        (item) => normalizeTitle(item?.title) === normalized,
      ).length

      if (duplicates > 1) return GOVERNANCE_MESSAGES.titleDuplicate
      return true
    })
}

export function specialtyDescriptionRules(Rule) {
  return [
    Rule.max(LIMITS.DESCRIPTION_MAX).error(GOVERNANCE_MESSAGES.descriptionMax),
    Rule.custom((value) => {
      if (!value || String(value).length <= LIMITS.DESCRIPTION_SOFT) return true
      return GOVERNANCE_MESSAGES.descriptionSoft
    }).warning(),
  ]
}

export function specialtyFeaturesRules(Rule) {
  return Rule.max(LIMITS.FEATURES_MAX).error(GOVERNANCE_MESSAGES.featuresMax)
}

export function specialtyImageRules(Rule) {
  return Rule.custom((image) => {
    if (!image?.asset?._ref && !image?.asset?._id) {
      return GOVERNANCE_MESSAGES.imageRequired
    }
    return true
  })
}

export function specialtiesNewArrayRules(Rule) {
  return [
    Rule.custom((items) => {
      if (!Array.isArray(items)) return true
      if (items.length > LIMITS.SPECIALTIES_VISIBLE_MAX) {
        return GOVERNANCE_MESSAGES.specialtiesTooMany
      }
      return true
    }).warning(),
    Rule.custom((items) => {
      if (!Array.isArray(items)) return true
      if (items.length > LIMITS.SPECIALTIES_VISIBLE_SOFT) {
        return GOVERNANCE_MESSAGES.specialtiesRecommendedMax
      }
      return true
    }).warning(),
    Rule.custom((items) => {
      if (!isStudioDev || !Array.isArray(items) || items.length < 2) return true

      const ids = items.map((item) => resolveCanonicalId(item)).filter(Boolean)
      const unique = new Set(ids)
      if (unique.size < ids.length) {
        return GOVERNANCE_MESSAGES.canonicalIdDuplicate
      }
      return true
    }).warning(),
  ]
}

export function isBrandSlugLocked(document, slugValue) {
  return Boolean(document?._createdAt && slugValue?.current?.trim())
}
