/**
 * Utilidades compartidas — comparación homePage publicado vs borrador.
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../../src/lib/sanity/runtime/loadSanityEnv.js'

export const PUBLISHED_ID = 'homePage'
export const DRAFT_ID = 'drafts.homePage'

/** Campos legacy espejo (homePageMigration LEGACY_MIRROR_FIELDS + especialidades). */
export const LEGACY_FIELDS_TO_SYNC = [
  'schemaVersion',
  'blocks',
  'hero',
  'services',
  'especialidades',
  'highlights',
  'portfolioPreview',
  'ctaBanner',
  'specialtiesNew',
]

export function createSyncClient({ requireToken = true } = {}) {
  const sanityEnv = loadSanityEnv({ requireToken })
  sanityEnv.applyToProcessEnv()
  const client = createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: '2024-05-28',
    token: sanityEnv.token,
    useCdn: false,
  })
  return { client, sanityEnv }
}

export function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b?._type === type)
}

export function findWhyBlock(blocks) {
  return blockOfType(blocks, 'whyUtilcarBlock') || blockOfType(blocks, 'whyUsBlock')
}

export function findPortfolioBlock(blocks) {
  return (blocks ?? []).find(
    (b) => b?._type === 'portfolioBlock' || b?._type === 'galleryBlock',
  )
}

function countItems(arr) {
  if (!Array.isArray(arr)) return null
  return arr.filter((item) => item && typeof item === 'object').length
}

/** Métricas editoriales para auditoría publicado vs borrador. */
export function extractHomePageMetrics(doc) {
  const blocks = doc?.blocks ?? []
  const servicesBlock = blockOfType(blocks, 'servicesBlock')
  const specialtiesBlock = blockOfType(blocks, 'specialtiesBlock')
  const whyBlock = findWhyBlock(blocks)
  const portfolioBlock = findPortfolioBlock(blocks)

  return {
    _id: doc?._id ?? null,
    _rev: doc?._rev ?? null,
    _updatedAt: doc?._updatedAt ?? null,
    blocksCount: blocks.length,
    blockTypes: blocks.map((b) => b?._type).filter(Boolean),
    servicesItemsCount: countItems(servicesBlock?.items),
    specialtiesCategoriesCount: countItems(specialtiesBlock?.categories),
    specialtiesItemsCount: countItems(specialtiesBlock?.items),
    whyUtilcarItemsCount: countItems(whyBlock?.items),
    whyBlockType: whyBlock?._type ?? null,
    featuredProjectsCount: countItems(portfolioBlock?.featuredProjects),
    portfolioBlockType: portfolioBlock?._type ?? null,
    hasWhyUtilcarBlock: Boolean(whyBlock),
  }
}

export function diffMetrics(published, draft) {
  const keys = [
    'blocksCount',
    'servicesItemsCount',
    'specialtiesCategoriesCount',
    'whyUtilcarItemsCount',
    'featuredProjectsCount',
  ]
  const diffs = {}
  for (const key of keys) {
    if (published[key] !== draft[key]) {
      diffs[key] = { published: published[key], draft: draft[key] }
    }
  }
  if (published.blockTypes?.join(',') !== draft.blockTypes?.join(',')) {
    diffs.blockTypes = { published: published.blockTypes, draft: draft.blockTypes }
  }
  if (published.portfolioBlockType !== draft.portfolioBlockType) {
    diffs.portfolioBlockType = {
      published: published.portfolioBlockType,
      draft: draft.portfolioBlockType,
    }
  }
  if (published.hasWhyUtilcarBlock !== draft.hasWhyUtilcarBlock) {
    diffs.hasWhyUtilcarBlock = {
      published: published.hasWhyUtilcarBlock,
      draft: draft.hasWhyUtilcarBlock,
    }
  }
  return diffs
}

export async function fetchHomePagePair(client) {
  const [published, draft] = await Promise.all([
    client.fetch(`*[_id == $id][0]`, { id: PUBLISHED_ID }),
    client.fetch(`*[_id == $id][0]`, { id: DRAFT_ID }),
  ])
  return { published, draft }
}

/** Payload editorial copiado del publicado al borrador (sin tocar publicado). */
export function buildDraftFromPublished(published, existingDraft = null) {
  if (!published) {
    throw new Error('homePage publicado no encontrado')
  }

  const payload = {
    _id: DRAFT_ID,
    _type: 'homePage',
  }

  for (const field of LEGACY_FIELDS_TO_SYNC) {
    if (published[field] !== undefined) {
      payload[field] = structuredClone(published[field])
    }
  }

  if (existingDraft?._createdAt) {
    payload._createdAt = existingDraft._createdAt
  } else if (published._createdAt) {
    payload._createdAt = published._createdAt
  }

  return payload
}

export function listCopiedFields(published) {
  return LEGACY_FIELDS_TO_SYNC.filter((field) => published?.[field] !== undefined)
}

export function listCopiedBlocks(published) {
  return (published?.blocks ?? []).map((block, index) => ({
    index,
    _type: block?._type,
    _key: block?._key,
    title: block?.title ?? block?.sectionTitle ?? null,
    itemsCount: countItems(block?.items),
    categoriesCount: countItems(block?.categories),
    projectsCount: countItems(block?.featuredProjects),
  }))
}

export function printMetricsTable(label, metrics) {
  console.info(`\n${label}`)
  console.info(`  _id:                    ${metrics._id}`)
  console.info(`  _rev:                   ${metrics._rev}`)
  console.info(`  _updatedAt:             ${metrics._updatedAt}`)
  console.info(`  blocks count:           ${metrics.blocksCount}`)
  console.info(`  block types:            ${metrics.blockTypes.join(', ') || '(ninguno)'}`)
  console.info(`  services items:         ${metrics.servicesItemsCount ?? 'null/ausente'}`)
  console.info(`  specialties categories: ${metrics.specialtiesCategoriesCount ?? 'null/ausente'}`)
  console.info(`  whyUtilcar items:       ${metrics.whyUtilcarItemsCount ?? 'null/ausente'} (${metrics.whyBlockType ?? 'sin bloque'})`)
  console.info(`  featuredProjects:       ${metrics.featuredProjectsCount ?? 'null/ausente'} (${metrics.portfolioBlockType ?? 'sin bloque'})`)
}

export function printDiffReport(diffs) {
  if (!Object.keys(diffs).length) {
    console.info('\n✓ Publicado y borrador están sincronizados (métricas editoriales).')
    return 0
  }
  console.info('\nDiferencias publicado → borrador:')
  for (const [key, value] of Object.entries(diffs)) {
    if (Array.isArray(value.published)) {
      console.info(`  ${key}:`)
      console.info(`    publicado: [${value.published.join(', ')}]`)
      console.info(`    borrador:  [${value.draft.join(', ')}]`)
    } else {
      console.info(`  ${key}: publicado=${value.published} | borrador=${value.draft}`)
    }
  }
  return Object.keys(diffs).length
}
