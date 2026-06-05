import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()
const c = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const doc = await c.fetch(`*[_id == "workPage"][0]{
  "blockCount": count(blocks),
  blocks[]{ _type, _key, "items": count(items) },
  filters[]{ _key, id },
  portfolio[]{ _key, id, title },
  preview[]{ _key, id, title }
}`)

console.log(JSON.stringify(doc, null, 2))
