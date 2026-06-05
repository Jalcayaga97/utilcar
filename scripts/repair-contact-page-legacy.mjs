/**
 * Elimina campos legacy huérfanos (hero, faqItems) de contactPage
 * cuando blocks[] ya tiene heroBlock y faqBlock.
 *
 * Si blocks[] está vacío pero hay legacy, usá primero:
 *   npm run repair:contact-page-legacy -- --apply --bootstrap-blocks
 *
 * npm run repair:contact-page-legacy:dry
 * npm run repair:contact-page-legacy -- --apply
 * npm run repair:contact-page-legacy -- --apply --bootstrap-blocks
 */
import { createClient } from '@sanity/client'
import { contactContent } from '../src/content/contact.js'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const CONTACT_SEO = {
  path: '/contacto',
  title: 'Contacto y cotización',
  description:
    'Cotice su conversión o equipamiento con Utilcar en Quinta Normal, Santiago. Teléfono, WhatsApp, formulario y mapa de ubicación.',
  keywords:
    'cotizar conversión automotriz Santiago, Utilcar contacto, taller conversión Chile',
}

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')
const bootstrapBlocks = process.argv.includes('--bootstrap-blocks')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
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

const PUBLISHED_ID = 'contactPage'
const DOCUMENT_IDS = [PUBLISHED_ID, 'drafts.contactPage']

const AUDIT_QUERY = `*[_id == $id][0]{
  _id,
  _rev,
  "hasHeroLegacy": defined(hero),
  "heroTitle": hero.title,
  "faqItemsCount": count(faqItems),
  "faqItemsSample": faqItems[0..2]{ id, question },
  "blockCount": count(blocks),
  "blockTypes": blocks[]{ _type, _key },
  "hasHeroBlock": count(blocks[_type == "heroBlock"]) > 0,
  "hasFaqBlock": count(blocks[_type == "faqBlock"]) > 0,
  "hasRichTextBlock": count(blocks[_type == "richTextBlock"]) > 0,
  "hasCtaBlock": count(blocks[_type == "ctaBlock"]) > 0,
  "hasSeoBlock": count(blocks[_type == "seoBlock"]) > 0
}`

const FULL_DOC_QUERY = `*[_id == $id][0]{
  _id,
  _rev,
  hero,
  intro,
  faq,
  faqItems,
  cta,
  blocks
}`

const AFTER_QUERY = `*[_id == "contactPage"][0]{
  _id,
  "hasHeroLegacy": defined(hero),
  "faqItemsCount": count(faqItems),
  "blockCount": count(blocks),
  blocks[]{ _type, _key }
}`

function blockKey(prefix = 'blk') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function plainTextBody(text) {
  const t = String(text ?? '').trim()
  if (!t) return []
  return [
    {
      _type: 'block',
      _key: blockKey('pt'),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: blockKey('sp'), text: t, marks: [] }],
    },
  ]
}

function buildBlocksFromLegacy(doc) {
  const hero = doc?.hero ?? contactContent.hero
  const intro = doc?.intro ?? contactContent.intro
  const faqMeta = doc?.faq ?? contactContent.faq
  const faqItems =
    (doc?.faqItems?.length ? doc.faqItems : contactContent.faqItems) ?? []
  const cta = doc?.cta ?? contactContent.cta
  const seo = CONTACT_SEO

  let order = 0

  return [
    {
      _type: 'heroBlock',
      _key: blockKey('hero'),
      enabled: true,
      order: order++,
      eyebrow: hero.eyebrow ?? '',
      title: hero.title ?? '',
      subtitle: hero.subtitle ?? '',
      imageAlt: hero.imageAlt ?? '',
    },
    {
      _type: 'richTextBlock',
      _key: blockKey('intro'),
      enabled: true,
      order: order++,
      eyebrow: '',
      title: '',
      body: plainTextBody(intro.formHint ?? contactContent.intro.formHint),
    },
    {
      _type: 'faqBlock',
      _key: blockKey('faq'),
      enabled: true,
      order: order++,
      eyebrow: faqMeta.eyebrow ?? '',
      title: faqMeta.title ?? '',
      description: faqMeta.description ?? '',
      items: faqItems.map((item, index) => ({
        _key: blockKey(`faq-${index}`),
        id: item.id ?? `faq-${index + 1}`,
        question: item.question ?? '',
        answer: item.answer ?? '',
      })),
    },
    {
      _type: 'ctaBlock',
      _key: blockKey('cta'),
      enabled: true,
      order: order++,
      title: cta.title ?? '',
      description: cta.description ?? '',
      primaryLabel: cta.primaryLabel ?? '',
      primaryTo: cta.primaryTo ?? '#formulario',
    },
    {
      _type: 'seoBlock',
      _key: blockKey('seo'),
      enabled: true,
      order: order++,
      title: seo.title ?? '',
      description: seo.description ?? '',
      keywords: seo.keywords ?? '',
      canonicalPath: seo.path ?? '/contacto',
      noindex: false,
    },
  ]
}

