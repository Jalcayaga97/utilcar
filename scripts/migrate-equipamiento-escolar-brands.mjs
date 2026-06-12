/**
 * Actualiza tabs de marcas en serviceSubPage-equipamiento-escolar (14 marcas oficiales).
 *
 * npm run migrate:equipamiento-escolar-brands:dry
 * npm run migrate:equipamiento-escolar-brands
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { equipamientoEscolarContent } from '../src/content/services.js'
import { EQUIPAMIENTO_MARCA_TABS } from '../src/content/equipamientoEscolarBrands.js'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'
import {
  GALLERY_COVERAGE_CATALOG,
  galleryFilesForTab,
} from './lib/galleryCoverageCatalog.mjs'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const DOC_ID = serviceSubPageDocumentId('equipamiento-escolar')
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

function mapTab(tab) {
  const catalogEntry = GALLERY_COVERAGE_CATALOG['equipamiento-escolar']?.[tab.id]
  const placeholder = catalogEntry?.placeholder === true
  const files = galleryFilesForTab('equipamiento-escolar', tab.id)

  return {
    tab,
    placeholder,
    files,
  }
}

async function buildGallery(tabId, tabName, files) {
  const gallery = []
  for (const [index, entry] of files.entries()) {
    const image = await uploadImage(entry.file, entry.alt)
    if (!image) continue
    gallery.push({
      _key: blockKey(`gal-${tabId}`, index),
      image,
      alt: entry.alt,
      caption: tabName,
    })
  }
  return gallery
}

function serializeTab(tab, gallery) {
  return {
    _type: 'serviceTab',
    _key: blockKey('tab', tab.id),
    id: tab.id,
    name: tab.name,
    description: tab.description ?? tab.intro?.[0] ?? '',
    models: tab.models ?? [],
    subtitle: tab.subtitle ?? '',
    intro: tab.intro ?? [],
    sections: (tab.sections ?? []).map((section, index) => ({
      _key: blockKey(`sec-${tab.id}`, index),
      title: section.title,
      items: section.items ?? [],
    })),
    gallery,
    extra: tab.extra ?? undefined,
  }
}

const DOC_QUERY = `*[_id in [$id, $draft]][0]{ _id, _rev, tabs[]{ id, name } }`

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE equipamiento escolar brands ${dryRun ? '(dry)' : '(apply)'}`)
console.info('══════════════════════════════════════\n')

const doc = await client.fetch(DOC_QUERY, { id: DOC_ID, draft: `drafts.${DOC_ID}` })
const targetId = doc?._id ?? DOC_ID

const beforeIds = (doc?.tabs ?? []).map((t) => t.id)
console.info(`BEFORE tabs (${beforeIds.length}): ${beforeIds.join(', ') || '(ninguno)'}\n`)

const tabs = []
const placeholders = []

for (const tab of EQUIPAMIENTO_MARCA_TABS) {
  const { files, placeholder } = mapTab(tab)
  const gallery = await buildGallery(tab.id, tab.name, files)
  if (gallery.length < 3) {
    console.warn(`✗ ${tab.name}: solo ${gallery.length}/3 imágenes`)
  }
  if (placeholder) placeholders.push(tab.id)
  const flag = placeholder ? ' [placeholder]' : ''
  console.info(`${gallery.length >= 3 ? '✓' : '✗'} ${tab.name} (${tab.id}): ${gallery.length} imgs${flag}`)
  tabs.push(serializeTab(tab, gallery))
}

const tabsSection = {
  eyebrow: equipamientoEscolarContent.brands.eyebrow,
  title: equipamientoEscolarContent.brands.title,
  description: equipamientoEscolarContent.brands.description,
}

if (apply) {
  await client
    .patch(targetId)
    .set({ tabs, tabsSection })
    .commit({ visibility: 'sync' })
}

console.info(`\nAFTER tabs: ${tabs.length}`)
console.info(`Placeholders (${placeholders.length}): ${placeholders.join(', ') || 'ninguno'}`)
console.info(apply ? '\n✓ Migración completada' : '\n[dry] Sin escritura en Sanity')
