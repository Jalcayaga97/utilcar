/**
 * Repara specialtiesBlock.categories[] en homePage si está vacío.
 * npm run repair:home-specialties
 * npm run repair:home-specialties -- --dry
 */
import {
  buildSpecialtyCategories,
  createImageUploader,
  createRepairClient,
  fetchHomePage,
  findBlockIndex,
  publishHomePage,
} from './lib/homeRepairShared.mjs'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — homePage specialtiesBlock')
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
const idx = findBlockIndex(blocks, 'specialtiesBlock')
if (idx < 0) {
  console.error('✗ No existe specialtiesBlock en blocks[]')
  process.exit(1)
}

const current = blocks[idx].categories ?? []
const validCount = current.filter((c) => c?.title).length

if (validCount >= 3) {
  console.info(`✓ specialtiesBlock.categories ya tiene ${validCount} categorías — sin cambios`)
  process.exit(0)
}

console.info(`  Estado actual: ${validCount}/3 categorías`)
const categories = await buildSpecialtyCategories(uploadImage)
blocks[idx] = {
  ...blocks[idx],
  categories,
  items: blocks[idx].items?.length ? blocks[idx].items : [],
}

if (stats.missing.length) {
  console.info('\n⚠ Imágenes faltantes:')
  for (const path of stats.missing) console.info(`  - ${path}`)
}

if (dryRun) {
  console.info(`\nModo dry — se crearían ${categories.length} categorías`)
  process.exit(stats.missing.length ? 1 : 0)
}

await publishHomePage(client, doc, blocks, {}, uploadImage)
console.info(`\n✓ Reparado: ${categories.length} categorías en specialtiesBlock.categories[]`)
console.info(`  Imágenes subidas: ${stats.uploaded}`)
