/**
 * Sube galerías de tabs butacas (camiones / furgones) a serviceSubPage-butacas.
 * Preserva intro, sections y demás contenido editorial existente.
 *
 * npm run migrate:butacas-tab-galleries:dry
 * npm run migrate:butacas-tab-galleries
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BUTACAS_CATEGORIES } from '../src/content/services.js'
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
  camiones: [
    { file: 'src/assets/images/butacas/IMG_0148.jfif', alt: 'Butacas para camiones — tapizado Utilcar' },
    { file: 'src/assets/images/butacas/IMG_0149.jfif', alt: 'Butacas para camiones — detalle costuras' },
  ],
  furgones: [
    { file: 'src/assets/images/butacas/IMG_0150.jfif', alt: 'Butacas para furgones — estructura y confort' },
    { file: 'src/assets/images/butacas/IMG_0148.jfif', alt: 'Butacas para furgones — fabricación a medida' },
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

const BUTACAS_ID = serviceSubPageDocumentId('butacas')
const uploadCache = new Map()

function blockKey(prefix, index) {
  return `${prefix}-${String(index).replace(/[^a-z0-9]/gi, '')}`
}

function fileStat(relativePath) {
  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) return { exists: false, abs }
  return { exists: true, abs, size: statSync(abs).size }
}

async function uploadImage(relativePath, alt) {
  if (!relativePath) return null
  if (uploadCache.has(relativePath)) return uploadCache.get(relativePath)

  const stat = fileStat(relativePath)
  if (!stat.exists) {
    console.warn(`  ⚠ Imagen no encontrada: ${relativePath}`)
    return null
  }

  if (dryRun) {
    const placeholder = { _type: 'image', alt: alt || basename(relativePath), _dry: true }
    uploadCache.set(relativePath, placeholder)
    return placeholder
  }

  const asset = await client.assets.upload('image', createReadStream(stat.abs), {
    filename: basename(stat.abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: alt || basename(stat.abs),
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

const QUERY = `*[_id == $id][0]{
  _id, _rev, tabs[]{
    _key, _type, id, name, description, intro, subtitle, models, sections, extra,
    gallery[]{ _key, alt, caption, image{ asset->{ _id } } }
  }
}`

async function main() {
  const doc = await client.fetch(QUERY, { id: BUTACAS_ID })
  if (!doc) {
    console.error('Documento butacas no encontrado.')
    process.exit(1)
  }

  const existingById = Object.fromEntries((doc.tabs ?? []).map((t) => [t.id, t]))
  const sourceTabs = BUTACAS_CATEGORIES.map((local) => ({
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

  console.log('[migrate:butacas-tab-galleries]')
  console.log(`  destino: ${doc._id}`)
  console.log(`  tabs: ${mappedTabs.length}`)
  console.log(`  imágenes gallery: ${galleryCount}`)
  for (const tab of mappedTabs) {
    console.log(`  · ${tab.id}: ${tab.gallery?.length ?? 0} imagen(es), _key=${tab._key}`)
  }

  if (dryRun) {
    console.log('[dry] Sin escritura en Sanity.')
    return
  }

  await client.patch(doc._id).set({ tabs: mappedTabs }).commit()
  console.log('Migración de galerías aplicada.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
