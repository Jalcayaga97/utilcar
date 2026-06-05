/**
 * Traza hero talleres-moviles — CMS → contrato → simulación adapter.
 * node scripts/audit-hero-trace.mjs
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageQuery } from '../src/lib/sanity/queries.js'
import { parseSanityPayload } from '../src/lib/cms/validate.js'
import { normalizeHero } from '../src/lib/cms/contracts/heroContract.js'

const PAGE_KEY = 'talleres-moviles'
const USE_PAGE_RESOLVER = true
const USE_SERVICES_V2 = true

function pickImageUrl(imageField) {
  if (!imageField) return null
  const url = imageField?.url ?? imageField?.asset?.url ?? null
  return url || null
}

function resolveServicePageHeroSim(heroSection, pageKey) {
  const cmsImage = heroSection?.image
  const cmsUrl =
    pickImageUrl(cmsImage) ||
    (typeof cmsImage?.asset?.url === 'string' ? cmsImage.asset.url : null) ||
    (typeof heroSection?.image?.url === 'string' ? heroSection.image.url : null) ||
    null
  const highlights = heroSection?.highlights ?? []
  return {
    src: cmsUrl || '(null — legacy path forces null explicitly)',
    highlightsCount: highlights.length,
    highlights,
    imageUrl: cmsUrl,
  }
}

function buildHeroSection(block) {
  if (!block) return null
  return normalizeHero(block)
}

function resolvePageExtensions(blocks) {
  const extensions = {}
  for (const block of blocks ?? []) {
    if (block?.enabled === false) continue
    if (block._type === 'heroBlock') {
      const section = buildHeroSection(block)
      if (section) extensions.heroSection = section
    }
  }
  return extensions
}

function isServiceSubPageCms(resolved) {
  const extensions = resolved?.extensions ?? {}
  return USE_PAGE_RESOLVER && USE_SERVICES_V2 && Object.keys(extensions).length > 0
}

const env = loadSanityEnv({ requireToken: false })
env.applyToProcessEnv()
const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

const raw = await client.fetch(serviceSubPageQuery(PAGE_KEY))
const parsed = parseSanityPayload(raw)
const heroBlock = (parsed?.blocks ?? []).find((b) => b._type === 'heroBlock')

console.log('=== parseSanityPayload(document) ===')
console.log('parsed null?', parsed === null)
console.log('blocks:', parsed?.blocks?.length)

const extensions = resolvePageExtensions(parsed?.blocks)
const resolved = { extensions, source: Object.keys(extensions).length ? 'blocks-full' : 'legacy-fallback' }
const cmsActive = isServiceSubPageCms(resolved)
const heroSection = extensions.heroSection ?? null
const heroResolved = heroSection ? resolveServicePageHeroSim(heroSection, PAGE_KEY) : null

const legacyHero = {
  eyebrow: 'Servicios',
  title: 'Talleres Móviles',
  subtitle: 'Soluciones móviles para trabajo en terreno',
  imageAlt: '...',
  // NO highlights key
}

console.log('\n=== SIMULACIÓN RUNTIME (flags ON) ===')
console.log('isServiceSubPageCms:', cmsActive)
console.log('runtimeSource:', cmsActive ? 'cms' : 'legacy')
console.log('extensionKeys:', Object.keys(extensions))

console.log('\n=== CAPA Contrato (heroSection) ===')
console.log('highlights:', heroSection?.highlights)
console.log('highlightsCount:', heroSection?.highlights?.length ?? 0)
console.log('image.url:', heroSection?.image?.url ?? null)

console.log('\n=== CAPA Resolver (resolveServicePageHero sim) ===')
console.log(JSON.stringify(heroResolved, null, 2))

console.log('\n=== CAPA Adapter legacy branch ===')
console.log('Si !cmsActive: heroImage = null, content.hero = legacy (sin highlights)')
console.log('legacy hero.highlights:', legacyHero.highlights ?? '(undefined)')

console.log('\n=== CAPA Componente ===')
const imageProp = cmsActive ? heroResolved?.imageUrl : null
const highlightsProp = cmsActive ? heroResolved?.highlights : legacyHero.highlights ?? []
console.log('image prop truthy?', Boolean(imageProp))
console.log('highlights prop count:', highlightsProp?.length ?? 0)
console.log('Sin imagen?', !imageProp)
