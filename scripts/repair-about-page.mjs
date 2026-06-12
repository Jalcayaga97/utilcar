/**
 * Elimina galleryBlock de aboutPage sin tocar los demás bloques editoriales.
 *
 * npm run repair:about-page:dry
 * npm run repair:about-page
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const GALLERY_BLOCK_TYPES = new Set(['galleryBlock', 'portfolioBlock'])

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

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

const PUBLISHED_ID = 'aboutPage'
const DOCUMENT_IDS = [PUBLISHED_ID, `drafts.${PUBLISHED_ID}`]

const AUDIT_QUERY = `*[_id == $id][0]{
  _id,
  _rev,
  "blockCount": count(blocks),
  "blockTypes": blocks[]{ _type, _key },
  "galleryBlockCount": count(blocks[_type in ["galleryBlock", "portfolioBlock"]]),
  "hasHeroBlock": count(blocks[_type == "heroBlock"]) > 0,
  "hasRichTextBlock": count(blocks[_type == "richTextBlock"]) > 0,
  "hasFeatureGridBlock": count(blocks[_type == "featureGridBlock"]) > 0,
  "hasCtaBlock": count(blocks[_type == "ctaBlock"]) > 0,
  "hasSeoBlock": count(blocks[_type == "seoBlock"]) > 0
}`

const FULL_DOC_QUERY = `*[_id == $id][0]{
  _id,
  _rev,
  blocks
}`

function analyze(doc) {
  if (!doc) {
    return { exists: false }
  }

  const blockTypes = (doc.blockTypes ?? []).map((b) => b._type)
  const galleryBlocks = (doc.blockTypes ?? []).filter((b) =>
    GALLERY_BLOCK_TYPES.has(b._type),
  )

  return {
    exists: true,
    blockCount: doc.blockCount ?? 0,
    blockTypes,
    galleryBlockCount: doc.galleryBlockCount ?? galleryBlocks.length,
    galleryBlocks,
    hasHeroBlock: Boolean(doc.hasHeroBlock),
    hasRichTextBlock: Boolean(doc.hasRichTextBlock),
    hasFeatureGridBlock: Boolean(doc.hasFeatureGridBlock),
    hasCtaBlock: Boolean(doc.hasCtaBlock),
    hasSeoBlock: Boolean(doc.hasSeoBlock),
    needsRepair: (doc.galleryBlockCount ?? galleryBlocks.length) > 0,
  }
}

function printReport(label, report) {
  console.info(`\n── ${label} ──`)
  if (!report.exists) {
    console.info('  documento: no existe')
    return
  }
  console.info(`  blocks[]: ${report.blockCount} → [${report.blockTypes.join(', ') || '—'}]`)
  console.info(`  galleryBlock detectado: ${report.galleryBlockCount > 0 ? 'sí' : 'no'}`)
  if (report.galleryBlocks?.length) {
    for (const block of report.galleryBlocks) {
      console.info(`    · ${block._type} (${block._key})`)
    }
  }
  console.info(`  heroBlock: ${report.hasHeroBlock ? 'sí' : 'no'}`)
  console.info(`  richTextBlock: ${report.hasRichTextBlock ? 'sí' : 'no'}`)
  console.info(`  featureGridBlock: ${report.hasFeatureGridBlock ? 'sí' : 'no'}`)
  console.info(`  ctaBlock: ${report.hasCtaBlock ? 'sí' : 'no'}`)
  console.info(`  seoBlock: ${report.hasSeoBlock ? 'sí' : 'no'}`)
  console.info(
    `  cambios a aplicar: ${report.needsRepair ? 'eliminar galleryBlock' : 'ninguno'}`,
  )
}

function stripGalleryBlocks(blocks) {
  const list = Array.isArray(blocks) ? structuredClone(blocks) : []
  const removed = list.filter((b) => GALLERY_BLOCK_TYPES.has(b?._type))
  const kept = list.filter((b) => !GALLERY_BLOCK_TYPES.has(b?._type))
  return { kept, removed }
}

console.info('\n══════════════════════════════════════')
console.info(`  REPAIR aboutPage ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════')

const before = {}
for (const id of DOCUMENT_IDS) {
  before[id] = await client.fetch(AUDIT_QUERY, { id })
  printReport(`BEFORE ${id}`, analyze(before[id]))
}

const publishedReport = analyze(before[PUBLISHED_ID])
if (!publishedReport.exists) {
  console.error('\n✗ aboutPage no encontrado')
  process.exit(1)
}

if (!publishedReport.needsRepair) {
  console.info('\n✓ Sin galleryBlock — no se requieren cambios.')
  process.exit(0)
}

if (dryRun) {
  console.info('\nDry-run — sin cambios en Sanity.')
  process.exit(0)
}

let patched = 0

for (const id of DOCUMENT_IDS) {
  const report = analyze(before[id])
  if (!report.exists || !report.needsRepair) continue

  const doc = await client.fetch(FULL_DOC_QUERY, { id })
  if (!doc) continue

  const { kept, removed } = stripGalleryBlocks(doc.blocks)
  if (!removed.length) continue

  await client
    .patch(id)
    .set({ blocks: kept })
    .commit({ visibility: 'sync' })

  patched += 1
  console.info(`\n✓ ${id}: eliminados ${removed.length} bloque(s) de galería`)
  console.info(`  bloques restantes: ${kept.map((b) => b._type).join(', ')}`)
}

const after = await client.fetch(AUDIT_QUERY, { id: PUBLISHED_ID })
printReport('AFTER aboutPage', analyze(after))

console.info(`\n✓ Migración completada (${patched} documento(s) actualizado(s))`)
