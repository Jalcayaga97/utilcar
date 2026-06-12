/**
 * Elimina campos huérfanos en contactPage (schema ya no los define):
 *   - form.fields.fax
 *   - servicios
 *
 * npm run repair:contact-orphan-fields:dry
 * npm run repair:contact-orphan-fields
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

const DOCUMENT_IDS = ['contactPage', 'drafts.contactPage']

const AUDIT_QUERY = `*[_id == $id][0]{
  _id,
  _rev,
  "hasFax": defined(form.fields.fax),
  "faxLabel": form.fields.fax.label,
  "hasServicios": defined(servicios),
  "serviciosCount": count(servicios)
}`

const UNSET_PATHS = ['form.fields.fax', 'servicios']

console.info('\n══════════════════════════════════════')
console.info(`  REPAIR contactPage orphan fields ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info(`  ${e.projectId} / ${e.dataset}`)
console.info('══════════════════════════════════════\n')

console.info('── BEFORE ──')
const before = {}
for (const id of DOCUMENT_IDS) {
  before[id] = await client.fetch(AUDIT_QUERY, { id })
  const doc = before[id]
  if (!doc) {
    console.info(`${id}: no existe`)
    continue
  }
  console.info(
    `${id}: fax=${doc.hasFax ? `sí (${doc.faxLabel ?? 'sin label'})` : 'no'} | servicios=${doc.hasServicios ? `sí (${doc.serviciosCount})` : 'no'}`,
  )
}

const toPatch = DOCUMENT_IDS.filter((id) => {
  const doc = before[id]
  return doc && (doc.hasFax || doc.hasServicios)
})

if (!toPatch.length) {
  console.info('\n✓ Sin campos huérfanos fax/servicios — nada que limpiar\n')
  process.exit(0)
}

console.info(`\nDocumentos a parchear: ${toPatch.join(', ')}`)
console.info(`Unset: ${UNSET_PATHS.join(', ')}`)

if (dryRun) {
  console.info('\n(dry-run — sin cambios en Sanity)\n')
  process.exit(0)
}

for (const id of toPatch) {
  await client.patch(id).unset(UNSET_PATHS).commit()
  console.info(`✓ patched ${id}`)
}

console.info('\n── AFTER ──')
for (const id of DOCUMENT_IDS) {
  const doc = await client.fetch(AUDIT_QUERY, { id })
  if (!doc) continue
  console.info(
    `${id}: fax=${doc.hasFax ? 'sí' : 'no'} | servicios=${doc.hasServicios ? 'sí' : 'no'}`,
  )
}

console.info('\n✓ Limpieza completada\n')
