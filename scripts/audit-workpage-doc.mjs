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

const doc = await client.fetch(`*[_id == "workPage"][0]{
  _id,
  _type,
  _rev,
  "blockCount": count(blocks),
  blocks[]{
    _type,
    _key,
    enabled,
    title,
    eyebrow,
    subtitle,
    description,
    imageAlt,
    primaryLabel,
    primaryTo,
    image{ asset->{ _id, url } }
  },
  page{
    hero{ title, eyebrow },
    intro{ title, eyebrow },
    projects{ title, eyebrow },
    cta{ title }
  }
}`)

console.log(JSON.stringify(doc, null, 2))

const draft = await client.fetch(`*[_id == "drafts.workPage"][0]{
  _id,
  "blockCount": count(blocks),
  "types": blocks[]._type
}`)

console.log('\n--- draft ---')
console.log(JSON.stringify(draft, null, 2))

const svc = await client.fetch(`*[_id == "serviceSubPage-talleres-moviles"][0]{
  _id,
  "blockCount": count(blocks),
  "types": blocks[]._type
}`)

console.log('\n--- service ref ---')
console.log(JSON.stringify(svc, null, 2))
