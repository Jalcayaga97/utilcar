/**
 * Smoke tests de la capa CMS (sin UI).
 * npm run cms:smoke
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@sanity/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function loadEnvFile(filename) {
  const path = join(root, filename)
  if (!existsSync(path)) return {}
  const env = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    env[key] = val
  }
  return env
}

const env = { ...loadEnvFile('.env'), ...loadEnvFile('.env.local') }

function ok(msg) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg) {
  console.error(`  ✗ ${msg}`)
  process.exitCode = 1
}

console.log('\n[cms:smoke] 1 — Cache TTL\n')

const { getCached, setCached, clearAdapterCache, CACHE_TTL_MS } = await import(
  '../src/lib/cms/adapterCache.js'
)
const { assertSchemaVersion, parseSanityPayload, SCHEMA_VERSION } = await import(
  '../src/lib/cms/validate.js'
)

clearAdapterCache()
setCached('test', { a: 1 })
if (getCached('test')?.a !== 1) fail('cache set/get')
else ok('cache set/get')

ok(`TTL configurado: ${CACHE_TTL_MS / 1000}s`)

console.log('\n[cms:smoke] 2 — Schema version\n')

try {
  assertSchemaVersion({ _schemaVersion: SCHEMA_VERSION })
  ok(`versión ${SCHEMA_VERSION} aceptada`)
} catch {
  fail('versión válida rechazada')
}

const rejected = parseSanityPayload({ _schemaVersion: 99, hero: { title: 'x' } })
if (rejected === null) ok('versión incorrecta → null (fallback)')
else fail('versión incorrecta no rechazada')

const stripped = parseSanityPayload({ _schemaVersion: 1, hero: { title: 'CMS' } })
if (stripped?.hero?.title === 'CMS' && stripped._schemaVersion === undefined) {
  ok('strip _schemaVersion')
} else {
  fail('strip _schemaVersion')
}

console.log('\n[cms:smoke] 3 — Config Sanity\n')

const useSanity = env.VITE_USE_SANITY === 'true'
const projectId = env.VITE_SANITY_PROJECT_ID?.trim() || ''
const dataset = env.VITE_SANITY_DATASET || 'production'
const configured = Boolean(projectId)

if (!useSanity) {
  ok('VITE_USE_SANITY=false → solo /content (esperado para Fase 4)')
} else if (!configured) {
  ok('VITE_USE_SANITY=true pero sin projectId → isSanityEnabled=false en runtime')
} else {
  ok(`Sanity configurado: ${projectId} / ${dataset}`)
}

console.log('\n[cms:smoke] 4 — Fetch remoto (opcional)\n')

const QUERIES = await import('../src/lib/sanity/queries.js')

async function tryFetch(label, projectId, dataset, query) {
  const client = createClient({
    projectId,
    dataset,
    apiVersion: env.VITE_SANITY_API_VERSION || '2024-05-28',
    useCdn: env.VITE_SANITY_USE_CDN !== 'false',
  })
  try {
    const raw = await client.fetch(query)
    const data = parseSanityPayload(raw)
    if (!data) {
      fail(`${label}: payload inválido o versión incorrecta`)
      return
    }
    ok(`${label}: documento recibido`)
    if (data._schemaVersion !== undefined) fail(`${label}: _schemaVersion no eliminado`)
  } catch (err) {
    fail(`${label}: ${err.message}`)
  }
}

if (useSanity && configured) {
  await tryFetch('homePage', projectId, dataset, QUERIES.HOME_QUERY)
  await tryFetch('servicesPage', projectId, dataset, QUERIES.SERVICES_QUERY)
} else {
  ok('Omitido (activa VITE_USE_SANITY=true y projectId real para probar fetch)')
}

console.log('\n[cms:smoke] 5 — Error handling (projectId inválido)\n')

try {
  const bad = createClient({
    projectId: 'invalid-project-id-xyz',
    dataset: 'production',
    apiVersion: '2024-05-28',
    useCdn: false,
  })
  await bad.fetch(QUERIES.HOME_QUERY)
  fail('projectId inválido no debería resolver')
} catch {
  ok('projectId inválido → error de red/API (frontend usa fallback local)')
}

console.log('\n[cms:smoke] Fin\n')
if (process.exitCode) {
  console.log('Algunas pruebas fallaron.\n')
} else {
  console.log('Todas las pruebas automáticas pasaron.\n')
  console.log('Siguiente: pruebas manuales en navegador (ver docs/SANITY_INTEGRACION.md)\n')
}
