import { set, unset } from 'sanity'
import { LEGACY_MIRROR_FIELDS } from './homePageMigration.js'
import { SYNC_SOURCE } from './homePageMigration.js'
import { logHomePageSync } from './homePageSyncLog.js'

const LEGACY_FLAT_FIELDS = LEGACY_MIRROR_FIELDS

function createKey() {
  return Math.random().toString(36).slice(2, 12)
}

const PORTFOLIO_TYPES = new Set(['portfolioBlock', 'galleryBlock'])

function normalizeBlock(block) {
  if (!block?._type) return block
  if (block._type === 'galleryBlock') {
    return { ...block, _type: 'portfolioBlock' }
  }
  return block
}

function withOrder(blocks) {
  return (blocks ?? []).map((block, index) => ({
    ...normalizeBlock(block),
    order: index,
  }))
}

/** Convierte specialtyCategory → shape legacy specialty (espejo GROQ). */
function categoryToLegacySpecialty(category) {
  if (!category) return null
  const features = (category.features ?? [])
    .flatMap((group) => group?.items ?? [])
    .filter(Boolean)

  return {
    _type: 'specialty',
    _key: category._key,
    title: category.title ?? '',
    subtitle: category.subtitle ?? '',
    description: category.description ?? '',
    features: features.length ? features : undefined,
    image: category.heroImage,
    buttonText: category.cta?.label,
    buttonLink: category.cta?.to,
  }
}

/** coalesce(categories[], items[]) — categories gana cuando tiene contenido. */
export function readSpecialtiesFromBlock(block) {
  if (!block) return []
  const categories = block.categories
  if (Array.isArray(categories) && categories.length > 0) {
    return categories.map(categoryToLegacySpecialty).filter(Boolean)
  }
  return block.items ?? []
}

function pickHero(block) {
  if (!block) return undefined
  const label = block.textLinkLabel ?? block.secondaryLink?.label
  const to = block.textLinkUrl ?? block.secondaryLink?.to
  return {
    title: block.title,
    subtitle: block.subtitle,
    highlights: block.highlights,
    secondaryLink:
      label || to
        ? {
            label: label ?? '',
            to: to ?? '/trabajos-realizados',
            ariaLabel: label ?? '',
          }
        : block.secondaryLink,
    imageAlt: block.imageAlt,
  }
}

function pickServices(block) {
  if (!block) return undefined
  const { eyebrow, title, description, cardLinkLabel } = block
  return { eyebrow, title, description, cardLinkLabel }
}

function pickWhyUs(block) {
  if (!block) return undefined
  const { eyebrow, title } = block
  return { eyebrow, title }
}

function pickPortfolio(block) {
  if (!block) return undefined
  const { eyebrow, title, description, ctaLabel, ctaTo, previewCount } = block
  return {
    eyebrow,
    title,
    description,
    ctaLabel,
    ctaTo,
    previewCount: previewCount ?? 3,
  }
}

function pickCta(block) {
  if (!block) return undefined
  return {
    title: block.title,
    description: block.description,
  }
}

function findBlock(blocks, type) {
  return (blocks ?? []).find((block) => block?._type === type)
}

function findWhyUsBlock(blocks) {
  return findBlock(blocks, 'whyUsBlock') || findBlock(blocks, 'whyUtilcarBlock')
}

function findPortfolioBlock(blocks) {
  return (blocks ?? []).find((block) => PORTFOLIO_TYPES.has(block?._type))
}

function upsertBlock(blocks, type, payload) {
  const list = withOrder(blocks).map(normalizeBlock)
  const index = list.findIndex((block) => block?._type === type)
  const next = {
    _type: type,
    _key: index >= 0 ? list[index]._key : createKey(),
    enabled: index >= 0 ? list[index].enabled !== false : true,
    ...payload,
  }
  if (index >= 0) {
    list[index] = { ...list[index], ...next }
  } else {
    list.push(next)
  }
  return withOrder(list)
}

/** blocks[] es la fuente de verdad editorial cuando tiene contenido. */
export function hasBlocksSourceOfTruth(doc) {
  return Array.isArray(doc?.blocks) && doc.blocks.length > 0
}

