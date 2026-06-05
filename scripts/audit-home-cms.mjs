/**
 * Auditoría CMS Home — npm run audit:home-cms
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

const UNKNOWN_FIELDS = ['primaryLabel', 'primaryTo', 'buttonLabel', 'buttonLink']

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

function checkHero(doc) {
  const hero = blockOfType(doc.blocks, 'heroBlock')
  const url = hero?.image?.asset?.url ?? null
  const ref = hero?.image?.asset?._ref ?? null
  const hasTextLink = Boolean(hero?.textLinkLabel && hero?.textLinkUrl)
  const legacyOnlyCta =
    Boolean(hero?.primaryCta?.label) ||
    (Boolean(hero?.secondaryLink?.label) && !hasTextLink)
  return {
    ok: Boolean(url || ref) && hasTextLink && !legacyOnlyCta,
    detail: url ? 'imagen CMS' : ref ? 'imagen (ref)' : 'sin imagen',
  }
}

function checkServices(doc) {
  const block = blockOfType(doc.blocks, 'servicesBlock')
  const count = block?.items?.length ?? 0
  const complete = (block?.items ?? []).filter(
    (i) => i?.title && i?.description && (i?.link?.path || i?.link?.label),
  ).length
  return { ok: count >= 6 && complete === count, detail: `${complete}/${count} items` }
}

function checkSpecialties(doc) {
  const block = blockOfType(doc.blocks, 'specialtiesBlock')
  const count = block?.categories?.length ?? 0
  return { ok: count >= 3, detail: `${count} categorías` }
}

function checkWhyUtilcar(doc) {
  const block =
    blockOfType(doc.blocks, 'whyUtilcarBlock') || blockOfType(doc.blocks, 'whyUsBlock')
  const count = block?.items?.length ?? 0
  return { ok: count >= 3, detail: `${count} motivos` }
}

function checkPortfolio(doc) {
  const block = blockOfType(doc.blocks, 'portfolioBlock')
  const featured = block?.featuredProjects?.length ?? 0
  const embedded = block?.items?.length ?? 0
  return {
    ok: featured >= 1 && embedded === 0,
    detail: `${featured} referencias, ${embedded} embebidos`,
  }
}

function checkCtaBlock(doc) {
  const block = blockOfType(doc.blocks, 'ctaBlock')
  const orphan = UNKNOWN_FIELDS.filter((f) => block?.[f])
  const flatOrphan = UNKNOWN_FIELDS.filter((f) => doc.ctaBanner?.[f])
  return {
    ok: Boolean(block?.title) && !orphan.length && !flatOrphan.length,
    detail: orphan.length || flatOrphan.length ? `campos huérfanos` : 'solo título/desc',
  }
}

async function checkGlobalCta() {
  const settings = await client.fetch(`*[_id == "siteSettings"][0]{ serviceCta }`)
  return {
    ok: Boolean(settings?.serviceCta?.title),
    detail: settings?.serviceCta?.title ? 'siteSettings OK' : 'falta seed',
  }
}

const doc = await client.fetch(`*[_id == "homePage"][0]{
  blocks[]{
    _type,
    title,
    textLinkLabel,
    textLinkUrl,
    primaryCta,
    secondaryLink,
    image{ asset->{ url, _id } },
    items[]{ title, description, link, image{ asset->{ url } } },
    categories[]{ title, description, heroImage{ asset->{ url } } },
    featuredProjects[]{ projectId },
    buttonLabel,
    buttonLink,
    primaryLabel,
    primaryTo
  },
  ctaBanner,
  specialtiesNew,
  highlights
}`)

if (!doc) {
  console.error('✗ homePage no encontrado')
  process.exit(1)
}

const globalCta = await checkGlobalCta()
const checks = {
  Hero: checkHero(doc),
  'CTA Global': globalCta,
  Servicios: checkServices(doc),
  Especialidades: checkSpecialties(doc),
  'Why Utilcar': checkWhyUtilcar(doc),
  Portfolio: checkPortfolio(doc),
  'Banner CTA': checkCtaBlock(doc),
}

let issues = 0
console.info('\nPágina Home CMS Audit\n')
for (const [label, result] of Object.entries(checks)) {
  const status = result.ok ? 'OK' : 'FAIL'
  if (!result.ok) issues += 1
  console.info(`${label.padEnd(18)} ${status.padEnd(6)} (${result.detail})`)
}

const coverageBefore = 35
const okCount = Object.values(checks).filter((c) => c.ok).length
const coverageAfter = Math.round((okCount / Object.keys(checks).length) * 1000) / 10

console.info(`\nIssues: ${issues}`)
console.info(`Cobertura estimada: ${coverageBefore}% → ${coverageAfter}%`)
process.exit(issues > 0 ? 1 : 0)
