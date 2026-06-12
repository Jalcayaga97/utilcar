/**
 * Repara _key en tabs[], sections[] y gallery[] de serviceSubPage-butacas.
 *
 * npm run repair:butacas-tabs-keys:dry
 * npm run repair:butacas-tabs-keys
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'

const dryRun = process.argv.includes('--dry')
const apply = process.argv.includes('--apply')

if (!dryRun && !apply) {
  console.error('Usá --dry o --apply')
  process.exit(1)
}

const e = loadSanityEnv({ requireToken: apply })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  token: e.token,
  useCdn: false,
})

const BUTACAS_ID = serviceSubPageDocumentId('butacas')

function blockKey(prefix, index) {
  return `${prefix}-${String(index).replace(/[^a-z0-9]/gi, '')}`
}

function repairGallery(gallery = [], tabId) {
  if (!Array.isArray(gallery)) return gallery
  return gallery.map((item, index) => ({
    ...item,
    _key: item._key ?? blockKey(`gal-${tabId}`, index),
  }))
}

function repairSections(sections = [], tabId) {
  return sections.map((section, index) => ({
    ...section,
    _key: section._key ?? blockKey(`sec-${tabId}`, index),
  }))
}

function repairTab(tab) {
  const tabId = tab.id ?? tab._key ?? 'tab'
  return {
    ...tab,
    _type: tab._type ?? 'serviceTab',
    _key: tab._key ?? blockKey('tab', tabId),
    sections: repairSections(tab.sections ?? [], tabId),
    gallery: repairGallery(tab.gallery ?? [], tabId),
  }
}

const QUERY = `*[_id in [$id, $draftId]]{
  _id, _rev,
  "tabCount": count(tabs),
  "missingTabKeys": count(tabs[!defined(_key) || _key == null]),
  tabs
}`

async function main() {
  const docs = await client.fetch(QUERY, {
    id: BUTACAS_ID,
    draftId: `drafts.${BUTACAS_ID}`,
  })

  const targets = docs.filter((d) => (d.tabCount ?? 0) > 0)
  if (!targets.length) {
    console.log('No hay documento butacas con tabs.')
    return
  }

  for (const doc of targets) {
    const repaired = (doc.tabs ?? []).map(repairTab)
    const missingBefore = doc.missingTabKeys ?? 0

    console.log(`[repair:butacas-tabs-keys] ${doc._id}`)
    console.log(`  tabs: ${repaired.length}, sin _key antes: ${missingBefore}`)
    console.log(
      `  keys: ${repaired.map((t) => t._key).join(', ')}`,
    )

    if (dryRun) {
      console.log('[dry] Se aplicarían _key sin cambiar contenido editorial.')
      continue
    }

    await client.patch(doc._id).set({ tabs: repaired }).commit()
    console.log(`  ✓ Reparado ${doc._id}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
