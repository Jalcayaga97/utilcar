/**
 * Auditoría read-only: Butacas por aplicación — CMS vs runtime.
 * node scripts/audit-butacas-product-lines.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { butacasContent, BUTACAS_CATEGORIES } from '../src/content/services.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const QUERY = `{
  "published": *[_id == "serviceSubPage-butacas"][0]{
    _id, pageKey, tabsSection,
    "blockCount": count(blocks),
    "tabCount": count(tabs),
    tabs[]{
      _key, _type, id, name, intro,
      sections[]{ _key, title, "itemCount": count(items) },
      gallery[]{ _key, alt }
    }
  },
  "draft": *[_id == "drafts.serviceSubPage-butacas"][0]{
    _id, tabsSection, "tabCount": count(tabs),
    tabs[]{ _key, id, name }
  }
}`

function resolveServicePageTabs(legacyTabs, cmsTabs) {
  if ((cmsTabs ?? []).length > 0) return cmsTabs
  return legacyTabs ?? []
}

function resolveCategoriesHeader(cmsSection, localCategories, cmsActive) {
  if (cmsActive && cmsSection) {
    return {
      eyebrow: cmsSection.eyebrow ?? '',
      title: cmsSection.title ?? '',
      description: cmsSection.description ?? '',
      source: 'cms.tabsSection',
    }
  }
  return {
    eyebrow: localCategories.eyebrow ?? '',
    title: localCategories.title ?? '',
    description: localCategories.description ?? '',
    source: 'local.content.categories',
  }
}

const data = await client.fetch(QUERY)
const pub = data.published
const draft = data.draft

console.log('=== A. DOCUMENTO SANITY ===')
console.log(JSON.stringify(data, null, 2))

const cmsTabs = pub?.tabs ?? []
const legacyTabs = BUTACAS_CATEGORIES
const runtimeTabs = resolveServicePageTabs(legacyTabs, cmsTabs)
const cmsActive = (pub?.blockCount ?? 0) > 0

const headerCms = resolveCategoriesHeader(pub?.tabsSection, butacasContent.categories, cmsActive)
const headerLocal = {
  eyebrow: butacasContent.categories.eyebrow,
  title: butacasContent.categories.title,
  description: butacasContent.categories.description,
}

console.log('\n=== B/C. RUNTIME SIMULATION (VITE flags ON as prod) ===')
console.log('cmsActive (blocks[] > 0):', cmsActive)
console.log('resolveServicePageTabs → source:', runtimeTabs === cmsTabs ? 'CMS tabs' : 'BUTACAS_CATEGORIES local')
console.log('CMS tabs used when length > 0:', cmsTabs.length > 0)
console.log('runtime tab count:', runtimeTabs.length)
console.log('categories header source:', headerCms.source)

console.log('\n=== D. COMPARATIVA CMS vs RUNTIME WEB ===')
const rows = [
  ['eyebrow', pub?.tabsSection?.eyebrow, headerCms.eyebrow, headerLocal.eyebrow],
  ['title', pub?.tabsSection?.title, headerCms.eyebrow === headerLocal.eyebrow ? headerLocal.title : headerCms.title, headerLocal.title],
  ['description', pub?.tabsSection?.description?.slice(0, 60) + '...', headerCms.description?.slice(0, 60), headerLocal.description?.slice(0, 60)],
  ['tabs.count', cmsTabs.length, runtimeTabs.length, legacyTabs.length],
  ['tabs[0].name', cmsTabs[0]?.name, runtimeTabs[0]?.name, legacyTabs[0]?.name],
  ['tabs[0]._key', cmsTabs[0]?._key ?? '(missing)', '(n/a runtime)', '(n/a local)'],
  ['tabs[0].intro[0]', cmsTabs[0]?.intro?.[0]?.slice(0, 50), runtimeTabs[0]?.intro?.[0]?.slice(0, 50), legacyTabs[0]?.intro?.[0]?.slice(0, 50)],
  ['tabs[0].sections', cmsTabs[0]?.sections?.length, runtimeTabs[0]?.sections?.length, legacyTabs[0]?.sections?.length],
  ['tabs[0].gallery', cmsTabs[0]?.gallery?.length ?? 0, '(local assets if no CMS gallery)', 2],
  ['specs (sección aparte)', '(featuresBlock CMS)', butacasContent.specs.title, butacasContent.specs.title],
]

console.log('| Campo | CMS (Sanity) | Runtime Web | Local shadow |')
console.log('|-------|--------------|-------------|--------------|')
for (const [field, cms, runtime, local] of rows) {
  const mismatch = String(cms) !== String(runtime) && field !== 'tabs[0]._key' && field !== 'tabs[0].gallery'
  console.log(`| ${field} | ${cms ?? '—'} | ${runtime ?? '—'} | ${local ?? '—'} |${mismatch ? ' ⚠' : ''}`)
}

console.log('\n=== E. SHADOW CONTENT / _key ===')
const missingKeys = cmsTabs.filter((t) => !t._key).map((t) => t.id)
console.log('Tabs sin _key:', missingKeys.length ? missingKeys.join(', ') : 'ninguno')
console.log('Draft existe:', Boolean(draft))
console.log('Web usa BUTACAS_CATEGORIES solo si CMS tabs vacío:', cmsTabs.length === 0)
console.log('Duplicación activa en runtime:', cmsTabs.length > 0 && runtimeTabs === legacyTabs)

// Banquetas reference
const banq = await client.fetch(`*[_id == "serviceSubPage-banquetas"][0]{
  "tabCount": count(tabs),
  "tabsWithKey": count(tabs[_key != null]),
  "tabsWithGallery": count(tabs[count(gallery) > 0])
}`)
console.log('\n=== REFERENCIA BANQUETAS ===')
console.log(JSON.stringify(banq, null, 2))
