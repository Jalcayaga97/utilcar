/**
 * Auditoría servicios Home — alineación con SERVICE_LINKS maestro.
 * npm run audit:home-services
 */
import { createAuditClient } from './lib/imageAuditShared.mjs'
import {
  EXPECTED_SERVICE_COUNT,
  SERVICE_LINKS_MANIFEST,
  isAlphabeticalOrder,
} from './lib/serviceCatalogManifest.mjs'

const HOME_QUERY = `*[_id == "homePage"][0]{
  blocks[]{
    _type,
    items[]{
      _key,
      title,
      description,
      link{ label, path }
    }
  }
}`

const SERVICES_PAGE_QUERY = `*[_type == "servicesPage"][0]{
  serviceLinks[]{ label, path }
}`

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

/**
 * @param {{ homeBlocks?: object[], servicesPageLinks?: { label: string, path: string }[] }} ctx
 */
export function auditHomeServicesContext({ homeBlocks, servicesPageLinks }) {
  let errors = 0
  let warnings = 0
  const lines = []

  const masterLinks =
    servicesPageLinks?.length === EXPECTED_SERVICE_COUNT
      ? servicesPageLinks
      : SERVICE_LINKS_MANIFEST

  const canonicalPaths = SERVICE_LINKS_MANIFEST.map((link) => link.path)
  const masterPathsList = masterLinks.map((link) => link.path)
  const canonicalOrder =
    masterPathsList.length === canonicalPaths.length &&
    masterPathsList.every((path, index) => path === canonicalPaths[index])

  if (!isAlphabeticalOrder(masterLinks)) {
    errors += 1
    lines.push('✗ SERVICE_LINKS no está en orden alfabético')
  } else {
    lines.push('✓ SERVICE_LINKS orden alfabético')
  }

  if (!canonicalOrder) {
    errors += 1
    lines.push('✗ SERVICE_LINKS no coincide con catálogo maestro')
  } else if (errors === 0 || isAlphabeticalOrder(masterLinks)) {
    lines.push('✓ SERVICE_LINKS alineado con catálogo maestro')
  }

  const masterPaths = masterLinks.map((link) => link.path)
  const uniqueMaster = new Set(masterPaths)
  if (uniqueMaster.size !== EXPECTED_SERVICE_COUNT) {
    errors += 1
    lines.push(`✗ SERVICE_LINKS con rutas duplicadas (${uniqueMaster.size}/${EXPECTED_SERVICE_COUNT})`)
  } else {
    lines.push(`✓ SERVICE_LINKS (${EXPECTED_SERVICE_COUNT} rutas únicas)`)
  }

  const servicesBlock = blockOfType(homeBlocks, 'servicesBlock')
  if (!servicesBlock) {
    errors += 1
    lines.push('✗ servicesBlock ausente en homePage')
    return { errors, warnings, lines, passed: false }
  }

  const items = (servicesBlock.items ?? []).filter((i) => i?.title && i?.description)
  if (items.length !== EXPECTED_SERVICE_COUNT) {
    errors += 1
    lines.push(`✗ homePage servicesBlock: ${items.length}/${EXPECTED_SERVICE_COUNT} ítems`)
  } else {
    lines.push(`✓ homePage servicesBlock (${items.length} ítems)`)
  }

  const itemPaths = items.map((item) => item?.link?.path).filter(Boolean)
  const uniqueItemPaths = new Set(itemPaths)
  if (uniqueItemPaths.size !== itemPaths.length) {
    errors += 1
    lines.push('✗ homePage servicesBlock: rutas duplicadas')
  } else if (items.length) {
    lines.push('✓ sin duplicados en servicesBlock')
  }

  for (let i = 0; i < masterPaths.length; i += 1) {
    const expectedPath = masterPaths[i]
    const expectedLabel = masterLinks[i]?.label
    const item = items[i]
    const itemPath = item?.link?.path

    if (itemPath !== expectedPath) {
      errors += 1
      lines.push(`✗ orden/ruta índice ${i}: esperado ${expectedPath}, recibido ${itemPath ?? '—'}`)
      continue
    }

    if (!masterPaths.includes(itemPath)) {
      errors += 1
      lines.push(`✗ ruta no registrada en SERVICE_LINKS: ${itemPath}`)
    }

    if (item?.title && expectedLabel && item.title !== expectedLabel) {
      warnings += 1
      lines.push(`⚠ título distinto en ${itemPath}: "${item.title}" vs "${expectedLabel}"`)
    }
  }

  if (errors === 0 && items.length === EXPECTED_SERVICE_COUNT) {
    lines.push('✓ rutas alineadas con SERVICE_LINKS')
  }

  return { errors, warnings, lines, passed: errors === 0 }
}

export async function runAudit({ silent = false } = {}) {
  const client = createAuditClient()
  const [homeDoc, servicesPage] = await Promise.all([
    client.fetch(HOME_QUERY),
    client.fetch(SERVICES_PAGE_QUERY),
  ])

  if (!silent) {
    console.info('\n══════════════════════════════════════')
    console.info('  Auditoría — Servicios Home')
    console.info('══════════════════════════════════════\n')
  }

  if (!homeDoc) {
    if (!silent) console.error('✗ homePage no encontrado')
    return { errors: 1, warnings: 0, passed: false, lines: ['✗ homePage no encontrado'] }
  }

  const result = auditHomeServicesContext({
    homeBlocks: homeDoc.blocks,
    servicesPageLinks: servicesPage?.serviceLinks,
  })

  if (!silent) {
    for (const line of result.lines) console.info(line)
    console.info('\n── Resumen ──')
    console.info(`Errores: ${result.errors}`)
    console.info(`Advertencias: ${result.warnings}`)
  }

  return result
}

const isMain = process.argv[1]?.endsWith('audit-home-services.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}
