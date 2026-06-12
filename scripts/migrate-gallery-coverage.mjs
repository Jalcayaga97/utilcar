/**
 * Estandariza galerías de tabs (mín. 3 imgs) en servicios con pestañas.
 * npm run migrate:gallery-coverage:dry
 * npm run migrate:gallery-coverage
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'
import {
  GALLERY_COVERAGE_PAGE_KEYS,
  galleryFilesForTab,
} from './lib/galleryCoverageCatalog.mjs'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

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

const TAB_QUERY = `*[_id == $id][0]{
  _id, pageKey,
  tabs[]{ _key, id, name, description, intro, subtitle, models, sections, extra,
    gallery[]{ _key, alt, caption, image{ asset->{ _id } } }
  }
}`

async function main() {
  console.info('\n[migrate:gallery-coverage]\n')

  for (const pageKey of GALLERY_COVERAGE_PAGE_KEYS) {
    const docId = serviceSubPageDocumentId(pageKey)
    const doc = await client.fetch(TAB_QUERY, { id: docId })
    if (!doc?.tabs?.length) {
      console.warn(`  ✗ ${pageKey}: sin tabs`)
      continue
    }

    const mappedTabs = []

    for (const tab of doc.tabs) {
      const files = galleryFilesForTab(pageKey, tab.id)
      const gallery = []
      for (const [index, entry] of files.entries()) {
        const image = await uploadImage(entry.file, entry.alt)
        if (!image) continue
        gallery.push({
          _key: blockKey(`gal-${tab.id}`, index),
          image,
          alt: entry.alt,
          caption: tab.name,
        })
      }
      mappedTabs.push({
        ...tab,
        _type: 'serviceTab',
        gallery,
      })
      console.info(`  ${pageKey}/${tab.id}: ${gallery.length} imgs (antes: ${tab.gallery?.length ?? 0})`)
    }

    if (!dryRun && mappedTabs.length) {
      await client.patch(docId).set({ tabs: mappedTabs }).commit()
    }
  }

  console.info(dryRun ? '\n[dry] Sin escritura' : '\n✓ Galerías actualizadas')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
