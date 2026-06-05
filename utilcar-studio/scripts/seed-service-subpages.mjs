/**
 * Crea los 6 documentos serviceSubPage (singletons) si no existen.
 * Uso: node scripts/seed-service-subpages.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from '../schemas/content/serviceSubPage.js'

const sanityEnv = loadSanityEnv({ requireToken: true })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

for (const { value, title } of SERVICE_SUB_PAGE_KEYS) {
  const id = serviceSubPageDocumentId(value)
  const existing = await client.getDocument(id)
  if (existing) {
    console.log(`✓ ${title} (${id}) ya existe`)
    continue
  }
  await client.create({
    _id: id,
    _type: 'serviceSubPage',
    pageKey: value,
    title,
    blocks: [],
    tabs: [],
  })
  console.log(`+ Creado ${title} → ${id}`)
}

console.log('Listo. Complete Page Builder en cada página de servicio.')