function analyze(doc) {
  if (!doc) {
    return {
      exists: false,
      hasHeroLegacy: false,
      hasFaqItemsLegacy: false,
      hasHeroBlock: false,
      hasFaqBlock: false,
      canUnset: false,
      blockTypes: [],
      blockCount: 0,
    }
  }

  const hasHeroLegacy = Boolean(doc.hasHeroLegacy)
  const hasFaqItemsLegacy = (doc.faqItemsCount ?? 0) > 0
  const hasHeroBlock = Boolean(doc.hasHeroBlock)
  const hasFaqBlock = Boolean(doc.hasFaqBlock)
  const hasLegacy = hasHeroLegacy || hasFaqItemsLegacy
  const blocksReady = hasHeroBlock && hasFaqBlock
  const canUnset = hasLegacy && blocksReady

  return {
    exists: true,
    hasHeroLegacy,
    hasFaqItemsLegacy,
    hasHeroBlock,
    hasFaqBlock,
    hasRichTextBlock: Boolean(doc.hasRichTextBlock),
    hasCtaBlock: Boolean(doc.hasCtaBlock),
    hasSeoBlock: Boolean(doc.hasSeoBlock),
    blockCount: doc.blockCount ?? 0,
    blockTypes: (doc.blockTypes ?? []).map((b) => b._type),
    heroTitle: doc.heroTitle ?? null,
    faqItemsCount: doc.faqItemsCount ?? 0,
    canUnset,
    blocksReady,
    hasLegacy,
    needsBootstrap: (doc.blockCount ?? 0) === 0 && hasLegacy,
  }
}

function printReport(label, report) {
  console.info(`\n── ${label} ──`)
  if (!report.exists) {
    console.info('  documento: no existe')
    return
  }
  console.info(`  hero legacy encontrado: ${report.hasHeroLegacy ? 'sí' : 'no'}${report.heroTitle ? ` ("${report.heroTitle}")` : ''}`)
  console.info(`  faqItems legacy encontrado: ${report.hasFaqItemsLegacy ? 'sí' : 'no'} (${report.faqItemsCount} ítems)`)
  console.info(`  blocks[]: ${report.blockCount} → [${report.blockTypes.join(', ') || '—'}]`)
  console.info(`  heroBlock presente: ${report.hasHeroBlock ? 'sí' : 'no'}`)
  console.info(`  faqBlock presente: ${report.hasFaqBlock ? 'sí' : 'no'}`)
  console.info(`  richTextBlock: ${report.hasRichTextBlock ? 'sí' : 'no'}`)
  console.info(`  ctaBlock: ${report.hasCtaBlock ? 'sí' : 'no'}`)
  console.info(`  seoBlock: ${report.hasSeoBlock ? 'sí' : 'no'}`)
  if (report.needsBootstrap) {
    console.info('  bootstrap blocks: requerido (blocks[] vacío con legacy presente)')
  }
  if (report.hasLegacy) {
    console.info(
      `  cambios a aplicar: ${report.canUnset ? "unset(['hero','faqItems'])" : 'NINGUNO (bloques faltantes)'}`,
    )
  } else {
    console.info('  cambios a aplicar: ninguno (sin legacy)')
  }
}

console.info('\n══════════════════════════════════════')
console.info(`  REPAIR contactPage legacy ${dryRun ? '(dry-run)' : '(apply)'}`)
if (bootstrapBlocks) console.info('  modo: --bootstrap-blocks')
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════')

console.info('\n── BEFORE (GROQ audit) ──')

const before = {}
for (const id of DOCUMENT_IDS) {
  before[id] = await client.fetch(AUDIT_QUERY, { id })
}

const reports = {}
for (const id of DOCUMENT_IDS) {
  reports[id] = analyze(before[id])
  printReport(id, reports[id])
}

const published = reports[PUBLISHED_ID]

if (!published.exists) {
  console.error('\n✗ contactPage (published) no encontrado\n')
  process.exit(1)
}

if (!published.hasLegacy) {
  console.info('\n✓ Sin campos legacy hero/faqItems — Studio no debería mostrar Unknown fields\n')
  process.exit(0)
}

