/**
 * Auditoría definitiva workPage — evidencia GROQ + documentos alternativos.
 * node scripts/audit-workpage-groq.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

console.log('Project:', e.projectId, 'Dataset:', e.dataset)
console.log('\n=== Query exacta solicitada ===\n')

const exact = await client.fetch(`*[_type == "workPage"][0]{
  _id,
  _type,
  blocks[]{
    _type,
    _key
  }
}`)
console.log(JSON.stringify(exact, null, 2))

console.log('\n=== Todos los documentos workPage ===\n')
const all = await client.fetch(`*[_type == "workPage"]{ _id, _type, "blockCount": count(blocks) }`)
console.log(JSON.stringify(all, null, 2))

console.log('\n=== IDs que contienen "work" ===\n')
const ids = await client.fetch(
  `*[_id match "*work*" || _type match "*work*"]{ _id, _type, "blockCount": count(blocks) }`,
)
console.log(JSON.stringify(ids, null, 2))

console.log('\n=== drafts.workPage ===\n')
const draft = await client.fetch(`*[_id == "drafts.workPage"][0]{ _id, _type, blocks[]{ _type, _key } }`)
console.log(JSON.stringify(draft, null, 2))

console.log('\n=== Perspectiva: published vs raw ===\n')
const published = await client.withConfig({ perspective: 'published' }).fetch(
  `*[_id == "workPage"][0]{ _id, "blockCount": count(blocks), blocks[]{ _type, _key } }`,
)
const raw = await client.withConfig({ perspective: 'raw' }).fetch(
  `*[_id == "workPage"][0]{ _id, "blockCount": count(blocks), blocks[]{ _type, _key } }`,
)
console.log('published:', JSON.stringify(published, null, 2))
console.log('raw:', JSON.stringify(raw, null, 2))
