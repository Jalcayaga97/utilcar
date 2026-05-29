/**
 * Prebuild: genera WebP espejo de public/ → public/webp/ (gitignored).
 * Los assets importados por Vite los procesa vite-plugin-webp en build/dev.
 *
 * Ejecutado automáticamente vía npm prebuild antes de vite build.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectImageFiles, writeWebpMirror } from './webp-utils.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'public')
const PUBLIC_WEBP_DIR = path.join(PUBLIC_DIR, 'webp')

/** Rutas legacy que ya no deben usarse en el repo */
const LEGACY_WEBP_DIRS = [
  path.join(ROOT, 'src', 'assets', 'webp'),
  path.join(ROOT, 'src', 'assets', 'webp', 'images'),
]

async function removeLegacyWebpDirs() {
  for (const dir of LEGACY_WEBP_DIRS) {
    try {
      await fs.rm(dir, { recursive: true, force: true })
    } catch {
      // ignorar
    }
  }
}

async function cleanPublicWebpOutput() {
  await fs.rm(PUBLIC_WEBP_DIR, { recursive: true, force: true })
  await fs.mkdir(PUBLIC_WEBP_DIR, { recursive: true })
}

async function generatePublicWebp() {
  const files = await collectImageFiles(PUBLIC_DIR, new Set(['webp']))
  if (!files.length) {
    console.log('[webp:prebuild] public/ — sin imágenes raster.')
    return 0
  }

  let converted = 0
  for (const file of files) {
    const { relative } = await writeWebpMirror(file, PUBLIC_DIR, PUBLIC_WEBP_DIR)
    converted += 1
    console.log(`  ✓ public/${relative}`)
  }

  console.log(`[webp:prebuild] ${converted} WebP → public/webp/`)
  return converted
}

async function main() {
  console.log('[webp:prebuild] Generando WebP de public/…\n')
  await removeLegacyWebpDirs()
  await cleanPublicWebpOutput()
  const count = await generatePublicWebp()
  console.log(`\n[webp:prebuild] Listo (${count} archivos). Carpeta gitignored, no commitear.`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
