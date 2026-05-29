/**
 * Contrato draft — dominio specialties (categorías, marcas, features, galerías, CTA).
 * Pre-implementación: sin runtime, GROQ productivo ni resolvers activos.
 */

import { logSpecialtiesContract } from '@/lib/cms/contracts/specialtiesContractLog'

const DEFAULT_CTA = Object.freeze({
  label: '',
  to: '/contacto',
  ariaLabel: '',
  styleVariant: 'primary',
})

const DEFAULT_IMAGE = Object.freeze({ url: null, alt: '' })

const DEFAULT_LAYOUT = Object.freeze({
  variant: 'alternating',
  showBrandTabs: false,
  imagePosition: 'alternate',
  columns: 3,
  dense: false,
})

export function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

function stableId(raw, index, prefix) {
  const key = sanitizeString(raw?._key)
  if (key) return key
  const explicit =
    sanitizeString(raw?.id) ||
    sanitizeString(raw?.canonicalId) ||
    sanitizeString(raw?.slug?.current ?? raw?.slug)
  if (explicit) return explicit
  const blockKey = sanitizeString(raw?.blockMeta?.blockKey)
  if (blockKey) return blockKey
  return `${prefix}-${index}`
}

function hasImageAsset(image) {
  return Boolean(image?.url || image?.asset?._ref || image?.asset?._id || image?.asset?.url)
}

