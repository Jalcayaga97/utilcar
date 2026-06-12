/**
 * Genera WebP espejo de imágenes locales (mantiene originales).
 * npm run migrate:local-images-webp
 * npm run migrate:local-images-webp -- --dry
 */
import { statSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectImageFiles, writeWebpMirror, WEBP_QUALITY } from './webp-utils.js'
import { collectLocalRasterFiles, formatBytes, extFromPath } from './lib/imageAuditShared.mjs'

const dryRun = process.argv.includes('--dry')
const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SCAN_TARGETS = [
  { root: join(WEB_ROOT, 'src', 'assets'), mirror: false },
  { root: join(WEB_ROOT, 'public'), mirror: true, mirrorRoot: join(WEB_ROOT, 'public', 'webp') },
]

export async function runMigration() {
  let converted = 0
  let skipped = 0
  let pending = 0
  let originalBytes = 0
  let webpBytes = 0

  console.info('\n══════════════════════════════════════')
  console.info('  Migración WebP — assets locales')
  console.info('══════════════════════════════════════\n')

  for (const target of SCAN_TARGETS) {
    const rasterFiles = target.mirror
      ? await collectImageFiles(target.root, new Set(['webp', 'node_modules']))
      : (await collectLocalRasterFiles(target.root, new Set(['node_modules']))).filter(
          (f) => extFromPath(f) !== 'webp',
        )

    for (const file of rasterFiles) {
      const ext = extFromPath(file)
      if (ext === 'webp') continue
      pending += 1
      let size = 0
      try {
        size = statSync(file).size
        originalBytes += size
      } catch {
        // ignore
      }

      const webpSidecar = file.replace(/\.(jpe?g|png|jfif)$/i, '.webp')
      if (existsSync(webpSidecar)) {
        skipped += 1
        try {
          webpBytes += statSync(webpSidecar).size
        } catch {
          // ignore
        }
        continue
      }

      if (dryRun) {
        converted += 1
        webpBytes += Math.round(size * 0.65)
        continue
      }

      if (target.mirror) {
        const { outputPath } = await writeWebpMirror(file, target.root, target.mirrorRoot)
        converted += 1
        try {
          webpBytes += statSync(outputPath).size
        } catch {
          // ignore
        }
      } else {
        const { outputPath } = await writeWebpMirror(file, target.root, target.root)
        converted += 1
        try {
          webpBytes += statSync(outputPath).size
        } catch {
          // ignore
        }
      }
    }
  }

  const estimatedSavings = originalBytes - webpBytes
  const stillPending = pending - converted - skipped

  console.info(`Archivos raster detectados: ${pending}`)
  console.info(`Convertidos:              ${converted}${dryRun ? ' (dry-run)' : ''}`)
  console.info(`Ya existían WebP:         ${skipped}`)
  console.info(`Pendientes:               ${stillPending}`)
  console.info(`Peso original (est.):     ${formatBytes(originalBytes)}`)
  console.info(`Peso WebP (real/est.):    ${formatBytes(webpBytes)}`)
  console.info(`Ahorro estimado:          ~${formatBytes(Math.max(0, estimatedSavings))}`)
  console.info(`Calidad WebP:             ${WEBP_QUALITY}`)
  console.info('\n(originales conservados — Sanity usa fm=webp en CDN)')

  return { converted, skipped, pending: stillPending, originalBytes, webpBytes }
}

const isMain = process.argv[1]?.endsWith('migrate-local-images-webp.mjs')
if (isMain) {
  await runMigration()
}