/** Deriva campos planos (GROQ) desde blocks[] — espejo para API actual. */
export function legacyFieldsFromBlocks(blocks) {
  const ordered = withOrder(blocks)
  const heroBlock = findBlock(ordered, 'heroBlock')
  const specialtiesBlock = findBlock(ordered, 'specialtiesBlock')
  const servicesBlock = findBlock(ordered, 'servicesBlock')
  const whyUsBlock = findWhyUsBlock(ordered)
  const portfolioBlock = findPortfolioBlock(ordered)
  const ctaBlock = findBlock(ordered, 'ctaBlock')

  return {
    hero: pickHero(heroBlock),
    specialtiesNew: readSpecialtiesFromBlock(specialtiesBlock),
    services: pickServices(servicesBlock),
    highlights: pickWhyUs(whyUsBlock),
    portfolioPreview: pickPortfolio(portfolioBlock),
    ctaBanner: pickCta(ctaBlock),
    blocks: ordered,
  }
}

/** Construye blocks[] desde campos planos (migración inicial). */
export function blocksFromLegacyFields(doc) {
  if (doc?.blocks?.length) return withOrder(doc.blocks)

  const blocks = []
  if (doc?.hero) {
    blocks.push({
      _type: 'heroBlock',
      _key: createKey(),
      enabled: true,
      ...doc.hero,
    })
  }

  blocks.push({
    _type: 'specialtiesBlock',
    _key: createKey(),
    enabled: true,
    eyebrow: doc?.especialidades?.eyebrow,
    title: doc?.especialidades?.title,
    description: doc?.especialidades?.description,
    items: doc?.specialtiesNew ?? [],
    categories: [],
  })

  if (doc?.services) {
    blocks.push({
      _type: 'servicesBlock',
      _key: createKey(),
      enabled: true,
      items: [],
      ...doc.services,
    })
  }

  if (doc?.highlights) {
    blocks.push({
      _type: 'whyUsBlock',
      _key: createKey(),
      enabled: true,
      items: doc.highlights?.items ?? [],
      eyebrow: doc.highlights.eyebrow,
      title: doc.highlights.title,
    })
  }

  if (doc?.portfolioPreview) {
    blocks.push({
      _type: 'portfolioBlock',
      _key: createKey(),
      enabled: true,
      items: [],
      ...doc.portfolioPreview,
    })
  }

  if (doc?.ctaBanner) {
    const banner = doc.ctaBanner
    blocks.push({
      _type: 'ctaBlock',
      _key: createKey(),
      enabled: true,
      title: banner.title,
      description: banner.description,
      buttonLabel: banner.primaryLabel,
      buttonLink: banner.primaryTo,
      buttonText: banner.buttonText,
    })
  }

  return withOrder(blocks)
}

