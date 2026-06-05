import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { parseEnvFile } from './parseEnvFile.js'
import { findUtilcarWebRoot } from './findUtilcarWebRoot.js'

const PROJECT_ID_KEYS = [
  'SANITY_PROJECT_ID',
  'SANITY_STUDIO_PROJECT_ID',
  'VITE_SANITY_PROJECT_ID',
]

const DATASET_KEYS = ['SANITY_DATASET', 'SANITY_STUDIO_DATASET', 'VITE_SANITY_DATASET']

const TOKEN_KEYS = ['SANITY_API_TOKEN', 'SANITY_AUTH_TOKEN']

function pickFirst(env, keys) {
  for (const key of keys) {
    const val = env[key]?.trim()
    if (val) return { value: val, key }
  }
  return { value: '', key: null }
}

/**
 * Carga variables Sanity desde .env del monorepo (sin depender de PowerShell).
 *
 * Orden (último gana): utilcar-web/.env.local → .env → utilcar-web/utilcar-studio/.env.local → .env
 * process.env tiene prioridad sobre archivos.
 *
 * @param {{ startDir?: string, requireToken?: boolean, requireProjectId?: boolean, defaultDataset?: string }} [options]
 */
export function loadSanityEnv(options = {}) {
  const {
    startDir = process.cwd(),
    requireToken = false,
    requireProjectId = true,
    defaultDataset = 'production',
  } = options

  const webRoot = findUtilcarWebRoot(startDir)
  if (!webRoot) {
    throw new Error(
      'No se encontró utilcar-web. Ejecute los scripts desde utilcar-web/ o utilcar-web/utilcar-studio/.',
    )
  }

  const studioRoot = join(webRoot, 'utilcar-studio')

  /** @type {Array<{ path: string, label: string }>} */
  const envFileEntries = [
    { path: join(webRoot, '.env.local'), label: 'utilcar-web/.env.local' },
    { path: join(webRoot, '.env'), label: 'utilcar-web/.env' },
    { path: join(studioRoot, '.env.local'), label: 'utilcar-web/utilcar-studio/.env.local' },
    { path: join(studioRoot, '.env'), label: 'utilcar-web/utilcar-studio/.env' },
  ]

  /** Valores solo desde archivos (para diagnóstico de fuentes). */
  const fromFiles = {}
  const fileSources = {}

  for (const { path, label } of envFileEntries) {
    if (!existsSync(path)) continue
    const parsed = parseEnvFile(path)
    for (const [key, value] of Object.entries(parsed)) {
      fromFiles[key] = value
      fileSources[key] = label
    }
  }

  /** process.env gana sobre archivos. */
  const merged = { ...fromFiles, ...process.env }

  const project = pickFirst(merged, PROJECT_ID_KEYS)
  const datasetPick = pickFirst(merged, DATASET_KEYS)
  const tokenPick = pickFirst(merged, TOKEN_KEYS)

  const projectId = project.value
  const dataset = datasetPick.value || defaultDataset
  const token = tokenPick.value

  const sources = {
    projectId: process.env[project.key ?? ''] ? 'process.env' : fileSources[project.key ?? ''] ?? null,
    dataset: process.env[datasetPick.key ?? ''] ? 'process.env' : fileSources[datasetPick.key ?? ''] ?? null,
    token: process.env[tokenPick.key ?? ''] ? 'process.env' : fileSources[tokenPick.key ?? ''] ?? null,
  }

  if (requireProjectId && !projectId) {
    throw new Error(
      [
        'Falta SANITY_PROJECT_ID (o SANITY_STUDIO_PROJECT_ID / VITE_SANITY_PROJECT_ID).',
        'Defínalo en utilcar-web/.env.local o utilcar-web/utilcar-studio/.env',
      ].join('\n'),
    )
  }

  if (requireToken && !token) {
    throw new Error(
      [
        'Falta SANITY_API_TOKEN.',
        'Cree un token con permisos de escritura en sanity.io/manage y añádalo a utilcar-web/.env.local',
      ].join('\n'),
    )
  }

  function applyToProcessEnv() {
    if (projectId) {
      process.env.SANITY_PROJECT_ID = projectId
      process.env.SANITY_STUDIO_PROJECT_ID = projectId
      process.env.VITE_SANITY_PROJECT_ID = projectId
    }
    if (dataset) {
      process.env.SANITY_DATASET = dataset
      process.env.SANITY_STUDIO_DATASET = dataset
      process.env.VITE_SANITY_DATASET = dataset
    }
    if (token) {
      process.env.SANITY_API_TOKEN = token
      process.env.SANITY_AUTH_TOKEN = token
    }
  }

  return {
    webRoot,
    studioRoot,
    projectId,
    dataset,
    token,
    sources,
    envFiles: envFileEntries.filter((e) => existsSync(e.path)).map((e) => e.label),
    applyToProcessEnv,
  }
}
