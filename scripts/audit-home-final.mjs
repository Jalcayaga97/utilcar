/**
 * Auditoría final Home CMS vs Web — npm run audit:home-final
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'

const sanityEnv = loadSanityEnv({ requireToken: false })
sanityEnv.applyToProcessEnv()

const client = createClient({
  projectId: sanityEnv.projectId,
  dataset: sanityEnv.dataset,
  apiVersion: '2024-05-28',
  token: sanityEnv.token || undefined,
  useCdn: false,
})

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function findWhyBlock(blocks) {
  return blockOfType(blocks, 'whyUtilcarBlock') || blockOfType(blocks, 'whyUsBlock')
}

function findPortfolioBlock(blocks) {
  return (blocks ?? []).find(
    (b) => b._type === 'portfolioBlock' || b._type === 'galleryBlock',
  )
}

function countMissingKeys(arr) {
  if (!Array.isArray(arr) || !arr.length) return 0
  return arr.filter((item) => item && typeof item === 'object' && !item._key).length
}

function workPageMissingKeys(doc) {
  let total = 0
  for (const path of ['filters', 'portfolio', 'preview']) {
    total += countMissingKeys(doc?.[path])
  }
  if (Array.isArray(doc?.blocks)) {
    for (const block of doc.blocks) {
      for (const field of ['items', 'categories', 'featuredProjects']) {
        total += countMissingKeys(block?.[field])
      }
    }
  }
  if (Array.isArray(doc?.page?.projects)) {
    total += countMissingKeys(doc.page.projects)
  }
  return total
}

function resolveFeaturedAgainstWork(featured, workPage) {
  const known = new Set([
    ...(workPage?.preview ?? []).map((p) => String(p?.id ?? '')),
    ...(workPage?.portfolio ?? []).map((p) => String(p?.id ?? '')),
  ])
  const refs = (featured ?? []).map((f) => String(f?.projectId ?? '')).filter(Boolean)
  const matched = refs.filter((id) => known.has(id)).length
  return { refs: refs.length, matched }
}

const home = await client.fetch(`*[_id == "homePage"][0]{
  blocks[]{
    _type,
    title,
    textLinkLabel,
    textLinkUrl,
    image{ asset->{ url, _id } },
    items[]{ _key, title },
    categories[]{ _key, title },
    featuredProjects[]{ _key, projectId },
    sectionEyebrow,
    sectionTitle
  }
}`)

const work = await client.fetch(`*[_id == "workPage"][0]{
  filters[]{ _key, id },
  portfolio[]{ _key, id },
  preview[]{ _key, id },
  blocks[]{ _type, items[]{ _key }, categories[]{ _key }, featuredProjects[]{ _key } },
  page{ projects[]{ _key } }
}`)

const settings = await client.fetch(`*[_id == "siteSettings"][0]{ serviceCta }`)

if (!home) {
  console.error('✗ homePage no encontrado')
  process.exit(1)
}

const servicesBlock = blockOfType(home.blocks, 'servicesBlock')
const specialtiesBlock = blockOfType(home.blocks, 'specialtiesBlock')
const whyBlock = findWhyBlock(home.blocks)
const portfolioBlock = findPortfolioBlock(home.blocks)
const heroBlock = blockOfType(home.blocks, 'heroBlock')

const serviceCount = (servicesBlock?.items ?? []).filter((i) => i?.title).length
const specialtyCount = (specialtiesBlock?.categories ?? []).filter((c) => c?.title).length
const whyCount = (whyBlock?.items ?? []).filter((i) => i?.title).length
const featured = portfolioBlock?.featuredProjects ?? []
const featuredInfo = resolveFeaturedAgainstWork(featured, work)
const workKeysMissing = workPageMissingKeys(work)

const checks = {
  'Home Services': {
    ok: serviceCount >= 6,
    detail: `${serviceCount}/6 items`,
  },
  'Home Specialties': {
    ok: specialtyCount >= 3,
    detail: `${specialtyCount}/3 categories`,
  },
  'Why Utilcar': {
    ok: whyCount >= 3 && Boolean(whyBlock),
    detail: whyBlock
      ? `${whyCount}/3 motivos (${whyBlock._type})`
      : 'bloque ausente',
  },
  'Featured Projects': {
    ok: featured.length >= 3,
    detail: `${featured.length} refs (${featuredInfo.matched} en workPage)`,
  },
  'WorkPage Keys': {
    ok: workKeysMissing === 0,
    detail: workKeysMissing === 0 ? 'sin missing keys' : `${workKeysMissing} faltantes`,
  },
  'Hero Image': {
    ok: Boolean(heroBlock?.image?.asset?.url || heroBlock?.image?.asset?._id),
    detail: heroBlock?.image?.asset?.url ? 'CMS OK' : 'ref o ausente',
  },
  'CTA Global': {
    ok: Boolean(settings?.serviceCta?.title),
    detail: settings?.serviceCta?.title ? 'siteSettings OK' : 'sin serviceCta',
  },
}

const emptyArrays = []
if (serviceCount === 0) emptyArrays.push('servicesBlock.items')
if (specialtyCount === 0) emptyArrays.push('specialtiesBlock.categories')
if (whyCount === 0) emptyArrays.push('whyUtilcarBlock.items')
if (featured.length === 0) emptyArrays.push('portfolioBlock.featuredProjects')

checks['Arrays vacíos'] = {
  ok: emptyArrays.length === 0,
  detail: emptyArrays.length ? emptyArrays.join(', ') : 'ninguno',
}

let issues = 0
console.info('\n══════════════════════════════════════')
console.info('  AUDITORÍA FINAL — Home CMS')
console.info('══════════════════════════════════════\n')
console.info(`${'Sección'.padEnd(22)} ${'Estado'.padEnd(8)} Detalle`)
console.info('─'.repeat(56))

for (const [label, result] of Object.entries(checks)) {
  const status = result.ok ? '✓ OK' : '✗ FAIL'
  if (!result.ok) issues += 1
  console.info(`${label.padEnd(22)} ${status.padEnd(8)} ${result.detail}`)
}

console.info('─'.repeat(56))
console.info(`Issues totales: ${issues}\n`)

process.exit(issues > 0 ? 1 : 0)
