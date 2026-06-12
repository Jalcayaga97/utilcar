/**
 * Auditoría global serviceSubPage — bloques, tabs, _keys, drafts, legacy.
 * npm run audit:all-services
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  SERVICE_SUB_PAGE_TAB_KEYS,
  serviceSubPageDocumentId,
} from '../utilcar-studio/schemas/content/serviceSubPage.js'

const sanityEnv = loadSanityEnv({ requireToken: false })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const REQUIRED_BLOCKS_ALL = ['heroBlock', 'ctaBlock', 'seoBlock']
/** Páginas con specs en tabs/intro — sin featuresBlock en blocks[]. */
const SERVICES_WITHOUT_FEATURES_BLOCK = new Set([
  'ventanas-lunetas',
  'banquetas',
  'accesorios',
  'tapiceria',
])

const LEGACY_ROOT_FIELDS = [
  'hero',
  'page',
  'intro',
  'scope',
  'specs',
  'gallery',
  'categories',
  'catalog',
  'brands',
  'cta',
  'faqItems',
  'featuredProjects',
  'categoriesLegacy',
  'tabsLegacy',
  'ventanasBrands',
  'services',
]

const QUERY = `{
  "published": *[_type == "serviceSubPage" && !(_id in path("drafts.**"))]{
    _id, pageKey, title, blocks[]{ _key, _type },
    tabsSection, introExtras,
    tabs[]{
      _key, _type, id, name,
      sections[]{ _key, title, items },
      gallery[]{ _key, alt, image{ asset->{ _id } } }
    },
    ${LEGACY_ROOT_FIELDS.map((f) => `"${f}": ${f}`).join(',\n    ')}
  },
  "drafts": *[_type == "serviceSubPage" && _id in path("drafts.**")]{
    _id, pageKey, title,
    "blockCount": count(blocks),
    "blocksNull": blocks == null,
    blocks[]{ _key, _type }
  }
}`

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function collectMissingKeys(items, label, errors, path = '') {
  if (!Array.isArray(items)) return
  for (const [index, item] of items.entries()) {
    if (!item) continue
    const itemPath = path ? `${path}[${index}]` : `${label}[${index}]`
    if (!item._key) {
      errors.push(`MISSING_KEY: ${itemPath} sin _key`)
    }
  }
}

function auditTabs(doc, errors, warnings) {
  const pageKey = doc.pageKey
  const expectsTabs = SERVICE_SUB_PAGE_TAB_KEYS.includes(pageKey)
  const tabs = doc.tabs ?? []
  const hasTabsSection = Boolean(String(doc.tabsSection?.title ?? '').trim())

  if (!expectsTabs) {
    if (tabs.length > 0 || hasTabsSection) {
      warnings.push(`tabs innecesarios en servicio sin pestañas (${tabs.length} tabs)`)
    }
    return
  }

  if (!hasTabsSection) {
    errors.push('tabsSection sin título')
  }
  if (!tabs.length) {
    errors.push('tabs[] vacío')
    return
  }

  const ids = tabs.map((t) => t.id).filter(Boolean)
  const uniqueIds = new Set(ids)
  if (uniqueIds.size !== ids.length) {
    errors.push('tabs[] con ids duplicados')
  }

  for (const tab of tabs) {
    if (!tab._key) errors.push(`MISSING_KEY: tab "${tab.id ?? '(sin id)'}" sin _key`)
    if (!String(tab.id ?? '').trim()) errors.push('tab sin id')
    if (!String(tab.name ?? '').trim()) errors.push(`tab "${tab.id ?? '?'}" sin name`)

    collectMissingKeys(tab.sections, 'sections', errors, `tab:${tab.id}/sections`)
    collectMissingKeys(tab.gallery, 'gallery', errors, `tab:${tab.id}/gallery`)
    if (!tab.gallery?.length) {
      errors.push(`tab "${tab.id}": gallery vacía`)
    }
  }
}

