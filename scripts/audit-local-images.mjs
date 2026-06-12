/**
 * Auditoría de imágenes locales (sin conversión).
 * npm run audit:local-images
 */
import { statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  extFromPath,
  formatBytes,
  estimateWebpSavingsBytes,
  collectLocalRasterFiles,
} from './lib/imageAuditShared.mjs'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SCAN_DIRS = [
  join(WEB_ROOT, 'src', 'assets'),
  join(WEB_ROOT, 'public'),
]

export async function runAudit() {
  const counts = { jpg: 0, jpeg: 0, png: 0, webp: 0 }
  let totalBytes = 0
  let savingsBytes = 0
  const files = []

  for (const dir of SCAN_DIRS) {
    const found = await collectLocalRasterFiles(dir, new Set(['node_modules']))
    files.push(...found)
  }

  for (const file of files) {
    const ext = extFromPath(file)
    if (ext === 'jpg') counts.jpg += 1
    else if (ext === 'jpeg') counts.jpeg += 1
    else if (ext === 'png') counts.png += 1
    else if (ext === 'webp') counts.webp += 1
    try {
      const size = statSync(file).size
      totalBytes += size
      if (ext !== 'webp') savingsBytes += estimateWebpSavingsBytes(size)
    } catch {
      // ignore
    }
  }

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría imágenes locales')
  console.info('══════════════════════════════════════\n')
  console.info(`Archivos raster: ${files.length}`)
  console.info(`jpg: ${counts.jpg}`)
  console.info(`jpeg: ${counts.jpeg}`)
  console.info(`png: ${counts.png}`)
  console.info(`webp: ${counts.webp}`)
  console.info(`\nPeso total: ${formatBytes(totalBytes)}`)
  console.info(`Ahorro estimado WebP: ~${formatBytes(savingsBytes)}`)
  console.info('\n(solo lectura — sin conversión ni eliminación)')

  return {
    counts,
    totalFiles: files.length,
    totalBytes,
    savingsBytes,
    pending: counts.jpg + counts.jpeg + counts.png,
    errors: 0,
    warnings: 0,
  }
}

const isMain = process.argv[1]?.endsWith('audit-local-images.mjs')
if (isMain) {
  await runAudit()
}
