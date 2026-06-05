import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { findUtilcarWebRoot } from './findUtilcarWebRoot.js'

export const STUDIO_CONFIG_FILENAMES = [
  'sanity.cli.cjs',
  'sanity.cli.js',
  'sanity.cli.ts',
  'sanity.config.js',
  'sanity.config.ts',
]

/**
 * @param {string} dir
 * @returns {{ studioRoot: string, cliConfigPath: string, configFilename: string } | null}
 */
export function detectStudioInDirectory(dir) {
  if (!dir || !existsSync(dir)) return null
  for (const filename of STUDIO_CONFIG_FILENAMES) {
    const cliConfigPath = join(dir, filename)
    if (existsSync(cliConfigPath)) {
      return { studioRoot: dir, cliConfigPath, configFilename: filename }
    }
  }
  return null
}

/**
 * Detecta el Studio Sanity (única fuente: utilcar-web/utilcar-studio).
 * Fallback: cwd y directorios padre (p. ej. ejecutar desde utilcar-studio/).
 *
 * @param {{ startDir?: string, webRoot?: string }} [options]
 * @returns {{ studioRoot: string, cliConfigPath: string, configFilename: string, source: string }}
 */
export function findSanityStudioRoot(options = {}) {
  const startDir = options.startDir ?? process.cwd()
  const webRoot = options.webRoot ?? findUtilcarWebRoot(startDir)

  /** @type {Array<{ dir: string, source: string }>} */
  const candidates = []

  if (webRoot) {
    candidates.push({
      dir: join(webRoot, 'utilcar-studio'),
      source: 'utilcar-web/utilcar-studio',
    })
  }

  let walk = startDir
  while (walk && walk !== dirname(walk)) {
    candidates.push({ dir: walk, source: `cwd: ${walk}` })
    walk = dirname(walk)
  }

  const seen = new Set()
  for (const { dir, source } of candidates) {
    const normalized = dir.replace(/\\/g, '/')
    if (seen.has(normalized)) continue
    seen.add(normalized)

    const hit = detectStudioInDirectory(dir)
    if (hit) {
      return { ...hit, source }
    }
  }

  const hint = [
    'No se encontró sanity.cli.* ni sanity.config.* en:',
    '  • utilcar-web/utilcar-studio/',
    '  • directorio actual (y padres)',
  ].join('\n')

  throw new Error(hint)
}
