/**
 * Auditoría de imágenes en serviceSubPage.
 * npm run audit:service-images
 */
import { existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createAuditClient,
  SERVICE_SUB_PAGE_KEYS,
  SERVICE_SUB_PAGE_TAB_KEYS,
  serviceSubPageDocumentId,
  HERO_FALLBACK_FILES,
  SERVICE_IMAGE_QUERY,
  WORK_PROJECTS_BY_CATEGORY,
  MIN_SERVICE_PORTFOLIO_PROJECTS,
  isValidHttpUrl,
  formatBytes,
  imageFormatFromUrl,
} from './lib/imageAuditShared.mjs'

const WEB_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function assetUrl(asset) {
  return asset?.url ?? null
}

function auditImageField(image, label, errors, warnings, stats) {
  if (!image?.asset?._id && !image?.asset?.url) {
    errors.push(`${label}: sin asset`)
    return
  }
  const url = assetUrl(image.asset)
  if (!isValidHttpUrl(url)) {
    errors.push(`${label}: URL inválida`)
    return
  }
  stats.imagesChecked += 1
  const fmt = imageFormatFromUrl(url)
  stats.formats[fmt] = (stats.formats[fmt] ?? 0) + 1
  if (image.asset?.size) stats.totalBytes += image.asset.size
  if (!String(image?.alt ?? '').trim() && !String(image?.imageAlt ?? '').trim()) {
    warnings.push(`${label}: sin alt text`)
  }
}

export async function runAudit() {
  const client = createAuditClient()
  const docs = await client.fetch(SERVICE_IMAGE_QUERY)
  const byKey = Object.fromEntries(docs.map((d) => [d.pageKey, d]))

  let totalErrors = 0
  let totalWarnings = 0
  let servicesWithErrors = 0
  let imagesChecked = 0
  const formats = {}
  let totalBytes = 0
  const usedAssetIds = new Set()

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría imágenes — serviceSubPage')
  console.info('══════════════════════════════════════\n')

  for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {
    const doc = byKey[pageKey]
    const errors = []
    const warnings = []
    const lines = []
    const stats = { imagesChecked: 0, formats, totalBytes: 0 }

    if (!doc) {
      errors.push('documento publicado no existe')
      totalErrors += 1
      console.info(`SERVICE: ${title}`)
      console.info('✗ documento no encontrado\n')
      continue
    }

    const hero = blockOfType(doc.blocks, 'heroBlock')
    const portfolio = blockOfType(doc.blocks, 'portfolioBlock')
    const heroImage = hero?.image
    const heroAlt = hero?.imageAlt ?? heroImage?.alt

    if (!heroImage?.asset?._id) {
      const fallback = HERO_FALLBACK_FILES[pageKey]
      const fallbackExists = fallback && existsSync(join(WEB_ROOT, fallback))
      if (fallbackExists) {
        warnings.push('hero usa fallback local (sin imagen CMS)')
        lines.push('⚠ hero image (fallback local)')
      } else {
        errors.push('hero sin imagen CMS ni fallback local')
        lines.push('✗ hero image')
      }
    } else {
      usedAssetIds.add(heroImage.asset._id)
      auditImageField(
        { ...heroImage, alt: heroAlt },
        'hero',
        errors,
        warnings,
        stats,
      )
      lines.push(errors.some((e) => e.startsWith('hero')) ? '✗ hero image' : '✓ hero image')
      if (warnings.some((w) => w.includes('hero') && w.includes('alt'))) {
        lines.push('⚠ image without alt')
      } else if (heroImage?.asset) {
        lines.push('✓ alt text')
      }
    }

    const embeddedPortfolio = (portfolio?.items ?? []).filter((i) => i?.image?.asset)
    if (embeddedPortfolio.length) {
      for (const [i, item] of embeddedPortfolio.entries()) {
        auditImageField(item.image, `portfolio[${i}]`, errors, warnings, stats)
        if (item.image?.asset?._id) usedAssetIds.add(item.image.asset._id)
      }
      lines.push('✓ portfolio images (embebidas)')
    } else {
      const projects = await client.fetch(WORK_PROJECTS_BY_CATEGORY, { category: pageKey })
      const withImage = projects.filter((p) => p.image?.asset?.url)
      if (withImage.length < MIN_SERVICE_PORTFOLIO_PROJECTS) {
        const msg = `portfolio insuficiente (${withImage.length}/${MIN_SERVICE_PORTFOLIO_PROJECTS} workProjects con imagen)`
        errors.push(msg)
        lines.push(`✗ portfolio images (${withImage.length})`)
      } else {
        for (const p of withImage) {
          stats.imagesChecked += 1
          if (p.image?.asset?._id) usedAssetIds.add(p.image.asset._id)
          if (p.image?.asset?.size) totalBytes += p.image.asset.size
          const fmt = imageFormatFromUrl(p.image.asset.url)
          formats[fmt] = (formats[fmt] ?? 0) + 1
        }
        lines.push(`✓ portfolio images (${withImage.length} workProjects)`)
      }
    }

    if (SERVICE_SUB_PAGE_TAB_KEYS.includes(pageKey)) {
      const tabs = doc.tabs ?? []
      let galleryCount = 0
      let emptyGalleries = 0
      for (const tab of tabs) {
        const gallery = tab.gallery ?? []
        if (!gallery.length) {
          emptyGalleries += 1
          errors.push(`tab "${tab.id}": galería vacía`)
          continue
        }
        if (gallery.length < 3) {
          warnings.push(`tab "${tab.id}": galería con menos de 3 imágenes (${gallery.length})`)
        }
        for (const [gi, item] of gallery.entries()) {
          if (!item._key) errors.push(`tab ${tab.id} gallery[${gi}] sin _key`)
          if (!item.image?.asset) {
            errors.push(`tab ${tab.id} gallery[${gi}] sin imagen`)
            continue
          }
          galleryCount += 1
          usedAssetIds.add(item.image.asset._id)
          auditImageField(
            { ...item.image, alt: item.alt ?? item.image?.alt },
            `tab:${tab.id}/gallery[${gi}]`,
            errors,
            warnings,
            stats,
          )
        }
      }
      lines.push(
        galleryCount > 0 ? '✓ tabs galleries' : emptyGalleries ? '⚠ tabs galleries (vacías)' : '✗ tabs galleries',
      )
    }

    imagesChecked += stats.imagesChecked
    if (errors.length) servicesWithErrors += 1
    totalErrors += errors.length
    totalWarnings += warnings.length

    console.info(`SERVICE: ${title}`)
    for (const line of lines) console.info(line)
    for (const err of errors) console.info(`  ERROR: ${err}`)
    for (const warn of warnings) console.info(`  WARN: ${warn}`)
    console.info('')
  }

  console.info('── Resumen ──\n')
  console.info(`Services audited: ${SERVICE_SUB_PAGE_KEYS.length}`)
  console.info(`Images checked: ${imagesChecked}`)
  console.info(`Warnings: ${totalWarnings}`)
  console.info(`Errors: ${totalErrors}`)
  if (totalBytes) console.info(`Estimated CMS payload: ${formatBytes(totalBytes)}`)
  console.info(`Unique Sanity assets referenced: ${usedAssetIds.size}`)

  return {
    errors: totalErrors,
    warnings: totalWarnings,
    imagesChecked,
    formats,
    servicesPassed: SERVICE_SUB_PAGE_KEYS.length - servicesWithErrors,
  }
}

const isMain = process.argv[1]?.endsWith('audit-service-images.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}
