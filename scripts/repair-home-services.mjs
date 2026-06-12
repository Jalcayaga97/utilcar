/**
 * Repara servicesBlock.items[] en homePage si está vacío.
 * npm run repair:home-services
 * npm run repair:home-services -- --dry
 */
import {
  buildServiceItems,
  createImageUploader,
  createRepairClient,
  fetchHomePage,
  findBlockIndex,
  homeContent,
  publishHomePage,
} from './lib/homeRepairShared.mjs'
import { EXPECTED_SERVICE_COUNT } from './lib/serviceCatalogManifest.mjs'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — homePage servicesBlock')
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

const blocks = [...(doc.blocks ?? [])]
const idx = findBlockIndex(blocks, 'servicesBlock')
if (idx < 0) {
  console.error('✗ No existe servicesBlock en blocks[]')
  process.exit(1)
}

const current = blocks[idx].items ?? []
const validCount = current.filter((i) => i?.title && i?.description).length

if (validCount >= EXPECTED_SERVICE_COUNT) {
  console.info(`✓ servicesBlock.items ya tiene ${validCount} servicios — sin cambios`)
  process.exit(0)
}

console.info(`  Estado actual: ${validCount}/${EXPECTED_SERVICE_COUNT} servicios`)
const cardLinkLabel = blocks[idx].cardLinkLabel ?? homeContent.services?.cardLinkLabel
const items = await buildServiceItems(uploadImage, cardLinkLabel)
blocks[idx] = { ...blocks[idx], items }

if (stats.missing.length) {
  console.info('\n⚠ Imágenes faltantes:')
  for (const path of stats.missing) console.info(`  - ${path}`)
}

if (dryRun) {
  console.info(`\nModo dry — se crearían ${items.length} servicios`)
  process.exit(stats.missing.length ? 1 : 0)
}

await publishHomePage(client, doc, blocks, {}, uploadImage)
console.info(`\n✓ Reparado: ${items.length} servicios en servicesBlock.items[]`)
console.info(`  Imágenes subidas: ${stats.uploaded}`)
