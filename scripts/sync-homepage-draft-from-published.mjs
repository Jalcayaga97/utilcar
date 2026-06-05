/**
 * Sincroniza drafts.homePage desde homePage publicado (sin modificar publicado).
 *
 * npm run sync:homepage-draft
 * npm run sync:homepage-draft -- --dry
 */
import {
  buildDraftFromPublished,
  createSyncClient,
  diffMetrics,
  extractHomePageMetrics,
  fetchHomePagePair,
  LEGACY_FIELDS_TO_SYNC,
  listCopiedBlocks,
  listCopiedFields,
  printDiffReport,
  printMetricsTable,
} from './lib/homepageSyncUtils.mjs'

const dryRun =
  process.argv.includes('--dry') ||
  process.argv.includes('--dry-run') ||
  process.argv.includes('--verify')

console.info('\n══════════════════════════════════════')
console.info('  SYNC — drafts.homePage ← homePage')
console.info(`  Modo: ${dryRun ? 'DRY-RUN (sin escritura)' : 'ESCRITURA'}`)
console.info('══════════════════════════════════════')

const { client, sanityEnv } = createSyncClient({ requireToken: !dryRun })

console.info(`\nDataset: ${sanityEnv.projectId} / ${sanityEnv.dataset}`)

const { published, draft } = await fetchHomePagePair(client)

if (!published) {
  console.error('\n✗ homePage publicado no encontrado — abortando')
  process.exit(1)
}

const pubMetricsBefore = extractHomePageMetrics(published)
const draftMetricsBefore = extractHomePageMetrics(draft ?? { _id: 'drafts.homePage', blocks: [] })
const diffsBefore = diffMetrics(pubMetricsBefore, draftMetricsBefore)

console.info('\n--- ANTES ---')
printMetricsTable('PUBLICADO', pubMetricsBefore)
printMetricsTable('BORRADOR', draftMetricsBefore)
printDiffReport(diffsBefore)

const fieldsCopied = listCopiedFields(published)
const blocksCopied = listCopiedBlocks(published)

console.info('\n--- Campos a copiar al borrador ---')
for (const field of fieldsCopied) {
  const value = published[field]
  const detail =
    field === 'blocks'
      ? `${(value ?? []).length} bloques`
      : field === 'specialtiesNew'
        ? `${Array.isArray(value) ? value.length : 0} items`
        : 'objeto'
  console.info(`  • ${field} (${detail})`)
}

console.info('\n--- blocks[] a copiar ---')
for (const block of blocksCopied) {
  console.info(
    `  [${block.index}] ${block._type} (_key: ${block._key})` +
      ` | items=${block.itemsCount ?? '-'} categories=${block.categoriesCount ?? '-'} projects=${block.projectsCount ?? '-'}` +
      (block.title ? ` | "${block.title}"` : ''),
  )
}

const payload = buildDraftFromPublished(published, draft)

if (dryRun) {
  console.info('\n--- DRY-RUN ---')
  console.info(`  Se escribiría en: drafts.homePage`)
  console.info(`  homePage publicado: NO se modifica`)
  console.info(`  Campos: ${fieldsCopied.join(', ')}`)
  console.info(`  Bloques: ${blocksCopied.length}`)
  console.info('\n✓ Dry-run completado — ejecute sin --dry para aplicar.')
  process.exit(diffsBefore && Object.keys(diffsBefore).length ? 0 : 0)
}

const pubRevBefore = published._rev
await client.createOrReplace(payload)

const { published: publishedAfter, draft: draftAfter } = await fetchHomePagePair(client)
const pubMetricsAfter = extractHomePageMetrics(publishedAfter)
const draftMetricsAfter = extractHomePageMetrics(draftAfter)
const diffsAfter = diffMetrics(pubMetricsAfter, draftMetricsAfter)

console.info('\n--- DESPUÉS ---')
printMetricsTable('PUBLICADO', pubMetricsAfter)
printMetricsTable('BORRADOR', draftMetricsAfter)
const remaining = printDiffReport(diffsAfter)

if (publishedAfter._rev !== pubRevBefore) {
  console.warn('\n⚠ ADVERTENCIA: el _rev del publicado cambió — no debería ocurrir.')
} else {
  console.info('\n✓ homePage publicado intacto (_rev sin cambios)')
}

if (remaining === 0) {
  console.info('✓ Borrador sincronizado con publicado')
  console.info('\nAbra Studio → Inicio y verifique:')
  console.info('  • Servicios: 6 items')
  console.info('  • Especialidades: 3 categorías')
  console.info('  • Por qué Utilcar: 3 motivos')
  console.info('  • Portfolio: 3 featuredProjects')
} else {
  console.error('\n✗ Quedan diferencias tras la sync — revise manualmente.')
  process.exit(1)
}

console.info('')
