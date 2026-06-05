import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

function readPackageName(dir) {
  const pkgPath = join(dir, 'package.json')
  if (!existsSync(pkgPath)) return null
  try {
    return JSON.parse(readFileSync(pkgPath, 'utf8')).name ?? null
  } catch {
    return null
  }
}

function isUtilcarWebRoot(dir) {
  if (readPackageName(dir) === 'utilcar-web') return true
  const marker = join(dir, 'scripts', 'migrate-services-content.mjs')
  const services = join(dir, 'src', 'content', 'services.js')
  return existsSync(marker) && existsSync(services)
}

/** Hermano típico en monorepo: utilcar-studio → ../utilcar-web */
function siblingUtilcarWeb(dir) {
  const candidates = [join(dirname(dir), 'utilcar-web'), join(dir, 'utilcar-web')]
  for (const candidate of candidates) {
    if (isUtilcarWebRoot(candidate)) return candidate
  }
  return null
}

/**
 * Localiza la raíz de utilcar-web subiendo desde startDir (o hermano en monorepo).
 * @param {string} [startDir]
 * @returns {string | null}
 */
export function findUtilcarWebRoot(startDir = process.cwd()) {
  let dir = startDir
  while (dir && dir !== dirname(dir)) {
    if (isUtilcarWebRoot(dir)) return dir

    const sibling = siblingUtilcarWeb(dir)
    if (sibling) return sibling

    dir = dirname(dir)
  }
  return null
}
