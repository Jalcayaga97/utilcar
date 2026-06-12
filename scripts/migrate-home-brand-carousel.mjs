/**
 * Inserta brandCarouselBlock en homePage tras portfolioBlock.
 *
 * npm run migrate:home-brand-carousel:dry
 * npm run migrate:home-brand-carousel
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { BRAND_NAMES } from './lib/brandLogoCatalog.mjs'

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

/** 15 marcas — SVG normalizados en public/brands/ (ejecutar generate:brand-logos antes). */
const BRAND_CATALOG = BRAND_NAMES.map((name) => ({
  name,
  file: `public/brands/${slugForName(name)}.svg`,
}))

function blockKey(prefix, index) {
  return `${prefix}-${String(index).replace(/[^a-z0-9]/gi, '')}`
}

async function uploadImage(relativePath, alt) {
  if (uploadCache.has(relativePath)) return uploadCache.get(relativePath)
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) {
    console.warn(`  ⚠ no encontrada: ${relativePath}`)
    return null
  }
  if (dryRun) {
    const ph = { _type: 'image', alt, _dry: true }
    uploadCache.set(relativePath, ph)
    return ph
  }
  const isSvg = abs.toLowerCase().endsWith('.svg')
  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
    ...(isSvg ? { contentType: 'image/svg+xml' } : {}),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt,
  }
  uploadCache.set(relativePath, ref)
  return ref
}

async function buildBrandItems() {
  const brands = []
  for (const [index, entry] of BRAND_CATALOG.entries()) {
    const logo = await uploadImage(entry.file, `Logo ${entry.name}`)
    if (!logo) continue
    brands.push({
      _key: blockKey('home-brand', index),
      _type: 'brandCarouselBlockItem',
      name: entry.name,
      logo,
      active: true,
    })
  }
  return brands
}

function buildBrandBlock(brands) {
  return {
    _type: 'brandCarouselBlock',
    _key: 'brand-carousel-home',
    enabled: true,
    order: 1,
    eyebrow: 'Confían en nosotros',
    title: 'Marcas que confían en nosotros',
    description: '',
    brands,
  }
}

function insertAfterPortfolio(blocks, brandBlock) {
  const list = structuredClone(blocks ?? [])
  const existingIdx = list.findIndex((b) => b._type === 'brandCarouselBlock')
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...brandBlock, _key: list[existingIdx]._key }
    return list.map((b, i) => ({ ...b, order: i }))
  }
  const portfolioIdx = list.findIndex(
    (b) => b._type === 'portfolioBlock' || b._type === 'galleryBlock',
  )
  const ctaIdx = list.findIndex((b) => b._type === 'ctaBlock')
  const insertAt =
    portfolioIdx >= 0 ? portfolioIdx + 1 : ctaIdx >= 0 ? ctaIdx : list.length
  list.splice(insertAt, 0, brandBlock)
  return list.map((b, i) => ({ ...b, order: i }))
}

const DOC_QUERY = `*[_id == $id][0]{ _id, _rev, blocks }`

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE home brand carousel ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

const doc = await client.fetch(DOC_QUERY, { id: DOC_ID })

if (!doc) {
  console.error(`✗ ${DOC_ID} no encontrado`)
  process.exit(1)
}

const hadBlock = (doc.blocks ?? []).some((b) => b._type === 'brandCarouselBlock')
const brands = await buildBrandItems()

if (brands.length < 15) {
  console.warn(`⚠ solo ${brands.length}/15 marcas disponibles`)
}

const brandBlock = buildBrandBlock(brands)
const blocks = insertAfterPortfolio(doc.blocks, brandBlock)

console.info(
  `${hadBlock ? '~' : '+'} homePage: brand carousel ${brands.length} marcas, ${blocks.length} bloques`,
)

if (apply && brands.length >= 1) {
  await client.patch(DOC_ID).set({ blocks }).commit({ visibility: 'sync' })
  console.info('\n✓ Migración completada')
} else {
  console.info('\n[dry] Sin escritura en Sanity')
}