function auditLegacyFields(doc, warnings) {
  for (const field of LEGACY_ROOT_FIELDS) {
    const value = doc[field]
    if (value == null) continue
    if (Array.isArray(value) && value.length === 0) continue
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) {
      continue
    }
    warnings.push(`LEGACY_FIELD_FOUND: ${field}`)
  }
}

function auditDraft(pageKey, published, draft, errors, warnings) {
  if (!draft) return

  const publishedId = serviceSubPageDocumentId(pageKey)
  if (!published) {
    errors.push(`draft sin published (${draft._id})`)
  }

  const blockCount = draft.blockCount ?? 0
  if (draft.blocksNull) {
    errors.push(`draft blocks null (${draft._id})`)
  } else if (blockCount === 0 && !draft.blocksNull) {
    warnings.push(`draft vacío (${draft._id})`)
  }
}

function auditDocument(pageKey, title, published, draft) {
  const errors = []
  const warnings = []

  auditDraft(pageKey, published, draft, errors, warnings)

  if (!published) {
    errors.push(`documento publicado no existe (serviceSubPage-${pageKey})`)
    return { pageKey, title, errors, warnings, cmsActive: false, blockCount: 0 }
  }

  const blocks = published.blocks ?? []
  const blockCount = blocks.length
  const cmsActive = blockCount > 0

  if (!cmsActive) {
    errors.push('cmsActive: blockCount === 0')
  }

  collectMissingKeys(blocks, 'blocks', errors)

  for (const blockType of REQUIRED_BLOCKS_ALL) {
    if (!blockOfType(blocks, blockType)) {
      errors.push(`bloque obligatorio faltante: ${blockType}`)
    }
  }

  if (!SERVICES_WITHOUT_FEATURES_BLOCK.has(pageKey) && !blockOfType(blocks, 'featuresBlock')) {
    errors.push('bloque obligatorio faltante: featuresBlock')
  }

  auditTabs(published, errors, warnings)
  auditLegacyFields(published, warnings)

  return { pageKey, title, errors, warnings, cmsActive, blockCount }
}

export async function runAudit() {
  const data = await client.fetch(QUERY)
  const publishedByKey = Object.fromEntries((data.published ?? []).map((d) => [d.pageKey, d]))
  const draftByKey = Object.fromEntries(
    (data.drafts ?? []).map((d) => [d.pageKey ?? d._id.replace('drafts.serviceSubPage-', ''), d]),
  )

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría global serviceSubPage')
  console.info('══════════════════════════════════════\n')

  const results = []
  let totalErrors = 0
  let totalWarnings = 0

  for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {
    const published = publishedByKey[pageKey] ?? null
    const draft = draftByKey[pageKey] ?? null
    const result = auditDocument(pageKey, title, published, draft)
    results.push(result)
    totalErrors += result.errors.length
    totalWarnings += result.warnings.length

    const status = result.errors.length ? '✗' : result.warnings.length ? '⚠' : '✓'
    console.info(
      `${status} ${title} (${pageKey}) · blocks: ${result.blockCount} · cms: ${result.cmsActive ? 'ON' : 'OFF'}`,
    )
    for (const err of result.errors) console.info(`    ERROR: ${err}`)
    for (const warn of result.warnings) console.info(`    WARN:  ${warn}`)
  }

  const passed = results.filter((r) => r.errors.length === 0).length
  const extraPublished = (data.published ?? []).filter(
    (d) => !SERVICE_SUB_PAGE_KEYS.some((k) => k.value === d.pageKey),
  )

  if (extraPublished.length) {
    for (const doc of extraPublished) {
      totalWarnings += 1
      console.info(`\n⚠ Documento extra en Sanity: ${doc._id} (pageKey: ${doc.pageKey})`)
    }
  }

  console.info('\n── Audit Summary ──\n')
  console.info(`Services audited: ${SERVICE_SUB_PAGE_KEYS.length}`)
  console.info(`Passed: ${passed}`)
  console.info(`Warnings: ${totalWarnings}`)
  console.info(`Errors: ${totalErrors}`)

  return { errors: totalErrors, warnings: totalWarnings, passed }
}

const isMain = process.argv[1]?.endsWith('audit-all-services.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}
