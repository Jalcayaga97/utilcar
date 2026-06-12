/**
 * Verificación post-migración + simulación resolver.
 * node scripts/verify-brand-equipment-tabs.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { EQUIPAMIENTO_MARCA_TABS } from '../src/content/equipamientoEscolarBrands.js'
import { serviceSubPageDocumentId } from '../utilcar-studio/schemas/content/serviceSubPage.js'

const EXPECTED_IDS = EQUIPAMIENTO_MARCA_TABS.map((t) => t.id)

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const VENTANAS_ID = serviceSubPageDocumentId('ventanas-lunetas')
const ESCOLAR_ID = serviceSubPageDocumentId('equipamiento-escolar')

const QUERY = `{
  "ventanasPublished": *[_id == $ventanas][0]{ _id, tabsSection, "tabCount": count(tabs), "tabIds": tabs[].id },
  "ventanasDraft": *[_id == $ventanasDraft][0]{ _id, tabsSection, "tabCount": count(tabs) },
  "escolarPublished": *[_id == $escolar][0]{ _id, tabsSection, "tabCount": count(tabs), "tabIds": tabs[].id },
  "escolarDraft": *[_id == $escolarDraft][0]{ _id, tabsSection, "tabCount": count(tabs), "tabIds": tabs[].id }
}`

function tabHasCmsGallery(tab) {
  return (tab?.gallery ?? []).some(
    (item) =>
      (typeof item?.src === 'string' && item.src.trim().length > 0) ||
      item?.image?.asset?._ref ||
      item?.image?.asset?._id,
  )
}

function resolveServicePageTabs(legacyContent, resolved) {
  const cmsTabs = resolved?.tabs ?? []
  if (cmsTabs.some(tabHasCmsGallery)) return cmsTabs
  return legacyContent?.tabs ?? []
}

const data = await client.fetch(QUERY, {
  ventanas: VENTANAS_ID,
  ventanasDraft: `drafts.${VENTANAS_ID}`,
  escolar: ESCOLAR_ID,
  escolarDraft: `drafts.${ESCOLAR_ID}`,
})

console.log('=== ESTADO DATASET ===')
console.log(JSON.stringify(data, null, 2))

const escolarDoc = data.escolarPublished ?? data.escolarDraft
const legacyContent = { tabs: EQUIPAMIENTO_MARCA_TABS }
const resolved = { tabs: escolarDoc?.tabs ?? [] }
const finalTabs = resolveServicePageTabs(legacyContent, resolved)

console.log('\n=== SIMULACIÓN RESOLVER (equipamiento-escolar) ===')
console.log('tabs finales:', finalTabs.length)
console.log('ids:', finalTabs.map((t) => t.id).join(', '))
console.log('tabsSection title:', escolarDoc?.tabsSection?.title ?? '(null)')

const escolarIds = escolarDoc?.tabIds ?? []
const orderOk = EXPECTED_IDS.every((id, i) => escolarIds[i] === id)
const idsOk = EXPECTED_IDS.every((id) => escolarIds.includes(id))

const ok =
  (data.escolarPublished?.tabCount ?? data.escolarDraft?.tabCount ?? 0) === 14 &&
  (data.ventanasPublished?.tabCount ?? 0) === 0 &&
  (data.ventanasDraft?.tabCount ?? 0) === 0 &&
  finalTabs.length === 14 &&
  idsOk &&
  orderOk

console.log('\n=== RESULTADO ===', ok ? 'OK' : 'FALLO')
if (!orderOk) console.log('⚠ Orden de tabs no coincide con listado oficial')
process.exit(ok ? 0 : 1)
