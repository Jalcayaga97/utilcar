/**
 * Auditoría de integridad CMS-first — trazabilidad Studio → Web.
 * npm run audit:cms-integrity
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
    VITE_USE_SPECIALTIES_V2: false,
    VITE_USE_SERVICES_V2: false,
    VITE_USE_WORK_V2: false,
    VITE_USE_CONTACT_V2: false,
    VITE_USE_ABOUT_V2: false,
    VITE_SANITY_USE_CDN: true,
  }
  if (!existsSync(envPath)) return flags
  const text = readFileSync(envPath, 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    const [, key, raw] = m
    if (!(key in flags)) continue
    const val = raw.trim()
    if (val === 'true') flags[key] = true
    else if (val === 'false') flags[key] = false
  }
  return flags
}

/** Bloques permitidos por página (Studio) + wiring web conocido. */
const PAGE_SPECS = {
  homePage: {
    label: 'Home',
    docId: 'homePage',
    cmsGate: (f) => f.VITE_USE_SANITY && f.VITE_USE_BLOCK_RESOLVER,
    allowedBlocks: [
      'heroBlock', 'showcaseCarouselBlock', 'brandCarouselBlock', 'specialtiesBlock',
      'servicesBlock', 'whyUsBlock', 'whyUtilcarBlock', 'portfolioBlock', 'ctaBlock',
    ],
    wiredBlocks: [
      'heroBlock', 'showcaseCarouselBlock', 'brandCarouselBlock', 'specialtiesBlock',
      'servicesBlock', 'whyUsBlock', 'whyUtilcarBlock', 'portfolioBlock', 'ctaBlock',
    ],
    query: 'HOME_QUERY_WITH_BLOCKS',
    resolver: 'homeResolver.js',
    adapter: 'home.adapter.js',
    page: 'Home.jsx',
  },
  aboutPage: {
    label: 'Sobre Nosotros',
    docId: 'aboutPage',
    cmsGate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_ABOUT_V2,
    allowedBlocks: ['heroBlock', 'richTextBlock', 'featureGridBlock', 'ctaBlock', 'seoBlock'],
    wiredBlocks: ['heroBlock', 'richTextBlock', 'featureGridBlock', 'ctaBlock', 'seoBlock'],
    query: 'ABOUT_QUERY_WITH_BLOCKS',
    resolver: 'aboutPageResolver.js',
    adapter: 'about.adapter.js',
    page: 'SobreNosotros.jsx',
  },
  contactPage: {
    label: 'Contacto',
    docId: 'contactPage',
    cmsGate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_CONTACT_V2,
    allowedBlocks: ['heroBlock', 'richTextBlock', 'faqBlock', 'ctaBlock', 'seoBlock'],
    wiredBlocks: ['heroBlock', 'richTextBlock', 'faqBlock', 'ctaBlock', 'seoBlock'],
    orphanInStudio: ['mapBlock'],
    query: 'CONTACT_QUERY_WITH_BLOCKS',
    resolver: 'contactPageResolver.js',
    adapter: 'contact.adapter.js',
    page: 'Contacto.jsx',
  },
  workPage: {
    label: 'Trabajos',
    docId: 'workPage',
    cmsGate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_WORK_V2,
    allowedBlocks: [
      'heroBlock', 'richTextBlock', 'portfolioBlock', 'ctaBlock', 'seoBlock',
    ],
    wiredBlocks: ['heroBlock', 'richTextBlock', 'portfolioBlock', 'ctaBlock', 'seoBlock'],
    query: 'WORK_QUERY_WITH_BLOCKS',
    resolver: 'workPageResolver.js',
    adapter: 'work.adapter.js',
    page: 'Trabajos.jsx',
  },
}

const SERVICE_SPEC = {
  label: 'Servicios (×12)',
  cmsGate: (f) => f.VITE_USE_SANITY && f.VITE_USE_PAGE_RESOLVER && f.VITE_USE_SERVICES_V2,
  allowedBlocks: [
    'heroBlock', 'servicesBlock', 'whyUsBlock', 'portfolioBlock', 'ctaBlock', 'faqBlock',
    'featuresBlock', 'richTextBlock', 'showcaseCarouselBlock', 'mapBlock', 'seoBlock',
  ],
  wiredBlocks: [
    'heroBlock', 'richTextBlock', 'featuresBlock', 'portfolioBlock', 'galleryBlock',
    'showcaseCarouselBlock', 'ctaBlock', 'seoBlock',
  ],
  query: 'serviceSubPageQuery',
  resolver: 'servicesPageResolver.js',
  adapter: 'services.adapter.js',
}

