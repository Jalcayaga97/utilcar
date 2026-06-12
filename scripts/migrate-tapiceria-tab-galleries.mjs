/**
 * Completa galerías CMS de serviceSubPage-tapiceria (mín. 3 imgs/tab).
 * npm run migrate:tapiceria-tab-galleries:dry
 * npm run migrate:tapiceria-tab-galleries
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { TAPICERIA_CATEGORIES } from '../src/content/interiorServices.js'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const WEB_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

const TAB_GALLERY_FILES = {
  'cambio-tapiz': [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', alt: 'Cambio de tapiz — butaca renovada Utilcar' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', alt: 'Cambio de tapiz — detalle costuras reforzadas' },
    { file: 'src/assets/images/butacas/IMG_0150.jfif', alt: 'Cambio de tapiz — terminación profesional' },
  ],
  'reparacion-tapiceria': [
    { file: 'src/assets/images/banquetas/escolares/banq_esc.jpg', alt: 'Reparación de tapicería — banquetas escolares' },
    { file: 'src/assets/images/banquetas/escolares/banq_esc1.jpg', alt: 'Reparación de tapicería — costuras restauradas' },
    { file: 'src/assets/images/banquetas/traslado/banq_tras_pers.jpg', alt: 'Reparación de tapicería — asientos de traslado' },
  ],
  'personalizacion-interior': [
    { file: 'src/assets/images/banquetas/adultos/IMG_0118.jfif', alt: 'Personalización interior — tapizado premium' },
    { file: 'src/assets/images/banquetas/adultos/IMG_0120.jfif', alt: 'Personalización interior — detalle de confort' },
    { file: 'src/assets/images/accesorios/cabeceras/cabeceras.jpg', alt: 'Personalización interior — coordinación equipamiento' },
  ],
}

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const DOC_ID = serviceSubPageDocumentId('tapiceria')
const uploadCache = new Map()

function blockKey(prefix, index) {
  return `${prefix}-${String(index).replace(/[^a-z0-9]/gi, '')}`
}

async function uploadImage(relativePath, alt) {
  if (uploadCache.has(relativePath)) return uploadCache.get(relativePath)
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) {
    console.warn(`  ⚠ Imagen no encontrada: ${relativePath}`)
    return null
  }
  if (dryRun) {
    const placeholder = { _type: 'image', alt, _dry: true }
    uploadCache.set(relativePath, placeholder)
    return placeholder
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

function mapTab(tab, galleryEntries) {
  return {
    _type: 'serviceTab',
    _key: tab._key ?? blockKey('tab', tab.id),
    id: tab.id,
    name: tab.name,
    description: tab.description ?? tab.intro?.[0] ?? '',
    models: tab.models ?? [],
    subtitle: tab.subtitle ?? '',
    intro: tab.intro ?? [],
    sections: (tab.sections ?? []).map((section, index) => ({
      _key: section._key ?? blockKey(`sec-${tab.id}`, index),
      title: section.title,
      items: section.items ?? [],
    })),
    gallery: galleryEntries,
    extra: tab.extra ?? undefined,
  }
}

const BEFORE_QUERY = `*[_id == $id][0]{
  tabs[]{ _key, id, name, "galleryCount": count(gallery) }
}`

const QUERY = `*[_id == $id][0]{
  _id, _rev, tabs[]{
    _key, _type, id, name, description, intro, subtitle, models, sections, extra,
    gallery[]{ _key, alt, caption, image{ asset->{ _id } } }
  }
}`

async function main() {
  const before = await client.fetch(BEFORE_QUERY, { id: DOC_ID })
  console.info('\n── BEFORE ──')
  for (const tab of before?.tabs ?? []) {
    console.info(`  ${tab.id} (_key=${tab._key}): ${tab.galleryCount} imágenes`)
  }

  const doc = await client.fetch(QUERY, { id: DOC_ID })
  if (!doc) {
    console.error('Documento tapiceria no encontrado.')
    process.exit(1)
  }

  const existingById = Object.fromEntries((doc.tabs ?? []).map((t) => [t.id, t]))
  const sourceTabs = TAPICERIA_CATEGORIES.map((local) => ({
    ...local,
    ...existingById[local.id],
    id: local.id,
  }))

  const mappedTabs = []
  let galleryCount = 0

  for (const tab of sourceTabs) {
    const files = TAB_GALLERY_FILES[tab.id] ?? []
    const gallery = []
    for (const [index, fileEntry] of files.entries()) {
      const image = await uploadImage(fileEntry.file, fileEntry.alt)
      if (!image) continue
      galleryCount += 1
      gallery.push({
        _key: blockKey(`gal-${tab.id}`, index),
        image,
        alt: fileEntry.alt,
        caption: tab.name,
      })
    }
    mappedTabs.push(mapTab(tab, gallery))
  }

  console.info('\n[migrate:tapiceria-tab-galleries]')
  console.info(`  destino: ${doc._id}`)
  for (const tab of mappedTabs) {
    console.info(`  · ${tab.id}: ${tab.gallery?.length ?? 0} imagen(es), _key=${tab._key}`)
  }

  if (dryRun) {
    console.info('\n[dry] Sin escritura en Sanity.')
    return
  }

  await client.patch(doc._id).set({ tabs: mappedTabs }).commit()

  const after = await client.fetch(BEFORE_QUERY, { id: DOC_ID })
  console.info('\n── AFTER ──')
  for (const tab of after?.tabs ?? []) {
    console.info(`  ${tab.id} (_key=${tab._key}): ${tab.galleryCount} imágenes`)
  }
  console.info(`\nTotal imágenes gallery: ${galleryCount}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
