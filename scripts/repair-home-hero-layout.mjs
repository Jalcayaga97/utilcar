/**
 * Repara heroBlock Home: layout dual-image + título horizontal + sin legacy.
 * npm run repair:home-hero-layout:dry
 * npm run repair:home-hero-layout
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
const BRAND = {
  logoAlt: 'Logotipo Utilcar Conversiones — conversiones automotrices Santiago',
}

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const DOC_ID = 'homePage'
const HERO_TITLE = 'Conversiones, modificaciones, tapicería y equipamientos automotrices.'

const PRIMARY_FILE = 'public/logo.jpg'
const SECONDARY_FILE = 'src/assets/images/hero.jpg'

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const uploadCache = new Map()

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

console.info('\n══════════════════════════════════════')
console.info(`  REPAIR home hero layout ${dryRun ? '(dry)' : '(apply)'}`)
console.info('══════════════════════════════════════\n')

const doc = await client.fetch(`*[_id == $id][0]{ _id, _rev, blocks }`, { id: DOC_ID })
if (!doc?.blocks?.length) {
  console.error('✗ homePage sin blocks — ejecutá npm run migrate:home')
  process.exit(1)
}

const heroIdx = doc.blocks.findIndex((b) => b._type === 'heroBlock')
if (heroIdx < 0) {
  console.error('✗ heroBlock no encontrado')
  process.exit(1)
}

const hero = doc.blocks[heroIdx]
console.info('BEFORE:')
console.info(`  title: ${hero.title ?? '(vacío)'}`)
console.info(`  subtitle: ${hero.subtitle ? 'sí' : 'no'}`)
console.info(`  highlights: ${hero.highlights?.length ?? 0}`)
console.info(`  primaryImage: ${hero.primaryImage?.asset?._ref ? 'sí' : 'no'}`)
console.info(`  secondaryImage: ${hero.secondaryImage?.asset?._ref ? 'sí' : 'no'}`)

const primaryImage = await uploadImage(PRIMARY_FILE, BRAND.logoAlt)
const secondaryImage = await uploadImage(
  SECONDARY_FILE,
  'Utilcar Conversiones — más de una década en conversiones automotrices',
)

const blocks = structuredClone(doc.blocks)
blocks[heroIdx] = {
  ...hero,
  title: HERO_TITLE,
  subtitle: undefined,
  highlights: undefined,
  primaryImage: primaryImage ?? hero.primaryImage ?? hero.image,
  primaryImageAlt: BRAND.logoAlt,
  secondaryImage: secondaryImage ?? hero.secondaryImage,
  secondaryImageAlt:
    hero.secondaryImageAlt ??
    'Utilcar Conversiones — distintivo años en el mercado',
}

if (apply) {
  await client
    .patch(DOC_ID)
    .set({ blocks })
    .commit({ visibility: 'sync' })

  const heroKey = blocks[heroIdx]._key
  if (heroKey) {
    await client
      .patch(DOC_ID)
      .unset([`blocks[_key=="${heroKey}"].subtitle`, `blocks[_key=="${heroKey}"].highlights`])
      .commit({ visibility: 'sync' })
  }
}

console.info('\nAFTER (planificado):')
console.info(`  title: ${HERO_TITLE}`)
console.info(`  subtitle: eliminado`)
console.info(`  highlights: eliminado`)
console.info(`  primaryImage: ${primaryImage ? PRIMARY_FILE : 'sin cambio'}`)
console.info(`  secondaryImage: ${secondaryImage ? SECONDARY_FILE : 'sin cambio'}`)
console.info(apply ? '\n✓ Reparación completada' : '\n[dry] Sin escritura en Sanity')
