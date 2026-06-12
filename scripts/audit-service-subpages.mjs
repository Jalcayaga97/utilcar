/**
 * Auditoría editorial serviceSubPage — schema vs frontend.
 * npm run audit:service-subpages
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  SERVICE_PORTFOLIO_PAGE_KEYS,
  WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS,
} from '../src/constants/servicePortfolio.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  SERVICE_SUB_PAGE_TAB_KEYS,
  serviceSubPageDocumentId,
} from '../utilcar-studio/schemas/content/serviceSubPage.js'

const sanityEnv = loadSanityEnv({ requireToken: false })
sanityEnv.applyToProcessEnv()

const TAB_PAGE_KEYS = SERVICE_SUB_PAGE_TAB_KEYS
const VENTANAS_KEY = 'ventanas-lunetas'
const FEATURES_PAGE_KEYS = [
  'talleres-moviles',
  'equipamiento-escolar',
  'butacas',
  'proteccion-cabina',
  'cambio-pisos',
  'reclinaciones',
  'fundas',
  'literas',
]
const PORTFOLIO_PAGE_KEYS = SERVICE_PORTFOLIO_PAGE_KEYS
const INTRO_EXTRAS_KEYS = [
  'talleres-moviles',
  'equipamiento-escolar',
  'butacas',
  'banquetas',
  'accesorios',
  'proteccion-cabina',
  'cambio-pisos',
  'reclinaciones',
  'fundas',
  'literas',
  'tapiceria',
]

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token || undefined,
  useCdn: false,
})

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function checkHero(doc) {
  const hero = blockOfType(doc.blocks, 'heroBlock')
  const url = hero?.image?.asset?.url ?? null
  const ref = hero?.image?.asset?._ref ?? null
  const ok = Boolean(url || ref)
  const highlights = Array.isArray(hero?.highlights) ? hero.highlights.length : 0
  return {
    ok,
    url: url ? url.slice(0, 48) + '…' : ref ? '(ref)' : '—',
    highlights,
  }
}

function checkPortfolio(doc) {
  const pageKey = doc.pageKey
  if (!PORTFOLIO_PAGE_KEYS.includes(pageKey)) {
    return { ok: true, detail: 'N/A' }
  }
  const portfolio = blockOfType(doc.blocks, 'portfolioBlock')
  if (!portfolio) return { ok: false, detail: 'sin bloque' }
  if (WORK_PROJECT_ONLY_PORTFOLIO_PAGE_KEYS.has(pageKey)) {
    const embedded = (portfolio.items ?? []).length
    const hasCopy = Boolean(String(portfolio.title ?? '').trim())
    if (embedded > 0) {
      return {
        ok: false,
        detail: `${embedded} ítems embebidos legacy (eliminar — tarjetas = workProject)`,
      }
    }
    return {
      ok: hasCopy,
      detail: hasCopy ? 'metadata OK (workProject)' : 'sin title',
    }
  }
  return { ok: false, detail: 'pageKey fuera de SERVICE_PORTFOLIO_PAGE_KEYS' }
}

function checkSeo(doc) {
  const seo = blockOfType(doc.blocks, 'seoBlock')
  return { ok: Boolean(seo?.title || seo?.metaTitle), detail: seo?.title ?? '—' }
}

function checkTabs(doc) {
  const pageKey = doc.pageKey
  if (!TAB_PAGE_KEYS.includes(pageKey)) {
    const hasTabs = (doc.tabs ?? []).length > 0 || doc.tabsSection?.title
    return { ok: !hasTabs, detail: hasTabs ? 'sobran tabs' : 'N/A' }
  }
  const tabCount = (doc.tabs ?? []).length
  const hasHeader = Boolean(doc.tabsSection?.title)
  return {
    ok: tabCount > 0 && hasHeader,
    detail: `${tabCount} tabs${hasHeader ? '' : ', sin header'}`,
  }
}

function checkIntroExtras(doc) {
  const pageKey = doc.pageKey
  if (pageKey === VENTANAS_KEY) {
    const proc = doc.introExtras?.procesoTemplado?.title
    const specs = (doc.introExtras?.especificaciones ?? []).length
    return {
      ok: Boolean(proc) && specs > 0,
      detail: proc ? `proc + ${specs} specs` : 'vacío',
    }
  }
  const hasExtras =
    doc.introExtras?.procesoTemplado?.title ||
    (doc.introExtras?.especificaciones ?? []).length > 0
  return { ok: !hasExtras, detail: hasExtras ? 'sobra introExtras' : 'N/A' }
}

function checkBlocks(doc) {
  const pageKey = doc.pageKey
  const required = ['heroBlock', 'richTextBlock', 'ctaBlock', 'seoBlock']
  if (FEATURES_PAGE_KEYS.includes(pageKey)) required.push('featuresBlock')
  if (PORTFOLIO_PAGE_KEYS.includes(pageKey)) required.push('portfolioBlock')
  const missing = required.filter((t) => !blockOfType(doc.blocks, t))
  const expected = required.length
  const found = expected - missing.length
  return {
    ok: missing.length === 0,
    detail: missing.length ? `falta ${missing.join(', ')}` : `${found}/${found}`,
  }
}

function auditDoc(doc) {
  const issues = []
  const pageKey = doc.pageKey

  const blocks = checkBlocks(doc)
  if (!blocks.ok) issues.push({ level: 'warn', msg: blocks.detail })

  const hero = checkHero(doc)
  if (!hero.ok) issues.push({ level: 'error', msg: 'heroBlock sin imagen' })

  const portfolio = checkPortfolio(doc)
  if (!portfolio.ok) issues.push({ level: 'warn', msg: `portfolio: ${portfolio.detail}` })

  const tabs = checkTabs(doc)
  if (!tabs.ok) issues.push({ level: 'warn', msg: `tabs: ${tabs.detail}` })

  const intro = checkIntroExtras(doc)
  if (!intro.ok) issues.push({ level: 'warn', msg: `introExtras: ${intro.detail}` })

  if (INTRO_EXTRAS_KEYS.includes(pageKey) && doc.introExtras) {
    issues.push({ level: 'warn', msg: 'introExtras visible en página incorrecta' })
  }

  return {
    issues,
    row: {
      pageKey,
      title: doc.title ?? pageKey,
      hero: hero.ok ? '✓' : '✗',
      heroUrl: hero.url,
      blocks: blocks.ok ? '✓' : '✗',
      seo: checkSeo(doc).ok ? '✓' : '✗',
      portfolio: portfolio.ok ? '✓' : portfolio.detail === 'N/A' ? '—' : '✗',
      tabs: tabs.ok ? '✓' : tabs.detail === 'N/A' ? '—' : '✗',
      introExtras: intro.ok ? '✓' : intro.detail === 'N/A' ? '—' : '✗',
      ctaGlobal: '✓',
      issueCount: issues.length,
    },
  }
}

console.info('\n══════════════════════════════════════')
console.info('  Auditoría serviceSubPage')
console.info('══════════════════════════════════════\n')

const docs = await client.fetch(
  `*[_type == "serviceSubPage"]{
    _id, pageKey, title, blocks[]{
      _type, eyebrow, title, subtitle, image{ asset->{ _id, url } }, imageAlt,
      items[]{ title, subtitle, description, client, vehicle, image{ asset->{ url } } }
    },
    tabsSection, tabs[]{ id, name, description, gallery[]{ asset->{ url } } },
    introExtras
  }`,
)

const settings = await client.fetch(`*[_id == "siteSettings"][0]{ serviceCta }`)
const globalCtaOk = Boolean(settings?.serviceCta?.title)

const rows = []
let totalIssues = 0

for (const { value, title } of SERVICE_SUB_PAGE_KEYS) {
  const id = serviceSubPageDocumentId(value)
  const doc = docs.find((d) => d._id === id)

  if (!doc) {
    rows.push({
      pageKey: value,
      title,
      hero: '✗',
      heroUrl: '—',
      blocks: '✗',
      seo: '✗',
      portfolio: '✗',
      tabs: '—',
      introExtras: '—',
      ctaGlobal: globalCtaOk ? '✓' : '✗',
      issueCount: 1,
    })
    totalIssues += 1
    console.info(`✗ ${title} (${id}) — documento no encontrado`)
    continue
  }

  const { issues, row } = auditDoc(doc)
  row.ctaGlobal = globalCtaOk ? '✓' : '✗'
  if (!globalCtaOk) {
    issues.push({ level: 'warn', msg: 'siteSettings.serviceCta no configurado' })
    row.issueCount += 1
  }
  rows.push(row)
  totalIssues += issues.length

  if (issues.length) {
    console.info(`${title} (${id})`)
    for (const issue of issues) {
      const icon = issue.level === 'error' ? '✗' : '⚠'
      console.info(`  ${icon} ${issue.msg}`)
    }
  }
}

const headers = ['Página', 'Hero', 'Bloques', 'SEO', 'Portfolio', 'Tabs', 'Intro', 'CTA global', 'Issues']
const colWidths = [22, 5, 7, 4, 9, 5, 6, 11, 6]

function pad(str, w) {
  const s = String(str)
  return s.length >= w ? s.slice(0, w - 1) + '…' : s.padEnd(w)
}

console.info('\n── Tabla resumen ──\n')
console.info(headers.map((h, i) => pad(h, colWidths[i])).join(' '))
console.info(colWidths.map((w) => '─'.repeat(w)).join(' '))

for (const row of rows) {
  console.info(
    [
      pad(row.title, colWidths[0]),
      pad(row.hero, colWidths[1]),
      pad(row.blocks, colWidths[2]),
      pad(row.seo, colWidths[3]),
      pad(row.portfolio, colWidths[4]),
      pad(row.tabs, colWidths[5]),
      pad(row.introExtras, colWidths[6]),
      pad(row.ctaGlobal, colWidths[7]),
      pad(row.issueCount, colWidths[8]),
    ].join(' '),
  )
}

const okCount = rows.filter((r) => r.issueCount === 0).length
const coverageBefore = 32.7
const coverageAfter = Math.round((okCount / rows.length) * 1000) / 10

console.info('\n── Cobertura CMS estimada ──')
console.info(`  Antes (referencia): ${coverageBefore}%`)
console.info(`  Después:            ${coverageAfter}% (${okCount}/${rows.length} páginas sin issues)`)

if (!globalCtaOk) {
  console.info('\n⚠ Ejecute: npm run seed:site-settings')
}

console.info(`\nTotal issues: ${totalIssues}`)
process.exit(totalIssues > 0 ? 1 : 0)
