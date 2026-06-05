/**
 * Compara published vs draft workPage (requiere token).
 * node scripts/audit-workpage-draft.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const e = loadSanityEnv({ requireToken: true })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const docs = await client.fetch(`*[_id in ["workPage", "drafts.workPage"]]{
  _id,
  _type,
  _updatedAt,
  "blockCount": count(blocks),
  blocks[]{ _type, _key }
} | order(_id asc)`)

console.log(JSON.stringify(docs, null, 2))

for (const doc of docs) {
  console.log(`\n${doc._id}: ${doc.blockCount ?? 0} bloques`)
}
