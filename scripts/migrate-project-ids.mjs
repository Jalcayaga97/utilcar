/**
 * Migra projectId.current al esquema oficial TM-001, VL-001, etc.
 * Mantiene _id de documento y referencias _ref intactas.
 *
 * npm run migrate:project-ids -- --dry
 * npm run migrate:project-ids -- --apply
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { labelForServiceCategory } from '../src/lib/cms/constants/serviceCategories.js'
import {
  PROJECT_ID_MIGRATION_ENTRIES,
  PROJECT_ID_MIGRATION_MAP,
  PROJECT_ID_PREFIX_BY_CATEGORY,
  PROJECT_ID_REGEX,
  parseProjectIdCode,
} from '../src/lib/cms/constants/projectIdCodes.js'
import { WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const sanityEnv = loadSanityEnv({ requireToken: apply })
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

function normalizeDocId(id) {
  return String(id ?? '').replace(/^drafts\./, '')
}

const projects = await client.fetch(WORK_PROJECTS_QUERY)
const byCurrentId = new Map(projects.map((p) => [String(p.id), p]))

console.info('\n══════════════════════════════════════════════════════════')
console.info(`  MIGRACIÓN projectId ${dryRun ? '(dry-run)' : '(apply)'}`)
console.info('══════════════════════════════════════════════════════════\n')

const planned = []
const skipped = []
const missing = []

for (const [oldId, newId] of PROJECT_ID_MIGRATION_ENTRIES) {
  const doc = byCurrentId.get(oldId)
  if (!doc) {
    missing.push(oldId)
    continue
  }
  if (doc.id === newId) {
    skipped.push({ oldId, newId, reason: 'ya migrado' })
    continue
  }
  planned.push({ doc, oldId, newId })
}

console.info('── Fase 1 — Plan de migración (32 proyectos) ──\n')
console.info(`${pad('ID actual', 22)} → ${pad('ID nuevo', 10)} Título`)
console.info(`${'─'.repeat(22)}   ${'─'.repeat(10)} ${'─'.repeat(36)}`)

for (const [oldId, newId] of PROJECT_ID_MIGRATION_ENTRIES) {
  const doc = byCurrentId.get(oldId)
  const title = doc?.title ?? '(no encontrado en CMS)'
  const marker = doc?.id === newId ? ' ✓' : doc ? '' : ' ✗'
  console.info(`${pad(oldId, 22)} → ${pad(newId, 10)} ${title}${marker}`)
}

if (missing.length) {
  console.info('\n⚠ IDs del mapa no encontrados en CMS:')
  for (const id of missing) console.info(`  - ${id}`)
}

if (skipped.length) {
  console.info(`\n• ${skipped.length} ya en formato nuevo (omitidos en apply)`)
}

const targetIds = new Set(planned.map((p) => p.newId))
const duplicateTargets = [...targetIds].filter(
  (id) => projects.some((p) => p.id === id && !planned.find((x) => x.doc._id === p._id)),
)

if (duplicateTargets.length) {
  console.error('\n✗ Colisión: estos IDs nuevos ya existen en otro documento:')
  for (const id of duplicateTargets) console.error(`  - ${id}`)
  process.exit(1)
}

if (dryRun) {
  console.info(`\n── Resumen dry-run ──`)
  console.info(`  A migrar: ${planned.length}`)
  console.info(`  Ya migrados: ${skipped.length}`)
  console.info(`  No encontrados: ${missing.length}`)
  console.info('\n  Ejecutá: npm run migrate:project-ids -- --apply\n')
  process.exit(missing.length ? 1 : 0)
}

let migrated = 0
const tx = client.transaction()

for (const { doc, oldId, newId } of planned) {
  tx.patch(normalizeDocId(doc._id), {
    set: {
      projectId: { _type: 'slug', current: newId },
    },
  })
  migrated++
  console.info(`  ~ ${oldId} → ${newId}  (${normalizeDocId(doc._id)})`)
}

if (migrated) await tx.commit()

let homeRefsUpdated = 0
const home = await client.fetch(`*[_id == "homePage"][0]{ blocks }`)
const blocks = [...(home?.blocks ?? [])]
const portfolioIdx = blocks.findIndex((b) => b._type === 'portfolioBlock')

if (portfolioIdx >= 0) {
  const portfolio = { ...blocks[portfolioIdx] }
  let changed = false
  portfolio.featuredProjects = (portfolio.featuredProjects ?? []).map((ref) => {
    const legacyId = String(ref?.projectId ?? ref?.project?.id ?? '').trim()
    const mapped = PROJECT_ID_MIGRATION_MAP[legacyId]
    if (!mapped || legacyId === mapped) return ref
    changed = true
    homeRefsUpdated++
    return { ...ref, projectId: mapped }
  })
  if (changed) {
    blocks[portfolioIdx] = portfolio
    await client.patch('homePage').set({ blocks }).commit()
    console.info(`\n  ~ homePage: ${homeRefsUpdated} projectId string(s) actualizados (_ref intactas)`)
  }
}

const afterProjects = await client.fetch(WORK_PROJECTS_QUERY)
const byCategory = Object.fromEntries(
  Object.keys(PROJECT_ID_PREFIX_BY_CATEGORY).map((k) => [k, []]),
)

for (const project of afterProjects) {
  if (byCategory[project.serviceCategory]) {
    byCategory[project.serviceCategory].push(project.id)
  }
}

const invalid = afterProjects.filter((p) => !PROJECT_ID_REGEX.test(String(p.id ?? '')))
const duplicateIds = afterProjects
  .map((p) => p.id)
  .filter((id, i, arr) => arr.indexOf(id) !== i)

console.info('\n── Auditoría final ──\n')
console.info(`  Proyectos migrados (slug):     ${migrated}`)
console.info(`  Referencias Home (strings):    ${homeRefsUpdated}`)
console.info(`  Total CMS después:             ${afterProjects.length}`)
console.info(`  Formato inválido:              ${invalid.length}`)
console.info(`  Duplicados projectId:          ${duplicateIds.length}`)

console.info('\n── Resultado por categoría ──\n')
for (const [category, prefix] of Object.entries(PROJECT_ID_PREFIX_BY_CATEGORY)) {
  const ids = (byCategory[category] ?? []).sort()
  const codes = ids.filter((id) => parseProjectIdCode(id)?.prefix === prefix)
  console.info(`  ${labelForServiceCategory(category)} (${prefix}): ${codes.length} — ${codes.join(', ') || '—'}`)
}

if (invalid.length || duplicateIds.length || missing.length) {
  console.error('\n✗ Auditoría con problemas\n')
  process.exit(1)
}

const migratedCount = afterProjects.filter((p) => PROJECT_ID_REGEX.test(String(p.id))).length
console.info(`\n✓ ${migratedCount}/${PROJECT_ID_MIGRATION_ENTRIES.length} proyectos con código oficial\n`)
