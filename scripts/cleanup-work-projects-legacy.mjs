/**
 * Elimina documentos workProject legacy/huérfanos tras normalización del catálogo.
 *
 * npm run cleanup:work-projects-legacy
 * npm run cleanup:work-projects-legacy -- --dry
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { labelForServiceCategory } from '../src/lib/cms/constants/serviceCategories.js'
import { WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'
import { RUNTIME_WORK_PROJECT_CATALOG } from './lib/workProjectRuntimeCatalog.mjs'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')

/** IDs legacy confirmados en auditoría — cada uno con equivalente canónico. */
const LEGACY_ORPHAN_IDS = ['1', '2', '3', 'pi-0', 'pi-1', 'pi-2', 'pi-3', 'pi-4']

/** Mapeo editorial legacy → ID canónico (TRABAJOS_PORTFOLIO). */
const LEGACY_TO_CANONICAL = {
  '1': 'esc-350',
  '2': 'taller-hiace',
  '3': 'vent-master',
  'pi-0': 'banq-adulto',
  'pi-1': 'but-2',
  'pi-2': 'but-3',
  'pi-3': 'taller-tr12',
  'pi-4': 'taller-tr9',
}

const CANONICAL_IDS = new Set(RUNTIME_WORK_PROJECT_CATALOG.map((item) => item.id))

const sanityEnv = loadSanityEnv({ requireToken: !dryRun })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token,
  useCdn: false,
})

function pad(value, width) {
  const text = String(value ?? '')
  return text.length >= width ? `${text.slice(0, width - 1)}…` : text.padEnd(width)
}

const cmsProjects = await client.fetch(WORK_PROJECTS_QUERY)
const cmsById = new Map(cmsProjects.map((project) => [String(project.id), project]))

const home = await client.fetch(`*[_id == "homePage"][0]{
  blocks[_type == "portfolioBlock"][0]{
    featuredProjects[]{
      _key,
      projectId,
      project->{ _id, "id": coalesce(projectId.current, projectId) }
    }
  }
}`)

const featuredRefs = home?.blocks?.featuredProjects ?? []
const refsToLegacy = featuredRefs.filter((ref) => {
  const refId = ref?.project?.id ?? ref?.projectId
  return LEGACY_ORPHAN_IDS.includes(String(refId))
})

console.info('\n══════════════════════════════════════════════════════════')
console.info('  PASO 1 — Validación previa (legacy → canónico)')
console.info('══════════════════════════════════════════════════════════\n')
console.info(`Proyectos CMS visibles: ${cmsProjects.length}\n`)
console.info(
  `${pad('ID CMS', 10)} ${pad('Título', 38)} ${pad('Categoría', 22)} Equivalente canónico`,
)
console.info(`${'─'.repeat(10)} ${'─'.repeat(38)} ${'─'.repeat(22)} ${'─'.repeat(20)}`)

const toDelete = []
const blocked = []

for (const legacyId of LEGACY_ORPHAN_IDS) {
  const doc = cmsById.get(legacyId)
  const canonicalId = LEGACY_TO_CANONICAL[legacyId]
  const canonical = cmsById.get(canonicalId)

  if (!doc) {
    console.info(`${pad(legacyId, 10)} ${pad('— (no existe)', 38)} ${pad('—', 22)} ${canonicalId}`)
    continue
  }

  const category = labelForServiceCategory(doc.serviceCategory)
  const canonicalOk = Boolean(canonical && canonical.visible !== false)
  const flags = []
  if (doc.featured) flags.push('featured')
  if (doc.homeVisible) flags.push('homeVisible')
  const flagNote = flags.length ? ` [${flags.join(', ')}]` : ''

  console.info(
    `${pad(legacyId, 10)} ${pad(doc.title, 38)} ${pad(category, 22)} ${canonicalId}${canonicalOk ? '' : ' ⚠ sin canónico'}`,
  )

  if (!canonicalOk) {
    blocked.push({ legacyId, reason: 'sin equivalente canónico activo' })
    continue
  }

  if (CANONICAL_IDS.has(legacyId)) {
    blocked.push({ legacyId, reason: 'ID está en catálogo canónico' })
    continue
  }

  toDelete.push({ legacyId, _id: doc._id, canonicalId, flags })
}

if (refsToLegacy.length) {
  console.info('\n── Referencias Home a documentos legacy ──\n')
  for (const ref of refsToLegacy) {
    const legacyId = ref?.project?.id ?? ref?.projectId
    console.info(`  • featuredProject ref → ${legacyId} (se repuntará a ${LEGACY_TO_CANONICAL[legacyId]})`)
  }
}

