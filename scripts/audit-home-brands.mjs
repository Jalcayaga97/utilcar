/**

 * Auditoría brandCarouselBlock en homePage.

 * npm run audit:home-brands

 */

import { createAuditClient } from './lib/imageAuditShared.mjs'

import { BRAND_NAMES, PLACEHOLDER_FILENAME } from './lib/brandLogoCatalog.mjs'



const MIN_BRANDS = 15

const DOC_ID = 'homePage'



const QUERY = `*[_id == "${DOC_ID}"][0]{

  _id,

  blocks[]{

    _type,

    _key,

    enabled,

    order,

    title,

    brands[]{

      _key,

      name,

      active,

      website,

      logo{

        alt,

        asset->{ _id, url, extension, originalFilename }

      }

    }

  }

}`



function blockOfType(blocks, type) {

  return (blocks ?? []).find((b) => b._type === type)

}



function blockIndex(blocks, type) {

  return (blocks ?? []).findIndex((b) => b._type === type)

}



function isPlaceholderLogo(brand) {
  const filename = String(brand?.logo?.asset?.originalFilename ?? '').toLowerCase()
  const url = String(brand?.logo?.asset?.url ?? '').toLowerCase()
  if (!filename && !url) return true
  if (filename === PLACEHOLDER_FILENAME) return true
  if (/logo\.jpe?g$/i.test(filename)) return true
  if (url.includes('logo.jpg')) return true
  return false
}



/**

 * @param {object[] | undefined} blocks

 */

export function auditHomeBrandsBlocks(blocks) {

  let errors = 0

  let warnings = 0

  const lines = []



  const block = blockOfType(blocks, 'brandCarouselBlock')

  if (!block) {

    errors += 1

    lines.push('✗ brandCarouselBlock ausente')

    return { errors, warnings, lines, passed: false }

  }



  lines.push('✓ brandCarouselBlock presente')



  if (block.enabled === false) {

    warnings += 1

    lines.push('⚠ bloque deshabilitado')

  } else {

    lines.push('✓ bloque habilitado')

  }



  const portfolioIdx = blockIndex(blocks, 'portfolioBlock')

  const galleryIdx = blockIndex(blocks, 'galleryBlock')

  const brandIdx = blockIndex(blocks, 'brandCarouselBlock')

  const portfolioOrGalleryIdx = portfolioIdx >= 0 ? portfolioIdx : galleryIdx



  if (portfolioOrGalleryIdx < 0) {

    warnings += 1

    lines.push('⚠ portfolioBlock ausente (no se puede validar posición)')

  } else if (brandIdx !== portfolioOrGalleryIdx + 1) {

    errors += 1

    lines.push(

      `✗ bloque no está después del portfolio (índice ${brandIdx}, esperado ${portfolioOrGalleryIdx + 1})`,

    )

  } else {

    lines.push('✓ posición correcta (después del portfolio)')

  }



  const activeBrands = (block.brands ?? []).filter((b) => b?.active !== false)

  if (activeBrands.length < MIN_BRANDS) {

    errors += 1

    lines.push(`✗ ${activeBrands.length}/${MIN_BRANDS} marcas activas`)

  } else {

    lines.push(`✓ ${activeBrands.length} marcas activas`)

  }



  const names = new Set()

  const assetIds = new Set()

  let invalidLogo = 0

  let missingName = 0

  let missingAlt = 0

  let placeholderCount = 0

  let duplicateAssets = 0



  for (const brand of activeBrands) {

    const name = String(brand?.name ?? '').trim()

    if (!name) {

      missingName += 1

      continue

    }

    if (names.has(name.toLowerCase())) {

      errors += 1

      lines.push(`✗ marca duplicada: ${name}`)

    }

    names.add(name.toLowerCase())



    const assetId = brand?.logo?.asset?._id

    if (!assetId && !brand?.logo?.asset?.url) {

      invalidLogo += 1

      continue

    }



    if (assetId) {

      if (assetIds.has(assetId)) {

        duplicateAssets += 1

      }

      assetIds.add(assetId)

    }



    const alt = String(brand?.logo?.alt ?? '').trim()

    if (!alt) {

      missingAlt += 1

    }



    if (isPlaceholderLogo(brand)) {

      placeholderCount += 1

      warnings += 1

      lines.push(`⚠ PLACEHOLDER_LOGO_FOUND: ${name}`)

    }

  }



  if (missingName) {

    errors += 1

    lines.push(`✗ ${missingName} marca(s) sin name`)

  } else if (activeBrands.length) {

    lines.push('✓ name presente en todas las marcas')

  }



  if (invalidLogo) {

    errors += 1

    lines.push(`✗ ${invalidLogo} logo(s) inválido(s)`)

  } else if (activeBrands.length) {

    lines.push('✓ logos presentes')

  }



  if (missingAlt) {

    errors += 1

    lines.push(`✗ ${missingAlt} logo(s) sin alt`)

  } else if (activeBrands.length) {

    lines.push('✓ alt presente en todos los logos')

  }



  if (duplicateAssets) {

    errors += 1

    lines.push(`✗ ${duplicateAssets} logo(s) duplicado(s) entre marcas`)

  } else if (activeBrands.length) {

    lines.push('✓ logos únicos')

  }



  if (placeholderCount) {

    errors += 1

    lines.push(`✗ ${placeholderCount} placeholder(s) detectado(s)`)

  } else if (activeBrands.length) {

    lines.push('✓ sin placeholders')

  }



  const missingCatalog = BRAND_NAMES.filter(

    (expected) => !activeBrands.some((b) => String(b?.name ?? '').trim() === expected),

  )

  if (missingCatalog.length) {

    errors += 1

    lines.push(`✗ faltan marcas del catálogo: ${missingCatalog.join(', ')}`)

  } else {

    lines.push('✓ catálogo completo (15 marcas)')

  }



  return { errors, warnings, lines, passed: errors === 0 }

}



export async function runAudit({ silent = false } = {}) {

  const client = createAuditClient()

  const doc = await client.fetch(QUERY)



  if (!silent) {

    console.info('\n══════════════════════════════════════')

    console.info('  Auditoría — Marcas Home')

    console.info('══════════════════════════════════════\n')

  }



  if (!doc) {

    if (!silent) console.error(`✗ ${DOC_ID} no encontrado`)

    return { errors: 1, warnings: 0, passed: false, lines: [`✗ ${DOC_ID} no encontrado`] }

  }



  const result = auditHomeBrandsBlocks(doc.blocks)



  if (!silent) {

    for (const line of result.lines) console.info(line)

    console.info('\n── Resumen ──')

    console.info(`Errores: ${result.errors}`)

    console.info(`Advertencias: ${result.warnings}`)

  }



  return result

}



const isMain = process.argv[1]?.endsWith('audit-home-brands.mjs')

if (isMain) {

  const result = await runAudit()

  if (result.errors > 0) process.exit(1)

}