const BLOCK_REGISTRY = [
  'heroBlock', 'servicesBlock', 'whyUsBlock', 'whyUtilcarBlock', 'portfolioBlock', 'galleryBlock',
  'ctaBlock', 'faqBlock', 'featuresBlock', 'mapBlock', 'seoBlock', 'richTextBlock',
  'featureGridBlock', 'showcaseCarouselBlock', 'brandCarouselBlock',
]

const CONTRACTS = {
  heroBlock: 'heroResolver / contracts',
  servicesBlock: 'servicesContract',
  whyUsBlock: 'whyUsResolver',
  portfolioBlock: 'portfolioResolver',
  galleryBlock: 'portfolioResolver',
  ctaBlock: 'ctaResolver',
  faqBlock: 'faqBlockContract',
  featuresBlock: 'featuresBlockContract',
  mapBlock: 'mapBlockContract',
  seoBlock: 'seoBlockContract',
  richTextBlock: 'richTextBlockContract',
  featureGridBlock: 'featureGridBlockContract',
  showcaseCarouselBlock: 'showcaseCarouselBlockContract',
  brandCarouselBlock: 'brandCarouselBlockContract',
  specialtiesBlock: 'specialtiesResolver (solo homeResolver)',
}

function blockStatus(pageSpec, blockType, flags) {
  const inStudio = pageSpec.allowedBlocks?.includes(blockType)
  const wired = pageSpec.wiredBlocks?.includes(blockType)
  const cmsActive = pageSpec.cmsGate(flags)
  const inRegistry = BLOCK_REGISTRY.includes(blockType) || blockType === 'specialtiesBlock'

  if (!inStudio) return 'N/A'
  if (!cmsActive) return 'FLAG_OFF → legacy'
  if (pageSpec.orphanInStudio?.includes(blockType)) return 'STUDIO sí · UI NO'
  if (!wired) return 'NO RENDERIZADO'
  if (!inRegistry && blockType !== 'specialtiesBlock') return 'SIN RESOLVER'
  return 'OK'
}

async function fetchDoc(client, docId) {
  return client.fetch(
    `*[_id == $id][0]{ _id, _rev, blocks[]{ _type, _key, enabled } }`,
    { id: docId },
  )
}

async function fetchDraftExists(client, docId) {
  const draft = await client.fetch(`*[_id == $id][0]{ _id }`, { id: `drafts.${docId}` })
  return Boolean(draft)
}

function coveragePct(pageSpec, flags) {
  const cmsActive = pageSpec.cmsGate(flags)
  if (!cmsActive) return 0
  const total = pageSpec.allowedBlocks.length
  const wired = pageSpec.wiredBlocks.filter((b) => pageSpec.allowedBlocks.includes(b)).length
  return Math.round((wired / total) * 100)
}

const flags = loadEnvFlags()
let errors = 0
let warnings = 0

console.info('\n══════════════════════════════════════')
console.info('  Auditoría integridad CMS-first')
console.info('══════════════════════════════════════\n')

console.info('── FASE 6 — Flags runtime (.env.local) ──\n')
for (const [key, val] of Object.entries(flags)) {
  console.info(`  ${val ? '✓' : '✗'} ${key}`)
}
console.info('')

const client = createAuditClient()

console.info('── FASE 1 — Documentos Sanity ──\n')

for (const [key, spec] of Object.entries(PAGE_SPECS)) {
  const doc = await fetchDoc(client, spec.docId)
  const hasDraft = await fetchDraftExists(client, spec.docId)
  const blocks = (doc?.blocks ?? []).map((b) => b._type)
  const cmsActive = spec.cmsGate(flags)
  const cov = coveragePct(spec, flags)

  if (!doc) {
    errors += 1
    console.info(`✗ ${spec.label}: documento ausente`)
    continue
  }

  console.info(`${spec.label} (${spec.docId})`)
  console.info(`  Documento:     ✓ publicado`)
  if (hasDraft) {
    warnings += 1
    console.info(`  Draft:           ⚠ existe drafts.${spec.docId} (web lee solo publicado)`)
  }
  console.info(`  blocks[]:        ${blocks.length} bloque(s)`)
  console.info(`  CMS runtime:     ${cmsActive ? '✓ ACTIVO' : '✗ LEGACY (flag off)'}`)
  console.info(`  Cobertura UI:    ${cov}%`)
  console.info(`  Bloques CMS:     ${blocks.join(', ') || '(vacío)'}`)
  console.info('')
}

