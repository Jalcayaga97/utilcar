/**
 * Normaliza hero (imagen + textLink) y ctaBlock (sin campos huérfanos).
 * npm run repair:home-meta
 */
import {
  createImageUploader,
  createRepairClient,
  fetchHomePage,
  normalizeBlocksForPublish,
  publishHomePage,
} from './lib/homeRepairShared.mjs'

const dryRun = process.argv.includes('--dry')

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — hero + ctaBlock')
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

const blocks = await normalizeBlocksForPublish(doc.blocks ?? [], uploadImage)
const hero = blocks.find((b) => b._type === 'heroBlock')
const hasHeroImage = Boolean(hero?.image?.asset?._ref || hero?.image?.asset?.url)
const hasTextLink = Boolean(hero?.textLinkLabel && hero?.textLinkUrl)

console.info(`  Hero imagen: ${hasHeroImage ? 'OK' : 'FALTA'}`)
console.info(`  Hero textLink: ${hasTextLink ? 'OK' : 'FALTA'}`)

if (dryRun) {
  console.info('\nModo dry — sin escritura')
  process.exit(0)
}

await publishHomePage(client, doc, blocks, {}, uploadImage)
console.info('\n✓ homePage meta normalizado')
if (stats.uploaded) console.info(`  Imágenes subidas: ${stats.uploaded}`)
