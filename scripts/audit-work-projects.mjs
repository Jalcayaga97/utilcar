/**
 * Auditoría workProject — npm run audit:work-projects
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SERVICE_CATEGORY_KEYS } from '../src/lib/cms/constants/serviceCategories.js'
import { WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'

const sanityEnv = loadSanityEnv({ requireToken: false })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token || undefined,
  useCdn: false,
})

const issues = []
const warnings = []

function issue(code, message, extra = {}) {
  issues.push({ code, message, ...extra })
}

function warn(code, message, extra = {}) {
  warnings.push({ code, message, ...extra })
}

const projects = await client.fetch(WORK_PROJECTS_QUERY)
const home = await client.fetch(`*[_id == "homePage"][0]{
  blocks[_type == "portfolioBlock"][0]{
    featuredProjects[]{ projectId, project->{ _id, "id": coalesce(projectId.current, projectId) } }
  }
}`)

const featured = home?.blocks?.featuredProjects ?? []
const ids = new Set(projects.map((p) => p.id))

const byCategory = Object.fromEntries(SERVICE_CATEGORY_KEYS.map((k) => [k, 0]))

console.log('\n=== audit:work-projects ===\n')
console.log(`Proyectos visibles: ${projects.length}\n`)

for (const p of projects) {
  if (!p.id) issue('missing-id', `Sin projectId: ${p.title}`)
  if (!p.title) issue('missing-title', `Sin título: ${p.id}`)
  if (!SERVICE_CATEGORY_KEYS.includes(p.serviceCategory)) {
    issue('invalid-category', `Categoría inválida: ${p.id}`, { category: p.serviceCategory })
  } else {
    byCategory[p.serviceCategory]++
  }
  if (!p.image?.asset?.url && !p.image?.asset?._ref) {
    issue('missing-image', `Sin imagen: ${p.id}`)
  }
}

for (const cat of SERVICE_CATEGORY_KEYS) {
  console.log(`• ${cat}: ${byCategory[cat] ?? 0} proyecto(s)`)
}

for (const ref of featured) {
  const refId = ref?.project?.id ?? ref?.projectId
  if (!refId) {
    issue('home-ref-empty', 'Referencia Home sin proyecto')
    continue
  }
  if (!ids.has(refId) && !ref?.project?._id) {
    if (projects.length) {
      issue('home-ref-orphan', `Home referencia ID sin workProject: ${refId}`)
    } else {
      warn('home-ref-pending', `Home referencia legacy ${refId} — ejecutá npm run migrate:work-projects`)
    }
  }
}

const dupes = new Set()
for (const p of projects) {
  if (dupes.has(p.id)) issue('duplicate-id', `ID duplicado: ${p.id}`)
  dupes.add(p.id)
}

if (warnings.length) {
  console.log('\n--- Advertencias ---')
  for (const w of warnings) console.log(`⚠ [${w.code}] ${w.message}`)
}

if (issues.length) {
  console.log('\n--- Errores ---')
  for (const i of issues) console.log(`✗ [${i.code}] ${i.message}`)
  console.log(`\nFAIL (${issues.length} errores)\n`)
  process.exit(1)
}

if (!projects.length) {
  console.log('\nTip: sin workProject en dataset — npm run migrate:work-projects\n')
}

console.log(`\nOK — ${projects.length} proyectos, ${featured.length} refs Home\n`)
