/**
 * Siembra tabs + tabsSection en serviceSubPage-butacas (idempotente).
 *
 * npm run seed:butacas-product-lines:dry
 * npm run seed:butacas-product-lines
 */
import { createClient } from '@sanity/client'
import { butacasContent, BUTACAS_CATEGORIES } from '../src/content/services.js'
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

const QUERY = `*[_id in [$id, $draftId]]{
  _id, "tabCount": count(tabs), tabsSection
}`

function buildTabsPayload() {
  return BUTACAS_CATEGORIES.map(({ id, name, intro, sections }) => ({
    _type: 'serviceTab',
    _key: `tab-${id}`,
    id,
    name,
    intro,
    sections: sections.map(({ title, items }, index) => ({
      _key: `sec-${id}-${index}`,
      title,
      items,
    })),
  }))
}

const tabsSection = {
  eyebrow: butacasContent.categories.eyebrow,
  title: butacasContent.categories.title,
  description: butacasContent.categories.description,
}

async function main() {
  const docs = await client.fetch(QUERY, {
    id: BUTACAS_ID,
    draftId: `drafts.${BUTACAS_ID}`,
  })

  const published = docs.find((d) => d._id === BUTACAS_ID)
  const draft = docs.find((d) => d._id === `drafts.${BUTACAS_ID}`)
  const targetId = published?._id ?? draft?._id ?? BUTACAS_ID
  const tabCount = published?.tabCount ?? draft?.tabCount ?? 0

  console.log('[seed:butacas-product-lines] Estado actual:', tabCount, 'tabs en', targetId)

  if (tabCount >= BUTACAS_CATEGORIES.length && (published?.tabsSection?.title || draft?.tabsSection?.title)) {
    console.log('Ya poblado — sin cambios.')
    return
  }

  const payload = buildTabsPayload()

  if (dryRun) {
    console.log('[dry] Se escribirían', payload.length, 'tabs')
    console.log('[dry] tabsSection:', JSON.stringify(tabsSection))
    return
  }

  await client
    .patch(targetId)
    .set({
      tabs: payload,
      tabsSection,
    })
    .commit()

  console.log('Seed aplicado:', payload.length, 'tabs en', targetId)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
