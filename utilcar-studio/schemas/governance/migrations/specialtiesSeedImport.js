/**
 * Import incremental seed → specialtiesBlock.categories[] (merge seguro).
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  mapLegacyItemToCategory,
  mergeExistingCategories,
  normalizeLegacySpecialtyItem,
} from './specialtiesMigration.js'
import { findSpecialtiesBlockIndex } from '../homePageSync.js'
import { validateMigratedCategories } from './specialtiesMigrationValidators.js'
import { logImportSpecialties } from './specialtiesSeedImportLog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDIO_ROOT = join(__dirname, '../../..')
const DEFAULT_SEED_PATH = join(STUDIO_ROOT, 'seed/minimal-content.json')
const FIXTURES_INDEX_PATH = join(
  STUDIO_ROOT,
  '../utilcar-web/src/lib/cms/contracts/fixtures/index.js',
)

/**
 * @param {object} raw
 * @returns {boolean}
 */
function isSpecialtyCategory(raw) {
  return raw?._type === 'specialtyCategory'
}

/**
 * Convierte entrada seed/legacy → specialtyCategory contractual.
 * @param {object} raw
 * @param {number} index
 */
export function seedEntryToCategory(raw, index = 0) {
  if (isSpecialtyCategory(raw)) return raw
  const item = normalizeLegacySpecialtyItem(raw)
  if (!item) return null
  return mapLegacyItemToCategory(item, index)
}

/**
 * Lee fuentes del JSON seed con prioridad contractual.
 * @param {object} seedJson
 */
export function readSeedSpecialtySources(seedJson) {
  const home = seedJson?.homePage ?? seedJson
  const blocks = Array.isArray(home?.blocks) ? home.blocks : []
  const specBlock = blocks.find((block) => block?._type === 'specialtiesBlock')

  const candidates = [
    { source: 'specialtiesBlock.categories', list: specBlock?.categories },
    { source: 'specialtiesBlock.items', list: specBlock?.items },
    { source: 'specialtiesNew', list: home?.specialtiesNew },
    { source: 'especialidadesList', list: home?.especialidadesList },
    { source: 'especialidades.items', list: home?.especialidades?.items },
  ]

  for (const { source, list } of candidates) {
    if (Array.isArray(list) && list.length > 0) {
      return { source, items: list }
    }
  }

  return { source: 'none', items: [] }
}

/**
 * Fallback fixtures (solo si seed vacío) — lectura estática de archivos fixture.
 */
export function readFixturesFallback() {
  const fixtureFiles = [
    join(STUDIO_ROOT, '../utilcar-web/src/lib/cms/contracts/fixtures/ventanas.fixture.js'),
    join(
      STUDIO_ROOT,
      '../utilcar-web/src/lib/cms/contracts/fixtures/busesEscolares.fixture.js',
    ),
    join(STUDIO_ROOT, '../utilcar-web/src/lib/cms/contracts/fixtures/banquetas.fixture.js'),
  ]

  const categories = []
  for (const filePath of fixtureFiles) {
    if (!existsSync(filePath)) continue
    const content = readFileSync(filePath, 'utf8')
    const match = content.match(/export const \w+CategoryFixture = (\{[\s\S]*?\n\})/)
    if (!match) continue
    try {
      const parsed = JSON.parse(
        match[1]
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,\s*}/g, '}')
          .replace(/,\s*]/g, ']'),
      )
      categories.push(parsed)
    } catch {
      // fixtures son JS — skip parse frágil; seed es fuente principal
    }
  }

  if (categories.length) {
    return { source: 'fixtures', items: categories }
  }
  return { source: 'none', items: [] }
}

/**
 * @param {string} [seedPath]
 */
export function loadSeedFile(seedPath = DEFAULT_SEED_PATH) {
  if (!existsSync(seedPath)) {
    throw new Error(`Seed no encontrado: ${seedPath}`)
  }
  return JSON.parse(readFileSync(seedPath, 'utf8'))
}

/**
 * Normaliza todas las entradas seed → categories[].
 * @param {object[]} items
 */
export function mapSeedItemsToCategories(items) {
  return (items ?? [])
    .map((raw, index) => seedEntryToCategory(raw, index))
    .filter(Boolean)
}

/**
 * Import incremental: append categorías faltantes, preserve edición existente.
 * @param {object} specialtiesBlock
 * @param {object[]} seedItems raw seed entries
 */
export function importSeedCategoriesIntoBlock(specialtiesBlock, seedItems) {
  const beforeCount = specialtiesBlock?.categories?.length ?? 0
  const incoming = mapSeedItemsToCategories(seedItems)

  logImportSpecialties('seed entries', { count: incoming.length, beforeCount })

  const { categories, migrated, preserved, merged } = mergeExistingCategories(
    specialtiesBlock?.categories ?? [],
    incoming,
  )

  const { validCategories, invalidCategories } = validateMigratedCategories(categories)

  if (invalidCategories.length) {
    logImportSpecialties('invalid filtered', {
      count: invalidCategories.length,
      ids: invalidCategories.map((r) => r.category?._key),
    })
  }

  const afterCount = validCategories.length
  const changed =
    afterCount !== beforeCount ||
    JSON.stringify(validCategories) !== JSON.stringify(specialtiesBlock?.categories ?? [])

  const nextBlock = {
    ...specialtiesBlock,
    categories: validCategories,
    items: specialtiesBlock?.items ?? [],
  }

  return {
    block: nextBlock,
    changed,
    imported: migrated,
    preserved,
    merged,
    snapshot: {
      before: { categoriesCount: beforeCount },
      after: { categoriesCount: afterCount },
      importedIds: migrated,
      preservedIds: preserved,
      mergedIds: merged,
      invalidCount: invalidCategories.length,
    },
  }
}

/**
 * @param {object} homeDoc
 * @param {object} seedJson
 */
export function importSeedIntoHomePage(homeDoc, seedJson) {
  let { source, items } = readSeedSpecialtySources(seedJson)

  if (!items.length) {
    const fallback = readFixturesFallback()
    source = fallback.source
    items = fallback.items
  }

  logImportSpecialties('source', { source, count: items.length })

  const blocks = [...(homeDoc?.blocks ?? [])]
  const index = findSpecialtiesBlockIndex(blocks)

  if (index < 0) {
    logImportSpecialties('warning', 'no specialtiesBlock in blocks[]')
    return {
      blocks,
      changed: false,
      source,
      snapshot: { reason: 'no specialtiesBlock' },
    }
  }

  const result = importSeedCategoriesIntoBlock(blocks[index], items)
  if (result.changed) {
    blocks[index] = result.block
  }

  return {
    blocks,
    blockIndex: index,
    source,
    ...result,
  }
}

export { DEFAULT_SEED_PATH, FIXTURES_INDEX_PATH }