if (published.needsBootstrap && !bootstrapBlocks) {
  console.error('\n⚠ blocks[] vacío — ejecutá con --bootstrap-blocks antes del unset:\n')
  console.error('  npm run repair:contact-page-legacy:dry -- --bootstrap-blocks')
  console.error('  npm run repair:contact-page-legacy -- --apply --bootstrap-blocks\n')
  process.exit(1)
}

function collectBlockers(report, label) {
  const list = []
  if (!report.hasLegacy) return list
  if (!report.blocksReady) {
    if (report.hasHeroLegacy && !report.hasHeroBlock) {
      list.push(`${label}: falta heroBlock`)
    }
    if (report.hasFaqItemsLegacy && !report.hasFaqBlock) {
      list.push(`${label}: falta faqBlock`)
    }
  }
  return list
}

const blockers = [
  ...collectBlockers(published, PUBLISHED_ID),
  ...collectBlockers(reports['drafts.contactPage'], 'drafts.contactPage'),
]

if (blockers.length && !(bootstrapBlocks && published.needsBootstrap)) {
  console.error('\n⚠ SEGURIDAD — no se eliminará nada:\n')
  for (const msg of blockers) console.error(`  • ${msg}`)
  console.error('\n')
  process.exit(1)
}

if (dryRun) {
  if (bootstrapBlocks && published.needsBootstrap) {
    const preview = buildBlocksFromLegacy(
      await client.fetch(FULL_DOC_QUERY, { id: PUBLISHED_ID }),
    )
    console.info('\n── Bootstrap preview (contactPage) ──')
    console.info(`  Crearía ${preview.length} bloques: ${preview.map((b) => b._type).join(', ')}`)
  }
  console.info("\nLuego: unset(['hero','faqItems']) en documentos con bloques listos")
  console.info('\nEjecutá: npm run repair:contact-page-legacy -- --apply --bootstrap-blocks\n')
  process.exit(0)
}

if (bootstrapBlocks && published.needsBootstrap) {
  const fullDoc = await client.fetch(FULL_DOC_QUERY, { id: PUBLISHED_ID })
  const blocks = buildBlocksFromLegacy(fullDoc)
  await client.patch(PUBLISHED_ID).set({ blocks }).commit({ visibility: 'sync' })
  console.info(`\n✓ ${PUBLISHED_ID}: blocks[] creados (${blocks.length}) → ${blocks.map((b) => b._type).join(', ')}`)
  before[PUBLISHED_ID] = await client.fetch(AUDIT_QUERY, { id: PUBLISHED_ID })
  reports[PUBLISHED_ID] = analyze(before[PUBLISHED_ID])
}

const toPatch = DOCUMENT_IDS.filter((id) => reports[id].canUnset)

if (!reports[PUBLISHED_ID].canUnset) {
  console.error('\n✗ Tras bootstrap aún faltan heroBlock/faqBlock — abortando unset\n')
  printReport('contactPage (post-bootstrap)', reports[PUBLISHED_ID])
  process.exit(1)
}

for (const id of toPatch) {
  await client
    .patch(id)
    .unset(['hero', 'faqItems'])
    .commit({ visibility: 'sync' })
  console.info(`\n✓ ${id}: unset hero, faqItems`)
}

const afterPublished = await client.fetch(AFTER_QUERY)

console.info('\n── AFTER (GROQ *[_id == "contactPage"][0]) ──')
console.info(JSON.stringify(afterPublished, null, 2))

const afterTypes = (afterPublished?.blocks ?? []).map((b) => b._type)
const expectedTypes = ['heroBlock', 'richTextBlock', 'faqBlock', 'ctaBlock', 'seoBlock']
const missingExpected = expectedTypes.filter((t) => !afterTypes.includes(t))

const afterOk =
  !afterPublished?.hasHeroLegacy &&
  (afterPublished?.faqItemsCount ?? 0) === 0 &&
  (afterPublished?.blockCount ?? 0) > 0

console.info('\n── Auditoría final ──')
console.info('  Campos eliminados: hero, faqItems')
console.info(`  Bloques conservados (${afterPublished?.blockCount ?? 0}): ${afterTypes.join(', ')}`)
if (missingExpected.length) {
  console.info(`  ⚠ Faltan bloques esperados: ${missingExpected.join(', ')}`)
} else {
  console.info('  ✓ heroBlock, richTextBlock, faqBlock, ctaBlock, seoBlock')
}
console.info(`  hero legacy en doc: ${afterPublished?.hasHeroLegacy ? 'SÍ (error)' : 'no'}`)
console.info(`  faqItems en doc: ${afterPublished?.faqItemsCount ?? 0}`)

if (!afterOk) {
  console.error('\n✗ Validación fallida\n')
  process.exit(1)
}

console.info('\n✓ Reparación completa — recargá Studio (Unknown fields found debe desaparecer)\n')
