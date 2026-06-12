/**
 * Sincroniza servicesBlock.items[] (12 servicios) en homePage según SERVICE_LINKS.
 *
 * npm run migrate:home-services:dry
 * npm run migrate:home-services
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

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE home services ${dryRun ? '(dry-run)' : '(apply)'}`)
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
  console.error('✗ servicesBlock ausente')
  process.exit(1)
}

const beforeCount = (blocks[idx].items ?? []).filter((i) => i?.title && i?.description).length
const cardLinkLabel = blocks[idx].cardLinkLabel ?? homeContent.services?.cardLinkLabel
const items = await buildServiceItems(uploadImage, cardLinkLabel)
blocks[idx] = { ...blocks[idx], items }

console.info(`~ homePage servicesBlock: ${beforeCount} → ${items.length}/${EXPECTED_SERVICE_COUNT}`)

if (stats.missing.length) {
  console.warn('\n⚠ Imágenes faltantes:')
  for (const path of stats.missing) console.warn(`  - ${path}`)
}

if (dryRun) {
  console.info('\n[dry] Sin escritura en Sanity')
  process.exit(stats.missing.length ? 1 : 0)
}

await publishHomePage(client, doc, blocks, {}, uploadImage)
console.info(`\n✓ Migración completada (${items.length} servicios)`)
console.info(`  Imágenes subidas: ${stats.uploaded}`)