function normalizeImageField(raw, altFallback = '') {
  if (!raw || typeof raw !== 'object') {
    return { url: null, alt: sanitizeString(altFallback) }
  }
  if (typeof raw === 'string') {
    return { url: raw, alt: sanitizeString(altFallback) }
  }
  const url = raw?.asset?.url ?? raw?.url ?? null
  return {
    url: url || null,
    alt: sanitizeString(raw?.alt ?? altFallback),
  }
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

export function specialtyCtaContract(overrides = {}) {
  return {
    label: '',
    to: '',
    ariaLabel: '',
    styleVariant: 'primary',
    ...overrides,
  }
}

export function specialtyFeatureContract(overrides = {}) {
  return {
    groupTitle: '',
    items: [],
    kind: 'spec',
    order: 0,
    ...overrides,
  }
}

export function specialtyGalleryItemContract(overrides = {}) {
  return {
    id: '',
    image: { ...DEFAULT_IMAGE },
    caption: '',
    role: 'gallery',
    featured: false,
    order: 0,
    ...overrides,
  }
}

export function specialtyBrandContract(overrides = {}) {
  return {
    id: '',
    name: '',
    logo: { ...DEFAULT_IMAGE },
    description: '',
    features: [],
    gallery: [],
    cta: specialtyCtaContract(),
    featured: false,
    order: 0,
    referenceId: null,
    ...overrides,
  }
}

export function specialtyCategoryContract(overrides = {}) {
  return {
    id: '',
    title: '',
    subtitle: '',
    description: '',
    heroImage: { ...DEFAULT_IMAGE },
    features: [],
    gallery: [],
    cta: specialtyCtaContract(),
    layout: { ...DEFAULT_LAYOUT },
    brands: [],
    order: 0,
    enabled: true,
    ...overrides,
  }
}

export function normalizeSpecialtyCta(raw) {
  if (!raw || typeof raw !== 'object') return specialtyCtaContract()
  return specialtyCtaContract({
    label: sanitizeString(raw.label ?? raw.buttonText),
    to: sanitizeString(raw.to ?? raw.path ?? raw.buttonLink ?? raw.href),
    ariaLabel: sanitizeString(raw.ariaLabel) || sanitizeString(raw.label ?? raw.buttonText),
    styleVariant: sanitizeString(raw.styleVariant) || 'primary',
  })
}

export function normalizeSpecialtyFeature(raw, context = {}) {
  const index = context.index ?? 0
  const items = Array.isArray(raw?.items)
    ? raw.items.map((item) => sanitizeString(item)).filter(Boolean)
    : []
  return specialtyFeatureContract({
    groupTitle: sanitizeString(raw?.groupTitle ?? raw?.title),
    items,
    kind: sanitizeString(raw?.kind) || 'spec',
    order: raw?.order ?? index,
  })
}

export function normalizeSpecialtyGallery(raw, context = {}) {
  const index = context.index ?? 0
  return specialtyGalleryItemContract({
    id: stableId(raw, index, 'gallery'),
    image: normalizeImageField(raw?.image ?? raw, raw?.alt),
    caption: sanitizeString(raw?.caption),
    role: sanitizeString(raw?.role) || 'gallery',
    featured: Boolean(raw?.featured),
    order: raw?.order ?? index,
  })
}

function mapLegacyFeatures(raw) {
  if (Array.isArray(raw?.specGroups) && raw.specGroups.length) {
    return raw.specGroups.map((group, index) =>
      normalizeSpecialtyFeature(
        { groupTitle: group?.title, items: group?.items, kind: 'spec' },
        { index },
      ),
    )
  }
  if (Array.isArray(raw?.features) && raw.features.length) {
    return [
      normalizeSpecialtyFeature(
        { groupTitle: 'Características', items: raw.features, kind: 'benefit' },
        { index: 0 },
      ),
    ]
  }
  return []
}

function mapLegacyGallery(raw) {
  const list = raw?.gallery ?? raw?.galleries
  if (!Array.isArray(list)) return []
  return list.map((item, index) => normalizeSpecialtyGallery(item, { index }))
}

export function normalizeSpecialtyBrand(raw, context = {}) {
  const index = context.index ?? 0
  const ref = raw?.reference ?? raw?.brandRef
  const referenceId =
    (ref?._ref ?? ref?._id ?? sanitizeString(raw?.referenceId)) || null

  const name =
    sanitizeString(raw?.name) ||
    sanitizeString(ref?.name) ||
    sanitizeString(raw?.title)

  return specialtyBrandContract({
    id: stableId(raw, index, 'brand'),
    name,
    logo: normalizeImageField(raw?.logo ?? ref?.logo, name),
    description: sanitizeString(raw?.description ?? raw?.subtitle),
    features: (raw?.features ?? []).map((feature, featureIndex) =>
      normalizeSpecialtyFeature(feature, { index: featureIndex }),
    ),
    gallery: (raw?.gallery ?? raw?.galleries ?? []).map((item, galleryIndex) =>
      normalizeSpecialtyGallery(item, { index: galleryIndex }),
    ),
    cta: normalizeSpecialtyCta(raw?.cta),
    featured: Boolean(raw?.featured),
    order: raw?.order ?? index,
    referenceId,
  })
}

/**
 * Normaliza categoría desde shape futuro (categories[]) o legacy (specialty / items[]).
 */
export function normalizeSpecialtyCategory(raw, context = {}) {
  const index = context.index ?? 0
  const description =
    sanitizeString(raw?.description) ||
    sanitizeString(raw?.intro)

  const features =
    Array.isArray(raw?.features) &&
    raw.features.length &&
    typeof raw.features[0] === 'object' &&
    !Array.isArray(raw.features[0])
      ? raw.features.map((feature, featureIndex) =>
          normalizeSpecialtyFeature(feature, { index: featureIndex }),
        )
      : mapLegacyFeatures(raw)

  const brands = (raw?.brands ?? []).map((brand, brandIndex) =>
    normalizeSpecialtyBrand(brand, { index: brandIndex }),
  )

  const gallery =
    mapLegacyGallery(raw).length > 0
      ? mapLegacyGallery(raw)
      : (raw?.gallery ?? []).map((item, galleryIndex) =>
          normalizeSpecialtyGallery(item, { index: galleryIndex }),
        )

  const layoutRaw = raw?.layout ?? raw?.layoutConfig ?? {}

  return specialtyCategoryContract({
    id: stableId(raw, index, 'category'),
    title: sanitizeString(raw?.title),
    subtitle: sanitizeString(raw?.subtitle),
    description,
    heroImage: normalizeImageField(
      raw?.heroImage ?? raw?.image,
      raw?.heroImageAlt ?? raw?.imageAlt ?? raw?.title,
    ),
    features,
    gallery,
    cta: normalizeSpecialtyCta(
      raw?.cta ?? {
        label: raw?.buttonText,
        to: raw?.buttonLink,
      },
    ),
    layout: {
      variant: sanitizeString(layoutRaw.variant) || DEFAULT_LAYOUT.variant,
      showBrandTabs: Boolean(layoutRaw.showBrandTabs),
      imagePosition: sanitizeString(layoutRaw.imagePosition) || DEFAULT_LAYOUT.imagePosition,
      columns: layoutRaw.columns ?? DEFAULT_LAYOUT.columns,
      dense: Boolean(layoutRaw.dense),
    },
    brands,
    order: raw?.order ?? index,
    enabled: raw?.enabled !== false,
  })
}

function collectDuplicateBrandWarnings(brands, categoryId) {
  const warnings = []
  const seen = new Map()
  for (const brand of brands) {
    const id = brand?.id
    if (!id) continue
    if (seen.has(id)) {
      warnings.push({
        type: 'duplicate-brand-id',
        block: 'specialtiesBlock',
        field: 'brands',
        categoryId,
        id,
        message: 'duplicate brand id',
      })
    } else {
      seen.set(id, true)
    }
  }
  return warnings
}

export function validateSpecialtyCta(cta, context = {}) {
  const warnings = []
  const label = sanitizeString(cta?.label)
  const path = sanitizeString(cta?.to)

  if (label && !path) {
    warnings.push({
      type: 'invalid-cta',
      ...context,
      message: 'invalid cta',
      reason: 'missing-path',
    })
  }
  if (path && !label) {
    warnings.push({
      type: 'invalid-cta',
      ...context,
      message: 'invalid cta',
      reason: 'missing-label',
    })
  }
  if (path && !isValidCtaPath(path)) {
    warnings.push({
      type: 'invalid-cta',
      ...context,
      path,
      message: 'invalid cta',
      reason: 'invalid-path',
    })
  }
  return warnings
}

export function validateSpecialtyBrand(brand, context = {}) {
  const warnings = []
  const categoryId = context.categoryId
  const index = context.index ?? 0
  const id = brand?.id ?? `brand-${index}`

  if (!sanitizeString(brand?.name)) {
    warnings.push({
      type: 'missing-title',
      block: 'specialtiesBlock',
      field: 'brands',
      categoryId,
      index,
      id,
      message: 'missing title',
    })
  }

  if (!brand?.gallery?.length) {
    warnings.push({
      type: 'brand-without-gallery',
      block: 'specialtiesBlock',
      field: 'brands',
      categoryId,
      index,
      id,
      message: 'brand without gallery',
    })
  }

  if (!brand?.features?.length) {
    warnings.push({
      type: 'empty-features',
      block: 'specialtiesBlock',
      field: 'brands',
      categoryId,
      index,
      id,
      message: 'empty features',
    })
  }

  warnings.push(
    ...validateSpecialtyCta(brand?.cta, {
      block: 'specialtiesBlock',
      field: 'brands',
      categoryId,
      index,
      id,
    }),
  )

  const valid = warnings.every((w) => w.type !== 'missing-title')
  return { valid, warnings }
}

export function validateSpecialtyCategory(category, context = {}) {
  const warnings = []
  const index = context.index ?? 0
  const id = category?.id ?? `category-${index}`

  if (!sanitizeString(category?.title)) {
    warnings.push({
      type: 'missing-title',
      block: 'specialtiesBlock',
      field: 'categories',
      index,
      id,
      message: 'missing title',
    })
  }

  if (!hasImageAsset(category?.heroImage)) {
    warnings.push({
      type: 'missing-hero-image',
      block: 'specialtiesBlock',
      field: 'categories',
      index,
      id,
      message: 'missing hero image',
    })
  }

  if (!category?.features?.length && !category?.brands?.length) {
    warnings.push({
      type: 'empty-features',
      block: 'specialtiesBlock',
      field: 'categories',
      index,
      id,
      message: 'empty features',
    })
  }

  warnings.push(
    ...validateSpecialtyCta(category?.cta, {
      block: 'specialtiesBlock',
      field: 'categories',
      index,
      id,
    }),
  )

  const brandWarnings = (category?.brands ?? []).flatMap((brand, brandIndex) =>
    validateSpecialtyBrand(brand, { categoryId: id, index: brandIndex }).warnings,
  )
  warnings.push(...brandWarnings)
  warnings.push(...collectDuplicateBrandWarnings(category?.brands ?? [], id))

  const valid = warnings.every((w) => w.type !== 'missing-title')
  return { valid, warnings }
}

export function getValidSpecialtyCategories(categories) {
  if (!Array.isArray(categories)) return []
  return categories.filter((category) => validateSpecialtyCategory(category).valid)
}

function readCategoriesFromBlock(block) {
  const list = block?.categories ?? block?.items ?? []
  return Array.isArray(list) ? list : []
}

/**
 * Mapea specialtiesBlock (draft o legacy) → contrato de sección.
 * @param {object | null | undefined} block
 */
export function mapSpecialtiesBlockToContract(block) {
  if (!block) {
    return { section: null, warnings: [], validCategories: [] }
  }

  const categories = readCategoriesFromBlock(block).map((raw, index) =>
    normalizeSpecialtyCategory(raw, { index }),
  )

  const section = {
    eyebrow: sanitizeString(block.eyebrow),
    title: sanitizeString(block.title),
    description: sanitizeString(block.description),
    itemEyebrowPrefix: sanitizeString(block.itemEyebrowPrefix),
    categories,
  }

  const warnings = categories.flatMap((category, index) =>
    validateSpecialtyCategory(category, { index }).warnings,
  )
  const validCategories = getValidSpecialtyCategories(categories)

  logSpecialtiesContract({
    action: 'mapSpecialtiesBlockToContract',
    categoryCount: categories.length,
    validCount: validCategories.length,
    warningCount: warnings.length,
  })

  return { section, warnings, validCategories }
}

/** Puente draft → shape legacy EspecialidadesUtilcar (futuro adapter). */
export function categoryContractToLegacyShape(category) {
  if (!category) return null
  return {
    id: category.id,
    title: category.title,
    subtitle: category.subtitle,
    intro: category.description,
    specGroups: category.features.map((feature) => ({
      title: feature.groupTitle || 'Especificaciones',
      items: feature.items,
    })),
    cta: {
      label: category.cta.label,
      path: category.cta.to,
    },
    image: category.heroImage.url,
    imageAlt: category.heroImage.alt,
  }
}

export {
  DEFAULT_CTA,
  DEFAULT_IMAGE,
  DEFAULT_LAYOUT,
  hasImageAsset,
  isValidCtaPath,
}
