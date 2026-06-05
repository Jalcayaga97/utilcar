/**
 * Migra specialtiesBlock.items[] → categories[] en homePage (idempotente).
 *
 * Uso:
 *   npm run migrate:specialties
 *   npm run migrate:specialties:dry
 *
 * Requiere SANITY_API_TOKEN con escritura.
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../../src/lib/sanity/runtime/loadSanityEnv.js'
import {
  migrateHomePageDocument,
  logMigrate,
  printMigrationSummary,
} from '../schemas/governance/migrations/index.js'

const HOME_DOCUMENT_ID = 'homePage'

const dryRun = process.argv.includes('--dry')
const BLOCKING_WARNING_TYPES = new Set(['missing-title', 'duplicate-slug', 'invalid-cta'])

const sanityEnv = loadSanityEnv({ requireToken: !dryRun })
sanityEnv.applyToProcessEnv()

const { projectId, dataset, token } = sanityEnv

function printDiffReport(result) {
  const snap = result.snapshot ?? {}
  logMigrate(`homePage: ${HOME_DOCUMENT_ID}`)

  if (result.bootstrapped) {
    logMigrate(`bootstrap: blocks[] creado desde legacy (${result.legacyItemsCount} items)`)
  }

  console.info('\nbefore:')
  console.info(`  • items: ${snap.before?.itemsCount ?? 0}`)
  console.info(`  • categories: ${snap.before?.categoriesCount ?? 0}`)

  console.info('\nafter:')
  console.info(`  • categories: ${snap.after?.categoriesCount ?? 0}`)

  if (result.migrated?.length) {
    console.info('\n+ migrated:')
    for (const title of result.migrated) {
      console.info(`  • ${title}`)
    }
  } else {
    console.info('\n+ migrated: none')
  }

  if (result.merged?.length) {
    console.info('\n~ merged:')
    for (const title of result.merged) {
      console.info(`  • ${title}`)
    }
  }

  if (result.preserved?.length) {
    console.info('\n= preserved:')
    for (const title of result.preserved) {
      console.info(`  • ${title}`)
    }
  } else {
    console.info('\n= preserved: none')
  }

  console.info(`\nchanged: ${Boolean(result.changed)}`)

  if (snap.invalidCount) {
    console.info(`\n⚠ invalid categories filtered: ${snap.invalidCount}`)
  }

  printMigrationSummary(snap)
}

function hasBlockingIssues(result) {
  const invalid = result.snapshot?.invalidCount ?? 0
  return invalid > 0
}

async function main() {
  logMigrate(dryRun ? 'DRY RUN — no se escribirá en Sanity' : 'LIVE RUN')
  logMigrate(`project: ${projectId} / ${dataset}`)

  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-05-28',
    token,
    useCdn: false,
  })

  const homeDoc = await client.fetch(`*[_id == $id][0]`, { id: HOME_DOCUMENT_ID })

  if (!homeDoc) {
    logMigrate('warning', `documento ${HOME_DOCUMENT_ID} no encontrado — exit clean`)
    process.exit(0)
  }

  const result = migrateHomePageDocument(homeDoc)

  printDiffReport(result)

  if (hasBlockingIssues(result)) {
    console.error('\n[utilcar migrate:specialties] ✗ Bloqueantes detectados — NO ejecutar live migration')
    process.exit(1)
  }

  if (!result.changed) {
    process.exit(0)
  }

  if (dryRun) {
    logMigrate('DRY RUN complete — patch omitido')
    process.exit(0)
  }

  await client
    .patch(HOME_DOCUMENT_ID)
    .ifRevisionId(homeDoc._rev)
    .set({ blocks: result.blocks })
    .commit()

  console.info('\n[utilcar migrate:specialties] ✓ patched homePage')
  console.info(`[utilcar migrate:specialties] ✓ migrated categories: ${result.snapshot?.after?.categoriesCount ?? 0}`)
  console.info(`[utilcar migrate:specialties] ✓ preserved brands: 0`)
  console.info(`[utilcar migrate:specialties] ✓ changed: true`)
}

main().catch((err) => {
  console.error('[utilcar migrate:specialties] error', err)
  process.exit(1)
})

