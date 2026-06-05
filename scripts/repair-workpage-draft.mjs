/**
 * Repara drafts.workPage cuando quedó con blocks[] vacío/null
 * pero workPage (published) tiene bloques.
 *
 * npm run repair:workpage-draft -- --dry
 * npm run repair:workpage-draft -- --apply
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

const PUBLISHED_ID = 'workPage'
const DRAFT_ID = 'drafts.workPage'

const [published, draft] = await Promise.all([
  client.fetch(`*[_id == $id][0]`, { id: PUBLISHED_ID }),
  client.fetch(`*[_id == $id][0]`, { id: DRAFT_ID }),
])

console.info('\n══════════════════════════════════════')
console.info(`  REPAIR workPage draft ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

if (!published) {
  console.error('✗ workPage (published) no encontrado')
  process.exit(1)
}

const pubCount = published.blocks?.length ?? 0
const draftCount = draft?.blocks?.length ?? 0

console.info('Published workPage:')
console.info(`  blocks: ${pubCount}`)
console.info(`  types: ${(published.blocks ?? []).map((b) => b._type).join(', ') || '—'}`)

console.info('\nDraft drafts.workPage:')
if (!draft) {
  console.info('  (no existe — Studio usará published directamente)')
} else {
  console.info(`  blocks: ${draft.blocks == null ? 'null' : draftCount}`)
  console.info(`  types: ${(draft.blocks ?? []).map((b) => b._type).join(', ') || '—'}`)
}

const draftBroken = draft && (!Array.isArray(draft.blocks) || draft.blocks.length === 0)
const publishedHasBlocks = pubCount > 0

if (!draftBroken) {
  console.info('\n✓ Draft OK o no existe — no requiere reparación\n')
  process.exit(0)
}

if (!publishedHasBlocks) {
  console.error('\n✗ Published también sin bloques — ejecutá sync-work-page-content primero\n')
  process.exit(1)
}

console.info('\n── Acción: copiar blocks[] (+ page/ui) de published → draft ──\n')

if (dryRun) {
  console.info(`Se copiarían ${pubCount} bloques al draft.`)
  console.info('Ejecutá: npm run repair:workpage-draft -- --apply\n')
  process.exit(0)
}

const { _id, _rev, _createdAt, _updatedAt, ...publishedContent } = published
const merged = {
  ...publishedContent,
  _id: DRAFT_ID,
  _type: 'workPage',
}

if (draft) {
  await client.createOrReplace(merged)
  console.info(`✓ drafts.workPage reemplazado con ${pubCount} bloques desde published\n`)
} else {
  await client.createOrReplace(merged)
  console.info(`✓ drafts.workPage creado con ${pubCount} bloques desde published\n`)
}

const after = await client.fetch(`*[_id == $id][0]{ _id, "blockCount": count(blocks), blocks[]{ _type, _key } }`, {
  id: DRAFT_ID,
})

console.info('Validación draft:', JSON.stringify(after, null, 2))

if ((after?.blockCount ?? 0) === pubCount) {
  console.info('\n✓ Draft reparado — recargá Studio\n')
} else {
  console.error('\n✗ Validación fallida\n')
  process.exit(1)
}
