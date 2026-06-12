/**
 * Auditoría de formatos de imagen (local + Sanity referenciados).
 * npm run audit:image-formats
 */
import { statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createAuditClient,
  SERVICE_IMAGE_QUERY,
  extFromPath,
  formatBytes,
  estimateWebpSavingsBytes,
  imageFormatFromUrl,
  collectLocalRasterFiles,
} from './lib/imageAuditShared.mjs'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS_DIR = join(WEB_ROOT, 'src', 'assets')

function bump(counts, key) {
  counts[key] = (counts[key] ?? 0) + 1
}

export async function runAudit() {
  const counts = { webp: 0, jpg: 0, jpeg: 0, png: 0, other: 0 }
  let totalBytes = 0
  let savingsBytes = 0

  const localFiles = await collectLocalRasterFiles(ASSETS_DIR, new Set(['node_modules']))
  for (const file of localFiles) {
    const ext = extFromPath(file)
    if (ext === 'webp') bump(counts, 'webp')
    else if (ext === 'jpg') bump(counts, 'jpg')
    else if (ext === 'jpeg') bump(counts, 'jpeg')
    else if (ext === 'png') bump(counts, 'png')
    else bump(counts, 'other')
    try {
      const size = statSync(file).size
      totalBytes += size
      if (ext !== 'webp') savingsBytes += estimateWebpSavingsBytes(size)
    } catch {
      // ignore
    }
  }

  const client = createAuditClient()
  const docs = await client.fetch(SERVICE_IMAGE_QUERY)
  const seenUrls = new Set()

  function trackUrl(url, size) {
    if (!url || seenUrls.has(url)) return
    seenUrls.add(url)
    const fmt = imageFormatFromUrl(url)
    if (counts[fmt] != null) bump(counts, fmt)
    else bump(counts, 'other')
    if (size) {
      totalBytes += size
      if (fmt !== 'webp') savingsBytes += estimateWebpSavingsBytes(size)
    }
  }

  for (const doc of docs) {
    for (const block of doc.blocks ?? []) {
      if (block.image?.asset?.url) trackUrl(block.image.asset.url, block.image.asset.size)
      if (block.ogImage?.asset?.url) trackUrl(block.ogImage.asset.url, block.ogImage.asset.size)
      for (const item of block.items ?? []) {
        if (item.image?.asset?.url) trackUrl(item.image.asset.url, item.image.asset.size)
      }
    }
    for (const tab of doc.tabs ?? []) {
      for (const g of tab.gallery ?? []) {
        if (g.image?.asset?.url) trackUrl(g.image.asset.url, g.image.asset.size)
      }
    }
  }

  const total =
    counts.webp + counts.jpg + counts.jpeg + counts.png + counts.other

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría formatos de imagen')
  console.info('══════════════════════════════════════\n')
  console.info(`Total assets: ${total}`)
  console.info('')
  console.info(`webp: ${counts.webp}`)
  console.info(`jpg: ${counts.jpg}`)
  console.info(`jpeg: ${counts.jpeg}`)
  console.info(`png: ${counts.png}`)
  if (counts.other) console.info(`other: ${counts.other}`)
  console.info('')
  console.info(`Total size (est.): ${formatBytes(totalBytes)}`)
  console.info(`Potential savings:\n~${formatBytes(savingsBytes)}`)

  return { counts, total, savingsBytes, errors: 0, warnings: 0 }
}

const isMain = process.argv[1]?.endsWith('audit-image-formats.mjs')
if (isMain) {
  await runAudit()
}
