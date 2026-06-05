/**
 * Migra featuredProjects (legacy) → selectedProjects en portfolioBlock del Home.
 *
 * npm run migrate:home-selected-projects:dry
 * npm run migrate:home-selected-projects -- --apply
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

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

const HOME_ID = 'homePage'
const DRAFT_ID = 'drafts.homePage'

function blockKey() {
  return `sel-${Math.random().toString(36).slice(2, 10)}`
}

function findPortfolioIndex(blocks) {
  return (blocks ?? []).findIndex(
    (b) => b?._type === 'portfolioBlock' || b?._type === 'galleryBlock',
  )
}

/** Resuelve _ref de workProject desde featuredProjectRef o referencia directa. */
async function resolveWorkProjectRef(ref, projectIdToDoc) {
  if (ref?.project?._ref) {
    return { _type: 'reference', _ref: ref.project._ref, _key: blockKey() }
  }

  const legacyId = String(ref?.projectId ?? ref?.project?.id ?? ref?.project?.projectId?.current ?? '').trim()
  if (!legacyId) return null

  const doc = projectIdToDoc.get(legacyId)
  if (!doc?._id) return null

  return { _type: 'reference', _ref: doc._id, _key: blockKey() }
}

async function buildProjectIdMap() {
  const rows = await client.fetch(
    `*[_type == "workProject"]{ _id, "id": coalesce(projectId.current, projectId) }`,
  )
  const map = new Map()
  for (const row of rows) {
    const id = String(row?.id ?? '').trim()
    if (id) map.set(id, row)
  }
  return map
}

async function migratePortfolioBlock(block, projectIdToDoc) {
  const existing = Array.isArray(block?.selectedProjects) ? block.selectedProjects : []
  if (existing.some((r) => r?._ref)) {
    return { block, changed: false, reason: 'selectedProjects ya poblado' }
  }

  const featured = block?.featuredProjects ?? []
  if (!featured.length) {
    return { block, changed: false, reason: 'sin featuredProjects legacy' }
  }

  const selectedProjects = []
  for (const ref of featured) {
    const resolved = await resolveWorkProjectRef(ref, projectIdToDoc)
    if (resolved) selectedProjects.push(resolved)
  }

  if (!selectedProjects.length) {
    return { block, changed: false, reason: 'featuredProjects sin match en workProject' }
  }

  return {
    block: { ...block, selectedProjects },
    changed: true,
    reason: `migrados ${selectedProjects.length} refs`,
  }
}

async function migrateDocument(docId, projectIdToDoc) {
  const doc = await client.fetch(`*[_id == $id][0]{ _id, blocks }`, { id: docId })
  if (!doc?.blocks?.length) return { docId, skipped: true, reason: 'sin blocks' }

  const idx = findPortfolioIndex(doc.blocks)
  if (idx < 0) return { docId, skipped: true, reason: 'sin portfolioBlock' }

  const { block, changed, reason } = await migratePortfolioBlock(doc.blocks[idx], projectIdToDoc)
  if (!changed) return { docId, skipped: true, reason }

  const blocks = [...doc.blocks]
  blocks[idx] = block
  return { docId, changed: true, reason, blocks, selectedCount: block.selectedProjects.length }
}

console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE Home selectedProjects ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

const projectIdToDoc = await buildProjectIdMap()
console.info(`Catálogo workProject: ${projectIdToDoc.size} documentos\n`)

const targets = [HOME_ID, DRAFT_ID]
const results = []

for (const id of targets) {
  const exists = await client.fetch(`*[_id == $id][0]{ _id }`, { id })
  if (!exists) continue
  results.push(await migrateDocument(id, projectIdToDoc))
}

for (const r of results) {
  if (r.skipped) {
    console.info(`  [skip] ${r.docId} — ${r.reason}`)
    continue
  }
  console.info(`  [migrate] ${r.docId} — ${r.reason} (${r.selectedCount} refs)`)
}

const toApply = results.filter((r) => r.changed)

if (!toApply.length) {
  console.info('\n✓ Nada que migrar (selectedProjects ya OK o sin featuredProjects)\n')
  process.exit(0)
}

if (dryRun) {
  console.info('\nEjecutá: npm run migrate:home-selected-projects -- --apply\n')
  process.exit(0)
}

for (const r of toApply) {
  await client.patch(r.docId).set({ blocks: r.blocks }).commit()
  console.info(`  ✓ ${r.docId} actualizado`)
}

const verify = await client.fetch(`*[_id == $id][0]{
  blocks[portfolioBlock._type == "portfolioBlock" || _type == "portfolioBlock"][0]{
    "selected": count(selectedProjects),
    "featured": count(featuredProjects)
  }
}`, { id: HOME_ID })

console.info('\nValidación published:', JSON.stringify(verify, null, 2))
console.info('\n✓ Migración completada — recargá Studio\n')
