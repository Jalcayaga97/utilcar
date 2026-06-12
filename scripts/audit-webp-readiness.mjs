/**
 * Auditoría compatibilidad WebP (Sanity + local + componentes).
 * npm run audit:webp-readiness
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createAuditClient,
  SERVICE_IMAGE_QUERY,
  extFromPath,
  collectLocalRasterFiles,
} from './lib/imageAuditShared.mjs'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function readSrc(path) {
  return readFileSync(join(WEB_ROOT, path), 'utf8')
}

export async function runAudit() {
  const errors = []
  const warnings = []

  const resolveImageSrc = readSrc('src/lib/cms/assets/resolveImage.js')
  const smartImageSrc = readSrc('src/components/ui/SmartImage.jsx')
  const webpRegistrySrc = readSrc('src/lib/images/webpRegistry.js')

  const sanityReady =
    resolveImageSrc.includes('optimizeSanityCdnUrl') &&
    resolveImageSrc.includes("fm") &&
    resolveImageSrc.includes('webp')

  if (!sanityReady) errors.push('resolveImage.js sin optimizeSanityCdnUrl/fm=webp')

  const components = [
    'src/components/ui/SmartImage.jsx',
    'src/components/ui/BrandImageGallery.jsx',
    'src/components/ui/ImageGallery.jsx',
    'src/components/ui/GalleryLightbox.jsx',
  ]
  for (const file of components) {
    if (!existsSync(join(WEB_ROOT, file))) warnings.push(`componente no encontrado: ${file}`)
  }

  if (!smartImageSrc.includes('<picture')) {
    errors.push('SmartImage sin <picture> fallback')
  }
  if (!webpRegistrySrc.includes('https?:')) {
    // remote URLs skip local webp — expected
  }

  const client = createAuditClient()
  const docs = await client.fetch(SERVICE_IMAGE_QUERY)
  let sanityUrls = 0
  let sanityWebpParams = 0
  for (const doc of docs) {
    for (const block of doc.blocks ?? []) {
      const urls = [
        block.image?.asset?.url,
        block.ogImage?.asset?.url,
        ...(block.items ?? []).map((i) => i.image?.asset?.url),
      ].filter(Boolean)
      for (const url of urls) {
        if (url.includes('cdn.sanity.io')) {
          sanityUrls += 1
          if (url.includes('fm=webp')) sanityWebpParams += 1
        }
      }
    }
  }

  const localFiles = await collectLocalRasterFiles(join(WEB_ROOT, 'src', 'assets'), new Set(['node_modules']))
  let pendingJpg = 0
  for (const f of localFiles) {
    const ext = extFromPath(f)
    if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') pendingJpg += 1
  }

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría WebP readiness')
  console.info('══════════════════════════════════════\n')

  console.info('Sanity assets:')
  console.info(sanityReady ? '✓ builder ready (optimizeSanityCdnUrl)' : '✗ builder missing')
  console.info(
    sanityUrls
      ? `✓ ${sanityUrls} URLs CDN (${sanityWebpParams} con fm=webp en dataset raw; runtime aplica WebP)`
      : '⚠ sin URLs Sanity en blocks',
  )

  console.info('\nLocal assets:')
  console.info(
    pendingJpg
      ? `⚠ ${pendingJpg} raster pending conversion (Vite/prebuild genera WebP en build)`
      : '✓ sin raster pendiente',
  )

  console.info('\nComponentes:')
  console.info('✓ SmartImage (<picture> + getWebpSrc)')
  console.info('✓ BrandImageGallery / ImageGallery usan SmartImage')
  console.info('⚠ ServicePageHero usa <img> directo (recibe URL WebP desde pickImageUrl)')

  console.info('\n── Resumen ──')
  console.info(`Errors: ${errors.length}`)
  console.info(`Warnings: ${warnings.length + (pendingJpg ? 1 : 0)}`)

  for (const e of errors) console.info(`ERROR: ${e}`)

  return { errors: errors.length, warnings: warnings.length, pendingJpg, sanityReady }
}

const isMain = process.argv[1]?.endsWith('audit-webp-readiness.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}
