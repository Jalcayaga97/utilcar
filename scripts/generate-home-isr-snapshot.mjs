/**
 * Genera snapshot ISR del Home (equivalente Vite → revalidate 60s vía CDN + SWR cliente).
 * npm run generate:home-isr
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function writeSnapshot(payload) {
  const json = `${JSON.stringify(payload)}\n`
  const publicDir = join(root, 'public/cms')
  const genDir = join(root, 'src/generated')
  mkdirSync(publicDir, { recursive: true })
  mkdirSync(genDir, { recursive: true })
  writeFileSync(join(publicDir, 'home-isr.json'), json, 'utf8')
  writeFileSync(join(genDir, 'home-isr.snapshot.json'), json, 'utf8')
}

function writeHeroPreload(payload, buildHeroPreloadHref) {
  const genDir = join(root, 'src/generated')
  const primaryUrl =
    payload.homeContent?.extensions?.heroSection?.primaryImage?.url ??
    payload.homeContent?.extensions?.heroSection?.image?.url ??
    null
  const href = buildHeroPreloadHref(primaryUrl)
  writeFileSync(
    join(genDir, 'home-hero-preload.json'),
    `${JSON.stringify({ href })}\n`,
    'utf8',
  )
}

function stripIconFields(payload, cmsIconToKey) {
  const normalizeItems = (items) => {
    if (!Array.isArray(items)) return
    for (const item of items) {
      if (!item || !('icon' in item)) continue
      item.icon = cmsIconToKey(item.icon) ?? (typeof item.icon === 'string' ? item.icon : null)
    }
  }

  normalizeItems(payload.highlights)
  normalizeItems(payload.homeContent?.extensions?.whyUsSection?.items)
  normalizeItems(payload.homeContent?.extensions?.servicesSection?.items)
  normalizeItems(payload.homeContent?.extensions?.highlightsItems)
}

async function loadPayload(server) {
  const homeAdapter = await server.ssrLoadModule('/src/lib/cms/home.adapter.js')
  const servicesAdapter = await server.ssrLoadModule('/src/lib/cms/services.adapter.js')
  const { cmsIconToKey } = await server.ssrLoadModule('/src/lib/cms/icons/resolveCmsIcon.js')

  const [homeContent, portfolioCards, highlights] = await Promise.all([
    homeAdapter.getHomeContent(),
    homeAdapter.getHomePortfolioCards(),
    servicesAdapter.getHighlights(),
  ])

  const payload = {
    generatedAt: new Date().toISOString(),
    revalidate: 60,
    homeContent,
    portfolioCards,
    highlights,
  }

  stripIconFields(payload, cmsIconToKey)
  return payload
}

async function main() {
  const server = await createServer({
    configFile: join(root, 'vite.config.js'),
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  })

  try {
    const payload = await loadPayload(server)
    const { buildHeroPreloadHref } = await server.ssrLoadModule('/src/lib/images/responsiveImage.js')
    writeSnapshot(payload)
    writeHeroPreload(payload, buildHeroPreloadHref)
    console.info(`[generate:home-isr] OK — ${payload.portfolioCards?.length ?? 0} trabajos, revalidate=${payload.revalidate}s`)
  } catch (error) {
    console.error('[generate:home-isr] Falló:', error?.message ?? error)
    process.exitCode = 1
  } finally {
    await server.close()
  }
}

await main()
