/**
 * Reporte validación Servicios V3.1
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'
import { SERVICE_CATEGORY_KEYS, labelForServiceCategory } from '../src/lib/cms/constants/serviceCategories.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from '../utilcar-studio/schemas/content/serviceSubPage.js'

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()
const c = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token || undefined,
  useCdn: false,
})

const projects = await c.fetch(WORK_PROJECTS_QUERY)
const home = await c.fetch(`*[_id == "homePage"][0]{
  blocks[_type == "portfolioBlock"][0]{
    featuredProjects[]{
      projectId,
      project->{ _id, "id": coalesce(projectId.current, projectId), title }
    }
  }
}`)

const featured = home?.blocks?.featuredProjects ?? []

console.log('\n=== TRABAJOS TABS ===\n')
for (const key of SERVICE_CATEGORY_KEYS) {
  const n = projects.filter((p) => p.serviceCategory === key).length
  const tab = n > 0 ? 'VISIBLE' : 'OCULTO'
  console.log(`${labelForServiceCategory(key)} → ${n} (${tab})`)
}

console.log('\n=== SERVICIOS ===\n')
for (const { value: pk, title } of SERVICE_SUB_PAGE_KEYS) {
  const doc = await c.fetch(
    `*[_id == $id][0]{
      "hero": blocks[_type == "heroBlock"][0]{ highlights, image{ asset->{ url } } },
      "portfolio": blocks[_type == "portfolioBlock"][0]{ items }
    }`,
    { id: serviceSubPageDocumentId(pk) },
  )
  const wc = projects.filter((p) => p.serviceCategory === pk).length
  const emb = doc?.portfolio?.items?.length ?? 0
  const src = wc > 0 ? 'workProject' : emb > 0 ? 'embedded-legacy' : 'ninguno'
  console.log(`${title} → ${src} → ${wc || emb}`)
}

console.log('\n=== HERO ===\n')
for (const { value: pk, title } of SERVICE_SUB_PAGE_KEYS) {
  const doc = await c.fetch(
    `*[_id == $id][0]{ "hero": blocks[_type == "heroBlock"][0]{ highlights, image{ asset->{ url } } } }`,
    { id: serviceSubPageDocumentId(pk) },
  )
  const h = doc?.hero
  console.log(
    `${title} | img: ${h?.image?.asset?.url ? 'OK' : 'NO'} | highlights: ${h?.highlights?.length ?? 0}`,
  )
}

console.log('\n=== HOME FEATURED ===\n')
for (const ref of featured) {
  console.log(
    `• projectId legacy: ${ref.projectId ?? '—'} → workProject: ${ref.project?.id ?? ref.project?._id ?? 'MISSING'}`,
  )
}