if (blocked.length) {
  console.info('\n── Bloqueados (no se eliminarán) ──\n')
  for (const item of blocked) {
    console.info(`  ✗ ${item.legacyId}: ${item.reason}`)
  }
}

console.info('\n══════════════════════════════════════════════════════════')
console.info('  PASO 2 — Eliminación')
console.info('══════════════════════════════════════════════════════════\n')

if (!toDelete.length) {
  console.info('  Nada que eliminar.\n')
  process.exit(0)
}

if (dryRun) {
  console.info(`  [dry-run] Se eliminarían ${toDelete.length} documento(s):\n`)
  for (const item of toDelete) {
    console.info(`    - workProject-${item.legacyId} → canónico: ${item.canonicalId}`)
  }
  console.info('\n  Ejecutá sin --dry para aplicar.\n')
  process.exit(0)
}

if (refsToLegacy.length) {
  const blocks = await client.fetch(`*[_id == "homePage"][0].blocks`)
  const idx = blocks.findIndex((b) => b._type === 'portfolioBlock')
  if (idx >= 0) {
    const portfolio = { ...blocks[idx] }
    portfolio.featuredProjects = (portfolio.featuredProjects ?? []).map((ref) => {
      const legacyId = String(ref?.project?.id ?? ref?.projectId ?? '').trim()
      const canonicalId = LEGACY_TO_CANONICAL[legacyId]
      if (!canonicalId) return ref
      const canonicalDoc = cmsById.get(canonicalId)
      if (!canonicalDoc?._id) return ref
      return {
        ...ref,
        project: { _type: 'reference', _ref: canonicalDoc._id },
        projectId: canonicalId,
      }
    })
    blocks[idx] = portfolio
    await client.patch('homePage').set({ blocks }).commit()
    console.info(`  ~ homePage: ${refsToLegacy.length} referencia(s) repuntadas a canónicos\n`)
  }
}

let deleted = 0
for (const item of toDelete) {
  await client.delete(item._id)
  deleted++
  console.info(`  ✓ eliminado workProject-${item.legacyId} (${item.canonicalId} conservado)`)
}

const countAfter = await client.fetch(`count(*[_type == "workProject" && visible != false])`)

console.info('\n══════════════════════════════════════════════════════════')
console.info('  PASO 3 — Validación posterior')
console.info('══════════════════════════════════════════════════════════\n')
console.info(`  Proyectos antes:     ${cmsProjects.length}`)
console.info(`  Eliminados:          ${deleted}`)
console.info(`  Proyectos después:   ${countAfter}`)

const canonicalPresent = RUNTIME_WORK_PROJECT_CATALOG.filter((item) => cmsById.has(item.id) || toDelete.some((d) => d.canonicalId === item.id))
console.info(`  Canónicos en CMS:    ${canonicalPresent.length}/${RUNTIME_WORK_PROJECT_CATALOG.length}`)

console.info('\n══════════════════════════════════════════════════════════')
console.info('  PASO 4 — Auditoría final')
console.info('══════════════════════════════════════════════════════════\n')

const cmsAfterList = await client.fetch(WORK_PROJECTS_QUERY)
const cmsAfterIds = new Set(cmsAfterList.map((p) => String(p.id)))
const missingCanonical = RUNTIME_WORK_PROJECT_CATALOG.filter((item) => !cmsAfterIds.has(item.id))
const extraDocs = cmsAfterList.filter((p) => !CANONICAL_IDS.has(String(p.id)))

console.info(`  Runtime total:       ${RUNTIME_WORK_PROJECT_CATALOG.length}`)
console.info(`  CMS total:           ${cmsAfterList.length}`)
console.info(`  Paridad canónica:    ${RUNTIME_WORK_PROJECT_CATALOG.length - missingCanonical.length}/${RUNTIME_WORK_PROJECT_CATALOG.length}`)

if (missingCanonical.length) {
  console.info('\n  ✗ Faltan canónicos:')
  for (const item of missingCanonical) console.info(`    - ${item.id}`)
}

if (extraDocs.length) {
  console.info('\n  ⚠ Documentos extra (no canónicos):')
  for (const doc of extraDocs) console.info(`    - ${doc.id}: ${doc.title}`)
}

if (refsToLegacy.length === 0) {
  console.info('\n  ✓ Sin referencias Home rotas (legacy repuntadas o no usadas)')
}

console.info('\n  Página Trabajos / filtros / Home: sin cambios de código — fuente = Proyectos CMS\n')

if (missingCanonical.length || extraDocs.length) {
  process.exit(1)
}

console.info('✓ Colección Proyectos CMS normalizada — solo IDs canónicos.\n')
