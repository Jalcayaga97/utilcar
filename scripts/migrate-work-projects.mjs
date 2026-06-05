/**
 * Migra proyectos embebidos → documentos workProject.
 * npm run migrate:work-projects
 * npm run migrate:work-projects -- --dry
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { SERVICE_CATEGORY_KEYS } from '../src/lib/cms/constants/serviceCategories.js'
import {
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from '../utilcar-studio/schemas/content/serviceSubPage.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'

const dryRun = process.argv.includes('--dry')

const sanityEnv = loadSanityEnv({ requireToken: true })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const CATEGORY_BY_LABEL = {
  'talleres móviles': 'talleres-moviles',
  'talleres moviles': 'talleres-moviles',
  'ventanas y lunetas': 'ventanas-lunetas',
  'equipamiento escolar': 'equipamiento-escolar',
  banquetas: 'banquetas',
  butacas: 'butacas',
  accesorios: 'accesorios',
}

function slugifyId(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function inferCategory(item, pageKey) {
  if (pageKey && SERVICE_CATEGORY_KEYS.includes(pageKey)) return pageKey
  const catId = item?.categoryId ?? item?.category
  if (SERVICE_CATEGORY_KEYS.includes(catId)) return catId
  const label = String(item?.subtitle ?? item?.category ?? '')
    .trim()
    .toLowerCase()
  return CATEGORY_BY_LABEL[label] ?? null
}

function collectCandidates() {
  const byId = new Map()

  const add = (raw, context = {}) => {
    const id = slugifyId(raw?.id ?? raw?._key ?? raw?.title)
    if (!id) return
    const serviceCategory =
      (context.pageKey && SERVICE_CATEGORY_KEYS.includes(context.pageKey)
        ? context.pageKey
        : null) ?? inferCategory(raw, context.pageKey)
    if (!serviceCategory) return

    const existing = byId.get(id) ?? { id, sources: [] }
    existing.sources.push(context.source)
    existing.title = raw.title ?? existing.title
    existing.description = raw.description ?? existing.description
    existing.client = raw.client ?? existing.client
    existing.vehicle = raw.vehicle ?? existing.vehicle
    existing.serviceCategory = serviceCategory
    existing.image = raw.image ?? existing.image
    existing.featured = Boolean(raw.featured ?? existing.featured)
    byId.set(id, existing)
  }

  return { byId, add }
}

const workPage = await client.fetch(`*[_id == "workPage"][0]{ portfolio, preview }`)
const { byId, add } = collectCandidates()

for (const item of [...(workPage?.portfolio ?? []), ...(workPage?.preview ?? [])]) {
  add(item, { source: 'workPage' })
}

for (const { value: pageKey } of SERVICE_SUB_PAGE_KEYS) {
  const doc = await client.fetch(
    `*[_id == $id][0]{ blocks[_type == "portfolioBlock"][0]{ items } }`,
    { id: serviceSubPageDocumentId(pageKey) },
  )
  for (const item of doc?.blocks?.items ?? []) {
    add(
      {
        id: item._key,
        title: item.title,
        description: item.description,
        client: item.client,
        vehicle: item.vehicle,
        subtitle: item.subtitle,
        image: item.image,
        featured: item.featured,
      },
      { source: `serviceSubPage:${pageKey}`, pageKey },
    )
  }
}

const existing = await client.fetch(
  `*[_type == "workProject"]{ _id, "id": coalesce(projectId.current, projectId) }`,
)
const existingIds = new Set(existing.map((d) => d.id))

console.log(`\n=== migrate:work-projects ${dryRun ? '(dry)' : ''} ===\n`)
console.log(`Candidatos únicos: ${byId.size}`)
console.log(`workProject existentes: ${existing.length}\n`)

let created = 0
let skipped = 0

for (const [id, data] of byId) {
  if (existingIds.has(id)) {
    skipped++
    continue
  }

  const doc = {
    _id: `workProject-${id}`,
    _type: 'workProject',
    schemaVersion: SCHEMA_VERSION_VALUE,
    projectId: { _type: 'slug', current: id },
    title: data.title || id,
    serviceCategory: data.serviceCategory,
    description: data.description || '',
    client: data.client || '',
    vehicle: data.vehicle || '',
    visible: true,
    featured: data.featured ?? false,
    order: created,
    ...(data.image?.asset?._ref
      ? { image: { _type: 'image', asset: { _type: 'reference', _ref: data.image.asset._ref } } }
      : {}),
  }

  console.log(`+ ${id} (${data.serviceCategory}) ← ${data.sources.join(', ')}`)
  if (!dryRun) {
    await client.createOrReplace(doc)
  }
  created++
}

console.log(`\nCreados: ${created}, omitidos (ya existían): ${skipped}\n`)

if (!dryRun && created > 0) {
  console.log('Tip: ejecutá npm run audit:work-projects para validar.\n')
}
