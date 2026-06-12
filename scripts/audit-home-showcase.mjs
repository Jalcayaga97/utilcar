/**
 * Auditoría showcaseCarouselBlock en homePage.
 * npm run audit:home-showcase
 */
import { createAuditClient } from './lib/imageAuditShared.mjs'

const MIN_IMAGES = 5
const DOC_ID = 'homePage'

const QUERY = `*[_id == "${DOC_ID}"][0]{
  _id,
  blocks[]{
    _type,
    _key,
    enabled,
    order,
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

function blockIndex(blocks, type) {
  return (blocks ?? []).findIndex((b) => b._type === type)
}

/**
 * @param {object[] | undefined} blocks
 * @returns {{ errors: number, warnings: number, lines: string[] }}
 */
export function auditHomeShowcaseBlocks(blocks) {
  let errors = 0
  let warnings = 0
  const lines = []

  const block = blockOfType(blocks, 'showcaseCarouselBlock')
  if (!block) {
    errors += 1
    lines.push('✗ showcaseCarouselBlock ausente')
    return { errors, warnings, lines }
  }

  lines.push('✓ showcaseCarouselBlock presente')

  if (block.enabled === false) {
    warnings += 1
    lines.push('⚠ bloque deshabilitado')
  } else {
    lines.push('✓ bloque habilitado')
  }

  const heroIdx = blockIndex(blocks, 'heroBlock')
  const showcaseIdx = blockIndex(blocks, 'showcaseCarouselBlock')
  if (heroIdx < 0) {
    warnings += 1
    lines.push('⚠ heroBlock ausente (no se puede validar posición)')
  } else if (showcaseIdx !== heroIdx + 1) {
    errors += 1
    lines.push(`✗ bloque no está inmediatamente después del hero (índice ${showcaseIdx}, esperado ${heroIdx + 1})`)
  } else {
    lines.push('✓ posición correcta (después del hero)')
  }

  const images = block.images ?? []
  if (images.length < MIN_IMAGES) {
    errors += 1
    lines.push(`✗ ${images.length}/${MIN_IMAGES} imágenes`)
  } else {
    lines.push(`✓ ${images.length} imágenes`)
  }

  let invalidAlt = 0
  let invalidAsset = 0
  for (const img of images) {
    if (!String(img?.alt ?? '').trim()) invalidAlt += 1
    if (!img?.image?.asset?._id && !img?.image?.asset?.url) invalidAsset += 1
  }

  if (invalidAlt) {
    errors += 1
    lines.push(`✗ ${invalidAlt} imagen(es) sin alt`)
  } else if (images.length) {
    lines.push('✓ alt en todas las imágenes')
  }

  if (invalidAsset) {
    errors += 1
    lines.push(`✗ ${invalidAsset} asset(s) inválido(s)`)
  } else if (images.length) {
    lines.push('✓ assets válidos')
  }

  return { errors, warnings, lines }
}

export async function runAudit({ silent = false } = {}) {
  const client = createAuditClient()
  const doc = await client.fetch(QUERY)

  if (!silent) {
    console.info('\n══════════════════════════════════════')
    console.info('  Auditoría — Carrusel destacado Home')
    console.info('══════════════════════════════════════\n')
  }

  if (!doc) {
    if (!silent) console.error(`✗ ${DOC_ID} no encontrado`)
    return { errors: 1, warnings: 0, passed: false, lines: [`✗ ${DOC_ID} no encontrado`] }
  }

  const result = auditHomeShowcaseBlocks(doc.blocks)

  if (!silent) {
    for (const line of result.lines) console.info(line)
    console.info('\n── Resumen ──')
    console.info(`Errores: ${result.errors}`)
    console.info(`Advertencias: ${result.warnings}`)
  }

  return {
    ...result,
    passed: result.errors === 0,
  }
}

const isMain = process.argv[1]?.endsWith('audit-home-showcase.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}
