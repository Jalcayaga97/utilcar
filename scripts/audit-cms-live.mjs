/**
 * Auditoría CMS Live — cadena CMS → Query → Contract → Resolver → Adapter → UI.
 * npm run audit:cms-live
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createAuditClient,
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from './lib/imageAuditShared.mjs'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function loadEnvFlags() {
  const envPath = join(WEB_ROOT, '.env.local')
  const flags = {
    VITE_USE_SANITY: false,
    VITE_USE_BLOCK_RESOLVER: false,
    VITE_USE_PAGE_RESOLVER: false,
    VITE_USE_SERVICES_V2: false,
    VITE_USE_WORK_V2: false,
    VITE_USE_CONTACT_V2: false,
    VITE_USE_ABOUT_V2: false,
  }
  if (!existsSync(envPath)) return flags
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^(VITE_USE_[A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    const [, key, raw] = m
    if (!(key in flags)) continue
    flags[key] = raw.trim() === 'true'
  }
  return flags
}

const BLOCK_REGISTRY = new Set([
  'heroBlock', 'servicesBlock', 'whyUsBlock', 'whyUtilcarBlock', 'portfolioBlock', 'galleryBlock',
  'ctaBlock', 'faqBlock', 'featuresBlock', 'mapBlock', 'seoBlock', 'richTextBlock',
  'featureGridBlock', 'showcaseCarouselBlock', 'brandCarouselBlock', 'specialtiesBlock',
])

const PAGE_LIVE_SPECS = {
  homePage: {
    label: 'Home',
    gate: (f) => f.VITE_USE_SANITY && f.VITE_USE_BLOCK_RESOLVER,
    studioBlocks: [
      'heroBlock', 'showcaseCarouselBlock', 'specialtiesBlock', 'servicesBlock',
      'whyUsBlock', 'whyUtilcarBlock', 'portfolioBlock', 'brandCarouselBlock', 'ctaBlock',
    ],
    uiBlocks: [
      'heroBlock', 'showcaseCarouselBlock', 'specialtiesBlock', 'servicesBlock',
      'whyUsBlock', 'whyUtilcarBlock', 'portfolioBlock', 'brandCarouselBlock', 'ctaBlock',
    ],
    query: 'HOME_QUERY_WITH_BLOCKS',
    adapter: 'home.adapter.js',
    page: 'Home.jsx',
  },
  aboutPage: {
    label: 'About',
    gate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_ABOUT_V2,
    studioBlocks: ['heroBlock', 'richTextBlock', 'featureGridBlock', 'ctaBlock', 'seoBlock'],
    uiBlocks: ['heroBlock', 'richTextBlock', 'featureGridBlock', 'ctaBlock', 'seoBlock'],
    query: 'ABOUT_QUERY_WITH_BLOCKS',
    adapter: 'about.adapter.js',
    page: 'SobreNosotros.jsx',
  },
  contactPage: {
    label: 'Contact',
    gate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_CONTACT_V2,
    studioBlocks: ['heroBlock', 'richTextBlock', 'faqBlock', 'ctaBlock', 'seoBlock'],
    uiBlocks: ['heroBlock', 'richTextBlock', 'faqBlock', 'ctaBlock', 'seoBlock'],
    query: 'CONTACT_QUERY_WITH_BLOCKS',
    adapter: 'contact.adapter.js',
    page: 'Contacto.jsx',
    extraFields: ['form'],
  },
  workPage: {
    label: 'Work',
    gate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_WORK_V2,
    studioBlocks: ['heroBlock', 'richTextBlock', 'portfolioBlock', 'ctaBlock', 'seoBlock'],
    uiBlocks: ['heroBlock', 'richTextBlock', 'portfolioBlock', 'ctaBlock', 'seoBlock'],
    query: 'WORK_QUERY_WITH_BLOCKS',
    adapter: 'work.adapter.js',
    page: 'Trabajos.jsx',
  },
}

const SERVICE_UI_BLOCKS = [
  'heroBlock', 'richTextBlock', 'featuresBlock', 'portfolioBlock', 'galleryBlock',
  'showcaseCarouselBlock', 'ctaBlock', 'seoBlock',
]

function coveragePct(spec) {
  const total = spec.studioBlocks.length + (spec.extraFields?.length ?? 0)
  const wired = spec.uiBlocks.filter((b) => spec.studioBlocks.includes(b)).length
  const extra = spec.extraFields?.length ?? 0
  return Math.round(((wired + extra) / total) * 100)
}

function auditBlock(blockType, spec, flags, cmsBlocks, issues, pageLabel) {
  if (!spec.studioBlocks.includes(blockType)) return

  if (!spec.gate(flags)) {
    issues.push({
      page: pageLabel,
      field: blockType,
      code: 'FIELD_USING_LEGACY_FALLBACK',
      detail: 'Flag CMS off — runtime usa src/content/*',
    })
    return
  }

  if (!BLOCK_REGISTRY.has(blockType) && blockType !== 'specialtiesBlock') {
    issues.push({
      page: pageLabel,
      field: blockType,
      code: 'FIELD_IN_CMS_NOT_RENDERED',
      detail: 'Sin resolver en blockRegistry',
    })
  }

  const inDoc = cmsBlocks.includes(blockType)

  if (inDoc && !spec.uiBlocks.includes(blockType)) {
    issues.push({
      page: pageLabel,
      field: blockType,
      code: 'FIELD_IN_CMS_NOT_RENDERED',
      detail: 'Presente en Studio/doc pero sin componente UI',
    })
  }
}

export async function runAudit() {
  const flags = loadEnvFlags()
  const client = createAuditClient()
  let errors = 0
  let warnings = 0
  const issues = []
  const summary = []

  console.info('\n══════════════════════════════════════')
  console.info('  CMS Live Integrity')
  console.info('══════════════════════════════════════\n')

  for (const [docId, spec] of Object.entries(PAGE_LIVE_SPECS)) {
    const doc = await client.fetch(
      `*[_id == $id][0]{ blocks[]{ _type, enabled, title, eyebrow, body } }`,
      { id: docId },
    )
    const cmsBlocks = (doc?.blocks ?? [])
      .filter((b) => b.enabled !== false)
      .map((b) => b._type)

    const pageIssues = []
    for (const block of spec.studioBlocks) {
      auditBlock(block, spec, flags, cmsBlocks, pageIssues, spec.label)
    }

    if (spec.extraFields) {
      const extraDoc = await client.fetch(
        `*[_id == $id][0]{ form }`,
        { id: docId },
      )
      for (const field of spec.extraFields) {
        if (spec.gate(flags) && !extraDoc?.[field]) {
          pageIssues.push({
            page: spec.label,
            field,
            code: 'FIELD_RENDERED_WITHOUT_CMS_SOURCE',
            detail: `Campo ${field} ausente en documento publicado`,
          })
        }
      }
    }

    const cov = spec.gate(flags) ? coveragePct(spec) : 0
    const pageErrors = pageIssues.filter((i) =>
      ['FIELD_USING_LEGACY_FALLBACK', 'FIELD_IN_CMS_NOT_RENDERED'].includes(i.code),
    ).length
    const pageWarnings = pageIssues.length - pageErrors
    errors += pageErrors
    warnings += pageWarnings

    const passed = spec.gate(flags) && pageIssues.length === 0 && cov === 100
    summary.push({ label: spec.label, passed, coverage: cov, issues: pageIssues })

    console.info(`${spec.label.padEnd(10)} ${passed ? 'PASS' : 'FAIL'}  (${cov}% coverage)`)
    for (const issue of pageIssues) {
      console.info(`  [${issue.code}] ${issue.field}: ${issue.detail}`)
    }
  }

  const serviceDocs = await client.fetch(
    `*[_type == "serviceSubPage"]{ pageKey, "blocks": blocks[]{ _type, enabled } }`,
  )
  let servicePassed = 0
  let serviceCovTotal = 0

  console.info('')
  for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {
    const doc = serviceDocs.find((d) => d.pageKey === pageKey)
    const cmsBlocks = (doc?.blocks ?? [])
      .filter((b) => b.enabled !== false)
      .map((b) => b._type)
    const gate = flags.VITE_USE_SANITY && flags.VITE_USE_PAGE_RESOLVER && flags.VITE_USE_SERVICES_V2
    const missingUi = SERVICE_UI_BLOCKS.filter((b) => cmsBlocks.includes(b) === false)
    const cov = gate
      ? Math.round(
          (SERVICE_UI_BLOCKS.filter((b) => cmsBlocks.includes(b)).length / SERVICE_UI_BLOCKS.length) *
            100,
        )
      : 0
    serviceCovTotal += cov

    const pageIssues = []
    if (!gate) {
      pageIssues.push({ code: 'FIELD_USING_LEGACY_FALLBACK', field: pageKey })
    } else if (missingUi.length > 2) {
      pageIssues.push({
        code: 'FIELD_RENDERED_WITHOUT_CMS_SOURCE',
        field: missingUi.join(', '),
        detail: title,
      })
    }

    if (gate && pageIssues.length === 0) servicePassed += 1
    if (pageIssues.some((i) => i.code === 'FIELD_USING_LEGACY_FALLBACK')) errors += 1
    else if (pageIssues.length) warnings += 1
  }

  const servicesCoverage = Math.round(serviceCovTotal / SERVICE_SUB_PAGE_KEYS.length)
  const servicesPass =
    flags.VITE_USE_SANITY &&
    flags.VITE_USE_PAGE_RESOLVER &&
    flags.VITE_USE_SERVICES_V2 &&
    servicePassed === SERVICE_SUB_PAGE_KEYS.length
  summary.push({
    label: 'Services',
    passed: servicesPass,
    coverage: servicesCoverage,
    issues: [],
  })

  console.info(`Services   ${servicesPass ? 'PASS' : 'FAIL'}  (${servicesCoverage}% avg coverage, ${servicePassed}/12 páginas OK)`)
  console.info('')
  console.info('── Resumen ──')
  for (const row of summary) {
    console.info(`${row.label.padEnd(10)} ${row.passed ? 'PASS' : 'FAIL'}  ${row.coverage}%`)
  }
  console.info('')
  console.info(`Errores: ${errors}`)
  console.info(`Advertencias: ${warnings}`)

  return { errors, warnings, summary, passed: errors === 0 }
}

const isMain = process.argv[1]?.endsWith('audit-cms-live.mjs')
if (isMain) {
  const result = await runAudit()
  if (!result.passed) process.exit(1)
}
