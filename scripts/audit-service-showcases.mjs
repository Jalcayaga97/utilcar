/**
 * Auditoría showcaseCarouselBlock en serviceSubPage.
 * npm run audit:service-showcases
 */
import {
  createAuditClient,
  SERVICE_SUB_PAGE_KEYS,
  serviceSubPageDocumentId,
} from './lib/imageAuditShared.mjs'

const MIN_IMAGES = 5

const QUERY = `*[_type == "serviceSubPage"]{
  _id,
  pageKey,
  blocks[]{
    _type,
    _key,
    enabled,
    images[]{
      _key,
      alt,
      title,
      image{ asset->{ _id, url } }
    }
  }
}`

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

export async function runAudit() {
  const client = createAuditClient()
  const docs = await client.fetch(QUERY)

  let errors = 0
  let warnings = 0
  const lines = []

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría — Carruseles de servicio')
  console.info('══════════════════════════════════════\n')

  for (const { value: pageKey, title } of SERVICE_SUB_PAGE_KEYS) {
    const doc = docs.find((d) => d.pageKey === pageKey)
    const docId = serviceSubPageDocumentId(pageKey)

    if (!doc) {
      errors += 1
      lines.push(`✗ ${title}: documento ${docId} no publicado`)
      continue
    }

    const block = blockOfType(doc.blocks, 'showcaseCarouselBlock')
    if (!block) {
      errors += 1
      lines.push(`✗ ${title}: showcaseCarouselBlock ausente`)
      continue
    }

    if (block.enabled === false) {
      warnings += 1
      lines.push(`⚠ ${title}: bloque deshabilitado`)
    }

    const images = block.images ?? []
    if (images.length < MIN_IMAGES) {
      errors += 1
      lines.push(`✗ ${title}: ${images.length}/${MIN_IMAGES} imágenes`)
      continue
    }

    let invalidAlt = 0
    let invalidAsset = 0
    for (const img of images) {
      if (!String(img?.alt ?? '').trim()) invalidAlt += 1
      if (!img?.image?.asset?._id && !img?.image?.asset?.url) invalidAsset += 1
    }

    if (invalidAlt) {
      errors += 1
      lines.push(`✗ ${title}: ${invalidAlt} imagen(es) sin alt`)
      continue
    }
    if (invalidAsset) {
      errors += 1
      lines.push(`✗ ${title}: ${invalidAsset} asset(s) inválido(s)`)
      continue
    }

    lines.push(`✓ ${title}: showcase OK (${images.length} imgs)`)
  }

  for (const line of lines) console.info(line)

  console.info('\n── Resumen ──')
  console.info(`Servicios: ${SERVICE_SUB_PAGE_KEYS.length}`)
  console.info(`Errores: ${errors}`)
  console.info(`Advertencias: ${warnings}`)

  return { errors, warnings, passed: errors === 0 }
}

const result = await runAudit()
if (result.errors > 0) process.exit(1)
