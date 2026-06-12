/**
 * Reemplaza logos placeholder del brandCarouselBlock con SVG corporativos normalizados.
 *
 * npm run generate:brand-logos
 * npm run migrate:home-brand-logos:dry
 * npm run migrate:home-brand-logos
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BRAND_NAMES } from './lib/brandLogoCatalog.mjs'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const DOC_ID = 'homePage'
const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const uploadCache = new Map()

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

function slugForName(name) {
  if (name === 'Grupo Norte') return 'grupo-norte'
  return name.toLowerCase().replace(/\s+/g, '-')
}

function logoPath(name) {
  return join(WEB_ROOT, 'public', 'brands', `${slugForName(name)}.svg`)
}

async function uploadSvg(name) {
  const abs = logoPath(name)
  if (!existsSync(abs)) {
    console.warn(`  ⚠ no encontrada: ${abs}`)
    return null
  }
  if (uploadCache.has(abs)) return uploadCache.get(abs)

  const alt = `Logo ${name}`
  if (dryRun) {
    const ph = { _type: 'image', alt, _dry: true, _file: basename(abs) }
    uploadCache.set(abs, ph)
    return ph
  }

  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
    contentType: 'image/svg+xml',
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt,
  }
  uploadCache.set(abs, ref)
  return ref
}

const DOC_QUERY = `*[_id == $id][0]{ _id, _rev, blocks }`

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE home brand logos ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

const doc = await client.fetch(DOC_QUERY, { id: DOC_ID })
if (!doc) {
  console.error(`✗ ${DOC_ID} no encontrado`)
  process.exit(1)
}

const blocks = structuredClone(doc.blocks ?? [])
const blockIdx = blocks.findIndex((b) => b._type === 'brandCarouselBlock')
if (blockIdx < 0) {
  console.error('✗ brandCarouselBlock ausente — ejecutá migrate:home-brand-carousel primero')
  process.exit(1)
}

const block = blocks[blockIdx]
const brands = structuredClone(block.brands ?? [])
let updated = 0

for (const brand of brands) {
  const name = String(brand?.name ?? '').trim()
  if (!BRAND_NAMES.includes(name)) continue
  const logo = await uploadSvg(name)
  if (!logo) continue
  brand.logo = logo
  updated += 1
  console.info(`  ~ ${name} → ${basename(logoPath(name))}`)
}

if (updated < BRAND_NAMES.length) {
  console.warn(`⚠ ${updated}/${BRAND_NAMES.length} logos actualizados`)
}

blocks[blockIdx] = { ...block, brands }

if (apply && updated > 0) {
  await client.patch(DOC_ID).set({ blocks }).commit({ visibility: 'sync' })
  console.info('\n✓ Logos corporativos aplicados en CMS')
} else {
  console.info('\n[dry] Sin escritura en Sanity')
}
