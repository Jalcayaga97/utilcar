/**
 * Compara homePage publicado vs drafts.homePage.
 * npm run audit:homepage-sync
 */
import {
  createSyncClient,
  diffMetrics,
  extractHomePageMetrics,
  fetchHomePagePair,
  printDiffReport,
  printMetricsTable,
} from './lib/homepageSyncUtils.mjs'

const { client, sanityEnv } = createSyncClient({ requireToken: false })

console.info('\n══════════════════════════════════════')
console.info('  AUDITORÍA — homePage sync')
console.info(`  ${sanityEnv.projectId} / ${sanityEnv.dataset}`)
console.info('══════════════════════════════════════')

const { published, draft } = await fetchHomePagePair(client)

if (!published) {
  console.error('\n✗ homePage publicado no encontrado')
  process.exit(1)
}

const pubMetrics = extractHomePageMetrics(published)
const draftMetrics = extractHomePageMetrics(draft ?? { _id: 'drafts.homePage', blocks: [] })

printMetricsTable('PUBLICADO (homePage)', pubMetrics)
printMetricsTable('BORRADOR (drafts.homePage)', draftMetrics)

const diffs = diffMetrics(pubMetrics, draftMetrics)
const issueCount = printDiffReport(diffs)

if (!draft) {
  console.info('\n⚠ drafts.homePage no existe — Studio creará borrador al abrir el documento.')
}

console.info('')
process.exit(issueCount > 0 ? 1 : 0)