const servicePublished = await client.fetch(
  `*[_type == "serviceSubPage"]{ pageKey, "blockCount": count(blocks) }`,
)
const serviceDocsOk = servicePublished.filter((d) => d.blockCount > 0).length
const serviceCov = SERVICE_SPEC.cmsGate(flags) ? coveragePct(SERVICE_SPEC, flags) : 0
console.info(`Servicios (12 sub-páginas)`)
console.info(`  Con blocks[]:    ${serviceDocsOk}/12`)
console.info(`  CMS runtime:     ${SERVICE_SPEC.cmsGate(flags) ? '✓ ACTIVO' : '✗ LEGACY'}`)
console.info(`  Cobertura UI:    ${serviceCov}%`)
console.info('')

console.info('── FASE 1 — Trazabilidad por bloque (páginas editoriales) ──\n')
console.info('Página | Bloque | Query | Contract | Resolver | Render | Estado')
console.info('-------|--------|-------|----------|----------|--------|-------')

for (const [, spec] of Object.entries(PAGE_SPECS)) {
  for (const block of spec.allowedBlocks) {
    const status = blockStatus(spec, block, flags)
    if (status.includes('NO') || status.includes('FLAG') || status.includes('STUDIO')) warnings += 1
    const registry = BLOCK_REGISTRY.includes(block) || block === 'specialtiesBlock' ? '✓' : '✗'
    const render = spec.wiredBlocks.includes(block) ? '✓' : '✗'
    console.info(
      `${spec.label} | ${block} | ${spec.query} | ${CONTRACTS[block] ?? '—'} | ${registry} | ${render} | ${status}`,
    )
  }
}

console.info('\n── FASE 4 — About Page (causa raíz) ──\n')
const aboutActive = PAGE_SPECS.aboutPage.cmsGate(flags)
if (!aboutActive) {
  errors += 1
  console.info('✗ CAUSA RAÍZ: VITE_USE_ABOUT_V2=false en .env.local')
  console.info('  → fetchAboutPage() usa ABOUT_QUERY (sin blocks[])')
  console.info('  → aboutPageResolver retorna legacy-fallback')
  console.info('  → mapAboutPageRuntime() usa src/content/about.js')
  console.info('  → richTextBlock.title/content en Studio NO llegan a SobreNosotros.jsx')
} else {
  const aboutDoc = await fetchDoc(client, 'aboutPage')
  const rt = (aboutDoc?.blocks ?? []).find((b) => b._type === 'richTextBlock')
  if (!rt) {
    warnings += 1
    console.info('⚠ richTextBlock ausente en documento publicado')
  } else if (rt.enabled === false) {
    warnings += 1
    console.info('⚠ richTextBlock deshabilitado (enabled: false)')
  } else {
    console.info('✓ Cadena CMS About activa y richTextBlock presente')
  }
}

console.info('\n── FASE 7 — Cobertura CMS por página ──\n')
const coverageRows = [
  ['Home', coveragePct(PAGE_SPECS.homePage, flags)],
  ['Sobre Nosotros', coveragePct(PAGE_SPECS.aboutPage, flags)],
  ['Contacto', coveragePct(PAGE_SPECS.contactPage, flags)],
  ['Trabajos', coveragePct(PAGE_SPECS.workPage, flags)],
  ['Servicios (×12)', serviceCov],
]
for (const [name, pct] of coverageRows) {
  const bar = pct >= 80 ? '✓' : pct > 0 ? '⚠' : '✗'
  console.info(`${bar} ${name.padEnd(18)} ${String(pct).padStart(3)}%`)
}

console.info('\n── Resumen ──')
console.info(`Errores: ${errors}`)
console.info(`Advertencias: ${warnings}`)

if (errors > 0) process.exit(1)
