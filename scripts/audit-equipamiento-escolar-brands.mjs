/**
 * Auditoría BEFORE — marcas Equipamiento Escolar (CMS + fallback).
 * node scripts/audit-equipamiento-escolar-brands.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { EQUIPAMIENTO_MARCA_TABS } from '../src/content/equipamientoEscolarBrands.js'
import { GALLERY_COVERAGE_CATALOG } from './lib/galleryCoverageCatalog.mjs'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const DOC_ID = serviceSubPageDocumentId('equipamiento-escolar')

const QUERY = `*[_id in [$id, $draft]][0]{
  _id,
  tabsSection,
  tabs[]{
    _key,
    id,
    name,
    subtitle,
    intro,
    "galleryCount": count(gallery),
    gallery[]{ _key, alt, src, image{ asset->{ _id, url } } },
    sections[]{ _key, title, items }
  }
}`

const doc = await client.fetch(QUERY, { id: DOC_ID, draft: `drafts.${DOC_ID}` })

console.info('\n══════════════════════════════════════')
console.info('  BEFORE — Marcas Equipamiento Escolar')
console.info('══════════════════════════════════════\n')

console.info('--- CMS (Sanity) ---')
if (!doc?.tabs?.length) {
  console.info('(sin tabs en CMS)')
} else {
  for (const tab of doc.tabs) {
    const imgs = tab.gallery ?? []
    const withAsset = imgs.filter((g) => g?.image?.asset?._id || g?.src)
    console.info(`${tab.name} | id: ${tab.id} | imgs: ${withAsset.length} | origen: CMS`)
  }
  console.info(`Total CMS tabs: ${doc.tabs.length}`)
}

console.info('\n--- Fallback local (EQUIPAMIENTO_MARCA_TABS) ---')
for (const tab of EQUIPAMIENTO_MARCA_TABS) {
  const catalog = GALLERY_COVERAGE_CATALOG['equipamiento-escolar']?.[tab.id] ?? []
  console.info(`${tab.name} | id: ${tab.id} | imgs catálogo: ${catalog.length} | origen: fallback`)
}
console.info(`Total fallback tabs: ${EQUIPAMIENTO_MARCA_TABS.length}`)
