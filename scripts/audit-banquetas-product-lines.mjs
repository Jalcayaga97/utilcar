/**
 * Auditoría read-only: Banquetas por aplicación — CMS vs runtime.
 * node scripts/audit-banquetas-product-lines.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { banquetasContent, BANQUETAS_CATEGORIES } from '../src/content/services.js'

const EXPECTED_IDS = ['escolares', 'furgones', 'camiones']
/** Conteo fallback local (src/assets/images/index.js → banquetasCategoriasGalerias) */
const LOCAL_GALLERY_COUNTS = { escolares: 3, furgones: 3, camiones: 2 }
const EXPECTED_NAMES = [
  'Banquetas escolares',
  'Banquetas para furgones',
  'Banquetas para camiones',
]

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const QUERY = `{
  "published": *[_id == "serviceSubPage-banquetas"][0]{
    _id, pageKey, tabsSection,
    "blockCount": count(blocks),
    "tabCount": count(tabs),
    tabs[]{
      _key, _type, id, name, description, intro,
      sections[]{ _key, title, "itemCount": count(items) },
      gallery[]{ _key, alt, "assetId": image.asset->_id }
    }
  },
  "draft": *[_id == "drafts.serviceSubPage-banquetas"][0]{
    _id, "tabCount": count(tabs),
    tabs[]{ _key, id, name }
  }
}`

function resolveServicePageTabs(legacyTabs, cmsTabs) {
  if ((cmsTabs ?? []).length > 0) return cmsTabs
  return legacyTabs ?? []
}

const data = await client.fetch(QUERY)
const pub = data.published
const cmsTabs = pub?.tabs ?? []
const legacyTabs = BANQUETAS_CATEGORIES
const runtimeTabs = resolveServicePageTabs(legacyTabs, cmsTabs)

console.log('=== A. DOCUMENTO SANITY (serviceSubPage-banquetas) ===')
console.log(JSON.stringify(data, null, 2))

console.log('\n=== B. BEFORE SUMMARY ===')
console.log('tabCount:', cmsTabs.length)
console.log('ids:', cmsTabs.map((t) => t.id).join(', '))
for (const tab of cmsTabs) {
  console.log(`  · ${tab.id}: gallery=${tab.gallery?.length ?? 0}, sections=${tab.sections?.length ?? 0}, _key=${tab._key ?? '(missing)'}`)
}

console.log('\n=== C. RUNTIME ===')
console.log('resolveServicePageTabs source:', runtimeTabs === cmsTabs ? 'CMS tabs' : 'BANQUETAS_CATEGORIES local')
console.log('runtime ids:', runtimeTabs.map((t) => t.id).join(', '))

console.log('\n=== D. _key / gallery validation ===')
const missingTabKeys = cmsTabs.filter((t) => !t._key).map((t) => t.id)
const missingSectionKeys = cmsTabs.flatMap((t) =>
  (t.sections ?? []).filter((s) => !s._key).map((s) => `${t.id}/${s.title}`),
)
const missingGalleryKeys = cmsTabs.flatMap((t) =>
  (t.gallery ?? []).filter((g) => !g._key).map((g) => `${t.id}/gallery`),
)
console.log('tabs sin _key:', missingTabKeys.length ? missingTabKeys.join(', ') : 'ninguno')
console.log('sections sin _key:', missingSectionKeys.length ? missingSectionKeys.join(', ') : 'ninguno')
console.log('gallery sin _key:', missingGalleryKeys.length ? missingGalleryKeys.join(', ') : 'ninguno')

console.log('\n=== E. LOCAL FALLBACK (BANQUETAS_CATEGORIES) ===')
console.log('ids:', legacyTabs.map((t) => t.id).join(', '))
console.log('names:', legacyTabs.map((t) => t.name).join(' | '))
for (const tab of legacyTabs) {
  console.log(
    `  · ${tab.id}: gallery=${LOCAL_GALLERY_COUNTS[tab.id] ?? 0}, sections=${tab.sections?.length ?? 0}`,
  )
}

console.log('\n=== F. ALINEACIÓN CMS vs LOCAL ===')
const cmsIds = cmsTabs.map((t) => t.id)
const localIds = legacyTabs.map((t) => t.id)
const idsMatch =
  cmsIds.length === EXPECTED_IDS.length &&
  EXPECTED_IDS.every((id, i) => cmsIds[i] === id && localIds[i] === id)
const namesMatch = legacyTabs.every(
  (tab, i) => tab.name === (cmsTabs[i]?.name ?? EXPECTED_NAMES[i]),
)
const legacyRefs = ['adultos', 'traslado', 'Banquetas Adultos', 'Traslado de Personal']
const foundLegacy = legacyRefs.filter((ref) =>
  JSON.stringify({ cmsTabs, legacyTabs }).includes(ref),
)

console.log('IDs esperados:', EXPECTED_IDS.join(' → '))
console.log('CMS ids:', cmsIds.join(' → '))
console.log('Local ids:', localIds.join(' → '))
console.log('IDs alineados:', idsMatch ? '✓' : '✗')
console.log('Nombres alineados:', namesMatch ? '✓' : '✗')
console.log('Referencias legacy (adultos/traslado):', foundLegacy.length ? foundLegacy.join(', ') : 'ninguna')
console.log('resolveServicePageTabs →', runtimeTabs === cmsTabs ? 'CMS' : 'local fallback')
console.log('tabsSection local title:', banquetasContent.categories?.title)

if (!idsMatch || foundLegacy.length) {
  process.exitCode = 1
}
