/**
 * Cobertura de galerías por tab (mín. 3 imágenes).
 * npm run audit:gallery-coverage
 */
import { createAuditClient } from './lib/imageAuditShared.mjs'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'
import {
  GALLERY_COVERAGE_PAGE_KEYS,
  GALLERY_COVERAGE_CATALOG,
} from './lib/galleryCoverageCatalog.mjs'

const MIN_IMAGES = 3

export async function runAudit() {
  const client = createAuditClient()
  let errors = 0
  let warnings = 0

  console.info('\n══════════════════════════════════════')
  console.info('  Auditoría cobertura galerías')
  console.info('══════════════════════════════════════\n')

  console.info(`${'Servicio'.padEnd(24)} ${'Tab'.padEnd(22)} Imgs  Estado`)
  console.info(`${'─'.repeat(24)} ${'─'.repeat(22)} ${'─'.repeat(4)} ${'─'.repeat(8)}`)

  for (const pageKey of GALLERY_COVERAGE_PAGE_KEYS) {
    const doc = await client.fetch(
      `*[_id == $id][0]{ tabs[]{ id, name, gallery[]{ _key, alt, image{ asset->{ _id } } } } }`,
      { id: serviceSubPageDocumentId(pageKey) },
    )
    const expectedTabs = Object.keys(GALLERY_COVERAGE_CATALOG[pageKey] ?? {})

    for (const tabId of expectedTabs) {
      const tab = (doc?.tabs ?? []).find((t) => t.id === tabId)
      const count = tab?.gallery?.length ?? 0
      const status = count >= MIN_IMAGES ? '✓ OK' : count ? '✗ BAJO' : '✗ VACÍO'
      if (count < MIN_IMAGES) errors += 1
      console.info(`${pageKey.padEnd(24)} ${tabId.padEnd(22)} ${String(count).padStart(4)}  ${status}`)
    }
  }

  console.info('\n── Resumen ──')
  console.info(`Mínimo requerido: ${MIN_IMAGES} imágenes/tab`)
  console.info(`Errors: ${errors}`)
  console.info(`Warnings: ${warnings}`)

  return { errors, warnings }
}

const isMain = process.argv[1]?.endsWith('audit-gallery-coverage.mjs')
if (isMain) {
  const result = await runAudit()
  if (result.errors > 0) process.exit(1)
}
