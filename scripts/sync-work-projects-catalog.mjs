/**
 * Auditoría y sincronización catálogo Proyectos CMS ↔ runtime (TRABAJOS_PORTFOLIO).
 *
 * npm run sync:work-projects-catalog          # auditoría + creación
 * npm run sync:work-projects-catalog -- --dry  # solo informe
 */
import { createClient } from '@sanity/client'
import { createReadStream, existsSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { labelForServiceCategory } from '../src/lib/cms/constants/serviceCategories.js'
import { WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'
import { SCHEMA_VERSION_VALUE } from '../utilcar-studio/schemas/content/fields/schemaVersion.js'
import { RUNTIME_WORK_PROJECT_CATALOG } from './lib/workProjectRuntimeCatalog.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = join(__dirname, '..')

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')

const sanityEnv = loadSanityEnv({ requireToken: !dryRun })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

const imageCache = new Map()
let uploadedImages = 0

async function uploadImage(relativePath, alt) {
  if (!relativePath) return null
  if (imageCache.has(relativePath)) return imageCache.get(relativePath)

  const abs = join(WEB_ROOT, relativePath)
  if (!existsSync(abs)) {
    console.warn(`  ⚠ imagen no encontrada: ${relativePath}`)
    imageCache.set(relativePath, null)
    return null
  }

  if (dryRun) {
    const placeholder = { _type: 'image', _dryRun: true, alt: alt || basename(abs) }
    imageCache.set(relativePath, placeholder)
    return placeholder
  }

  const asset = await client.assets.upload('image', createReadStream(abs), {
    filename: basename(abs),
  })
  const ref = {
    _type: 'image',
    asset: { _type: 'reference', _ref: asset._id },
    alt: alt || basename(abs),
  }
  imageCache.set(relativePath, ref)
  uploadedImages++
  return ref
}

function pad(value, width) {
  const text = String(value ?? '')
  return text.length >= width ? `${text.slice(0, width - 1)}…` : text.padEnd(width)
}

function normalizeTitle(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

const cmsProjects = await client.fetch(WORK_PROJECTS_QUERY)
const cmsById = new Map(cmsProjects.map((project) => [String(project.id), project]))
const cmsByTitleCategory = new Map(
  cmsProjects.map((project) => [
    `${normalizeTitle(project.title)}::${project.serviceCategory}`,
    project,
  ]),
)

const runtimeCatalog = RUNTIME_WORK_PROJECT_CATALOG
const auditRows = []
const missing = []
const matchedIds = new Set()

for (const item of runtimeCatalog) {
  let cmsHit = cmsById.get(item.id)
  let matchType = cmsHit ? 'id' : null

  if (!cmsHit) {
    const key = `${normalizeTitle(item.title)}::${item.serviceCategory}`
    cmsHit = cmsByTitleCategory.get(key)
    if (cmsHit) matchType = 'title'
  }

  if (cmsHit) matchedIds.add(String(cmsHit.id))

  const row = {
    title: item.title,
    category: labelForServiceCategory(item.serviceCategory),
    serviceCategory: item.serviceCategory,
    runtimeId: item.id,
    existsInCms: Boolean(cmsHit),
    cmsId: cmsHit?.id ?? '—',
    matchType: matchType ?? '—',
  }
  auditRows.push(row)

  if (!cmsById.has(item.id)) {
    missing.push({ ...item, titleMatch: cmsHit ?? null })
  }
}

const orphanCms = cmsProjects.filter((project) => !matchedIds.has(String(project.id)))

console.info('\n══════════════════════════════════════════════════════════')
console.info('  AUDITORÍA — Proyectos runtime vs CMS')
console.info('══════════════════════════════════════════════════════════\n')
console.info(`Dataset: ${sanityEnv.dataset} · Runtime: ${runtimeCatalog.length} · CMS: ${cmsProjects.length}\n`)

console.info('── Tabla de consistencia ──\n')
console.info(
  `${pad('Título', 42)} ${pad('Categoría', 22)} ${pad('CMS', 5)} ${pad('ID CMS', 18)} Runtime ID`,
)
console.info(`${'─'.repeat(42)} ${'─'.repeat(22)} ${'─'.repeat(5)} ${'─'.repeat(18)} ${'─'.repeat(18)}`)

for (const row of auditRows) {
  console.info(
    `${pad(row.title, 42)} ${pad(row.category, 22)} ${pad(row.existsInCms ? 'Sí' : 'No', 5)} ${pad(row.cmsId, 18)} ${row.runtimeId}`,
  )
}

if (orphanCms.length) {
  console.info('\n── Documentos CMS sin par en catálogo runtime (legacy) ──\n')
  for (const project of orphanCms) {
    console.info(`  • ${project.id} — ${project.title} (${project.serviceCategory})`)
  }
}

console.info('\n── Faltantes por crear (ID canónico runtime) ──\n')
if (!missing.length) {
  console.info('  (ninguno)\n')
} else {
  for (const item of missing) {
    const note = item.titleMatch ? ` [existe como "${item.titleMatch.id}"]` : ''
    console.info(`  • ${item.id} — ${item.title}${note}`)
  }
  console.info('')
}

if (dryRun) {
  console.info('── Resumen (dry-run) ──\n')
  console.info(`  Runtime total:     ${runtimeCatalog.length}`)
  console.info(`  CMS actual:        ${cmsProjects.length}`)
  console.info(`  A crear:           ${missing.length}`)
  console.info(`  Restantes:         ${missing.length}`)
  console.info('\n  Ejecutá sin --dry para crear documentos.\n')
  process.exit(0)
}

const maxOrderByCategory = Object.create(null)
for (const project of cmsProjects) {
  const cat = project.serviceCategory
  const order = Number(project.order) || 0
  maxOrderByCategory[cat] = Math.max(maxOrderByCategory[cat] ?? -1, order)
}

let created = 0
let failed = 0

for (const item of missing) {
  const order = (maxOrderByCategory[item.serviceCategory] ?? -1) + 1
  maxOrderByCategory[item.serviceCategory] = order

  const image = await uploadImage(item.imageFile, item.title)
  if (!image && !dryRun) {
    console.warn(`  ✗ ${item.id} — sin imagen, omitido`)
    failed++
    continue
  }

  const doc = {
    _id: `workProject-${item.id}`,
    _type: 'workProject',
    schemaVersion: SCHEMA_VERSION_VALUE,
    projectId: { _type: 'slug', current: item.id },
    title: item.title,
    serviceCategory: item.serviceCategory,
    description: item.description ?? '',
    client: '',
    vehicle: '',
    visible: true,
    featured: false,
    homeVisible: false,
    order,
    ...(image?._dryRun
      ? {}
      : image
        ? { image }
        : {}),
  }

  if (doc._id && !image?._dryRun) {
    await client.createOrReplace(doc)
    created++
    console.info(`  + ${item.id} (${item.serviceCategory}, order ${order})`)
  }
}

const cmsAfter = await client.fetch(`count(*[_type == "workProject" && visible != false])`)
const stillMissing = missing.length - created - failed

console.info('\n── Validación final ──\n')
console.info(`  Runtime total:           ${runtimeCatalog.length}`)
console.info(`  CMS antes:               ${cmsProjects.length}`)
console.info(`  CMS después:             ${cmsAfter}`)
console.info(`  Creados:                 ${created}`)
console.info(`  Fallidos (sin imagen):   ${failed}`)
console.info(`  Restantes sin migrar:    ${stillMissing}`)
console.info(`  Imágenes subidas:        ${uploadedImages}`)

if (orphanCms.length) {
  console.info(`  Huérfanos CMS legacy:    ${orphanCms.length} (no eliminados)`)
}

const parity = runtimeCatalog.filter((item) => cmsById.has(item.id)).length + created
console.info(`\n  Paridad por ID canónico: ${parity}/${runtimeCatalog.length}`)

if (stillMissing > 0) {
  console.info('\n⚠ Quedan proyectos sin documento CMS.\n')
  process.exit(1)
}

console.info('\n✓ Catálogo normalizado — todos los IDs runtime tienen documento CMS.\n')
