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

const doc = await c.fetch(`*[_id == "homePage"][0]{
  blocks[]{ _type, _key, title, sectionTitle, sectionEyebrow,
    "itemCount": count(items),
    "catCount": count(categories),
    "featCount": count(featuredProjects),
    items[]{ _key, title },
    categories[]{ _key, title },
    featuredProjects[]{ _key, projectId }
  },
  services,
  highlights
}`)

console.log(JSON.stringify(doc, null, 2))

const wp = await c.fetch(`*[_id == "workPage"][0]{
  filters[]{ _key, id },
  portfolio[]{ _key, id },
  preview[]{ _key, id }
}`)
console.log('\nworkPage:', JSON.stringify(wp, null, 2))
