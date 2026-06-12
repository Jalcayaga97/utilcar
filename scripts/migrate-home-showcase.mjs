/**
 * Inserta showcaseCarouselBlock (5 imgs) en homePage tras heroBlock.
 *
 * npm run migrate:home-showcase:dry
 * npm run migrate:home-showcase
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
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

/** 5 imágenes de ejemplo — reutiliza assets locales existentes. */
const HOME_SHOWCASE_CATALOG = [
  {
    file: 'src/assets/images/banquetas/escolares/banq_esc.jpg',
    title: 'Banquetas escolares',
    alt: 'Banquetas escolares — fabricación Utilcar',
  },
  {
    file: 'src/assets/images/butacas/IMG_0148.jfif',
    title: 'Butacas Utilcar',
    alt: 'Butacas Utilcar — tapizado y terminaciones',
  },
  {
    file: 'src/assets/images/ventanas/vent1.jpg',
    title: 'Ventanas corredizas',
    alt: 'Ventanas laterales corredizas en furgón utilitario',
  },
  {
    file: 'src/assets/images/talleres/tr11.jpg',
    title: 'Taller móvil',
    alt: 'Conversión de furgón para servicio técnico móvil',
  },
  {
    file: 'src/assets/images/talleres/tr143.jpg',
    title: 'Taller equipado',
    alt: 'Taller móvil equipado para trabajo en terreno — Utilcar',
  },
]

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
  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt,
  }
  uploadCache.set(relativePath, ref)
  return ref
}

async function buildShowcaseImages() {
  const images = []
  for (const [index, entry] of HOME_SHOWCASE_CATALOG.entries()) {
    const image = await uploadImage(entry.file, entry.alt)
    if (!image) continue
    images.push({
      _key: blockKey('home-showcase-img', index),
      _type: 'showcaseCarouselBlockItem',
      image,
      alt: entry.alt,
      title: entry.title,
    })
  }
  return images
}

function buildShowcaseBlock(images) {
  return {
    _type: 'showcaseCarouselBlock',
    _key: 'showcase-home',
    enabled: true,
    order: 1,
    eyebrow: '',
    title: '',
    description: '',
    images,
  }
}

function insertAfterHero(blocks, showcaseBlock) {
  const list = structuredClone(blocks ?? [])
  const existingIdx = list.findIndex((b) => b._type === 'showcaseCarouselBlock')
  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...showcaseBlock, _key: list[existingIdx]._key }
    return list.map((b, i) => ({ ...b, order: i }))
  }
  const heroIdx = list.findIndex((b) => b._type === 'heroBlock')
  const insertAt = heroIdx >= 0 ? heroIdx + 1 : 0
  list.splice(insertAt, 0, showcaseBlock)
  return list.map((b, i) => ({ ...b, order: i }))
}

const DOC_QUERY = `*[_id == $id][0]{ _id, _rev, blocks }`

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE home showcase ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

const doc = await client.fetch(DOC_QUERY, { id: DOC_ID })

if (!doc) {
  console.error(`✗ ${DOC_ID} no encontrado — ejecutá npm run migrate:home primero`)
  process.exit(1)
}

const hadShowcase = (doc.blocks ?? []).some((b) => b._type === 'showcaseCarouselBlock')
const images = await buildShowcaseImages()

if (images.length < 5) {
  console.warn(`⚠ solo ${images.length}/5 imágenes disponibles`)
}

const showcaseBlock = buildShowcaseBlock(images)
const blocks = insertAfterHero(doc.blocks, showcaseBlock)

console.info(
  `${hadShowcase ? '~' : '+'} homePage: showcase ${images.length} imgs, ${blocks.length} bloques`,
)

if (apply && images.length >= 1) {
  await client.patch(DOC_ID).set({ blocks }).commit({ visibility: 'sync' })
  console.info('\n✓ Migración completada')
} else {
  console.info('\n[dry] Sin escritura en Sanity')
}
