/**
 * Mueve tabs + tabsSection de serviceSubPage-ventanas-lunetas → serviceSubPage-equipamiento-escolar.
 *
 * npm run migrate:brand-equipment-tabs:dry
 * npm run migrate:brand-equipment-tabs -- --apply
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

const VENTANAS_ID = serviceSubPageDocumentId('ventanas-lunetas')
const ESCOLAR_ID = serviceSubPageDocumentId('equipamiento-escolar')

const QUERY = `{
  "ventanasDocs": *[_id in [$ventanas, $ventanasDraft]]{
    _id, _rev, tabs, tabsSection, "tabCount": count(tabs)
  },
  "escolarDocs": *[_id in [$escolar, $escolarDraft]]{
    _id, _rev, tabs, tabsSection, "tabCount": count(tabs)
  }
}`

function pickSourceDoc(docs = []) {
  const published = docs.find((d) => !d._id.startsWith('drafts.'))
  const draft = docs.find((d) => d._id.startsWith('drafts.'))
  return draft?.tabCount ? draft : published ?? draft ?? null
}

function tabsFromDocs(docs = []) {
  for (const doc of docs) {
    if (doc?.tabs?.length) return doc.tabs
  }
  return []
}

function sectionFromDocs(docs = []) {
  for (const doc of docs) {
    if (doc?.tabsSection) return doc.tabsSection
  }
  return null
}

async function main() {
  const data = await client.fetch(QUERY, {
    ventanas: VENTANAS_ID,
    ventanasDraft: `drafts.${VENTANAS_ID}`,
    escolar: ESCOLAR_ID,
    escolarDraft: `drafts.${ESCOLAR_ID}`,
  })

  const ventanasDocs = data.ventanasDocs ?? []
  const escolarDocs = data.escolarDocs ?? []
  const ventanasSource = pickSourceDoc(ventanasDocs)
  const escolarTarget = pickSourceDoc(escolarDocs) ?? { _id: ESCOLAR_ID }

  console.log('[migrate:brand-equipment-tabs] Estado actual:')
  for (const doc of ventanasDocs) {
    console.log(`  Ventanas (${doc._id}): ${doc.tabCount ?? 0} tabs`)
  }
  for (const doc of escolarDocs) {
    console.log(`  Escolar (${doc._id}): ${doc.tabCount ?? 0} tabs`)
  }

  const ventanasTabs = tabsFromDocs(ventanasDocs)
  const ventanasSection = sectionFromDocs(ventanasDocs)
  const escolarTabs = tabsFromDocs(escolarDocs)
  const escolarSection = sectionFromDocs(escolarDocs)

  const mergedTabs = escolarTabs.length ? escolarTabs : ventanasTabs
  const mergedSection = escolarSection ?? ventanasSection

  if (!mergedTabs.length && !mergedSection) {
    console.log('No hay tabs ni cabecera — nada que migrar.')
    return
  }

  if (dryRun) {
    console.log('[dry] Se copiarían a Equipamiento escolar:')
    console.log(`  destino: ${escolarTarget._id}`)
    console.log(`  tabs: ${mergedTabs.length} pestaña(s)`)
    console.log(`  tabsSection: ${mergedSection ? JSON.stringify(mergedSection) : '(sin cabecera)'}`)
    console.log('[dry] Se limpiarían tabs/tabsSection en todos los docs de Ventanas y lunetas')
    return
  }

  const tx = client.transaction()

  tx.patch(escolarTarget._id, (p) =>
    p.set({
      tabs: mergedTabs,
      ...(mergedSection ? { tabsSection: mergedSection } : {}),
    }),
  )

  for (const doc of ventanasDocs) {
    if ((doc.tabCount ?? 0) > 0 || doc.tabsSection) {
      tx.patch(doc._id, (p) => p.unset(['tabs', 'tabsSection']))
    }
  }

  await tx.commit()

  console.log('Migración aplicada.')
  console.log(`  → ${escolarTarget._id}: ${mergedTabs.length} tab(s)`)
  for (const doc of ventanasDocs) {
    if ((doc.tabCount ?? 0) > 0 || doc.tabsSection) {
      console.log(`  → ${doc._id}: tabs/tabsSection eliminados`)
    }
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
