/**
 * Auditoría Especialidades Home — categorías en specialtiesBlock.
 * npm run audit:home-specialties
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const EXPECTED_HOME_TITLES = [
  'Equipamiento para Furgones',
  'Conversión de Buses Escolares',
  'Fabricación de Banquetas',
]

const issues = []
const warnings = []

function issue(code, message, extra = {}) {
  issues.push({ code, message, ...extra })
}

function warn(code, message, extra = {}) {
  warnings.push({ code, message, ...extra })
}

function hasHeroAsset(cat) {
  return Boolean(
    cat?.heroImage?.asset?._ref ||
      cat?.heroImage?.asset?._id ||
      cat?.heroImage?.asset?.url,
  )
}

function hasValidCta(cat) {
  const label = String(cat?.cta?.label ?? '').trim()
  const path = String(cat?.cta?.to ?? cat?.cta?.path ?? '').trim()
  return Boolean(label && path)
}

function featureItemCount(cat) {
  const features = cat?.features ?? []
  if (!Array.isArray(features) || !features.length) return 0
  return features.reduce((sum, group) => {
    const items = Array.isArray(group?.items) ? group.items : []
    return sum + items.filter((t) => String(t ?? '').trim()).length
  }, 0)
}

const sanityEnv = loadSanityEnv({ requireToken: false })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token || undefined,
  useCdn: false,
})

const home = await client.fetch(`*[_id == "homePage"][0]{
  blocks[_type == "specialtiesBlock"][0]{
    _type,
    title,
    categories[]{
      _key,
      title,
      subtitle,
      description,
      featured,
      enabled,
      heroImage{ asset->{ _id, url } },
      features[]{ _key, title, items },
      cta{ label, to }
    }
  }
}`)

const block = home?.blocks?.[0] ?? home?.blocks ?? null
const categories = block?.categories ?? []

console.log('\n=== audit:home-specialties ===\n')
console.log(`Dataset: ${sanityEnv.dataset}`)
console.log(`Bloque specialtiesBlock: ${block ? 'encontrado' : 'NO'}`)
console.log(`Categorías en CMS: ${categories.length}\n`)

if (!block) {
  issue('missing-block', 'homePage no tiene specialtiesBlock')
}

const enabledCats = categories.filter((c) => c?.enabled !== false)

if (enabledCats.length < 3) {
  issue(
    'category-count',
    `Se esperan al menos 3 categorías visibles; hay ${enabledCats.length}`,
    { enabled: enabledCats.length, total: categories.length },
  )
}

for (const expected of EXPECTED_HOME_TITLES) {
  const found = enabledCats.some(
    (c) => String(c?.title ?? '').trim() === expected,
  )
  if (!found) {
    warn('expected-title', `Título esperado no encontrado entre visibles: "${expected}"`)
  }
}

enabledCats.forEach((raw, index) => {
  const title = String(raw?.title ?? '').trim() || `(índice ${index})`
  const id = raw?._key ?? `category-${index}`

  if (!String(raw?.title ?? '').trim()) {
    issue('missing-title', `Sin título: ${title}`, { id, index })
  }

  if (!hasHeroAsset(raw)) {
    issue('missing-hero', `Sin heroImage: ${title}`, { id, index })
  }

  if (!hasValidCta(raw)) {
    issue('missing-cta', `CTA incompleto (label + to): ${title}`, {
      id,
      index,
      cta: raw?.cta,
    })
  }

  const itemCount = featureItemCount(raw)
  if (itemCount < 1) {
    issue('missing-features', `Sin ítems en features: ${title}`, { id, index })
  }
})

console.log('--- Categorías visibles ---')
for (const cat of enabledCats) {
  console.log(
    `• ${cat.title ?? '(sin título)'}` +
      ` | hero: ${hasHeroAsset(cat) ? 'ok' : 'NO'}` +
      ` | cta: ${hasValidCta(cat) ? 'ok' : 'NO'}` +
      ` | features ítems: ${featureItemCount(cat)}`,
  )
}

if (warnings.length) {
  console.log('\n--- Advertencias ---')
  for (const w of warnings) {
    console.log(`⚠ [${w.code}] ${w.message}`)
  }
}

if (issues.length) {
  console.log('\n--- Errores ---')
  for (const i of issues) {
    console.log(`✗ [${i.code}] ${i.message}`)
  }
  console.log(`\nResultado: FAIL (${issues.length} error(es), ${warnings.length} aviso(s))\n`)
  process.exit(1)
}

console.log(
  `\nResultado: OK (${enabledCats.length} categoría(s) visibles, ${warnings.length} aviso(s))\n`,
)
