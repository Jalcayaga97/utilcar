/**
 * Import incremental categorías faltantes desde seed/minimal-content.json.
 *
 * Uso:
 *   npm run import:specialties:dry
 *   npm run import:specialties
 */
import { createClient } from '@sanity/client'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import {
  loadSeedFile,
  importSeedIntoHomePage,
} from '../schemas/governance/migrations/specialtiesSeedImport.js'
import {
  logImportSpecialties,
  printImportSummary,
} from '../schemas/governance/migrations/specialtiesSeedImportLog.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDIO_ROOT = join(__dirname, '..')
const HOME_DOCUMENT_ID = 'homePage'

const dryRun = process.argv.includes('--dry')

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {}
  const env = {}
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

function envGet(key) {
  const fromProcess = process.env[key]
  if (fromProcess !== undefined && fromProcess !== '') return fromProcess
  const fileEnv = {
    ...loadEnvFile(join(STUDIO_ROOT, '.env')),
    ...loadEnvFile(join(STUDIO_ROOT, '.env.local')),
  }
  return fileEnv[key] ?? ''
}

const projectId =
  envGet('SANITY_PROJECT_ID') ||
  envGet('VITE_SANITY_PROJECT_ID') ||
  envGet('SANITY_STUDIO_PROJECT_ID')

const dataset =
  envGet('SANITY_DATASET') ||
  envGet('VITE_SANITY_DATASET') ||
  envGet('SANITY_STUDIO_DATASET') ||
  'production'

const token = envGet('SANITY_API_TOKEN')

function printReport(result) {
  const snap = result.snapshot ?? {}
  logImportSpecialties(`homePage: ${HOME_DOCUMENT_ID}`)
  logImportSpecialties(`seed source: ${result.source ?? 'unknown'}`)

  console.info('\nbefore:')
  console.info(`  • categories: ${snap.before?.categoriesCount ?? 0}`)

  console.info('\nafter:')
  console.info(`  • categories: ${snap.after?.categoriesCount ?? 0}`)

  if (result.imported?.length) {
    console.info('\n+ imported:')
    for (const title of result.imported) {
      console.info(`  • ${title}`)
    }
  } else {
    console.info('\n+ imported: none')
  }

  if (result.merged?.length) {
    console.info('\n~ merged (campos vacíos):')
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
  printImportSummary(snap)
}

async function main() {
  if (!projectId?.trim()) {
    console.error('[utilcar import:specialties] Falta projectId en .env')
    process.exit(1)
  }

  if (!token) {
    console.error('[utilcar import:specialties] Falta SANITY_API_TOKEN en utilcar-studio/.env')
    process.exit(1)
  }

  logImportSpecialties(dryRun ? 'DRY RUN — no se escribirá en Sanity' : 'LIVE RUN')
  logImportSpecialties(`project: ${projectId} / ${dataset}`)

  const seedJson = loadSeedFile()
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2024-05-28',
    token,
    useCdn: false,
  })

  const homeDoc = await client.fetch(`*[_id == $id][0]`, { id: HOME_DOCUMENT_ID })

  if (!homeDoc) {
    logImportSpecialties('warning', `documento ${HOME_DOCUMENT_ID} no encontrado`)
    process.exit(0)
  }

  const result = importSeedIntoHomePage(homeDoc, seedJson)

  printReport(result)

  if (result.snapshot?.invalidCount > 0) {
    console.error('\n[utilcar import:specialties] ✗ Categorías inválidas filtradas — revisar logs')
    process.exit(1)
  }

  if (!result.changed) {
    process.exit(0)
  }

  if (dryRun) {
    logImportSpecialties('DRY RUN complete — patch omitido')
    process.exit(0)
  }

  await client
    .patch(HOME_DOCUMENT_ID)
    .ifRevisionId(homeDoc._rev)
    .set({ blocks: result.blocks })
    .commit()

  console.info('\n[utilcar import:specialties] ✓ patched homePage')
  console.info(
    `[utilcar import:specialties] ✓ categories: ${result.snapshot?.after?.categoriesCount ?? 0}`,
  )
  console.info('[utilcar import:specialties] ✓ items[] legacy preservado')
}

main().catch((err) => {
  console.error('[utilcar import:specialties] error', err)
  process.exit(1)
})
