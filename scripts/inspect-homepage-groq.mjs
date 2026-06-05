/**
 * Inspección GROQ — homePage publicado vs borrador (solo diagnóstico).
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const BLOCKS_PROJECTION = `{
  _id,
  _rev,
  _updatedAt,
  "blocks": blocks[]{
    _type,
    _key,
    title,
    sectionTitle,
    sectionEyebrow,
    "itemsCount": count(items),
    "categoriesCount": count(categories),
    "projectsCount": count(featuredProjects),
    items[]{ _key, title, "hasImage": defined(image.asset) },
    categories[]{ _key, title, "hasImage": defined(heroImage.asset) },
    featuredProjects[]{ _key, projectId }
  },
  hero,
  services,
  especialidades,
  highlights,
  portfolioPreview,
  ctaBanner,
  specialtiesNew,
  especialidadesList,
  "specialtiesNewCount": count(specialtiesNew),
  "especialidadesListCount": count(especialidadesList),
  "especialidadesItemsCount": count(especialidades.items)
}`

async function inspect(id, label) {
  const full = await client.fetch(`*[_id == $id][0]`, { id })
  const summary = await client.fetch(`*[_id == $id][0]${BLOCKS_PROJECTION}`, { id })
  return { label, id, full, summary }
}

console.info(`\nDataset: ${e.projectId} / ${e.dataset}\n`)

const typeQuery = await client.fetch(`*[_type == "homePage"]{ _id, _rev, _updatedAt }`)
console.info('Documentos _type == "homePage":')
console.log(JSON.stringify(typeQuery, null, 2))

const published = await inspect('homePage', 'PUBLICADO')
const draft = await inspect('drafts.homePage', 'BORRADOR (drafts.homePage)')

for (const { label, id, full, summary } of [published, draft]) {
  console.info(`\n${'═'.repeat(60)}`)
  console.info(`${label} — _id: ${id}`)
  console.info(`${'═'.repeat(60)}`)

  console.info('\n--- JSON completo ---\n')
  console.log(JSON.stringify(full, null, 2))

  console.info('\n--- blocks[] resumen ---\n')
  console.log(JSON.stringify(summary, null, 2))
}
