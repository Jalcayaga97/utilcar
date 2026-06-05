/**
 * Auditoría CMS → GROQ → resolver (sin Vite) — Talleres Móviles.
 * npm run audit:talleres-pipeline
 */
import { createClient } from '@sanity/client'
import { loadSanityEnv } from '../src/lib/sanity/runtime/loadSanityEnv.js'
import { serviceSubPageQuery, WORK_PROJECTS_QUERY } from '../src/lib/sanity/queries.js'
import { HOME_BLOCKS_PROJECTION } from '../src/lib/sanity/queries.js'

const PAGE_KEY = 'talleres-moviles'

const env = loadSanityEnv({ requireToken: false })
env.applyToProcessEnv()

const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: '2024-05-28',
  useCdn: false,
})

function blockOfType(blocks, type) {
  return (blocks ?? []).find((b) => b._type === type)
}

/** Réplica mínima normalizeWorkProject (sin alias @/) */
function normalizeWorkProject(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id =
    typeof raw.id === 'string'
      ? raw.id.trim()
      : String(raw.projectId?.current ?? raw.projectId ?? '').trim()
  const serviceCategory = String(raw.serviceCategory ?? '').trim()
  if (!id || !String(raw.title ?? '').trim()) return null
  const imageUrl = raw.image?.asset?.url ?? raw.image?.url ?? null
  return {
    id,
    title: String(raw.title).trim(),
    serviceCategory,
    categoryId: serviceCategory,
    visible: raw.visible !== false,
    imageUrl,
  }
}

function normalizeWorkProjectList(list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizeWorkProject).filter((p) => p && p.visible !== false)
}

function filterByCategory(projects, pageKey) {
  return projects.filter((p) => p.categoryId === pageKey)
}

/** Réplica heroContract normalizeHighlights + normalizeHeroImage */
function mapHeroFromBlock(block) {
  if (!block) return null
  const highlights = Array.isArray(block.highlights)
    ? block.highlights.map((h) => String(h ?? '').trim()).filter(Boolean)
    : []
  const imageUrl = block.image?.asset?.url ?? block.image?.url ?? null
  return {
    highlights,
    image: { url: imageUrl, alt: block.imageAlt ?? '' },
    title: block.title ?? '',
  }
}

console.log('=== FASE 1 — CMS + GROQ (Sanity API) ===\n')

const doc = await client.fetch(serviceSubPageQuery(PAGE_KEY))
const heroBlock = blockOfType(doc?.blocks, 'heroBlock')
const portfolioBlock = blockOfType(doc?.blocks, 'portfolioBlock')

console.log('1. Documento serviceSubPage:', doc ? `_id=${doc._id ?? '(sin id)'} pageKey=${doc.pageKey}` : 'NULL')
console.log('   blocks count:', doc?.blocks?.length ?? 0)
console.log('   _schemaVersion:', doc?._schemaVersion ?? doc?.schemaVersion ?? '(undefined)')

console.log('\n2. heroBlock en CMS:')
console.log('   highlights[]:', JSON.stringify(heroBlock?.highlights ?? null))
console.log('   image.asset.url:', heroBlock?.image?.asset?.url ? 'YES (' + heroBlock.image.asset.url.slice(0, 55) + '…)' : 'NO')
console.log('   image.asset._ref:', heroBlock?.image?.asset?._ref ?? heroBlock?.image?.asset?._id ?? 'NO')

console.log('\n3. GROQ projection incluye highlights + image?')
const projHasHighlights = HOME_BLOCKS_PROJECTION.includes('highlights')
const projHasImage = HOME_BLOCKS_PROJECTION.includes('image{ asset->{ _id, url }')
console.log('   highlights en PAGE_BLOCKS_PROJECTION:', projHasHighlights)
console.log('   image{ asset->… } en PAGE_BLOCKS_PROJECTION:', projHasImage)

const heroMapped = mapHeroFromBlock(heroBlock)
console.log('\n4. Tras mapHeroBlockToContract (réplica):')
console.log('   highlights:', heroMapped?.highlights?.length ?? 0, heroMapped?.highlights)
console.log('   image.url:', heroMapped?.image?.url ? 'YES' : 'NO')

console.log('\n=== FASE 2 — workProject ===\n')

const wpRaw = await client.fetch(WORK_PROJECTS_QUERY)
console.log('WORK_PROJECTS_QUERY tipo:', Array.isArray(wpRaw) ? `array[${wpRaw.length}]` : typeof wpRaw)

const wpList = normalizeWorkProjectList(wpRaw)
const wpFiltered = filterByCategory(wpList, PAGE_KEY)

console.log('Total normalizados:', wpList.length)
console.log('Con serviceCategory === talleres-moviles:', wpFiltered.length)
if (wpList.length && !wpFiltered.length) {
  const cats = [...new Set(wpList.map((p) => p.categoryId))]
  console.log('   Categorías encontradas:', cats.join(', '))
}
if (wpFiltered.length) {
  console.log('   Primer proyecto:', {
    id: wpFiltered[0].id,
    title: wpFiltered[0].title,
    categoryId: wpFiltered[0].categoryId,
    imageUrl: wpFiltered[0].imageUrl ? 'YES' : 'NO',
  })
}

const dropped = (wpRaw ?? []).length - wpList.length
if (dropped > 0) {
  console.log('\n   AVISO: proyectos descartados en normalize:', dropped)
  for (const raw of wpRaw ?? []) {
    const n = normalizeWorkProject(raw)
    if (!n) {
      console.log('   - descartado:', raw._id, {
        projectId: raw.projectId,
        title: raw.title,
        serviceCategory: raw.serviceCategory,
        visible: raw.visible,
      })
    }
  }
}

console.log('\n=== FASE 3 — Simulación runtime flags ===\n')
console.log('(En browser, Vite inyecta import.meta.env — verificar .env.local)')
console.log('   VITE_USE_SANITY=true')
console.log('   VITE_USE_PAGE_RESOLVER=true')
console.log('   VITE_USE_SERVICES_V2=true')

console.log('\n=== FASE 4 — Hipótesis legacy vs CMS ===\n')
console.log('Legacy local gallery (services.js):')
console.log('   eyebrow: Galería | title: Trabajos realizados')
console.log('   → Si el usuario ve ese encabezado, NO prueba path CMS.')
console.log('Legacy hero: sin highlights[], heroImage siempre null en mapServicePageRuntime legacy.')

console.log('\nportfolioBlock CMS meta:')
console.log('   eyebrow:', portfolioBlock?.eyebrow)
console.log('   title:', portfolioBlock?.title)

console.log('\n=== FASE 5 — parseSanityPayload + array (BUG) ===\n')
const wpParsed = (() => {
  if (!wpRaw) return null
  const rest = { ...wpRaw }
  delete rest._schemaVersion
  return rest
})()
console.log('Tras stripSchemaVersion sobre array[9]:')
console.log('   Array.isArray:', Array.isArray(wpParsed))
console.log('   keys:', Object.keys(wpParsed).slice(0, 3).join(', '), '…')
console.log('   → normalizeWorkProjectList devuelve 0 → portfolioProjects vacío')

console.log('\n=== FIN ===')
