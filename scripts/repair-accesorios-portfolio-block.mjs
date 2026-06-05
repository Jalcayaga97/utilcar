/**
 * Añade portfolioBlock (eyebrow/title/description) a serviceSubPage-accesorios.
 * Las tarjetas siguen viniendo de workProject en runtime.
 *
 * npm run repair:accesorios-portfolio
 * npm run repair:accesorios-portfolio -- --dry
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { accesoriosContent } from '../src/content/services.js'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')
const DOC_ID = 'serviceSubPage-accesorios'

function blockKey(prefix, index) {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`
}

function findBlockIndex(blocks, type) {
  return (blocks ?? []).findIndex((b) => b?._type === type)
}

function buildPortfolioBlock(gallery, order) {
  return {
    _type: 'portfolioBlock',
    _key: blockKey('portfolio', order),
    enabled: true,
    order,
    eyebrow: gallery?.eyebrow ?? 'Galería',
    title: gallery?.title ?? 'Trabajos realizados',
    description: gallery?.description ?? '',
    items: [],
  }
}

function normalizeBlockOrders(blocks) {
  return blocks.map((block, index) => ({
    ...block,
    order: typeof block.order === 'number' ? block.order : index,
  }))
}

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — portfolioBlock Accesorios')
console.info('══════════════════════════════════════\n')

const sanityEnv = loadSanityEnv({ requireToken: !dryRun })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const doc = await client.fetch(`*[_id == $id][0]`, { id: DOC_ID })
if (!doc) {
  console.error(`✗ Documento ${DOC_ID} no encontrado`)
  process.exit(1)
}

const blocks = [...(doc.blocks ?? [])]
const portfolioIdx = findBlockIndex(blocks, 'portfolioBlock')
const gallery = accesoriosContent.gallery ?? {}

if (portfolioIdx >= 0) {
  const existing = blocks[portfolioIdx]
  const embeddedCount = existing.items?.length ?? 0
  blocks[portfolioIdx] = {
    ...existing,
    eyebrow: existing.eyebrow || gallery.eyebrow,
    title: existing.title || gallery.title,
    description: existing.description || gallery.description,
    enabled: existing.enabled !== false,
    items: [],
  }
  if (embeddedCount > 0) {
    console.info(`  ~ portfolioBlock: copy editorial OK, ${embeddedCount} ítems embebidos eliminados`)
  } else {
    console.info('  ~ portfolioBlock existente — copy editorial completado')
  }
} else {
  const ctaIdx = findBlockIndex(blocks, 'ctaBlock')
  const insertAt = ctaIdx >= 0 ? ctaIdx : blocks.length
  const portfolioOrder =
    insertAt > 0 && typeof blocks[insertAt - 1]?.order === 'number'
      ? blocks[insertAt - 1].order + 1
      : insertAt

  blocks.splice(insertAt, 0, buildPortfolioBlock(gallery, portfolioOrder))
  console.info(`  + portfolioBlock insertado en posición ${insertAt} (orden ${portfolioOrder})`)
}

const nextBlocks = normalizeBlockOrders(blocks)
const blockTypes = nextBlocks.map((b) => b._type).join(' → ')
console.info(`  bloques: ${blockTypes}`)

if (dryRun) {
  console.info('\n  [dry-run] Sin cambios en Sanity')
  process.exit(0)
}

await client.transaction().patch(DOC_ID, { set: { blocks: nextBlocks } }).commit()
console.info('\n✓ serviceSubPage-accesorios actualizado (workProject-only)')
