/**
 * Auditoría intro vs description — Butacas tabs.
 * node scripts/audit-butacas-intro.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { BUTACAS_CATEGORIES } from '../src/content/services.js'
function safeString(value, fallback = '') {
  if (value == null) return fallback
  const s = String(value).trim()
  return s || fallback
}

function resolveServiceTabIntroOld(raw = {}) {
  return (raw.intro ?? []).map((p) => safeString(p)).filter(Boolean)
}

function resolveServiceTabIntroNew(raw = {}) {
  const description = safeString(raw.description)
  const paragraphs = (raw.intro ?? [])
    .flatMap((p) => (Array.isArray(p) ? p : [p]))
    .map((p) => safeString(p))
    .filter(Boolean)
  if (description) {
    const tail = paragraphs.filter((p) => p !== description)
    return [description, ...tail]
  }
  return paragraphs
}

function normalizeServiceTab(raw = {}, index = 0) {
  return {
    id: safeString(raw.id, `tab-${index}`),
    name: safeString(raw.name),
    description: safeString(raw.description),
    intro: resolveServiceTabIntroNew(raw),
  }
}

function normalizeServiceTabs(tabs = []) {
  return tabs.map((tab, index) => normalizeServiceTab(tab, index))
}

const e = loadSanityEnv({ requireToken: false })
e.applyToProcessEnv()

const client = createClient({
  projectId: e.projectId,
  dataset: e.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const raw = await client.fetch(`*[_id == "serviceSubPage-butacas"][0].tabs[]{
  id, name, description, intro
}`)

const draftRaw = await client.fetch(`*[_id == "drafts.serviceSubPage-butacas"][0].tabs[]{
  id, name, description, intro
}`)

const normalized = normalizeServiceTabs(raw ?? [])
const local = BUTACAS_CATEGORIES

console.log('=== 0. DRAFT vs PUBLISHED ===\n')
for (const [label, tabs] of [['published', raw], ['draft', draftRaw]]) {
  console.log(`--- ${label} ---`)
  for (const tab of tabs ?? []) {
    console.log(`  ${tab.id}: desc=${JSON.stringify(tab.description?.slice(0, 60))} intro0=${JSON.stringify(tab.intro?.[0]?.slice(0, 60))}`)
  }
}

console.log('\n=== 1. SANITY tabs[].intro vs description ===\n')
for (const tab of raw ?? []) {
  console.log(`--- ${tab.id} (${tab.name}) ---`)
  console.log('  description (Studio "Descripción breve"):', JSON.stringify(tab.description ?? null))
  console.log('  intro[] (Studio "Intro"):', JSON.stringify(tab.intro ?? null))
}

console.log('\n=== 2. normalizeServiceTabs() output ===\n')
for (const tab of normalized) {
  console.log(`--- ${tab.id} ---`)
  console.log('  description:', JSON.stringify(tab.description))
  console.log('  intro[]:', JSON.stringify(tab.intro))
}

console.log('\n=== 3. LOCAL BUTACAS_CATEGORIES (shadow) ===\n')
for (const tab of local) {
  console.log(`--- ${tab.id} ---`)
  console.log('  intro[0]:', tab.intro?.[0]?.slice(0, 80))
}

console.log('\n=== 4. BanquetasCategoryPanel renderiza ===')
console.log('  resolveCategoryIntro(category) → intro[] normalizado o description como fallback')

console.log('\n=== 5. BEFORE / AFTER (simulación editor editó description, intro[] seed) ===')
const simulated = {
  id: 'camiones',
  name: 'Butacas para camiones (CMS)',
  description: 'TEXTO NUEVO desde Sanity — Descripción breve editada en Studio.',
  intro: [BUTACAS_CATEGORIES[0].intro[0]],
}
console.log('  Sanity description:', simulated.description)
console.log('  Sanity intro[0] (seed/local):', simulated.intro[0].slice(0, 80) + '…')
console.log('  BEFORE render (solo intro[]):', resolveServiceTabIntroOld(simulated)[0]?.slice(0, 80) + '…')
console.log('  AFTER render (resolveServiceTabIntro):', resolveServiceTabIntroNew(simulated)[0])

console.log('\n=== 6. MATCH CHECK (production) ===')
for (const tab of normalized) {
  const cms = raw.find((t) => t.id === tab.id)
  const loc = local.find((t) => t.id === tab.id)
  const renderedIntro = tab.intro?.[0] ?? '(vacío — no se renderiza nada)'
  const editorBrief = cms?.description ?? '(vacío)'
  console.log(`\n${tab.id}:`)
  console.log('  Sanity description (campo editor probable):', editorBrief.slice(0, 100))
  console.log('  Sanity intro[0]:', cms?.intro?.[0]?.slice(0, 100) ?? '(vacío)')
  console.log('  Normalized intro[0] → RENDERIZADO:', renderedIntro.slice(0, 100))
  console.log('  Local intro[0] (shadow):', loc?.intro?.[0]?.slice(0, 100))
  console.log(
    '  ¿description ≠ intro y editor editó description?',
    Boolean(cms?.description && cms.description !== cms?.intro?.[0]),
  )
}
