/**
 * Asegura siteSettings.contactEmail para pruebas de contacto.
 * npm run patch:contact-email
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const TARGET_EMAIL = 'julioignaciorodriguez97@gmail.com'
const DOCUMENT_ID = 'siteSettings'

const sanityEnv = loadSanityEnv({ requireToken: true })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const existing = await client.fetch(
  `*[_id == $id][0]{ contactEmail }`,
  { id: DOCUMENT_ID },
)

if (existing?.contactEmail === TARGET_EMAIL) {
  console.info(`✓ siteSettings.contactEmail ya es ${TARGET_EMAIL}`)
  process.exit(0)
}

await client.patch(DOCUMENT_ID).set({ contactEmail: TARGET_EMAIL }).commit()
console.info(`+ siteSettings.contactEmail → ${TARGET_EMAIL}`)
