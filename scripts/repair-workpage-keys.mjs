/**
 * Normaliza _key en arrays de workPage y completa preview ids 1–3 si faltan.
 * npm run repair:workpage-keys
 * npm run repair:workpage-keys -- --dry
 */
import {
  createRepairClient,
  ensureArrayKeys,
  fetchWorkPage,
  mergePreviewItems,
} from './lib/homeRepairShared.mjs'

const dryRun = process.argv.includes('--dry') || process.argv.includes('--verify')

const ARRAY_PATHS = ['filters', 'portfolio', 'preview']

function ensureNestedArrayKeys(blocks) {
  if (!Array.isArray(blocks)) return { blocks, changed: false }
  let changed = false
  const next = blocks.map((block) => {
    if (!block || typeof block !== 'object') return block
    let copy = block
    for (const field of ['items', 'categories', 'featuredProjects', 'filters']) {
      if (!Array.isArray(block[field])) continue
      const keyed = ensureArrayKeys(block[field])
      const missing = block[field].some((item, i) => !item?._key && keyed[i]?._key)
      if (missing) {
        copy = { ...copy, [field]: keyed }
        changed = true
      }
    }
    return copy
  })
  return { blocks: next, changed }
}

function countMissingKeys(arr) {
  if (!Array.isArray(arr)) return 0
  return arr.filter((item) => item && typeof item === 'object' && !item._key).length
}

console.info('\n══════════════════════════════════════')
console.info('  REPARACIÓN — workPage _keys')
console.info('══════════════════════════════════════\n')

const { client } = createRepairClient({ dryRun })
const doc = await fetchWorkPage(client)
if (!doc) {
  console.error('✗ workPage no encontrado')
  process.exit(1)
}

const patch = { ...doc }
let changed = false

for (const path of ARRAY_PATHS) {
  const before = patch[path]
  const missing = countMissingKeys(before)
  if (!Array.isArray(before)) continue

  let next = ensureArrayKeys(before)
  if (path === 'preview') {
    const merged = mergePreviewItems(next)
    if (JSON.stringify(merged) !== JSON.stringify(before)) {
      next = merged
      console.info(`  + preview: añadidos ids legacy 1–3 si faltaban`)
    }
  }

  if (missing > 0 || JSON.stringify(next) !== JSON.stringify(before)) {
    patch[path] = next
    changed = true
    console.info(`  ~ ${path}[]: ${missing} _key(s) generados`)
  } else {
    console.info(`  ✓ ${path}[] OK`)
  }
}

if (Array.isArray(patch.blocks)) {
  const { blocks, changed: blocksChanged } = ensureNestedArrayKeys(patch.blocks)
  if (blocksChanged) {
    patch.blocks = blocks
    changed = true
    console.info('  ~ blocks[]: _keys en arrays anidados')
  }
}

if (Array.isArray(doc.page?.projects)) {
  const missing = countMissingKeys(doc.page.projects)
  if (missing > 0) {
    patch.page = {
      ...patch.page,
      projects: ensureArrayKeys(doc.page.projects),
    }
    changed = true
    console.info(`  ~ page.projects[]: ${missing} _key(s) generados`)
  }
}

if (!changed) {
  console.info('\n✓ workPage sin _keys faltantes')
  process.exit(0)
}

if (dryRun) {
  console.info('\nModo dry — cambios detectados, sin escritura')
  process.exit(0)
}

await client.createOrReplace({ ...patch, _id: 'workPage', _type: 'workPage' })
console.info('\n✓ workPage publicado con _keys normalizados')
