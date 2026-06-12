/**
 * Sincroniza servicesPage.serviceLinks con SERVICE_LINKS (orden alfabético, 12 rutas).
 *
 * npm run migrate:service-links:dry
 * npm run migrate:service-links
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SERVICE_LINKS_MANIFEST } from './lib/serviceCatalogManifest.mjs'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const DOC_ID = 'servicesPage'
const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const doc = await client.fetch(`*[_id == $id][0]{ _id, serviceLinks }`, { id: DOC_ID })
if (!doc) {
  console.error(`✗ ${DOC_ID} no encontrado`)
  process.exit(1)
}

const before = doc.serviceLinks?.length ?? 0
console.info('\n══════════════════════════════════════')
console.info(`  MIGRATE service links ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info('══════════════════════════════════════\n')
console.info(`~ ${DOC_ID}: ${before} → ${SERVICE_LINKS_MANIFEST.length} enlaces`)

if (apply) {
  await client
    .patch(DOC_ID)
    .set({ serviceLinks: SERVICE_LINKS_MANIFEST })
    .commit({ visibility: 'sync' })
  console.info('\n✓ serviceLinks actualizados')
} else {
  console.info('\n[dry] Sin escritura en Sanity')
}