function isEqualJson(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

function flatFieldsChanged(before, after) {
  return LEGACY_FLAT_FIELDS.some((field) => !isEqualJson(before?.[field], after?.[field]))
}

/** Evita que el espejo legacy sobrescriba arrays editoriales ya poblados. */
function preserveBlockNestedArrays(beforeBlocks, nextBlocks) {
  const before = withOrder(beforeBlocks ?? [])
  const next = withOrder(nextBlocks ?? [])
  return next.map((block) => {
    const prev =
      before.find((b) => b._key && b._key === block._key && b._type === block._type) ??
      before.find((b) => b._type === block._type)
    if (!prev) return block

    const merged = { ...block }
    if (block._type === 'servicesBlock' && !(block.items?.length > 0) && prev.items?.length) {
      merged.items = prev.items
    }
    if (
      block._type === 'specialtiesBlock' &&
      !(block.categories?.length > 0) &&
      prev.categories?.length
    ) {
      merged.categories = prev.categories
    }
    const whyTypes = new Set(['whyUtilcarBlock', 'whyUsBlock'])
    if (whyTypes.has(block._type) && !(block.items?.length > 0) && prev.items?.length) {
      merged.items = prev.items
    }
    if (
      (block._type === 'portfolioBlock' || block._type === 'galleryBlock') &&
      !(block.featuredProjects?.length > 0) &&
      prev.featuredProjects?.length
    ) {
      merged.featuredProjects = prev.featuredProjects
    }
    return merged
  })
}

function patchesFromLegacyMirror(blocks, after) {
  const patches = []
  const fieldsSynced = []
  const legacyFromBlocks = legacyFieldsFromBlocks(blocks)
  legacyFromBlocks.blocks = preserveBlockNestedArrays(after?.blocks, legacyFromBlocks.blocks)

  for (const field of LEGACY_FLAT_FIELDS) {
    const value = legacyFromBlocks[field]
    if (!isEqualJson(after?.[field], value)) {
      patches.push(value === undefined ? unset([field]) : set(value, [field]))
      fieldsSynced.push(field)
    }
  }

  if (!isEqualJson(after?.blocks, legacyFromBlocks.blocks)) {
    patches.push(set(legacyFromBlocks.blocks, ['blocks']))
    fieldsSynced.push('blocks')
  }

  return { patches, fieldsSynced }
}

/**
 * Reconciliación blocks-first: solo blocks escribe; campos planos = espejo.
 * @returns {{ patches: import('sanity').Patch[], flatEditRejected?: boolean, source: string, fieldsSynced?: string[] }}
 */
export function patchesForHomePageReconcile(before, after) {
  let blocks = withOrder(after?.blocks ?? [])

  if (!blocks.length) {
    blocks = blocksFromLegacyFields(after)
    if (blocks.length) {
      const initial = [set(blocks, ['blocks'])]
      const { patches: mirrorPatches, fieldsSynced } = patchesFromLegacyMirror(blocks, {
        ...after,
        blocks,
      })
      const allPatches = [...initial, ...mirrorPatches]
      const result = {
        patches: allPatches,
        source: SYNC_SOURCE.LEGACY_SYNC,
        fieldsSynced,
      }
      logHomePageSync({
        source: result.source,
        fieldsSynced,
        detail: 'Migración inicial flat → blocks',
      })
      return result
    }
    return { patches: [], source: SYNC_SOURCE.NONE }
  }

  const blocksChanged = !isEqualJson(withOrder(before?.blocks), blocks)
  const flatChanged = flatFieldsChanged(before, after)
  const hasSource = hasBlocksSourceOfTruth(after)

  if (blocksChanged || !flatChanged) {
    const { patches, fieldsSynced } = patchesFromLegacyMirror(blocks, after)
    const result = {
      patches,
      flatEditRejected: false,
      source: SYNC_SOURCE.BLOCKS,
      fieldsSynced,
    }
    if (patches.length) {
      logHomePageSync({
        source: result.source,
        fieldsSynced,
        detail: 'blocks → legacy mirror',
      })
    }
    return result
  }

  if (hasSource && flatChanged) {
    const { patches, fieldsSynced } = patchesFromLegacyMirror(blocks, after)
    const result = {
      patches,
      flatEditRejected: true,
      source: SYNC_SOURCE.LEGACY_MIRROR_REJECTED,
      fieldsSynced,
    }
    logHomePageSync({
      source: result.source,
      fieldsSynced,
      rejected: true,
      detail: 'Escritura legacy rechazada; blocks gana',
    })
    return result
  }

  return { patches: [], source: SYNC_SOURCE.NONE }
}

export function applyHomePagePatches(value, eventPatches) {
  let next = structuredClone(value ?? {})
  for (const patch of eventPatches) {
    next = applyPatch(next, patch)
  }
  return next
}

function applyPatch(doc, patch) {
  if (patch.type === 'set') {
    return setDeep(doc, patch.path, patch.value)
  }
  if (patch.type === 'unset') {
    return unsetDeep(doc, patch.path)
  }
  return doc
}

function setDeep(obj, path, value) {
  if (!path?.length) return value
  const [head, ...rest] = path
  return {
    ...obj,
    [head]: rest.length ? setDeep(obj?.[head] ?? {}, rest, value) : value,
  }
}

function unsetDeep(obj, path) {
  if (!path?.length || !obj) return obj
  const [head, ...rest] = path
  if (!rest.length) {
    const next = { ...obj }
    delete next[head]
    return next
  }
  if (obj[head] === undefined) return obj
  return { ...obj, [head]: unsetDeep(obj[head], rest) }
}

/** Índice del bloque specialtiesBlock en blocks[]. */
export function findSpecialtiesBlockIndex(blocks) {
  return (blocks ?? []).findIndex((block) => block?._type === 'specialtiesBlock')
}

/** Path Sanity al array categories de specialtiesBlock. */
export function getSpecialtiesCategoriesPath(blocks) {
  const index = findSpecialtiesBlockIndex(blocks)
  if (index < 0) return null
  return ['blocks', index, 'categories']
}

/** @deprecated — usar getSpecialtiesCategoriesPath */
export function getSpecialtiesItemsPath(blocks) {
  const index = findSpecialtiesBlockIndex(blocks)
  if (index < 0) return null
  return ['blocks', index, 'items']
}
