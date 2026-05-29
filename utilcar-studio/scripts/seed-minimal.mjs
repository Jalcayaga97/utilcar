/**
 * Crea/actualiza los 4 singletons mínimos en Sanity.
 * Carga .env automáticamente (Windows / Mac / Linux) — sin export manual en shell.
 *
 * Orden: process.env → utilcar-studio/.env → .env.local → utilcar-web/.env.local
 * Project ID fallback (solo aquí): 1k8yld2r
 *
 * Requiere SANITY_API_TOKEN en .env o entorno.
 * Uso: npm run seed
 */
import { createClient } from '@sanity/client'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/** Único fallback hardcodeado del repo (solo script seed). */
const DEFAULT_PROJECT_ID = '1k8yld2r'

const __dirname = dirname(fileURLToPath(import.meta.url))
const STUDIO_ROOT = join(__dirname, '..')

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

function loadAllEnvFiles() {
  return {
    ...loadEnvFile(join(STUDIO_ROOT, '.env')),
    ...loadEnvFile(join(STUDIO_ROOT, '.env.local')),
    ...loadEnvFile(join(STUDIO_ROOT, '../utilcar-web/.env.local')),
    ...loadEnvFile(join(STUDIO_ROOT, '../utilcar-web/.env')),
  }
}

const fileEnv = loadAllEnvFiles()

/** process.env tiene prioridad sobre archivos .env */
function envGet(key) {
  const fromProcess = process.env[key]
  if (fromProcess !== undefined && fromProcess !== '') return fromProcess
  const fromFile = fileEnv[key]
  if (fromFile !== undefined && fromFile !== '') return fromFile
  return ''
}

const projectId =
  envGet('SANITY_PROJECT_ID') ||
  envGet('VITE_SANITY_PROJECT_ID') ||
  envGet('SANITY_STUDIO_PROJECT_ID') ||
  DEFAULT_PROJECT_ID

const dataset =
  envGet('SANITY_DATASET') ||
  envGet('VITE_SANITY_DATASET') ||
  envGet('SANITY_STUDIO_DATASET') ||
  'production'

const token = envGet('SANITY_API_TOKEN')

if (!projectId?.trim()) {
  console.error('[seed] No se pudo resolver projectId (caso extremo).')
  process.exit(1)
}

if (!token) {
  console.error(
    '[seed] Falta SANITY_API_TOKEN.\n' +
      '  Añádelo en utilcar-studio/.env:\n' +
      '  SANITY_API_TOKEN=sk...\n' +
      '  (Token con escritura en sanity.io/manage → API → Tokens)',
  )
  process.exit(1)
}

const seed = JSON.parse(readFileSync(join(STUDIO_ROOT, 'seed/minimal-content.json'), 'utf8'))

const client = createClient({
  projectId,
  dataset,
  apiVersion: '2024-05-28',
  token,
  useCdn: false,
})

const docs = [seed.homePage, seed.servicesPage, seed.workPage, seed.contactPage]

console.log(`[seed] Proyecto ${projectId} / ${dataset}`)

/** Migra especialidadesList (legacy) → especialidades.items sin perder datos. */
async function migrateHomeEspecialidades(homeDoc) {
  const existing = await client.fetch(`*[_id == "homePage"][0]`)
  if (!existing) return homeDoc

  const legacy = existing.especialidadesList
  if (!legacy?.length) return homeDoc

  const section = {
    ...(existing.especialidades ?? {}),
    ...(homeDoc.especialidades ?? {}),
  }
  const items = [...(section.items ?? [])]
  const ids = new Set(items.map((i) => i?.id).filter(Boolean))

  for (const item of legacy) {
    if (item?.id && !ids.has(item.id)) {
      items.push(item)
      ids.add(item.id)
    }
  }

  if (items.length) {
    homeDoc.especialidades = { ...section, items }
    console.log('  ↳ migrado especialidadesList → especialidades.items')
  }

  return homeDoc
}

for (const doc of docs) {
  const payload = doc._type === 'homePage' ? await migrateHomeEspecialidades({ ...doc }) : doc
  await client.createOrReplace(payload)
  console.log(`  ✓ ${doc._type} (${doc._id})`)
}

console.log('[seed] Listo. Publica en Studio si usas borrador.')
