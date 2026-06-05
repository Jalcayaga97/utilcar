/**
 * Convierte portfolioBlock de Butacas a metadata-only (workProject en runtime).
 * Conserva eyebrow/title/description; vacía items embebidos.
 *
 * npm run repair:butacas-portfolio
 * npm run repair:butacas-portfolio -- --dry
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { butacasContent } from '../src/content/services.js'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')
const DOC_ID = 'serviceSubPage-butacas'

function findBlockIndex(blocks, type) {
  return (blocks ?? []).findIndex((b) => b?._type === type)
}

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — portfolioBlock Butacas')
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
const gallery = butacasContent.gallery ?? {}

if (portfolioIdx < 0) {
  console.error('✗ portfolioBlock no encontrado — ejecute migrate:services primero')
  process.exit(1)
}

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

console.info(`  ~ portfolioBlock: metadata conservada, ${embeddedCount} ítems embebidos eliminados`)
console.info(`  bloques: ${blocks.map((b) => b._type).join(' → ')}`)

if (dryRun) {
  console.info('\n  [dry-run] Sin cambios en Sanity')
  process.exit(0)
}

await client.transaction().patch(DOC_ID, { set: { blocks } }).commit()
console.info('\n✓ serviceSubPage-butacas actualizado (workProject-only)')
