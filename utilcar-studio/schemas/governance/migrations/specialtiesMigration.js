/**
 * Migración idempotente specialtiesBlock.items[] → categories[].
 * Sin side-effects de red — usable desde CLI y tests.
 */
import { resolveCanonicalId } from '../identity.js'
import { blocksFromLegacyFields } from '../homePageSync.js'
import { validateMigratedCategories } from './specialtiesMigrationValidators.js'
import { logMigrate, logMigrateMerge } from './specialtiesMigrationLog.js'

function sanitizeString(value) {
  if (value == null) return ''
  return String(value).trim()
}

function normalizeTitle(title) {
  return sanitizeString(title).toLowerCase()
}

function slugify(text) {
  return sanitizeString(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function hasImageAsset(image) {
  return Boolean(image?.asset?._ref || image?.asset?._id)
}

function createKey(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function resolveCategoryIdentity(category) {
  if (!category) return ''
  const fromSlug = sanitizeString(category.slug?.current)
  if (fromSlug) return fromSlug
  return resolveCanonicalId({
    _key: category._key,
    id: category.canonicalId,
    title: category.title,
    slug: category.slug,
    blockMeta: category.blockMeta,
  })
}

function resolveItemIdentity(item) {
  return resolveCanonicalId(item)
}

/**
 * @param {object} category
 * @param {object} item legacy specialty
 */
export function categoryMatchesItem(category, item) {
  const catId = resolveCategoryIdentity(category)
  const itemId = resolveItemIdentity(item)
  if (catId && itemId && catId === itemId) return true

  const catSlug = sanitizeString(category?.slug?.current)
  const itemSlug = sanitizeString(item?.slug?.current ?? item?.id)
  if (catSlug && itemSlug && catSlug === slugify(itemSlug)) return true

  const catTitle = normalizeTitle(category?.title)
  const itemTitle = normalizeTitle(item?.title)
  return Boolean(catTitle && itemTitle && catTitle === itemTitle)
}

/**
 * @param {object[]} categories
 * @param {object} item
 */
export function findMatchingCategory(categories, item) {
  return (categories ?? []).find((category) => categoryMatchesItem(category, item)) ?? null
}

/**
 * @param {object} item
 */
export function buildCategoryFeatures(item) {
  if (Array.isArray(item?.specGroups) && item.specGroups.length) {
    return item.specGroups.map((group, index) => ({
      _type: 'specialtyFeature',
      _key: group._key ?? `feature-${index}`,
      title: sanitizeString(group.title) || 'Especificaciones',
      items: (group.items ?? []).map((entry) => sanitizeString(entry)).filter(Boolean),
      kind: 'spec',
    }))
  }

  const rawFeatures = item?.features
  if (!Array.isArray(rawFeatures) || !rawFeatures.length) return []

  if (typeof rawFeatures[0] === 'object' && rawFeatures[0] !== null) {
    return rawFeatures.map((group, index) => ({
      _type: 'specialtyFeature',
      _key: group._key ?? `feature-${index}`,
      title: sanitizeString(group.title ?? group.groupTitle) || 'Características',
      items: (group.items ?? []).map((entry) => sanitizeString(entry)).filter(Boolean),
      kind: sanitizeString(group.kind) || 'spec',
    }))
  }

  return [
    {
      _type: 'specialtyFeature',
      _key: 'feature-benefits',
      title: 'Características',
      items: rawFeatures.map((entry) => sanitizeString(entry)).filter(Boolean),
      kind: 'benefit',
    },
  ]
}

/**
 * @param {object} item
 * @param {object[]} [existingGallery]
 */
export function buildCategoryGallery(item, existingGallery = []) {
  if (Array.isArray(existingGallery) && existingGallery.length) {
    return existingGallery
  }

  const image = item?.heroImage ?? item?.image
  if (!hasImageAsset(image)) return []

  return [
    {
      _type: 'specialtyGalleryItem',
      _key: `${item._key ?? resolveItemIdentity(item) ?? 'cat'}-hero-gallery`,
      image,
      alt: sanitizeString(item.heroImageAlt ?? item.imageAlt ?? item.title),
      role: 'hero',
      featured: true,
    },
  ]
}

function mapLegacyCta(item) {
  const cta = item?.cta
  const label = sanitizeString(cta?.label ?? item?.buttonText)
  const to = sanitizeString(cta?.to ?? cta?.path ?? item?.buttonLink)

  if (!label && !to) return undefined

  return {
    _type: 'specialtyCta',
    label,
    to,
    ariaLabel: label,
    styleVariant: 'primary',
  }
}

function mergeCta(existing, incoming) {
  if (!incoming) return existing
  if (!existing) return incoming
  return {
    ...existing,
    label: sanitizeString(existing.label) || incoming.label,
    to: sanitizeString(existing.to) || incoming.to,
    ariaLabel: sanitizeString(existing.ariaLabel) || incoming.ariaLabel || existing.label || incoming.label,
  }
}

/**
 * @param {object} item legacy specialty / especialidadItem shape
 * @param {number} [index]
 */
export function mapLegacyItemToCategory(item, index = 0) {
  const identity = resolveItemIdentity(item) || `item-${index}`
  const slugCurrent = slugify(item?.id ?? item?.slug?.current ?? identity ?? item?.title)

  const description = sanitizeString(item?.description ?? item?.intro)

  return {
    _type: 'specialtyCategory',
    _key: item._key ?? `category-${identity}`,
    title: sanitizeString(item?.title),
    subtitle: sanitizeString(item?.subtitle),
    slug: { _type: 'slug', current: slugCurrent },
    description,
    heroImage: item?.heroImage ?? item?.image,
    heroImageAlt: sanitizeString(item?.heroImageAlt ?? item?.imageAlt),
    gallery: buildCategoryGallery(item),
    features: buildCategoryFeatures(item),
    cta: mapLegacyCta(item),
    brands: [],
    featured: false,
    enabled: item?.enabled !== false,
  }
}

/**
 * Merge incremental — preserva edición nueva en categories existentes.
 * @param {object[]} existingCategories
 * @param {object[]} incomingCategories from legacy items
 */
export function mergeExistingCategories(existingCategories, incomingCategories) {
  const result = [...(existingCategories ?? [])]
  const migrated = []
  const preserved = []
  const merged = []

  for (const incoming of incomingCategories) {
    const matchIndex = result.findIndex((existing) => categoryMatchesItem(existing, incoming))

    if (matchIndex < 0) {
      result.push(incoming)
      migrated.push(incoming.title || incoming.slug?.current || incoming._key)
      logMigrateMerge('append', { title: incoming.title, key: incoming._key })
      continue
    }

    const existing = result[matchIndex]
    const next = mergeCategoryFields(existing, incoming)
    result[matchIndex] = next
    merged.push(next.title || next.slug?.current || next._key)
    logMigrateMerge('merge', {
      title: next.title,
      key: next._key,
      preservedBrands: Boolean(existing.brands?.length),
      preservedGallery: Boolean(existing.gallery?.length),
    })
  }

  for (const cat of existingCategories ?? []) {
    const hadIncomingMatch = incomingCategories.some((incoming) =>
      categoryMatchesItem(cat, incoming),
    )
    if (!hadIncomingMatch) {
      preserved.push(cat.title || cat.slug?.current || cat._key)
    }
  }

  return { categories: result, migrated, preserved, merged }
}

function mergeCategoryFields(existing, incoming) {
  return {
    ...existing,
    _type: 'specialtyCategory',
    _key: existing._key ?? incoming._key,
    title: sanitizeString(existing.title) || incoming.title,
    subtitle: sanitizeString(existing.subtitle) || incoming.subtitle,
    slug: sanitizeString(existing.slug?.current)
      ? existing.slug
      : incoming.slug,
    description: sanitizeString(existing.description) || incoming.description,
    heroImage: hasImageAsset(existing.heroImage) ? existing.heroImage : incoming.heroImage,
    heroImageAlt: sanitizeString(existing.heroImageAlt) || incoming.heroImageAlt,
    gallery: existing.gallery?.length ? existing.gallery : incoming.gallery,
    features: existing.features?.length ? existing.features : incoming.features,
    cta: mergeCta(existing.cta, incoming.cta),
    brands: existing.brands?.length ? existing.brands : (incoming.brands ?? []),
    layoutConfig: existing.layoutConfig ?? incoming.layoutConfig,
    featured: existing.featured ?? incoming.featured ?? false,
    enabled: existing.enabled !== false,
  }
}

/**
 * @param {object | null | undefined} block specialtiesBlock
 */
export function detectMigrationState(block) {
  if (!block || block._type !== 'specialtiesBlock') {
    return {
      case: 'D',
      items: [],
      categories: [],
      shouldMigrate: false,
      reason: 'no specialtiesBlock',
    }
  }

  const items = Array.isArray(block.items) ? block.items : []
  const categories = Array.isArray(block.categories) ? block.categories : []

  if (!items.length && !categories.length) {
    return {
      case: 'D',
      items,
      categories,
      shouldMigrate: false,
      reason: 'empty specialties block',
    }
  }

  if (!items.length && categories.length) {
    return {
      case: 'C',
      items,
      categories,
      shouldMigrate: false,
      reason: 'categories only — already migrated',
    }
  }

  const unmatchedItems = items.filter((item) => !findMatchingCategory(categories, item))

  if (items.length && !categories.length) {
    return {
      case: 'A',
      items,
      categories,
      shouldMigrate: true,
      unmatchedItems: items,
      reason: 'full migration',
    }
  }

  if (unmatchedItems.length) {
    return {
      case: 'B',
      items,
      categories,
      shouldMigrate: true,
      unmatchedItems,
      reason: 'incremental merge',
    }
  }

  return {
    case: 'C',
    items,
    categories,
    shouldMigrate: false,
    reason: 'all legacy items matched — skip',
  }
}

/**
 * Ejecuta migración sobre un specialtiesBlock (sin persistir).
 * @param {object} block
 * @returns {{ block: object, snapshot: object, changed: boolean }}
 */
export function migrateSpecialtiesBlock(block) {
  const state = detectMigrationState(block)

  logMigrate('state', {
    case: state.case,
    reason: state.reason,
    items: state.items.length,
    categoriesBefore: state.categories.length,
  })

  if (!state.shouldMigrate) {
    return {
      block,
      changed: false,
      snapshot: {
        before: { itemsCount: state.items.length, categoriesCount: state.categories.length },
        after: { categoriesCount: state.categories.length },
        migratedIds: [],
        skippedIds: state.items.map((item) => resolveItemIdentity(item)),
        case: state.case,
      },
    }
  }

  const incoming = (state.unmatchedItems ?? []).map((item, index) =>
    mapLegacyItemToCategory(item, index),
  )

  const { categories: mergedCategories, migrated, preserved, merged } = mergeExistingCategories(
    state.categories,
    incoming,
  )

  const { validCategories, invalidCategories } = validateMigratedCategories(mergedCategories)

  if (invalidCategories.length) {
    logMigrate('invalid categories filtered', {
      count: invalidCategories.length,
      ids: invalidCategories.map((r) => r.category?._key),
    })
  }

  const nextBlock = {
    ...block,
    categories: validCategories,
    items: block.items ?? [],
  }

  const migratedIds = [...migrated, ...merged].filter(Boolean)
  const skippedIds = preserved.filter(Boolean)

  const snapshot = {
    before: { itemsCount: state.items.length, categoriesCount: state.categories.length },
    after: { categoriesCount: validCategories.length },
    migratedIds,
    skippedIds,
    mergedIds: merged,
    case: state.case,
    invalidCount: invalidCategories.length,
  }

  const changed =
    validCategories.length !== state.categories.length ||
    JSON.stringify(validCategories) !== JSON.stringify(state.categories)

  return {
    block: nextBlock,
    changed,
    snapshot,
    migrated,
    preserved,
    merged,
  }
}

/**
 * @param {object[]} blocks homePage.blocks
 */
export function migrateHomePageBlocks(blocks) {
  const list = [...(blocks ?? [])]
  const index = list.findIndex((b) => b?._type === 'specialtiesBlock')

  if (index < 0) {
    logMigrate('warning', 'no specialtiesBlock in blocks[]')
    return {
      blocks: list,
      changed: false,
      snapshot: { case: 'D', reason: 'no specialtiesBlock' },
    }
  }

  const result = migrateSpecialtiesBlock(list[index])
  if (result.changed) {
    list[index] = result.block
  }

  return {
    blocks: list,
    ...result,
    blockIndex: index,
  }
}

export { slugify, resolveItemIdentity, resolveCategoryIdentity, createKey }

/**
 * Normaliza especialidadItem / specialty / shape híbrido → items[] legacy.
 * @param {object} raw
 */
export function normalizeLegacySpecialtyItem(raw) {
  if (!raw || typeof raw !== 'object') return null
  if (raw._type === 'specialty') return raw

  return {
    _type: 'specialty',
    _key: raw._key,
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle,
    description: raw.description ?? raw.intro,
    intro: raw.intro ?? raw.description,
    specGroups: raw.specGroups,
    features: Array.isArray(raw.features)
      ? raw.features
      : raw.specGroups?.flatMap((group) => group?.items ?? []),
    image: raw.image ?? raw.heroImage,
    imageAlt: raw.imageAlt,
    buttonText: raw.buttonText ?? raw.cta?.label,
    buttonLink: raw.buttonLink ?? raw.cta?.path ?? raw.cta?.to,
    cta: raw.cta,
  }
}

/**
 * coalesce(specialtiesNew, especialidades.items, especialidadesList)
 * @param {object} doc homePage
 */
export function readLegacySpecialtyItemsFromDoc(doc) {
  const merged = new Map()

  const addItems = (list) => {
    for (const raw of list ?? []) {
      const item = normalizeLegacySpecialtyItem(raw)
      if (!item) continue
      const id = resolveCanonicalId(item)
      if (!merged.has(id)) merged.set(id, item)
    }
  }

  addItems(doc?.specialtiesNew)
  addItems(doc?.especialidades?.items)
  addItems(doc?.especialidadesList)

  return [...merged.values()]
}

/**
 * Bootstrap blocks[] desde campos planos cuando el documento aún no tiene Page Builder.
 * @param {object} doc homePage
 */
export function bootstrapHomePageBlocks(doc) {
  if (Array.isArray(doc?.blocks) && doc.blocks.length > 0) {
    return { blocks: doc.blocks, bootstrapped: false, legacyItemsCount: 0 }
  }

  const legacyItems = readLegacySpecialtyItemsFromDoc(doc)
  const blocks = blocksFromLegacyFields({
    ...doc,
    specialtiesNew: legacyItems,
  })

  const specIndex = blocks.findIndex((block) => block?._type === 'specialtiesBlock')
  if (specIndex >= 0) {
    blocks[specIndex] = {
      ...blocks[specIndex],
      items: legacyItems,
      categories: blocks[specIndex].categories ?? [],
      itemEyebrowPrefix:
        blocks[specIndex].itemEyebrowPrefix ?? doc?.especialidades?.itemEyebrowPrefix,
    }
  }

  logMigrate('bootstrap blocks[] from legacy flat fields', {
    blocksCount: blocks.length,
    legacyItems: legacyItems.length,
  })

  return { blocks, bootstrapped: true, legacyItemsCount: legacyItems.length }
}

/**
 * Pipeline completo: bootstrap (si aplica) + items → categories.
 * @param {object} doc homePage
 */
export function migrateHomePageDocument(doc) {
  const { blocks: bootstrappedBlocks, bootstrapped, legacyItemsCount } =
    bootstrapHomePageBlocks(doc)
  const result = migrateHomePageBlocks(bootstrappedBlocks)

  return {
    ...result,
    bootstrapped,
    legacyItemsCount,
    changed: result.changed || bootstrapped,
  }
}
