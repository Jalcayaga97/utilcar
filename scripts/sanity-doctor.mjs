/**
 * Diagnóstico del runtime Sanity (env, Studio, permisos).
 * npm run sanity:doctor
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { findSanityStudioRoot } from '../src/lib/sanity/runtime/findSanityStudioRoot.js'
import { findUtilcarWebRoot } from '../src/lib/sanity/runtime/findUtilcarWebRoot.js'

const env = loadSanityEnv({ requireToken: false })
env.applyToProcessEnv()

const webRoot = env.webRoot ?? findUtilcarWebRoot()
const studio = findSanityStudioRoot({ webRoot })

console.info('\n══════════════════════════════════════')
console.info('  Sanity Doctor — Utilcar')
console.info('══════════════════════════════════════\n')

console.info(`utilcar-web root:     ${webRoot}`)
console.info(`Studio root:          ${studio.studioRoot}`)
console.info(`  (${studio.source})`)
console.info(`CLI / config:         ${studio.configFilename}`)
console.info(`  ${studio.cliConfigPath}`)
if (studio.configFilename?.endsWith('.cjs')) {
  console.info('  (export usa sandbox CJS temporal — ver docs/SANITY_RUNTIME_SETUP.md)')
}
console.info('')
console.info(`Project ID:           ${env.projectId}`)
console.info(`  fuente:             ${env.sources.projectId ?? '—'}`)
console.info(`Dataset:              ${env.dataset}`)
console.info(`  fuente:             ${env.sources.dataset ?? 'default'}`)
console.info(`Token presente:       ${env.token ? 'sí' : 'no'}`)
if (env.token) {
  console.info(`  fuente:             ${env.sources.token ?? '—'}`)
}
console.info('')
console.info('Archivos .env cargados:')
for (const f of env.envFiles.length ? env.envFiles : ['(ninguno encontrado)']) {
  console.info(`  • ${f}`)
}

if (!env.token) {
  console.info('\n⚠ Sin token: migrate/snapshot requieren SANITY_API_TOKEN en .env.local\n')
  process.exit(0)
}

const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: '2024-05-28',
  token: env.token,
  useCdn: false,
})

console.info('\n── Permisos de lectura ──\n')

try {
  const count = await client.fetch('count(*[_type == "sanity.imageAsset"])')
  console.info(`  ✓ API OK — image assets visibles: ${count}`)
} catch (err) {
  console.error(`  ✗ Error de lectura: ${err.message}`)
  process.exit(1)
}

console.info('\n✓ Doctor completado.\n')
