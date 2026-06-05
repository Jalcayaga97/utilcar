/**
 * Repara whyUtilcarBlock y portfolioBlock (featuredProjects) en homePage.
 * npm run repair:home-sections
 * npm run repair:home-sections -- --dry
 */
import {
  buildFeaturedProjects,
  buildWhyUtilcarBlock,
  createImageUploader,
  createKey,
  createRepairClient,
  fetchHomePage,
  fetchWorkPage,
  findBlockIndex,
  findPortfolioBlockIndex,
  normalizePortfolioBlock,
  publishHomePage,
  TRABAJOS_PREVIEW_IDS,
} from './lib/homeRepairShared.mjs'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — whyUtilcar + portfolioBlock')
console.info('══════════════════════════════════════\n')

const { client } = createRepairClient({ dryRun })
const cache = new Map()
const stats = { uploaded: 0, wouldUpload: 0, missing: [] }
const uploadImage = createImageUploader(dryRun ? null : client, cache, stats)
const doc = await fetchHomePage(client)
if (!doc) {
  console.error('✗ homePage no encontrado')
  process.exit(1)
}

const workPage = await fetchWorkPage(client)
const previewIds = new Set(
  (workPage?.preview ?? []).map((p) => String(p?.id ?? '')).filter(Boolean),
)
const portfolioIds = new Set(
  (workPage?.portfolio ?? []).map((p) => String(p?.id ?? '')).filter(Boolean),
)
const knownIds = new Set([...previewIds, ...portfolioIds])

let featuredIds = TRABAJOS_PREVIEW_IDS.filter((id) => knownIds.has(id))
if (featuredIds.length < 3) {
  featuredIds = TRABAJOS_PREVIEW_IDS
}

const blocks = [...(doc.blocks ?? [])]
let changed = false

const whyIdx =
  findBlockIndex(blocks, 'whyUtilcarBlock') >= 0
    ? findBlockIndex(blocks, 'whyUtilcarBlock')
    : findBlockIndex(blocks, 'whyUsBlock')

const whyItems = whyIdx >= 0 ? (blocks[whyIdx].items ?? []) : []
if (whyIdx < 0 || whyItems.filter((i) => i?.title).length < 3) {
  const existing = whyIdx >= 0 ? blocks[whyIdx] : {}
  const whyBlock = buildWhyUtilcarBlock(existing)
  if (whyIdx >= 0) {
    blocks[whyIdx] = whyBlock
  } else {
    const specIdx = findBlockIndex(blocks, 'specialtiesBlock')
    const insertAt = specIdx >= 0 ? specIdx + 1 : blocks.length
    blocks.splice(insertAt, 0, whyBlock)
  }
  changed = true
  console.info('  + whyUtilcarBlock con 3 motivos')
} else {
  if (blocks[whyIdx]._type === 'whyUsBlock') {
    blocks[whyIdx] = { ...blocks[whyIdx], _type: 'whyUtilcarBlock' }
    changed = true
    console.info('  ~ whyUsBlock renombrado a whyUtilcarBlock')
  } else {
    console.info('  ✓ whyUtilcarBlock OK')
  }
}

const portIdx = findPortfolioBlockIndex(blocks)
const portBlock = portIdx >= 0 ? blocks[portIdx] : null
const featCount = portBlock?.featuredProjects?.length ?? 0
const needsPortfolio =
  portIdx < 0 ||
  portBlock?._type === 'galleryBlock' ||
  featCount < 3

if (needsPortfolio) {
  const featuredProjects =
    featCount >= 3 ? portBlock.featuredProjects : buildFeaturedProjects(featuredIds)
  const normalized = normalizePortfolioBlock(
    portBlock ?? { _key: createKey(), order: 4 },
    featuredProjects,
  )
  if (portIdx >= 0) {
    blocks[portIdx] = { ...normalized, _key: blocks[portIdx]._key || normalized._key }
  } else {
    const ctaIdx = findBlockIndex(blocks, 'ctaBlock')
    const insertAt = ctaIdx >= 0 ? ctaIdx : blocks.length
    blocks.splice(insertAt, 0, normalized)
  }
  changed = true
  console.info(
    `  + portfolioBlock con ${featuredProjects.length} featuredProjects (${featuredIds.join(', ')})`,
  )
} else if (portBlock?._type === 'galleryBlock') {
  blocks[portIdx] = { ...portBlock, _type: 'portfolioBlock' }
  changed = true
  console.info('  ~ galleryBlock → portfolioBlock')
} else {
  console.info('  ✓ portfolioBlock OK')
}

blocks.forEach((block, index) => {
  blocks[index] = { ...block, order: index }
})

if (!changed) {
  console.info('\n✓ Secciones whyUtilcar y portfolio ya están completas')
  process.exit(0)
}

if (dryRun) {
  console.info('\nModo dry — cambios detectados, sin escritura')
  process.exit(0)
}

await publishHomePage(client, doc, blocks, {}, uploadImage)
console.info('\n✓ homePage actualizado (whyUtilcar + portfolioBlock)')
